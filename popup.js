import { animate } from "motion";

const scanBtn = document.getElementById("scanBtn");
const scoreCard = document.getElementById("scoreCard");
const issuesSection = document.getElementById("issuesSection");
const issuesList = document.getElementById("issuesList");
const issueCount = document.getElementById("issueCount");
const sortSelect = document.getElementById("sortSelect");
const filterAllBtn = document.getElementById("filterAll");
const filterFixableBtn = document.getElementById("filterFixable");
const fixableCount = document.getElementById("fixableCount");

let report = null;
let lastReport = null;
let filterMode = "all"; // "all" | "fixable"

scanBtn.addEventListener("click", runScan);

async function runScan() {
  scanBtn.disabled = true;
  scanBtn.textContent = "Scanning…";
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) throw new Error("No active tab.");
    if (!/^https?:\/\//i.test(tab.url || "")) {
      throw new Error(
        "This page type blocks extensions. Open a normal http(s) website and try again."
      );
    }

    try {
      report = await chrome.tabs.sendMessage(tab.id, { type: "VERTEX_SCAN" });
      if (!report || report.error)
        throw new Error(report?.error || "Scan failed.");
    } catch {
      // classic injection (content.js is a plain script)
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });
      report = await chrome.tabs.sendMessage(tab.id, { type: "VERTEX_SCAN" });
      if (!report || report.error)
        throw new Error(report?.error || "Scan failed after injection.");
    }

    lastReport = report;
    renderScore(report);
    updateFixableCount(report.issues);
    renderIssues(applyFiltersAndSort(report.issues));

    animate(0, report.issues.length, {
      duration: 1,
      onUpdate: (latest) => (issueCount.textContent = Math.round(latest)),
    });

  } catch (e) {
    renderError(e);
  } finally {
    scanBtn.disabled = false;
    scanBtn.innerHTML = `<span class="play">▶</span> Scan this Page`;
  }
}

/* ---------- filters ---------- */
filterAllBtn?.addEventListener("click", () => setFilter("all"));
filterFixableBtn?.addEventListener("click", () => setFilter("fixable"));

function setFilter(mode) {
  filterMode = mode;
  filterAllBtn.classList.toggle("chip--active", mode === "all");
  filterAllBtn.setAttribute("aria-pressed", mode === "all");
  filterFixableBtn.classList.toggle("chip--active", mode === "fixable");
  filterFixableBtn.setAttribute("aria-pressed", mode === "fixable");
  if (lastReport) renderIssues(applyFiltersAndSort(lastReport.issues));
}

function updateFixableCount(items) {
  const n = items.filter((i) => i.fixable).length;
  if (fixableCount) {
    fixableCount.textContent = n;

    const score = document.getElementById("score-num");

    animate(0, n, {
      duration: 1,
      onUpdate: (latest) => (fixableCount.textContent = Math.round(latest)),
    });
  }
}

function applyFiltersAndSort(items) {
  let arr = [...items];
  if (filterMode === "fixable") arr = arr.filter((i) => i.fixable);

  const by = sortSelect?.value || "type";
  if (by === "type")
    arr.sort((a, b) => (a.type || "").localeCompare(b.type || ""));
  if (by === "severity")
    arr.sort((a, b) => severityRank(b.severity) - severityRank(a.severity));

  return arr;
}

/* ---------- sorting ---------- */
sortSelect?.addEventListener("change", () => {
  if (!lastReport) return;
  renderIssues(applyFiltersAndSort(lastReport.issues));
});

function severityRank(s) {
  return s === "high" ? 3 : s === "medium" ? 2 : 1;
}

/* ---------- Reveal on page only (Try focus removed) ---------- */
issuesList.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-action='reveal']");
  if (!btn) return;
  const path = btn.getAttribute("data-path") || null;

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) throw new Error("No active tab.");
    if (!/^https?:\/\//i.test(tab.url || ""))
      throw new Error("Action blocked on this page.");
    await chrome.tabs.sendMessage(tab.id, { type: "VERTEX_HIGHLIGHT", path });
  } catch (err) {
    renderError(err);
  }
});

/* ---------- renderers ---------- */
function renderScore(r) {
  const tier =
    r.score >= 95
      ? "AAA"
      : r.score >= 85
      ? "AA"
      : r.score >= 70
      ? "A"
      : "Needs Work";
  const badgeClass =
    r.score >= 95
      ? "badge-aaa"
      : r.score >= 85
      ? "badge-aa"
      : r.score >= 70
      ? "badge-a"
      : "badge-needs-work";
  scoreCard.classList.remove("hidden");
  scoreCard.innerHTML = `
    <div class="score">
      <div>
        <div id="score"><span id="score-num">${Math.round(
          r.score
        )}</span><span>%</span></div>
        <div class="muted">Estimated compliance</div>
      </div>
      <div class="badge-tier ${badgeClass}" aria-label="Tier">${tier}</div>
    </div>
    <div class="muted" style="margin-top:6px">
      <span id="passed-num"> ${r.passed} </span>
      <span>/${r.checked} checks passed</span>
    </div>`;
  issuesSection.classList.remove("hidden");

  const score = document.getElementById("score-num");

  animate(0, r.score, {
    duration: 1,
    onUpdate: (latest) => (score.innerHTML = Math.round(latest)),
  });

  const passedNum = document.getElementById("passed-num");

  animate(0, r.passed, {
    duration: 1,
    onUpdate: (latest) => (passedNum.innerHTML = Math.round(latest)),
  });
}

function renderIssues(items) {
  issuesList.innerHTML = "";
  issueCount.textContent = `${items.length}`;

  for (const it of items) {
    const el = document.createElement("div");
    el.className = "issue";

    // Optional: preview for image-related issues
    let previewHTML = "";
    if ((it.type || "").toLowerCase() === "images") {
      const src = extractSrc(it.snippet) || extractSrc(it.tip);
      if (src)
        previewHTML = `<div class="preview"><img src="${escapeAttr(
          src
        )}" alt=""></div>`;
    }

    el.innerHTML = `
      <div class="head">
        <div class="type">${escapeHTML(it.type || "Issue")}</div>
        <div class="sev ${escapeHTML(it.severity || "low")}">${escapeHTML(
      it.severity || "low"
    )}</div>
      </div>
      <div class="muted" style="margin-top:4px">${escapeHTML(
        it.message || ""
      )}</div>
      ${it.snippet ? `<pre class="code">${escapeHTML(it.snippet)}</pre>` : ""}
      ${
        it.tip
          ? `<div style="margin-top:6px">💡 <strong>Fix:</strong> ${escapeHTML(
              it.tip
            )}</div>`
          : ""
      }
      ${previewHTML}
      <div class="actions">
        <button class="btn" data-action="reveal" data-path="${escapeAttr(
          it.path || ""
        )}">Reveal on page</button>
      </div>
    `;
    issuesList.appendChild(el);
  }
}

function renderError(err) {
  scoreCard.classList.remove("hidden");
  scoreCard.innerHTML = `
    <div style="color:#ff7675;font-weight:700">Error</div>
    <div class="muted">${escapeHTML(
      err?.message || "Something went wrong."
    )}</div>
  `;
}

/* ---------- helpers ---------- */
function escapeHTML(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );
}
function escapeAttr(s) {
  return String(s).replace(/"/g, "&quot;");
}
function extractSrc(str) {
  if (!str) return null;
  const m =
    String(str).match(/src\s*=\s*"([^"]+)"/i) ||
    String(str).match(/src\s*=\s*'([^']+)'/i);
  return m ? m[1] : null;
}

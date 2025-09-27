const scanBtn = document.getElementById("scanBtn");
const scoreCard = document.getElementById("scoreCard");
const issuesSection = document.getElementById("issuesSection");
const issuesList = document.getElementById("issuesList");
const issueCount = document.getElementById("issueCount");
const sortSelect = document.getElementById("sortSelect");

let lastReport = null;

scanBtn.addEventListener("click", async () => {
  scanBtn.disabled = true;
  scanBtn.textContent = "Scanning…";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const report = await chrome.tabs.sendMessage(tab.id, { type: "VERTEX_SCAN" });
    lastReport = report;
    renderScore(report);
    renderIssues(report.issues);
  } catch (e) {
    renderError(e);
  } finally {
    scanBtn.disabled = false;
    scanBtn.innerHTML = `<span class="play">▶</span> Scan this Page`;
  }
});

sortSelect.addEventListener("change", () => {
  if (!lastReport) return;
  const sorted = [...lastReport.issues];
  const by = sortSelect.value;
  if (by === "type") sorted.sort((a,b)=>a.type.localeCompare(b.type));
  if (by === "severity") sorted.sort((a,b)=>severityRank(b.severity)-severityRank(a.severity));
  if (by === "fixable") sorted.sort((a,b)=>Number(b.fixable)-Number(a.fixable));
  renderIssues(sorted);
});

function severityRank(s){ return s==="high"?3:s==="medium"?2:1; }

function renderScore(r){
  const tier = r.score >= 90 ? "AAA" : r.score >= 50 ? "AA" : r.score >= 30 ? "A" : "Needs Work";
  const badgeClass = r.score >= 90 ? "badge-aaa" : r.score >= 50 ? "badge-aa" : "badge-a";
  scoreCard.classList.remove("hidden");
  scoreCard.innerHTML = `
    <div class="score">
      <div>
        <div style="font-size:28px;font-weight:800">${Math.round(r.score)}%</div>
        <div class="muted">Estimated compliance</div>
      </div>
      <div class="badge-tier ${badgeClass}" aria-label="Tier">${tier}</div>
    </div>
    <div class="muted" style="margin-top:6px">${r.passed}/${r.checked} checks passed</div>
  `;
  issuesSection.classList.remove("hidden");
}

function renderIssues(items){
  issuesList.innerHTML = "";
  issueCount.textContent = `${items.length} issue${items.length!==1?"s":""}`;
  for(const it of items){
    const el = document.createElement("div");
    el.className = "issue";
    el.innerHTML = `
      <div class="head">
        <div class="type">${it.type}</div>
        <div class="sev ${it.severity}">${it.severity}</div>
      </div>
      <div class="muted" style="margin-top:4px">${it.message}</div>
      ${it.snippet ? `<pre class="code">${escapeHTML(it.snippet)}</pre>` : ""}
      ${it.tip ? `<div style="margin-top:6px">💡 <strong>Fix:</strong> ${it.tip}</div>` : ""}
      <div class="actions">
        ${it.path ? `<button class="btn" data-act="reveal" data-path="${it.path}">Reveal on page</button>` : ""}
        ${it.fixable ? `<button class="btn" data-act="focus" data-path="${it.path}">Try focus</button>` : ""}
      </div>
    `;
    issuesList.appendChild(el);
  }

  issuesList.querySelectorAll("button[data-act='reveal']").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.sendMessage(tab.id, { type:"VERTEX_HIGHLIGHT", path: btn.dataset.path });
    });
  });

  issuesList.querySelectorAll("button[data-act='focus']").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.sendMessage(tab.id, { type:"VERTEX_TRY_FOCUS", path: btn.dataset.path });
    });
  });
}

function renderError(err){
  scoreCard.classList.remove("hidden");
  scoreCard.innerHTML = `<div style="color:#ff7675;font-weight:700">Error</div>
    <div class="muted">${err?.message || "Could not scan this page."}</div>`;
}

function escapeHTML(s){
  return s.replace(/[&<>"']/g, c=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}

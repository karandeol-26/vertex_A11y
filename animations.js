import { animate, hover } from "motion";

hover(".primary-btn", (element) => {
  animate(element, {
    scale: 1.05,
    backgroundColor: "#000",
    color: "#fff",
  });

  return () =>
    animate(element, {
      scale: 1,
      backgroundColor: "#fff",
      color: "#000",
    });
});

const helpPrompt = document.getElementById("help-prompt");
const helpBox = document.getElementById("help-box");

hover(helpPrompt, (element) => {
  animate(element, {
    color: "#CCC",
  });

  animate(helpBox, {
    opacity: 1,
  });

  return () => {
    animate(element, {
      color: "#FFF",
    });

    animate(helpBox, {
      opacity: 0,
    });
  };
});

import { animate, hover } from "motion";

const scanBtn = document.getElementById("scanBtn");

hover(".primary-btn", (element) => {
    animate(element, {
        scale: 1.05, 
        backgroundColor: "#000",
        color: "#fff"
    })

    return () => animate(element, {
        scale: 1, 
        backgroundColor: "#fff",
        color: "#000"
    });
});
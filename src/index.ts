import { SlotApplication } from "./SlotApplication";
import "./styles.css";
import gsap from "gsap";
import { appConstants } from "./constants";

const app = new SlotApplication();
const canvasDiv = document.getElementById("canvasDiv");
if (canvasDiv) {
  canvasDiv.appendChild(app.view);
}

const ham = document.querySelector(".ham");
const menu = document.querySelector("ul.main-menu");
let links = null;
if (menu) {
  links = menu.querySelectorAll("li");
}

const tl = gsap.timeline({ paused: true });

tl.to(menu, {
  duration: 0.8,
  opacity: 1,
  height: appConstants.SYMBOL_SIZE * 3,
  ease: "expo.inOut",
});
tl.from(
  links,
  {
    duration: 1,
    opacity: 0,
    stagger: 0.1,
    ease: "expo.inOut",
  },
  "-=0.5"
);

tl.reverse();

ham &&
  ham.addEventListener("click", () => {
    tl.reversed(!tl.reversed());
  });

import gsap from "gsap";
import "./canvasMenu.css";

type Timeline = gsap.core.Timeline;

export interface IWrapper {
  closeMenu: () => void;
}

export class CanvasMenu {
  buttonDiv: HTMLElement = document.createElement("div");
  tl: Timeline = gsap.timeline({ paused: true });

  constructor(parentDiv: HTMLElement, topPos: string, height: string) {
    const buttonSpan = document.createElement("span");
    this.buttonDiv.className = "canvas-menu__button";
    buttonSpan.innerHTML = "☰";
    this.buttonDiv.appendChild(buttonSpan);
    parentDiv.appendChild(this.buttonDiv);

    const menu = document.createElement("ul");
    menu.className = "canvas-menu__items";
    menu.style.top = topPos;
    const items = ["About", "Products", "Blogs", "Contact"];
    for (const name of items) {
      menu.appendChild(this.getSubMenu(name));
    }
    parentDiv.appendChild(menu);

    let links = null;
    if (menu) {
      links = menu.querySelectorAll("li");
    }

    //const tl = gsap.timeline({ paused: true });

    this.tl.to(menu, {
      duration: 0.8,
      opacity: 1,
      height: height,
      ease: "expo.inOut",
    });
    this.tl.from(
      links,
      {
        duration: 1,
        opacity: 0,
        stagger: 0.1,
        ease: "expo.inOut",
      },
      "-=0.5"
    );

    this.tl.reverse();

    this.buttonDiv.addEventListener("click", () => {
      this.tl.reversed(!this.tl.reversed());
    });
  }

  getSubMenu(name: string) {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.innerHTML = name;
    link.href = "#";
    li.appendChild(link);
    return li;
  }

  closeMenu() {
    if (!this.tl.reversed()) {
      this.tl.reversed(!this.tl.reversed());
    }
  }
}

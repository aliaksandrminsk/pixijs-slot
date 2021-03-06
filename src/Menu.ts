import gsap from "gsap";
import "./Menu.css";

type Timeline = gsap.core.Timeline;

export interface IWrapper {
  closeMenu: () => void;
}

export class Menu {
  buttonDiv: HTMLElement = document.createElement("div");
  menu: HTMLElement = document.createElement("ul");
  tl: Timeline = gsap.timeline({ paused: true });

  constructor(topPos: string, height: string) {
    const buttonSpan = document.createElement("span");
    this.buttonDiv.className = "menu__button";
    buttonSpan.innerHTML = "☰";
    this.buttonDiv.appendChild(buttonSpan);

    this.menu.className = "menu__items";
    this.menu.style.top = topPos;
    this.menu.style.pointerEvents = "none";
    const items = ["About", "Products", "Blogs", "Contact"];
    for (const name of items) {
      this.menu.appendChild(this.getSubMenu(name));
    }
    const links = this.menu.querySelectorAll("li");

    this.tl.to(this.menu, {
      duration: 0.8,
      opacity: 1,
      height: height,
      ease: "expo.inOut",
      onComplete: () => {
        this.menu.style.pointerEvents = "auto";
      },
      onReverseComplete: () => {
        this.menu.style.pointerEvents = "none";
      },
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

  setParentDiv(parentDiv: HTMLElement) {
    if (this.buttonDiv.parentElement) {
      this.buttonDiv.parentElement.removeChild(this.buttonDiv);
      this.buttonDiv.parentElement.removeChild(this.menu);
    }
    parentDiv.appendChild(this.buttonDiv);
    parentDiv.appendChild(this.menu);
  }

  closeMenu() {
    if (!this.tl.reversed()) {
      this.tl.reversed(!this.tl.reversed());
    }
  }
}

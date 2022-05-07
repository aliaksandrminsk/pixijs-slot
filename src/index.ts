import { SlotApplication } from "./SlotApplication";
import "./styles.css";
import { Menu } from "./Menu";
import { appConstants } from "./constants";

const canvasDiv = document.getElementById("canvasDiv");
if (canvasDiv) {
  const canvasMenu = new Menu("6.5rem", String(appConstants.SYMBOL_SIZE * 3));
  canvasMenu.setParentDiv(canvasDiv);

  const app = new SlotApplication(canvasMenu);
  canvasDiv.appendChild(app.view);
}

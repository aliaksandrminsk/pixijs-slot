import * as PIXI from "pixi.js";
import { appConstants } from "./constants";
import {
  Application,
  Container,
  Graphics,
  Sprite,
  TextStyle,
  Texture,
  Text,
} from "pixi.js";
import gsap from "gsap";
import { IWrapper } from "./CanvasMenu";

interface IReel {
  container: Container;
  symbols: Array<Sprite>;
  position: number;
  previousPosition: number;
  blur: PIXI.filters.BlurFilter;
}

type TextType = "start" | "spinning";
type Tween = gsap.core.Tween;

export class SlotApplication extends Application {
  protected reels = new Array<IReel>();
  protected tweens = new Array<Tween>();
  protected wrapper: IWrapper;

  constructor(wrapper: IWrapper) {
    super({
      width: appConstants.STAGE_WIDTH,
      height: appConstants.STAGE_HEIGHT,
      backgroundColor: appConstants.COLOR,
    });
    this.wrapper = wrapper;
    this.loader
      .add("atlas", "./atlas.json")
      .load(this.onAssetsLoaded.bind(this));
  }

  // onAssetsLoaded handler builds the example.
  onAssetsLoaded() {
    const resTextures = this.loader.resources["atlas"].textures;
    const slotTextures = new Array<Texture>();
    if (resTextures) {
      if (resTextures["king.png"]) slotTextures.push(resTextures["king.png"]);
      if (resTextures["2.png"]) slotTextures.push(resTextures["2.png"]);
      if (resTextures["9.png"]) slotTextures.push(resTextures["9.png"]);
      if (resTextures["3.png"]) slotTextures.push(resTextures["3.png"]);
    }

    // Build the reels
    const reelContainer = new Container();
    for (let i = 0; i < 5; i++) {
      const rc = new Container();
      rc.x = i * appConstants.REEL_WIDTH;
      reelContainer.addChild(rc);

      const reel = {
        container: rc,
        symbols: new Array<Sprite>(),
        position: 0,
        previousPosition: 0,
        blur: new PIXI.filters.BlurFilter(),
      };
      reel.blur.blurX = 0;
      reel.blur.blurY = 0;
      rc.filters = [reel.blur];

      // Build the symbols
      for (let j = 0; j < 4; j++) {
        const symbol = new Sprite(
          slotTextures[Math.floor(Math.random() * slotTextures.length)]
        );
        // Scale the symbol to fit symbol area.
        symbol.y = j * appConstants.SYMBOL_SIZE;
        symbol.scale.x = symbol.scale.y = Math.min(
          appConstants.SYMBOL_SIZE / symbol.width,
          appConstants.SYMBOL_SIZE / symbol.height
        );
        symbol.x = Math.round((appConstants.SYMBOL_SIZE - symbol.width) / 2);
        reel.symbols.push(symbol);
        rc.addChild(symbol);
      }
      this.reels.push(reel);
    }
    this.stage.addChild(reelContainer);

    // Build top & bottom covers and position reelContainer
    const margin = (this.screen.height - appConstants.SYMBOL_SIZE * 3) / 2;
    reelContainer.y = margin;
    reelContainer.x = Math.round(
      this.screen.width - appConstants.REEL_WIDTH * 5
    );
    const top = new Graphics();
    top.beginFill(0, 1);
    top.drawRect(0, 0, this.screen.width, margin);
    const bottom = new Graphics();
    bottom.beginFill(0, 1);
    bottom.drawRect(
      0,
      appConstants.SYMBOL_SIZE * 3 + margin,
      this.screen.width,
      margin
    );

    const style = new TextStyle({
      fontFamily: "Arial",
      fontSize: 36,
      fontStyle: "italic",
      fontWeight: "bold",
      fill: ["#fdffff", "#09ff99"], // gradient
      stroke: "#4a1850",
      strokeThickness: 4,
      dropShadow: true,
      dropShadowColor: "#005000",
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 3,
      dropShadowDistance: 3,
    });

    const headerText = new Text("PIXI SLOT", style);
    headerText.x = Math.round((top.width - headerText.width) / 2);
    headerText.y = Math.round((margin - headerText.height) / 2);
    top.addChild(headerText);

    const playText = new Text("Spin the wheels!", style);
    playText.x = Math.round((bottom.width - playText.width) / 2);
    playText.y =
      this.screen.height - margin + Math.round((margin - playText.height) / 2);

    const spinningText = new Text("Spinning...", style);
    spinningText.x = Math.round((bottom.width - spinningText.width) / 2);
    spinningText.y =
      this.screen.height -
      margin +
      Math.round((margin - spinningText.height) / 2);

    this.stage.addChild(top);
    this.stage.addChild(bottom);

    const showText = (type: TextType) => {
      bottom.removeChild(spinningText);
      bottom.removeChild(playText);
      bottom.interactive = false;
      bottom.buttonMode = false;

      if (type === "start") {
        bottom.interactive = true;
        bottom.buttonMode = true;
        bottom.addChild(playText);
      } else if (type === "spinning") {
        bottom.addChild(spinningText);
      }
    };

    showText("start");
    bottom.addListener("pointerdown", () => {
      startPlay();
    });

    let running = false;

    const startPlay = () => {
      this.wrapper.closeMenu();

      if (running) return;
      running = true;

      showText("spinning");
      this.deleteAllTweens();

      for (let i = 0; i < this.reels.length; i++) {
        const r = this.reels[i];
        const extra = Math.floor(Math.random() * 3);
        const target = r.position + 10 + i * 5 + extra;
        const time = (2500 + i * 600 + extra * 600) / 1000;

        const tween = gsap.to(r, {
          position: target,
          duration: time,
          ease: this.userEase(0.7),
        });
        if (i === this.reels.length - 1) tween.then(reelsComplete);
        tween.play();
        this.tweens.push(tween);
      }
    };

    function reelsComplete() {
      running = false;
      showText("start");
    }

    this.ticker.add(() => {
      for (let i = 0; i < this.reels.length; i++) {
        const r = this.reels[i];
        r.blur.blurY = (r.position - r.previousPosition) * 8;
        r.previousPosition = r.position;

        for (let j = 0; j < r.symbols.length; j++) {
          const s = r.symbols[j];
          const prevy = s.y;

          s.y =
            ((r.position + j) % r.symbols.length) * appConstants.SYMBOL_SIZE -
            appConstants.SYMBOL_SIZE;
          if (s.y < 0 && prevy > appConstants.SYMBOL_SIZE) {
            s.texture =
              slotTextures[Math.floor(Math.random() * slotTextures.length)];
            s.scale.x = s.scale.y = Math.min(
              appConstants.SYMBOL_SIZE / s.texture.width,
              appConstants.SYMBOL_SIZE / s.texture.height
            );
            s.x = Math.round((appConstants.SYMBOL_SIZE - s.width) / 2);
          }
        }
      }
    });
  }

  userEase(amount: number) {
    return (t: number) => --t * t * ((amount + 1) * t + amount) + 1;
  }

  deleteAllTweens() {
    for (let i = 0; i < this.tweens.length; i++) {
      this.tweens[i].kill();
      this.tweens.splice(this.tweens.indexOf(this.tweens[i]), 1);
    }
  }
}

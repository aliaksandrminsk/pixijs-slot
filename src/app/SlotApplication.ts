import * as PIXI from "pixi.js";
import { ITankStore } from "../store/TankStore";
import { appConstants } from "./constants";
import { Sprite } from "pixi.js";
import TWEEN, {Easing} from "@tweenjs/tween.js";
window.PIXI = PIXI;

interface IReel {
  container: PIXI.Container,
  symbols: Array<Sprite>,
  position: number,
  previousPosition: number,
  blur: PIXI.filters.BlurFilter,
}

export class SlotApplication extends PIXI.Application {
  private store: ITankStore;

  protected readonly REEL_WIDTH = 160;
  protected readonly SYMBOL_SIZE = 150;
  protected reels = new Array<IReel>();
  protected tweening = new Array();

  constructor(store: ITankStore) {
    super({
      width: appConstants.STAGE_WIDTH,
      height: appConstants.STAGE_HEIGHT,
      backgroundColor: appConstants.COLOR,
    });

    this.store = store;
    //PIXI.utils.clearTextureCache();

    this.loader
        .add('./assets/queen.png', './assets/queen.png')
        .add('./assets/king.png', './assets/king.png')
        .add('./assets/9.png', './assets/9.png')
        .add('./assets/2.png', './assets/2.png')
        .add('./assets/3.png', './assets/3.png')
        .load(this.onAssetsLoaded.bind(this));
  }

  // onAssetsLoaded handler builds the example.
  onAssetsLoaded() {
    // Create different slot symbols.
    const slotTextures = [
      PIXI.Texture.from('./assets/queen.png'),
      PIXI.Texture.from('./assets/king.png'),
      PIXI.Texture.from('./assets/2.png'),
      PIXI.Texture.from('./assets/9.png'),
      PIXI.Texture.from('./assets/3.png'),
    ];

    // Build the reels
    const reelContainer = new PIXI.Container();
    for (let i = 0; i < 5; i++) {
      const rc = new PIXI.Container();
      rc.x = i * this.REEL_WIDTH;
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
        const symbol = new PIXI.Sprite(slotTextures[Math.floor(Math.random() * slotTextures.length)]);
        // Scale the symbol to fit symbol area.
        symbol.y = j * this.SYMBOL_SIZE;
        symbol.scale.x = symbol.scale.y = Math.min(this.SYMBOL_SIZE / symbol.width, this.SYMBOL_SIZE / symbol.height);
        symbol.x = Math.round((this.SYMBOL_SIZE - symbol.width) / 2);
        reel.symbols.push(symbol);
        rc.addChild(symbol);
      }
      this.reels.push(reel);
    }
    this.stage.addChild(reelContainer);

    // Build top & bottom covers and position reelContainer
    const margin = (this.screen.height - this.SYMBOL_SIZE * 3) / 2;
    reelContainer.y = margin;
    reelContainer.x = Math.round(this.screen.width - this.REEL_WIDTH * 5);
    const top = new PIXI.Graphics();
    top.beginFill(0, 1);
    top.drawRect(0, 0, this.screen.width, margin);
    const bottom = new PIXI.Graphics();
    bottom.beginFill(0, 1);
    bottom.drawRect(0, this.SYMBOL_SIZE * 3 + margin, this.screen.width, margin);

    // Add play text
    const style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 36,
      fontStyle: 'italic',
      fontWeight: 'bold',
      fill: ['#ffffff', '#00ff99'], // gradient
      stroke: '#4a1850',
      strokeThickness: 5,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
      wordWrap: true,
      wordWrapWidth: 440,
    });

    const playText = new PIXI.Text('Spin the wheels!', style);
    playText.x = Math.round((bottom.width - playText.width) / 2);
    playText.y = this.screen.height - margin + Math.round((margin - playText.height) / 2);
    bottom.addChild(playText);

    // Add header text
    const headerText = new PIXI.Text('PIXI SLOT', style);
    headerText.x = Math.round((top.width - headerText.width) / 2);
    headerText.y = Math.round((margin - headerText.height) / 2);
    top.addChild(headerText);

    this.stage.addChild(top);
    this.stage.addChild(bottom);

    // Set the interactivity.
    bottom.interactive = true;
    bottom.buttonMode = true;
    bottom.addListener('pointerdown', () => {
      startPlay();
    });

    let running = false;

    // Function to start playing.
    let startPlay = () => {
      if (running) return;
      running = true;

      this.deleteAllTweens();

      for (let i = 0; i < this.reels.length; i++) {
        const r = this.reels[i];
        const extra = Math.floor(Math.random() * 3);
        const target = r.position + 10 + i * 5 + extra;
        const time = 2500 + i * 600 + extra * 600;
        //this.tweenTo(r, target, time, this.backout(0.5), null, i === this.reels.length - 1 ? reelsComplete : null);
        const tween = new TWEEN.Tween(r).to({ position: target }, time);
        tween.easing(this.backout(0.5));
        //tween.easing(Easing.Cubic.Out);
        if(i === this.reels.length - 1 ) tween.onComplete(reelsComplete);
        tween.start();
        this.tweening.push(tween);

      }
    }

    // Reels done handler.
    function reelsComplete() {
      running = false;
    }


    this.ticker.add(() => {

      TWEEN.update();

      for (let i = 0; i < this.reels.length; i++) {
        const r = this.reels[i];
        // Update blur filter y amount based on speed.
        // This would be better if calculated with time in mind also. Now blur depends on frame rate.
        r.blur.blurY = (r.position - r.previousPosition) * 8;
        r.previousPosition = r.position;

        // Update symbol positions on reel.
        for (let j = 0; j < r.symbols.length; j++) {
          const s = r.symbols[j];
          const prevy = s.y;

          s.y = ((r.position + j) % r.symbols.length) * this.SYMBOL_SIZE - this.SYMBOL_SIZE;
          if (s.y < 0 && prevy > this.SYMBOL_SIZE) {
            // Detect going over and swap a texture.
            // This should in proper product be determined from some logical reel.
            s.texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
            s.scale.x = s.scale.y = Math.min(this.SYMBOL_SIZE / s.texture.width, this.SYMBOL_SIZE / s.texture.height);
            s.x = Math.round((this.SYMBOL_SIZE - s.width) / 2);
          }
        }
      }
    });
  }

  backout(amount: number) {
    return (t: number) => (--t * t * ((amount + 1) * t + amount) + 1);
  }

  deleteAllTweens() {
    for (let i = 0; i < this.tweening.length; i++) {
      this.tweening[i].stop();
      this.tweening.splice(this.tweening.indexOf(this.tweening[i]), 1);
    }
  }
}

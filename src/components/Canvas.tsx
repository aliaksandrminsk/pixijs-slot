import React, { useEffect, useRef } from "react";
import { SlotApplication } from "../app/SlotApplication";
import { useStore } from "../store";

const Canvas = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { tankStore: store } = useStore();

  useEffect(() => {
    const app = new SlotApplication();
    //store.startTankHandler = () => app.startTank();
    //store.stopTankHandler = () => app.stopTank();

    if (ref.current) {
      ref.current.appendChild(app.view);
    }

    return () => {
      app.destroy(true);
    };
  });

  return <div ref={ref} />;
};

export default Canvas;

import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import './App.css';

const App = () => {
  const boxRef = useRef(null);
  const [bgColor, setBgColor] = useState("red");
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check if it's a touch device
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);

    const appElement = document.querySelector(".App");
    
    const handleInteraction = (event) => {
      let clientX, clientY;

      if (event.type.startsWith('touch')) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      updatePosition(clientX, clientY, appElement);
    };

    if (isTouchDevice) {
      appElement.addEventListener("touchmove", handleInteraction);
      appElement.addEventListener("touchstart", handleInteraction);
    } else {
      appElement.addEventListener("mousemove", handleInteraction);
    }

    return () => {
      if (isTouchDevice) {
        appElement.removeEventListener("touchmove", handleInteraction);
        appElement.removeEventListener("touchstart", handleInteraction);
      } else {
        appElement.removeEventListener("mousemove", handleInteraction);
      }
    };
  }, [isTouchDevice]);

  const updatePosition = (clientX, clientY, currentTarget) => {
    const width = currentTarget.clientWidth;
    const height = currentTarget.clientHeight;
  
    const boxSize = boxRef.current.offsetWidth / 2; // 方块半径
    const limitedX = Math.max(boxSize, Math.min(clientX, width - boxSize)); // 限制X范围
    const limitedY = Math.max(boxSize, Math.min(clientY, height - boxSize)); // 限制Y范围
  
    // 计算颜色百分比
    const xPercent = limitedX / width;
    const yPercent = limitedY / height;
  
    // 颜色计算逻辑保持不变
    const red = Math.round(255 * (1 - xPercent) * (1 - yPercent));
    const blue = Math.round(255 * xPercent * (1 - yPercent));
    const green = Math.round(255 * (1 - xPercent) * yPercent);
    const yellow = Math.round(255 * xPercent * yPercent);
  
    const newColor = `rgb(${red + yellow}, ${green + yellow}, ${blue})`;
    setBgColor(newColor);
  
    // 更新方块位置，使用限制后的坐标
    gsap.to(boxRef.current, {
      duration: 0.1,
      x: limitedX,
      y: limitedY,
      ease: "none",
      transformOrigin: "center center"
    });
  };
  
  return (
    <div className="App" style={{ backgroundColor: bgColor }}>
      <div className="box" ref={boxRef}></div>
    </div>
  );
};

export default App;
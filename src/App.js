import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import './App.css';
import colorNamer from 'color-namer';
import ntc from './ntc';  // 将 ntc.js 文件正确导入

const App = () => {
  const boxRef = useRef(null);
  const [bgColor, setBgColor] = useState("red");
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [fixedColor, setFixedColor] = useState(null); // 用于存储固定的颜色
  const [colorName, setColorName] = useState(""); // 存储颜色名称
  const [objectName, setObjectName] = useState(""); // 存储物体名称

  useEffect(() => {
    // 判断设备类型
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);

    const appElement = document.querySelector(".App");

    const handleInteraction = (event) => {
      if (fixedColor) return; // 如果颜色已固定，不再继续更新
      
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

    const handleClick = () => {
      if (fixedColor) return; // 如果颜色已固定，跳过点击处理
      
      setFixedColor(bgColor); // 固定当前颜色

      // 使用 color-namer 获取最接近的颜色名称
      const resultNamer = colorNamer(bgColor);
      const closestNamerColor = resultNamer.ntc[0].name;

      // 将 rgb 转换为 hex 格式，适用于 ntc.js
      const hexColor = rgbToHex(bgColor);

      // 使用 ntc.js 获取颜色名称
      const resultNTC = ntcName(hexColor);
      const closestNTCColor = resultNTC[1];  // 获取最接近的颜色名称

      // 将最接近的颜色名称更新到状态中
      setColorName(`${closestNamerColor} (Namer) / ${closestNTCColor} (NTC)`);

      // 关联颜色与现实物体
      const object = getObjectForColor(closestNamerColor);
      setObjectName(object);
    };

    appElement.addEventListener(isTouchDevice ? "touchend" : "click", handleClick);

    return () => {
      if (isTouchDevice) {
        appElement.removeEventListener("touchmove", handleInteraction);
        appElement.removeEventListener("touchstart", handleInteraction);
        appElement.removeEventListener("touchend", handleClick);
      } else {
        appElement.removeEventListener("mousemove", handleInteraction);
        appElement.removeEventListener("click", handleClick);
      }
    };
  }, [isTouchDevice, bgColor, fixedColor]);

  const updatePosition = (clientX, clientY, currentTarget) => {
    const width = currentTarget.clientWidth;
    const height = currentTarget.clientHeight;

    const boxSize = boxRef.current.offsetWidth / 2; // 方块半径
    const limitedX = Math.max(boxSize, Math.min(clientX, width - boxSize));
    const limitedY = Math.max(boxSize, Math.min(clientY, height - boxSize));

    // 计算颜色百分比
    const xPercent = limitedX / width;
    const yPercent = limitedY / height;

    const red = Math.round(255 * (1 - xPercent) * (1 - yPercent));
    const blue = Math.round(255 * xPercent * (1 - yPercent));
    const green = Math.round(255 * (1 - xPercent) * yPercent);
    const yellow = Math.round(255 * xPercent * yPercent);

    const newColor = `rgb(${red + yellow}, ${green + yellow}, ${blue})`;
    setBgColor(newColor);

    gsap.to(boxRef.current, {
      duration: 0.1,
      x: limitedX,
      y: limitedY,
      ease: "none",
      transformOrigin: "center center"
    });
  };

  // 将 rgb 转换为 hex 格式
  const rgbToHex = (rgb) => {
    const rgbArray = rgb.match(/\d+/g).map(Number);
    return `#${((1 << 24) + (rgbArray[0] << 16) + (rgbArray[1] << 8) + rgbArray[2]).toString(16).slice(1).toUpperCase()}`;
  };

  // 重置颜色选择
  const resetColor = () => {
    setFixedColor(null); // 允许重新选择颜色
  };

  // ntc.js 的名称获取
  const ntcName = (hexColor) => {
    let closestColor = '';
    for (let i = 0; i < ntc.length; i++) {
      if (ntc[i].hex === hexColor.replace('#', '')) {
        closestColor = ntc[i].name;
        break;
      }
    }
    return [hexColor, closestColor];
  };

  // 定义一个简单的颜色-物体映射表
  const getObjectForColor = (colorName) => {
    const colorObjects = {
      red: "apple",
      blue: "sky",
      green: "grass",
      yellow: "sunflower",
      aquamarine: "sea",
      amber: "gemstone",
      // 更多颜色可以根据需求进行扩展
    };
    return colorObjects[colorName.toLowerCase()] || "an object";
  };

  return (
    <div className="App" style={{ backgroundColor: fixedColor || bgColor }}>
      <div className="box" ref={boxRef}></div>
      {fixedColor && (
        <div className="color-info">
          <p>固定颜色: {colorName}</p>
          <p>相关物体: {objectName}</p>
          <button onClick={resetColor}>重新选择颜色</button>
        </div>
      )}
    </div>
  );
};

export default App;

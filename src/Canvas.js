import React from 'react';
import { useRef, useEffect } from 'react'
import DinoGame from './DinoGame';
import { useState } from 'react';




const Canvas = () => {
  //const canvasRef = useRef();

  const [widthOld, setWidth] = useState(window.innerWidth >= 680 ? 680 : window.innerWidth);
  const [heightOld, setHeight] = useState(window.innerWidth >= 680 ? 320 : (window.innerWidth *8/17));

  let width = window.innerWidth >= 680 ? 680 : window.innerWidth;
  let height = window.innerWidth >= 680 ? 320 : (window.innerWidth *8/17);
  console.log(window.innerWidth)
    console.log(window.innerHeight)
    console.log(width, height)

return (
    < DinoGame width={width} height={height} />
  );
};

export default Canvas;
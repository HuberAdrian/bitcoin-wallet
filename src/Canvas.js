import React from 'react';
import { useRef, useEffect } from 'react'
import DinoGame from './DinoGame';
import { useState } from 'react';




const Canvas = () => {
  //const canvasRef = useRef();

  const [width, setWidth] = useState(window.innerWidth >= 680 ? 680 : window.innerWidth);
  const [height, setHeight] = useState(window.innerWidth >= 680 ? 320 : (window.innerWidth *8/17));


return (
    < DinoGame width={width} height={height} />
  );
};

export default Canvas;
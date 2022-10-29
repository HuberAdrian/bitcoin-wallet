import React from 'react';
import { useRef, useEffect } from 'react'
import DinoGame from './DinoGame';
import { useState } from 'react';




const Canvas = () => {
  //const canvasRef = useRef();

  const [widthOld, setWidth] = useState(window.innerWidth >= 680 ? 680 : window.innerWidth);
  const [heightOld, setHeight] = useState(window.innerWidth >= 680 ? 250 : (window.innerWidth *8/17));

  // change the width and height of the canvas when the window is resized
  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth >= 680 ? 680 : window.innerWidth);
      setHeight(window.innerWidth >= 680 ? 250 : (window.innerWidth *8/17));
      console.log("width: " + widthOld + " height: " + heightOld);
      window.location.reload();
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, []);
  
return (
    < DinoGame width={widthOld} height={heightOld} />
  );
};

export default Canvas;
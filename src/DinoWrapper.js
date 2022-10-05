import React from 'react'
import { useRef } from 'react'
import DinoGame from './DinoGame'

function DinoWrapper() {
    const canvasRef = useRef(null)
    
  return (<>
    <div>DinoWrapper</div>
    <DinoGame  ></DinoGame>
    </>
  )
}

export default DinoWrapper
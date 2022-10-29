import React from 'react';
import { useState, useRef, useEffect } from 'react';

import * as DEFAULT from './constants';
import { STATUS } from './constants';
import {
    replayImage, gameOverImage, skyImage, groundImage,
    dinoImage, dinoLeftImage, dinoRightImage, dinoDieImage, obstacleImage,
    dinoCrouchLeftImage, dinoCrouchRightImage, flyingDinoUpImage, flyingDinoDownImage
} from './img/img';

const DinoGame = ({width, height}) => {

    const canvasRef = useRef();

    // options for the game
    let options = {
        fps: DEFAULT.FPS,
        skySpeed: DEFAULT.SKY_SPEED,
        groundSpeed: DEFAULT.GROUND_SPEED,
        skyImage: skyImage,
        groundImage: groundImage,
        dinoImage: {
            0: dinoImage,
            1: dinoLeftImage,
            2: dinoRightImage,
            3: dinoDieImage,
            4: dinoCrouchLeftImage,
            5: dinoCrouchRightImage,
            6: flyingDinoUpImage,
            7: flyingDinoDownImage
        },
        obstacleImage: obstacleImage,
        skyOffset: DEFAULT.SKY_OFFSET,
        groundOffset: DEFAULT.GROUND_OFFSET
    };

    // state of the game
    let status = STATUS.STOP;
    let score = 0;
    let highScore = 0;
    let jumpHeight = 0;
    let currentDistance = 0;
    let obstaclesBase = 1;
    let obstacles = [];
    let playerStatus = 0;
    let playerCrouch = false;
    let jumpDelta = DEFAULT.JUMP_DELTA;
    let timer = null;
    let gravity = DEFAULT.JUMP_GRAVITY;
    let jumpMaxHeight = DEFAULT.JUMP_MAX_HEIGHT;
    let booleanStatus = 0;

    // create obstacles
    const obstaclesGenerate = () => {

        let obstacles_created = [];
        for (let i = 0; i < 10; ++i) {
            let random = Math.floor(Math.random() * 100) % 60;
            random = (Math.random() * 10 % 2 === 0 ? 1 : -1) * random;
            obstacles_created.push({
                distance: random + obstaclesBase * 200,
                obstacleImageHeight: options.obstacleImage.height + (Math.random()*height/6)
            });
            obstaclesBase = obstaclesBase + 1;
        }

        obstacles = obstacles.concat(obstacles_created);
        return;
    }


    useEffect(() => {
            
            //check if highscore exists in local storage
            if (window.localStorage) {
                highScore = window.localStorage['highScoreDino'] || 0;
            }
            obstaclesGenerate();

            // get focus on Canvas
            canvasRef.current.focus(); 
            draw() //render();

            setTimeout(() => {
                // start game after 1 second
                onJump();
            }, 1000);
    
            window.onblur = pause;
            window.onfocus = goOn;
    
            return;
    }, []);
    


    const onJump = () => {
        switch (status) {
            case STATUS.STOP:
                start();
                break;
            case STATUS.START:
                jump();
                break;
            case STATUS.OVER:
                restart();
                break;
            case STATUS.PAUSE:
                goOn();
                break;
            default:
                break;
        }
    };

    const onCrouch = (e) => {
            if (e === 'down') {
                playerCrouch = true;
                gravity = DEFAULT.JUMP_GRAVITY * 4;
                jumpMaxHeight = jumpHeight

                // tickle with feed
                if (booleanStatus) {
                    playerStatus = 4;
                }
                else {
                    playerStatus = 5;
                }

            } 
            else{
                playerStatus = 0;
                playerCrouch = false;
                gravity = DEFAULT.JUMP_GRAVITY;
                jumpMaxHeight = DEFAULT.JUMP_MAX_HEIGHT;
            }
    }

    const onPause = () => {
        switch (status) {
            case STATUS.PAUSE: // pause -> go on
                goOn();
                break;
            case STATUS.START: // start -> pause
                pause();
                break;
            default:
                break;
        }
    }



	const draw = () => {
        const ctx  = canvasRef.current.getContext('2d');
		ctx.clearRect(0, 0, width, height);

            let level = Math.min(200, Math.floor(score / 100));
            let groundSpeed = (options.groundSpeed + level) / options.fps;
            let skySpeed = options.skySpeed / options.fps;  
            let obstacleWidth = options.obstacleImage.width;
            let dinoWidth = options.dinoImage[0].width;
            let dinoHeight = options.dinoImage[0].height;
            let positionDinoX = width / 8;
            let positionDinoY = height/1.3 - jumpHeight;

            //boolean for tickle with feed
            booleanStatus = !booleanStatus;
            
            
            ctx.clearRect(0, 0, width, height);
            ctx.save();

            // Draw cloud
            options.skyOffset = options.skyOffset < width
                ? (options.skyOffset + skySpeed)
                : (options.skyOffset - width);
            ctx.translate(-options.skyOffset, 0, height/3);
            ctx.drawImage(options.skyImage, 0, height/3);
            ctx.drawImage(options.skyImage, options.skyImage.width, height/3);
            

            // Draw ground
            options.groundOffset = options.groundOffset < width 
                ? (options.groundOffset + groundSpeed)
                : (options.groundOffset - width);
            ctx.translate(options.skyOffset - options.groundOffset, 0);
            ctx.drawImage(options.groundImage, 0, height - options.groundImage.height);
            ctx.drawImage(options.groundImage, options.groundImage.width, height - options.groundImage.height);

            // Draw dinosaur
            // Translate to top left corner
            ctx.translate(options.groundOffset, 0);
            ctx.drawImage(options.dinoImage[playerStatus], positionDinoX, (positionDinoY)); 

            



            // if dino jump
            jumpHeight = jumpHeight + jumpDelta;
            if (jumpHeight <= 1) {
                jumpHeight = 0;
                jumpDelta = 0;

                // change back from flying dino to normal dino after jump 
                if (!playerCrouch) {
                    playerStatus = 0;
                }
            } 

            // during jump
            else if (jumpHeight < jumpMaxHeight && jumpDelta > 0) {
                jumpDelta = (jumpHeight* jumpHeight) * 0.001033 - jumpHeight * 0.139 + 6;
                playerStatus = 6;

                // tickle with wings
                if (booleanStatus) {
                    playerStatus = 7;
                }
            } 
            
            // if dino reach max height
            else if (jumpHeight >= jumpMaxHeight) {
                jumpDelta = -jumpDelta/2;
            
            }

            // make dino fall faster
            if (jumpHeight > 1 && jumpDelta < 0) {
                jumpDelta = jumpDelta - gravity;
            }
        
            



            // Draw score text
            let scoreText = (status === STATUS.OVER) ? 'GAME OVER  ' : '';
            scoreText += Math.floor(score);
            ctx.font = "Bold 18px Arial";
            ctx.textAlign = "right";
            ctx.fillStyle = "#595959";
            ctx.fillText(scoreText, width - 30, 23);


            // if Dino is running:
            if (status === STATUS.START) {
                score = score + 0.1;

                // check if highscore is reached
                if (score > highScore) {
                    highScore = score;
                    window.localStorage['highScoreDino'] = highScore;

                }
            
                currentDistance = currentDistance + groundSpeed;
                
                // make Dino tickle with feed when score is divisible by 100
                    if (booleanStatus && playerStatus < 3) {
                        playerStatus = 1;
                        }
                    
                    else if (!booleanStatus && playerStatus < 3) {
                        playerStatus = 2;
                    }

                // make groundspeed faster
                    options.groundSpeed = Math.min(score + DEFAULT.GROUND_SPEED, 600);
                
            }

            // draw highscore
            if (highScore) {
                ctx.textAlign = "left";
                ctx.fillText("HIGH " + Math.floor(highScore), 30, 23);
            }
            
            // Draw obstacles
            let pop = 0;
            for (let i = 0; i < obstacles.length; ++i) {
                if (currentDistance >= obstacles[i].distance) {
                    let offset = width - (currentDistance - obstacles[i].distance + groundSpeed);
                    if (offset > 0) {
                        ctx.drawImage(options.obstacleImage, offset, ((height - (options.groundImage.height/3)) - obstacles[i].obstacleImageHeight), obstacleWidth, obstacles[i].obstacleImageHeight);
                    } else {
                        ++pop;
                    }
                    
                } else {
                    break;
                }
            }

            for (let i = 0; i < pop; ++i) {
                obstacles.shift();
            }

            // create obstacles if not enough
            if (obstacles.length < 5) {
                obstaclesGenerate()
            }

            // Check collision
            if (status === STATUS.START) {
                let dinoRect = {
                    x: positionDinoX + dinoWidth * 0.2,
                    y: positionDinoY + dinoHeight * 0.2,
                    width: dinoWidth * 0.6,
                    height: dinoHeight * 0.6
                };
                for (let i = 0; i < obstacles.length; ++i) {
                    let obstacleRect = {
                        x: width - (currentDistance - obstacles[i].distance),
                        y: height - (options.groundImage.height/3) - obstacles[i].obstacleImageHeight,
                        width: obstacleWidth,
                        height: obstacles[i].obstacleImageHeight
                    };
                    if (dinoRect.x < obstacleRect.x + obstacleRect.width &&
                        dinoRect.x + dinoRect.width > obstacleRect.x &&
                        dinoRect.y < obstacleRect.y + obstacleRect.height &&
                        dinoRect.y + dinoRect.height > obstacleRect.y) {
                            ctx.drawImage(gameOverImage, width / 2 - 70, 40);
                            ctx.drawImage(replayImage, width / 2 + 10, 55);
                            stop();
                            break;
                    }
                }
            }
            
            ctx.restore(); // restores the most recently saved canvas state by popping the top entry in the drawing state stack.

	};


    const __setTimer = () => {
        timer = setInterval(() => {
            draw();
        }, 1000 / options.fps);
    }

    const __clearTimer = () => {
        if (timer) {
        clearInterval(timer);
        timer = null;
        }
    }



    const __clear = () => {
        obstacles = [];
        obstaclesBase = 1;
        currentDistance = 0;
        score = 0;
        jumpHeight = 0;
    }

    const start = () => {
        if (status === STATUS.START) {
            return;
        }

        status = STATUS.START;
        __setTimer();
        //render();
        jump();
    }

    const pause = () => {
        if (status === STATUS.START) {
            status = STATUS.PAUSE;
            // pause animation
            __clearTimer();
        }
    }

    const goOn = () => {
        if (status === STATUS.PAUSE) {
            status = STATUS.START;
            __setTimer();
            //render();
        }
    }

    const stop = () => {
        if (status === STATUS.OVER) {
            return;
        }

        playerCrouch = false;
        status = STATUS.OVER;
        playerStatus = 3;
        __clearTimer();
        //handleLoose();
        draw();
        __clear();
        playerStatus = 0;

    }

    const restart = () => {
        obstaclesGenerate();
        start();
    }

    const jump = () => {
        if (jumpHeight > 2) {
            return;
        }

        jumpDelta = DEFAULT.JUMP_DELTA;
        jumpHeight = DEFAULT.JUMP_DELTA;
    }



    // handle KeyDown event
    const handleKeyDown = (e) => {
        e.preventDefault();
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
            onJump();
            onCrouch("up");
        }
        
        else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
            onCrouch("down");
        }

        else if (e.code === 'KeyP') {
            onPause();
        }
         
    }

    // handle KeyUp event
    const handleKeyUp = (e) => {
        e.preventDefault();
        if (e.code === 'ArrowDown' || e.code === 'KeyS') {
            onCrouch("up");
        }
    }



    const handleMouseDown = (e) => {
        e.preventDefault();
        const x = e.clientX - canvasRef.current.offsetLeft;
        const y = e.clientY - canvasRef.current.offsetTop;

        if (status === STATUS.INIT || status === STATUS.STOP) {
            status = STATUS.START;
            obstaclesGenerate();
            __setTimer();
            //render();
        } else if (status === STATUS.OVER) {
            if (x > 150 && x < 196 && y > 100 && y < 146) {
                status = STATUS.INIT;
                __clear();
                draw();
                //render();
            }
        }

        else {
            onJump();
        }
    }


    /*
    // handle rerendering:

    let isRunning = true; // used to stop the animation
    let lastTime;

    // create render() function to render the canvas based on anmaition frame 
    const render = (time) => {
        // get focus on canvas
        canvasRef.current.focus();

        // return if the game is not started because we cant calculate the delta time
        if (lastTime == null) {
            lastTime = time;
            window.requestAnimationFrame(render);
            return;
        }

        // stop rendering if isRunning is false
        if (!isRunning) {
            return;
        }

        const deltaTime = time - lastTime;
        draw(deltaTime);

        lastTime = time;
        window.requestAnimationFrame(render);
    }

    function handleLoose() {
        console.log("loose called");
        lastTime = null;
        // set High Score in local storage
        isRunning = false;
    }
    */


    return (<>
        <div className="game" >
            <canvas tabIndex={0} ref={canvasRef} height={height} width={width} onKeyDown={handleKeyDown} onMouseDown={handleMouseDown} onKeyUp={handleKeyUp}  />
        </div> 
        <h1>Space</h1>
        </>
    );
}

export default DinoGame;
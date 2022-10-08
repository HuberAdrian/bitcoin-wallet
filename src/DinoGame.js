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


    // rewrite states as variables with let
    let options = {
        fps: DEFAULT.FPS,
        skySpeed: DEFAULT.SKY_SPEED,
        groundSpeed: DEFAULT.GROUND_SPEED,
        skyImage: skyImage,
        groundImage: groundImage,
        // dinoImage: [dinoImage, dinoLeftImage, dinoRightImage, dinoDieImage],
        dinoImage: {
            0: dinoImage,
            1: dinoLeftImage,
            2: dinoRightImage,
            3: dinoDieImage,
            4: dinoCrouchLeftImage,
            5: dinoCrouchRightImage
        },
        obstacleImage: obstacleImage,
        skyOffset: DEFAULT.SKY_OFFSET,
        groundOffset: DEFAULT.GROUND_OFFSET
    };

    let status = STATUS.STOP;
    let score = 0;
    let highScore = 0;
    let jumpHeight = 0;
    let currentDistance = 0;
    let obstaclesBase = 1;
    let obstacles = [];
    let playerStatus = 0;
    let playerCrouch = false;
    let jumpDelta = 0;
    let timer = null;


    const __obstaclesGenerate = () => {

        console.log('obstacles generate');
        let obstacles_created = [];
        for (let i = 0; i < 10; ++i) {
            let random = Math.floor(Math.random() * 100) % 60;
            random = (Math.random() * 10 % 2 === 0 ? 1 : -1) * random;
            obstacles_created.push({
                distance: random + obstaclesBase * 200
            });
            obstaclesBase = obstaclesBase + 1;
        }

        obstacles = obstacles.concat(obstacles_created);
        console.log(obstacles);
        return;
    }


    useEffect(() => {
            
            //check if highscore exists in local storage
            if (window.localStorage) {
                highScore = window.localStorage['highScoreDino'] || 0;
            }
            __obstaclesGenerate();
    
    
            // check if images are loaded
            
            if (dinoImage && replayImage && gameOverImage) {
                console.log("draw called from useEffect start");
                draw();
            }
    
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
                    default:
                        break;
                }
            };
    
            const onCrouch = (e) => {
                if (status === STATUS.START) {
                    if (e === 'down') {
                        playerStatus = playerStatus % 2 + 4;
                        playerCrouch = true;
                    } else if (e === 'up') {
                        playerStatus = 0;
                        playerCrouch = false;
                    }
                } else {
                    return;
                }
            }
    
            const onPause = () => {
                switch (status) {
                    case STATUS.PAUSE:
                        goOn();
                        break;
                    case STATUS.START:
                        pause();
                        break;
                    default:
                        break;
                }
            }
    
            window.onkeypress = (e) => {
                if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
                    onJump();
                } else if (e.code === 'KeyP') {
                    onPause();
                }
            }
            window.onkeydown = (e) => {
                if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                    onCrouch('down');
                }
            }
            window.onkeyup = (e) => {
                if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                    onCrouch('up');
                }
            }
    
            //canvasRef.parentNode.onclick = onJump;
    
            window.onblur = pause;
            window.onfocus = goOn;
            console.log("component did mount");
    
            return;
    }, []);
    



	const draw = () => {
        const ctx  = canvasRef.current.getContext('2d');
        
        if (!canvasRef) {
            console.log("canvas not created")
            return;
        }


		ctx.clearRect(0, 0, width, height);
		// ...

        console.log("draw called");

            let level = Math.min(200, Math.floor(score / 100));
            let groundSpeed = (options.groundSpeed + level) / options.fps;
            let skySpeed = options.skySpeed / options.fps;
            let obstacleWidth = options.obstacleImage.width;
            let dinoWidth = options.dinoImage[0].width;
            let dinoHeight = options.dinoImage[0].height;
            
            
            ctx.clearRect(0, 0, width, height);
            ctx.save();

            // Draw cloud
            options.skyOffset = options.skyOffset < width
                ? (options.skyOffset + skySpeed)
                : (options.skyOffset - width);
            ctx.translate(-options.skyOffset, 0);
            ctx.drawImage(options.skyImage, 0, 0);
            ctx.drawImage(options.skyImage, options.skyImage.width, 0);
            
            // Draw ground
            options.groundOffset = options.groundOffset < width 
                ? (options.groundOffset + groundSpeed)
                : (options.groundOffset - width);
            ctx.translate(options.skyOffset - options.groundOffset, 0);
            ctx.drawImage(options.groundImage, 0, 76);
            ctx.drawImage(options.groundImage, options.groundImage.width, 76);

            // Draw dinosaur
            // Translate to top left corner
            ctx.translate(options.groundOffset, 0);
            ctx.drawImage(options.dinoImage[playerStatus], 80, 64 - jumpHeight);
            // Update jump height and speed
            jumpHeight = jumpHeight + jumpDelta;
            if (jumpHeight <= 1) {
                jumpHeight = 0;
                jumpDelta = 0;
            } 
            else if (jumpHeight < DEFAULT.JUMP_MAX_HEIGHT && jumpDelta > 0) {
                jumpDelta = (jumpHeight ** 2) * 0.001033 - jumpHeight * 0.137 + 5;
            // } else if (jumpHeight < DEFAULT.JUMP_MAX_HEIGHT && this.jumpDelta < 0) {
            //     this.jumpDelta = (this.jumpDelta ** 2) * 0.00023 - this.jumpHeight * 0.03 - 4;
            } else if (jumpHeight >= DEFAULT.JUMP_MAX_HEIGHT) {
                jumpDelta = -jumpDelta/2;
            }

            // Draw score text
            let scoreText = (status === STATUS.OVER) ? 'GAME OVER  ' : '';
            scoreText += Math.floor(score);
            ctx.font = "Bold 18px Arial";
            ctx.textAlign = "right";
            ctx.fillStyle = "#595959";
            ctx.fillText(scoreText, width - 30, 23);
            if (status === STATUS.START) {
                score = score + 1;

                if (score > highScore) {
                    highScore = score;
                    // console.log("Score: " + this.score + ", New High: " + this.highScore);
                    window.localStorage['highScoreDino'] = highScore;

                }
                currentDistance = currentDistance + groundSpeed;
                if (score % 4 === 0) {
                    if (!playerCrouch) {
                        playerStatus = (playerStatus + 1) % 3;
                    } else {
                        playerStatus = (playerStatus + 1) % 2 + 4;
                    }
                    // this.options.groundSpeed = Math.min((this.score / 10) + DEFAULT.GROUND_SPEED, 600);
                    // console.log(this.groundSpeed);
                }
            }

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
                        ctx.drawImage(options.obstacleImage, offset, 74);
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

            if (obstacles.length < 5) {
                __obstaclesGenerate()
            }

            // Check collision
            let firstOffset = width - (currentDistance - obstacles[0].distance + groundSpeed);
            if (90 - obstacleWidth < firstOffset &&
                firstOffset < 60 + dinoWidth &&
                64 - jumpHeight + dinoHeight > 84) {
                ctx.drawImage(gameOverImage, width / 2 - 70, 40);
                ctx.drawImage(replayImage, width / 2 + 10, 55);
                stop();
            }
            
            ctx.restore();




	};

    

    const __clear = () => {
        obstacles = [];
        obstaclesBase = 1;
        currentDistance = 0;
        score = 0;
        jumpHeight = 0;
    }

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

    const start = () => {
        if (status === STATUS.START) {
            return;
        }

        status = STATUS.START;
        __setTimer();
        jump();
    }

    const pause = () => {
        if (status === STATUS.START) {
            status = STATUS.PAUSE;
            __clearTimer();
        }
    }

    const goOn = () => {
        if (status === STATUS.PAUSE) {
            status = STATUS.START;
            __setTimer();
        }
    }

    const stop = () => {
        if (status === STATUS.OVER) {
            return;
        }

        playerCrouch = false;
        status = STATUS.START;
        playerStatus = 3;
        __clearTimer();
        //console.log("draw called from stop");
        //draw();
        __clear();
        playerStatus = 0;

    }

    const restart = () => {
        console.log('restart called');
        __obstaclesGenerate();
        start();
    }

    const jump = () => {
        if (jumpHeight > 2) {
            return;
        }

        jumpDelta = DEFAULT.JUMP_DELTA;
        jumpHeight = DEFAULT.JUMP_DELTA;
    }



    const __keyDown = (e) => {
        if (e.keyCode === 32) {
            jump();
        }
        if (e.keyCode === 40) {
            playerCrouch = true;
        }
    }

    const __keyUp = (e) => {
        if (e.keyCode === 40) {
            playerCrouch = false;
        }
    }

    
    const __mouseDown = (e) => {
        const x = e.clientX - canvasRef.current.offsetLeft;
        const y = e.clientY - canvasRef.current.offsetTop;
        if (status === STATUS.INIT) {
            status = STATUS.START;
            __obstaclesGenerate();
            __setTimer();
        } else if (status === STATUS.PLAY) {
            jump();
        } else if (status === STATUS.OVER) {
            if (x > 150 && x < 196 && y > 100 && y < 146) {
                status = STATUS.INIT;
                __clear();
                console.log("draw called from mouseDown");
                draw();
            }
        }
    }


    return (
        <div className="game">
            <canvas ref={canvasRef} height={height} width={width} />
        </div>
    );
}

export default DinoGame;
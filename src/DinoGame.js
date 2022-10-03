import React from 'react';
import { useState, useRef, useEffect } from 'react';
import useCanvas from './useCanvas';

import * as DEFAULT from './constants';
import { STATUS } from './constants';
import {
    replayImage, gameOverImage, skyImage, groundImage,
    dinoImage, dinoLeftImage, dinoRightImage, dinoDieImage, obstacleImage,
    dinoCrouchLeftImage, dinoCrouchRightImage, flyingDinoUpImage, flyingDinoDownImage
} from './img/img';


/*
export default class DinoGame extends React.Component {
    constructor(props) {
        console.log('constructor');
        super(props);


        let imageLoadCount = 0;
        let onImageLoaded = () => {
            ++imageLoadCount;
            if (imageLoadCount === 3) {
                console.log('image loaded');
                this.__draw();
            }
        };

        // Image files
        skyImage.onload = onImageLoaded;
        groundImage.onload = onImageLoaded;
        dinoImage.onload = onImageLoaded;

        this.options = {
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
            groundOffset: DEFAULT.GROUND_OFFSET,
            ...this.props.options
        };

        this.status = STATUS.STOP;
        this.timer = null;
        this.score = 0;
        this.highScore = window.localStorage ? window.localStorage['highScore'] || 0 : 0;
        this.jumpHeight = 0;
        this.jumpDelta = 0;
        this.obstaclesBase = 1;
        this.obstacles = this.__obstaclesGenerate();
        
        this.currentDistance = 0;
        this.playerStatus = 0;
        this.playerCrouch = false;
    }

    componentDidMount() {
        console.log('componentDidMount');
        if (window.innerWidth >= 680) {
            this.canvas.width = 680;
        }

        const onJump = () => {
            switch (this.status) {
                case STATUS.STOP:
                    this.start();
                    break;
                case STATUS.START:
                    this.jump();
                    break;
                case STATUS.OVER:
                    this.restart();
                    break;
                default:
                    break;
            }
        };

        const onCrouch = (e) => {
            if (this.status === STATUS.START) {
                if (e === 'down') {
                    this.playerStatus = this.playerStatus % 2 + 4;
                    this.playerCrouch = true;
                } else if (e === 'up') {
                    this.playerStatus = 0;
                    this.playerCrouch = false;
                }
            } else {
                return;
            }
        }

        const onPause = () => {
            switch (this.status) {
                case STATUS.PAUSE:
                    this.goOn();
                    break;
                case STATUS.START:
                    this.pause();
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

        this.canvas.parentNode.onclick = onJump;

        window.onblur = this.pause;
        window.onfocus = this.goOn;
    }

    componentWillUnmount() {
        window.onblur = null;
        window.onfocus = null;
    }

    __draw() {
        console.log('draw');
        if (!this.canvas) {
            return;
        }

        const { options } = this;

        let level = Math.min(200, Math.floor(this.score / 100));
        let groundSpeed = (options.groundSpeed + level) / options.fps;
        let skySpeed = options.skySpeed / options.fps;
        let obstacleWidth = options.obstacleImage.width;
        let dinoWidth = options.dinoImage[0].width;
        let dinoHeight = options.dinoImage[0].height;

        const ctx = this.canvas.getContext('2d');
        const { width, height } = this.canvas;

        ctx.clearRect(0, 0, width, height);
        ctx.save();

        // Draw cloud
        this.options.skyOffset = this.options.skyOffset < width
            ? (this.options.skyOffset + skySpeed)
            : (this.options.skyOffset - width);
        ctx.translate(-this.options.skyOffset, 0);
        ctx.drawImage(this.options.skyImage, 0, 0);
        ctx.drawImage(this.options.skyImage, this.options.skyImage.width, 0);

        // Draw ground
        this.options.groundOffset = this.options.groundOffset < width
            ? (this.options.groundOffset + groundSpeed)
            : (this.options.groundOffset - width);
        ctx.translate(this.options.skyOffset - this.options.groundOffset, 0);
        ctx.drawImage(this.options.groundImage, 0, 76);
        ctx.drawImage(this.options.groundImage, this.options.groundImage.width, 76);

        // Draw dinosaur
        // Translate to top left corner
        ctx.translate(this.options.groundOffset, 0);
        ctx.drawImage(this.options.dinoImage[this.playerStatus], 80, 64 - this.jumpHeight);
        // Update jump height and speed
        this.jumpHeight = this.jumpHeight + this.jumpDelta;
        if (this.jumpHeight <= 1) {
            this.jumpHeight = 0;
            this.jumpDelta = 0;
        } else if (this.jumpHeight < DEFAULT.JUMP_MAX_HEIGHT && this.jumpDelta > 0) {
            this.jumpDelta = (this.jumpHeight ** 2) * 0.001033 - this.jumpHeight * 0.137 + 5;
        // } else if (this.jumpHeight < DEFAULT.JUMP_MAX_HEIGHT && this.jumpDelta < 0) {
        //     this.jumpDelta = (this.jumpDelta ** 2) * 0.00023 - this.jumpHeight * 0.03 - 4;
        } else if (this.jumpHeight >= DEFAULT.JUMP_MAX_HEIGHT) {
            this.jumpDelta = - DEFAULT.JUMP_DELTA / 2;
        }



        // Draw score text
        let scoreText = (this.status === STATUS.OVER) ? 'GAME OVER  ' : '';
        scoreText += Math.floor(this.score);
        ctx.font = "Bold 18px Arial";
        ctx.textAlign = "right";
        ctx.fillStyle = "#595959";
        ctx.fillText(scoreText, width - 30, 23);
        if (this.status === STATUS.START) {
            this.score += 0.5;
            if (this.score > this.highScore) {
                this.highScore = this.score;
                // console.log("Score: " + this.score + ", New High: " + this.highScore);
                window.localStorage['highScore'] = this.highScore;
            }
            this.currentDistance += groundSpeed;
            if (this.score % 4 === 0) {
                if (!this.playerCrouch) {
                    this.playerStatus = (this.playerStatus + 1) % 3;
                } else {
                    this.playerStatus = (this.playerStatus + 1) % 2 + 4;
                }
                // this.options.groundSpeed = Math.min((this.score / 10) + DEFAULT.GROUND_SPEED, 600);
                // console.log(this.groundSpeed);
            }
        }

        if (this.highScore) {
            ctx.textAlign = "left";
            ctx.fillText("HIGH " + Math.floor(this.highScore), 30, 23);
        }

        // Draw obstacles
        let pop = 0;
        for (let i = 0; i < this.obstacles.length; ++i) {
            if (this.currentDistance >= this.obstacles[i].distance) {
                let offset = width - (this.currentDistance - this.obstacles[i].distance + groundSpeed);
                if (offset > 0) {
                    ctx.drawImage(this.options.obstacleImage, offset, 74);
                } else {
                    ++pop;
                }
                
            } else {
                break;
            }
        }
        
        for (let i = 0; i < pop; ++i) {
            this.obstacles.shift();
        }

        if (this.obstacles.length < 5) {
            this.obstacles = this.obstacles.concat(this.__obstaclesGenerate());
        }

        // Collision detection
        let firstOffset = width - (this.currentDistance - this.obstacles[0].distance + groundSpeed);
        if (90 - obstacleWidth < firstOffset &&
            firstOffset < 60 + dinoWidth &&
            64 - this.jumpHeight + dinoHeight > 84) {
            ctx.drawImage(gameOverImage, width / 2 - 70, 40);
            ctx.drawImage(replayImage, width / 2 + 10, 55);
            this.stop();
        }

        ctx.restore();
    }

    __obstaclesGenerate() {
        console.log('obstaclesGenerate');
        let result = [];
        for (let i = 0; i < 10; ++i) {
            let random = Math.floor(Math.random() * 100) % 60;
            random = (Math.random() * 10 % 2 === 0 ? 1 : -1) * random;
            result.push({
                distance: random + this.obstaclesBase * 200
            });
            ++this.obstaclesBase;
        }
        return result;
    }

    __setTimer() {
        this.timer = setInterval(() => {
            this.__draw();
        }, 1000 / this.options.fps);
    }

    __clearTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    __clear() {
        this.score = 0;
        this.jumpHeight = 0;
        this.currentDistance = 0;
        this.obstacles = [];
        this.obstaclesBase = 1;
        this.playerStatus = 0;
    }

    start = () => {
        if (this.status === STATUS.START) {
            return;
        }

        this.status = STATUS.START;
        this.__setTimer();
        this.jump();
    };

    pause = () => {
        if (this.status === STATUS.START) {
            this.status = STATUS.PAUSE;
            this.__clearTimer();
        }
    };

    goOn = () => {
        if (this.status === STATUS.PAUSE) {
            this.status = STATUS.START;
            this.__setTimer();
        }
    };

    stop = () => {
        if (this.status === STATUS.OVER) {
            return;
        }

        this.status = STATUS.OVER;
        this.playerStatus = 3;
        this.__clearTimer();
        this.__draw();
        this.__clear();
        this.playerStatus = 0;
        this.playerCrouch = false;
    };

    restart = () => {
        this.obstacles = this.__obstaclesGenerate();
        this.start();
    };

    jump = () => {
        if (this.jumpHeight > 2) {
            return;
        }

        this.jumpDelta = DEFAULT.JUMP_DELTA;
        this.jumpHeight = DEFAULT.JUMP_DELTA;
    };

    render() {
        return (
            <canvas
                id="canvas"
                ref={ref => this.canvas = ref}
                height={160}
                width={340}
            />
        );
    }
}


*/

// rewrite DinoGame as a functional component



const DinoGame = (props) => {
    
    /*
    const [options, setOptions] = useState({
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
        groundOffset: DEFAULT.GROUND_OFFSET,
        ...props.options
    });


    const [status, setStatus] = useState(STATUS.STOP);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [jumpHeight, setJumpHeight] = useState(0);
    const [currentDistance, setCurrentDistance] = useState(0);
    const [obstaclesBase, setObstaclesBase] = useState(1);
    const [obstacles, setObstacles] = useState([]);
    const [playerStatus, setPlayerStatus] = useState(0);
    const [playerCrouch, setPlayerCrouch] = useState(false);
    const [jumpDelta, setJumpDelta] = useState(0);
    const [timer, setTimer] = useState(null);
    */


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
        groundOffset: DEFAULT.GROUND_OFFSET,
        ...props.options
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
    
    const [canvasRef, tracer] = useCanvas('2d');
	const [width, setWidth] = useState(window.innerWidth >= 680 ? 680 : window.innerWidth);
    const [height, setHeight] = useState(window.innerWidth >= 680 ? 320 : (window.innerWidth *8/17));


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
    



	const draw = tracer((ctx) => {

		ctx.clearRect(0, 0, width, height);
		// ...

        console.log("draw called");
        if (!canvasRef) {
            console.log('canvas not created');
            return;
        }
        else {
        console.log('canvas created');
        }
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




	});


	useEffect(() => draw(), [width, height]);




/*
    const __draw = (ctx, canvas) => {
        console.log("draw called");
        if (!canvas) {
            console.log('canvas not created');
            return;
        }
        else {
        console.log('canvas created');
        }
            let level = Math.min(200, Math.floor(score / 100));
            let groundSpeed = (options.groundSpeed + level) / options.fps;
            let skySpeed = options.skySpeed / options.fps;
            let obstacleWidth = options.obstacleImage.width;
            let dinoWidth = options.dinoImage[0].width;
            let dinoHeight = options.dinoImage[0].height;
            
            const { width, height } = canvas;
            
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
            setJumpHeight(jumpHeight + jumpDelta);
            if (jumpHeight <= 1) {
                setJumpHeight(0);
                setJumpDelta(0);
            } 
            else if (jumpHeight < DEFAULT.JUMP_MAX_HEIGHT && jumpDelta > 0) {
                setJumpDelta((jumpHeight ** 2) * 0.001033 - jumpHeight * 0.137 + 5);
            // } else if (jumpHeight < DEFAULT.JUMP_MAX_HEIGHT && this.jumpDelta < 0) {
            //     this.jumpDelta = (this.jumpDelta ** 2) * 0.00023 - this.jumpHeight * 0.03 - 4;
            } else if (jumpHeight >= DEFAULT.JUMP_MAX_HEIGHT) {
                setJumpDelta(-DEFAULT.JUMP_DELTA/2);
            }

            // Draw score text
            let scoreText = (status === STATUS.OVER) ? 'GAME OVER  ' : '';
            scoreText += Math.floor(score);
            ctx.font = "Bold 18px Arial";
            ctx.textAlign = "right";
            ctx.fillStyle = "#595959";
            ctx.fillText(scoreText, width - 30, 23);
            if (status === STATUS.START) {
                setScore(score + 1);
                if (score > highScore) {
                    setHighScore(score);
                    // console.log("Score: " + this.score + ", New High: " + this.highScore);
                    window.localStorage['highScoreDino'] = highScore;

                }
                setCurrentDistance(currentDistance + groundSpeed);
                if (score % 4 === 0) {
                    if (!playerCrouch) {
                        setPlayerStatus((playerStatus + 1) % 3);
                    } else {
                        setPlayerStatus((playerStatus + 1) % 2 + 4);
                    }
                    // this.options.groundSpeed = Math.min((this.score / 10) + DEFAULT.GROUND_SPEED, 600);
                    // console.log(this.groundSpeed);
                }
            }

            if (highScore) {
                ctx.textAlign = "left";
                ctx.fillText("HIGH " + Math.floor(highScore), 30, 23);
            }


            // return if obstacles not created
            if (!obstacles.length) {
                return;
            }

            // Draw obstacles
            let pop = 0;
            for (let i = 0; i < obstacles.length; ++i) {
                console.log(pop);
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
                __obstaclesGenerate(false)
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

    */

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
        draw();
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
                draw();
            }
        }
    }


    return (
        <div className="game">
            <canvas id='canvas' ref={canvasRef} width={width} height={height} />
        </div>
    );
}

export default DinoGame;
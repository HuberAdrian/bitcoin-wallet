import React from 'react';
import { useState, useRef, useEffect } from 'react';

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
        super(props);


        let imageLoadCount = 0;
        let onImageLoaded = () => {
            ++imageLoadCount;
            if (imageLoadCount === 3) {
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
            console.log(pop);
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



// rewrite DinoGame as a functional component
*/

const DinoGame = (props) => {
    
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


    const canvas = useRef(null);
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

    //check if highscore exists in local storage
    useEffect(() => {
        if (window.localStorage) {
            setHighScore(window.localStorage['highScore'] || 0);
        }
    }, []);

    setObstacles(obstaclesGenerate());

    const __draw = () => {
        const ctx = canvas.current.getContext('2d');
        const width = canvas.current.width;
        const height = canvas.current.height;
        const dinoWidth = 44;
        const dinoHeight = 47;
        const obstacleWidth = 50;
        const groundHeight = 10;
        const groundY = height - groundHeight;
        const replay = new Image();
        replay.src = replayImage;
        const gameOver = new Image();
        gameOver.src = gameOverImage;
        const dino = new Image();
        dino.src = dinoImage;

        ctx.save();

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw ground
        ctx.fillStyle = "#595959";
        ctx.fillRect(0, groundY, width, groundHeight);

        // Draw dino
        if (playerCrouch) {
            ctx.drawImage(dino, playerStatus * dinoWidth, 2 * dinoHeight, dinoWidth, dinoHeight, 60, 90, dinoWidth, dinoHeight);
        } else {
            ctx.drawImage(dino, playerStatus * dinoWidth, 0, dinoWidth, dinoHeight, 60, 64 - jumpHeight, dinoWidth, dinoHeight);
        }

        // Jump
        if (jumpHeight > 2) {
            setJumpHeight(jumpHeight + jumpDelta);
        } else {
            setJumpHeight(0);
            setJumpDelta(0);
        }

        // Draw obstacles
        for (let i = 0; i < obstacles.length; ++i) {
            ctx.fillStyle = "#595959";
            ctx.fillRect(width - (currentDistance - obstacles[i].distance + groundSpeed), groundY - 20, obstacleWidth, 20);
        }

        // Move obstacles
        setCurrentDistance(currentDistance + groundSpeed);
        if (currentDistance - obstacles[0].distance > width) {
            obstacles.shift();
        }
        
        // Generate obstacles
        if (obstacles.length < 10) {
            const random = Math.floor(Math.random() * 100) % 60;
            obstacles.push({
                distance: random + obstaclesBase * 200
            });
            setObstaclesBase(obstaclesBase + 1);
        }

        // Check collision
        for (let i = 0; i < obstacles.length; ++i) {
            if (currentDistance - obstacles[i].distance < 50 && currentDistance - obstacles[i].distance > -50) {
                if (jumpHeight > 0) {
                    setJumpHeight(0);
                    setJumpDelta(0);
                } else {
                    setStatus(STATUS.OVER);
                    setPlayerStatus(3);
                    __clearTimer();
                    __draw();
                    __clear();
                    setPlayerStatus(0);
                    setPlayerCrouch(false);
                }
            }
        }

        // Draw score
        ctx.fillStyle = "#595959";
        ctx.font = "20px Arial";
        ctx.fillText(score, 10, 20);

        // Draw high score
        ctx.fillStyle = "#595959";
        ctx.font = "20px Arial";
        ctx.fillText(highScore, 10, 40);

        // Draw replay
        if (status === STATUS.OVER) {
            ctx.drawImage(replay, 0, 0, 46, 46, 150, 100, 46, 46);
            ctx.drawImage(gameOver, 0, 0, 191, 11, 75, 50, 191, 11);
        }

        ctx.restore();
    };

    const __clear = () => {
        setObstacles([]);
        setObstaclesBase(1);
        setCurrentDistance(0);
        setScore(0);
        setGroundSpeed(DEFAULT.GROUND_SPEED);
    }

    const __obstaclesGenerate = () => {
        let obstacles = [];
        for (let i = 0; i < 10; ++i) {
            let random = Math.floor(Math.random() * 100) % 60;
            random = (Math.random() * 10 % 2 === 0 ? 1 : -1) * random;
            obstacles.push({
                distance: random + obstaclesBase * 200
            });
            setObstaclesBase(obstaclesBase + 1);
        }
        return obstacles;
    }

    const __setTimer = () => {
        setTimer(setInterval(() => {
            setScore(score + 1);
            if (score % 100 === 0) {
                setGroundSpeed(groundSpeed + 1);
            }
        }, 100));
    }

    const __clearTimer = () => {
        clearInterval(timer);
    }

    const __keyDown = (e) => {
        if (e.keyCode === 32) {
            jump();
        }
        if (e.keyCode === 40) {
            setPlayerCrouch(true);
        }
    }

    const __keyUp = (e) => {
        if (e.keyCode === 40) {
            setPlayerCrouch(false);
        }
    }

    const __mouseDown = (e) => {
        const x = e.clientX - canvas.current.offsetLeft;
        const y = e.clientY - canvas.current.offsetTop;
        if (status === STATUS.INIT) {
            setStatus(STATUS.PLAY);
            setObstacles(__obstaclesGenerate());
            __setTimer();
        } else if (status === STATUS.PLAY) {
            jump();
        } else if (status === STATUS.OVER) {
            if (x > 150 && x < 196 && y > 100 && y < 146) {
                setStatus(STATUS.INIT);
                __clear();
                __draw();
            }
        }
    }

    const jump = () => {
        if (jumpHeight === 0) {
            setJumpHeight(30);
            setJumpDelta(-2);
        }
    }

    useEffect(() => {
        if (status === STATUS.PLAY) {
            if (score > highScore) {
                setHighScore(score);
            }
            __draw();
        }
    }, [score, jumpHeight, playerCrouch, playerStatus, status]);

    useEffect(() => {

        // check if images are loaded
        if (dinoImage && replayImage && gameOverImage) {
            __draw();
        }

        // add event listeners
        document.addEventListener('keydown', __keyDown);
        document.addEventListener('keyup', __keyUp);
        canvas.current.addEventListener('mousedown', __mouseDown);
        return () => {
            document.removeEventListener('keydown', __keyDown);
            document.removeEventListener('keyup', __keyUp);
            canvas.current.removeEventListener('mousedown', __mouseDown);
        }
    }, []);

    return (
        <div className="game">
            <canvas ref={canvas} width={340} height={160} />
        </div>
    );
}

export default DinoGame;
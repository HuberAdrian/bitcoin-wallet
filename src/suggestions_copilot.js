const DinoGame = () => {
    const canvasRef = useRef(null);
    const [game, setGame] = useState(null);
    const [status, setStatus] = useState(STATUS.OVER);

    useEffect(() => {
        const canvas = canvasRef.current;
        const game = new Game(canvas);
        setGame(game);
    }, []);

    const handleKeyDown = useCallback((e) => {
        if (e.keyCode === 32) {
            if (status === STATUS.START) {
                game.pause();
                setStatus(STATUS.PAUSE);
            } else if (status === STATUS.PAUSE) {
                game.goOn();
                setStatus(STATUS.START);
            } else if (status === STATUS.OVER) {
                game.restart();
                setStatus(STATUS.START);
            }
        }
    }, [game, status]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return (
        <div className="dino-game">
            <canvas
                id="canvas"
                ref={canvasRef}
                height={160}
                width={340}
            />
        </div>
    );
}


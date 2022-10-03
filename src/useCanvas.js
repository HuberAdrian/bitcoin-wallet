import React from 'react';

export const requestAnimationFrame = (
	window.requestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.msRequestAnimationFrame
);

export const cancelAnimationFrame = (
	window.cancelAnimationFrame ||
	window.mozCancelAnimationFrame
);

export const useCanvas = (contextType = '2d', contextAttributes = undefined) => {
	const canvasRef = React.useRef(null);
	let canvas, context, animationFrameId, tracer;

	const updateContext = () => {
		canvas = canvasRef.current;
		if (canvas) {
			context = canvas.getContext(contextType, contextAttributes);
			animationFrameId = requestAnimationFrame(renderFrame);
		}
	};

	const setTracer = (tracerFn) => {
		tracer = tracerFn;
		return updateContext;
	};

	function renderFrame() {
		animationFrameId = requestAnimationFrame(renderFrame);
		tracer(context, canvas);
	}

	React.useEffect(() => {
		updateContext();
		return () => cancelAnimationFrame(animationFrameId);
	}, []);

	return [canvasRef, setTracer];
};

export default useCanvas;
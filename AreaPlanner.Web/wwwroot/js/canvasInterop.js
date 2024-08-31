window.canvasInterop = {
    initialize(dotNetObjectRef, elementId) {
        console.log('canvasInterop initialized');

        let shapes = [];
        let currentPoints = [];
        let referencePoints = [];
        let settingReferenceLine = false;
        let redoStack = [];
        let selectedShapeIndex = null;

        const canvasElement = document.getElementById(elementId);
        if (!canvasElement) {
            console.error(`Canvas element with id '${elementId}' not found`);
            return;
        }

        const context = canvasElement.getContext('2d');
        if (!context) {
            console.error('Failed to get canvas context');
            return;
        }

        const img = new Image();
        img.src = "floor_map_3.jpg";
        img.onload = () => {
            canvasElement.width = img.width;
            canvasElement.height = img.height;
            redrawCanvas();
        };

        function redrawCanvas() {
            clearCanvas(context);
            context.drawImage(img, 0, 0);
            drawShapes(context, shapes);
            drawPoints(context, currentPoints);
        }

        function clearCanvas(ctx) {
            ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        }

        function drawReferenceLine(ctx, points) {
            redrawCanvas();
            if (points.length === 2) {
                drawLine(ctx, points[0], points[1], 'red');
            }
        }

        function drawPoints(ctx, points) {
            points.forEach((point, index) => {
                drawCircle(ctx, point, 5, 'blue');
                if (index > 0) {
                    drawLine(ctx, points[index - 1], point, 'blue');
                }
            });

            if (points.length > 2 && isCloseToFirstPoint(points[0], points[points.length - 1])) {
                drawLine(ctx, points[points.length - 1], points[0], 'blue');
            }
        }

        function drawShapes(ctx, shapes) {
            shapes.forEach(points => {
                ctx.beginPath();
                points.forEach((point, index) => {
                    if (index === 0) {
                        ctx.moveTo(point.x, point.y);
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                });
                ctx.closePath();
                ctx.strokeStyle = 'green';
                ctx.stroke();
                ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
                ctx.fill();
            });
        }

        function drawLine(ctx, from, to, color) {
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.strokeStyle = color;
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.closePath();
        }

        function drawCircle(ctx, point, radius, color) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.closePath();
        }

        function isCloseToFirstPoint(firstPoint, currentPoint) {
            return calculateDistance(firstPoint, currentPoint) < 10;
        }

        function calculateDistance(point1, point2) {
            return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
        }

        function handleReferenceLine(x, y) {
            referencePoints.push({ x, y });
            drawReferenceLine(context, referencePoints);

            if (referencePoints.length === 2) {
                const distance = calculateDistance(referencePoints[0], referencePoints[1]);
                dotNetObjectRef.invokeMethodAsync('SetPixelsPerMeter', distance)
                    .catch(error => console.error('Error invoking SetPixelsPerMeter:', error));
                referencePoints = [];
                settingReferenceLine = false;
            }
        }

        function handleDrawing(x, y) {
            if (currentPoints.length === 0) {
                currentPoints.push({ x, y });
                drawPoints(context, currentPoints);
            } else {
                if (currentPoints.length > 2 && isCloseToFirstPoint(currentPoints[0], { x, y })) {
                    closeShape(x, y);
                } else {
                    currentPoints.push({ x, y });
                    drawPoints(context, currentPoints);
                }
            }
        }

        function closeShape(x, y) {
            currentPoints.push({ x, y });
            if (selectedShapeIndex !== null) {
                shapes[selectedShapeIndex] = [...currentPoints];
                selectedShapeIndex = null;
            } else {
                shapes.push([...currentPoints]);
            }
            currentPoints = [];
            redrawCanvas();

            dotNetObjectRef.invokeMethodAsync('ShapeClosed', shapes)
                .catch(error => console.error('Error invoking ShapeClosed:', error));
        }

        canvasElement.addEventListener('click', (event) => {
            const rect = canvasElement.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            if (settingReferenceLine) {
                handleReferenceLine(x, y);
            } else {
                handleDrawing(x, y);
            }
        });

        window.canvasInterop.startReferenceLine = function () {
            referencePoints = [];
            settingReferenceLine = true;
        };

        window.canvasInterop.undoLastAction = function () {
            if (currentPoints.length > 0) {
                redoStack.push(currentPoints.pop());
            } else if (shapes.length > 0) {
                let lastShape = shapes.pop();
                if (lastShape.length > 0) {
                    currentPoints = lastShape;
                    redoStack.push(currentPoints.pop());
                }
            }
            redrawCanvas();
        };

        window.canvasInterop.redoLastAction = function () {
            if (redoStack.length > 0) {
                const lastAction = redoStack.pop();
                if (currentPoints.length > 0) {
                    currentPoints.push(lastAction);
                } else {
                    shapes.push([lastAction]);
                }
            }
            redrawCanvas();
        };

        window.canvasInterop.deleteShape = function (index) {
            if (index >= 0 && index < shapes.length) {
                shapes.splice(index, 1);
                redrawCanvas();
                dotNetObjectRef.invokeMethodAsync('ShapeClosed', shapes)
                    .catch(error => console.error('Error invoking ShapeClosed:', error));
            }
        };

        window.canvasInterop.selectShape = function (index) {
            if (index >= 0 && index < shapes.length) {
                selectedShapeIndex = index;
                currentPoints = [...shapes[index]];
                redrawCanvas();
            }
        };

        window.canvasInterop.saveEdits = function () {
            if (selectedShapeIndex !== null && currentPoints.length > 0) {
                shapes[selectedShapeIndex] = [...currentPoints];
                currentPoints = [];
                selectedShapeIndex = null;
                redrawCanvas();

                dotNetObjectRef.invokeMethodAsync('ShapeClosed', shapes)
                    .catch(error => console.error('Error invoking ShapeClosed:', error));
            }
        };
    }
};

window.canvasInterop = {
    initialize: function (dotNetObjectRef, elementId) {
        console.log('canvasInterop initialized');
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
            drawImage();
        };

        let shapes = [];
        let currentPoints = [];
        let referencePoints = [];
        let settingReferenceLine = false;
        const redoStack = [];

        function drawImage() {
            context.drawImage(img, 0, 0);
        }

        function drawShapes() {
            drawImage();
            shapes.forEach(shape => {
                context.beginPath();
                shape.forEach((point, index) => {
                    if (index === 0) {
                        context.moveTo(point.x, point.y);
                    } else {
                        context.lineTo(point.x, point.y);
                    }
                });
                context.closePath();
                context.strokeStyle = 'green';
                context.stroke();
                context.fillStyle = 'rgba(0, 255, 0, 0.2)';
                context.fill();
            });
        }

        function drawPoints() {
            drawImage();
            drawShapes();
            currentPoints.forEach((point, index) => {
                context.beginPath();
                context.arc(point.x, point.y, 5, 0, 2 * Math.PI);
                context.fillStyle = 'blue';
                context.fill();
                context.closePath();

                if (index > 0) {
                    const prevPoint = currentPoints[index - 1];
                    context.beginPath();
                    context.moveTo(prevPoint.x, prevPoint.y);
                    context.lineTo(point.x, point.y);
                    context.strokeStyle = 'blue';
                    context.lineWidth = 5;
                    context.stroke();
                    context.closePath();
                }
            });

            if (currentPoints.length > 2 && isCloseToFirstPoint(currentPoints[0], currentPoints[currentPoints.length - 1])) {
                context.beginPath();
                context.moveTo(currentPoints[currentPoints.length - 1].x, currentPoints[currentPoints.length - 1].y);
                context.lineTo(currentPoints[0].x, currentPoints[0].y);
                context.strokeStyle = 'blue';
                context.lineWidth = 5;
                context.stroke();
                context.closePath();
            }
        }

        function drawReferenceLine() {
            drawImage();
            drawShapes();
            if (referencePoints.length === 2) {
                context.beginPath();
                context.moveTo(referencePoints[0].x, referencePoints[0].y);
                context.lineTo(referencePoints[1].x, referencePoints[1].y);
                context.strokeStyle = 'red';
                context.lineWidth = 5;
                context.stroke();
            }
        }

        function clearCanvas() {
            context.clearRect(0, 0, canvasElement.width, canvasElement.height);
            drawImage();
        }

        function isCloseToFirstPoint(firstPoint, currentPoint) {
            return calculateDistance(firstPoint, currentPoint) < 10; // Adjust threshold as needed
        }

        function calculateDistance(point1, point2) {
            return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
        }

        function redrawCanvas() {
            clearCanvas();
            drawShapes();
            drawPoints();

            dotNetObjectRef.invokeMethodAsync('UpdateShapes', shapes)
                .catch(error => console.error('Error invoking UpdateShapes:', error));
        }

        function handleReferenceLine(x, y) {
            referencePoints.push({ x, y });
            drawReferenceLine();

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
            } else {
                if (currentPoints.length > 2 && isCloseToFirstPoint(currentPoints[0], { x, y })) {
                    closeShape(x, y);
                } else {
                    currentPoints.push({ x, y });
                }
            }
            drawPoints();
        }

        function closeShape(x, y) {
            currentPoints.push({ x, y });
            shapes.push([...currentPoints]);
            currentPoints = [];
            redrawCanvas();

            dotNetObjectRef.invokeMethodAsync('ShapeClosed', shapes)
                .catch(error => console.error('Error invoking ShapeClosed:', error));
        }

        window.canvasInterop.startReferenceLine = function () {
            referencePoints = [];
            settingReferenceLine = true;
        };

        window.canvasInterop.undoLastAction = function () {
            if (shapes.length > 0) {
                redoStack.push(shapes.pop());
                redrawCanvas();
            } else if (currentPoints.length > 0) {
                currentPoints.pop();
                redrawCanvas();
            }
        };

        window.canvasInterop.redoLastAction = function () {
            if (redoStack.length > 0) {
                shapes.push(redoStack.pop());
                redrawCanvas();
            }
        };

        window.canvasInterop.deleteShape = function (index) {
            if (index >= 0 && index < shapes.length) {
                shapes.splice(index, 1);
                redrawCanvas();
                dotNetObjectRef.invokeMethodAsync('ShapeClosed', shapes)
                    .catch(error => console.error('Error invoking ShapeClosed:', error));
            }
        };

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
    }
};

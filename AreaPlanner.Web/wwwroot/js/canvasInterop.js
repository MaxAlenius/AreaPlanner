window.canvasInterop = {
    // Initializes the canvas interaction.
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

        let shapes = [];
        let currentPoints = [];
        let referencePoints = [];
        let settingReferenceLine = false;

        // Event listener for handling clicks on the canvas.
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

        // Handles creating a reference line between two points.
        function handleReferenceLine(x, y) {
            referencePoints.push({ x: x, y: y });
            drawReferenceLine(context, referencePoints);

            if (referencePoints.length === 2) {
                const distance = calculateDistance(referencePoints[0], referencePoints[1]);
                dotNetObjectRef.invokeMethodAsync('SetPixelsPerMeter', distance)
                    .catch(error => console.error('Error invoking SetPixelsPerMeter:', error));
                referencePoints = [];
                settingReferenceLine = false;
            }
        }

        // Handles drawing when not setting a reference line.
        function handleDrawing(x, y) {
            if (currentPoints.length === 0) {
                currentPoints.push({ x: x, y: y });
                drawPoints(context, currentPoints);
            } else {
                if (currentPoints.length > 2 && isCloseToFirstPoint(currentPoints[0], { x: x, y: y })) {
                    closeShape(x, y); // Pass x, y to include the last point
                } else {
                    currentPoints.push({ x: x, y: y });
                    drawPoints(context, currentPoints);
                }
            }
        }

        // Closes the shape and sends it to .NET for processing.
        function closeShape(x, y) {
            // Include the last point to close the shape properly
            currentPoints.push({ x: x, y: y });
            shapes.push([...currentPoints]);
            currentPoints = [];
            drawShapes(context, shapes);

            dotNetObjectRef.invokeMethodAsync('ShapeClosed', shapes)
                .catch(error => console.error('Error invoking ShapeClosed:', error));
        }

        // Draws a reference line between two points.
        function drawReferenceLine(ctx, points) {
            clearCanvas(context);
            drawShapes(ctx, shapes);
            if (points.length === 2) {
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                ctx.lineTo(points[1].x, points[1].y);
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 5;
                ctx.stroke();
            }
        }

        // Draws points on the canvas.
        function drawPoints(ctx, points) {
            clearCanvas(context);
            drawShapes(ctx, shapes);
            points.forEach((point, index) => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'blue';
                ctx.fill();
                ctx.closePath();

                if (index > 0) {
                    const prevPoint = points[index - 1];
                    ctx.beginPath();
                    ctx.moveTo(prevPoint.x, prevPoint.y);
                    ctx.lineTo(point.x, point.y);
                    ctx.strokeStyle = 'blue';
                    ctx.lineWidth = 5;
                    ctx.stroke();
                    ctx.closePath();
                }
            });

            // Draw the closing line if needed
            if (points.length > 2 && isCloseToFirstPoint(points[0], points[points.length - 1])) {
                ctx.beginPath();
                ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
                ctx.lineTo(points[0].x, points[0].y);
                ctx.strokeStyle = 'blue';
                ctx.lineWidth = 5;
                ctx.stroke();
                ctx.closePath();
            }
        }

        // Draws shapes based on stored points.
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

        // Clears the canvas.
        function clearCanvas(ctx) {
            ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        }

        // Checks if a point is close to the first point.
        function isCloseToFirstPoint(firstPoint, currentPoint) {
            const distance = Math.sqrt(Math.pow(currentPoint.x - firstPoint.x, 2) + Math.pow(currentPoint.y - firstPoint.y, 2));
            return distance < 10; // Adjust threshold as needed
        }

        // Calculates the distance between two points.
        function calculateDistance(point1, point2) {
            return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
        }

        // Exposes a function to start setting a reference line.
        window.canvasInterop.startReferenceLine = function () {
            referencePoints = [];
            settingReferenceLine = true;
        };

        let undoStack = [];
        let redoStack = [];

        function handleDrawing(x, y) {
            if (currentPoints.length === 0) {
                currentPoints.push({ x: x, y: y });
                drawPoints(context, currentPoints);
            } else {
                if (currentPoints.length > 2 && isCloseToFirstPoint(currentPoints[0], { x: x, y: y })) {
                    closeShape(x, y); // Pass x, y to include the last point
                } else {
                    currentPoints.push({ x: x, y: y });
                    drawPoints(context, currentPoints);
                }
            }
        };

        // Undo the last drawing action
        window.canvasInterop.undoLastAction = function () {
            if (shapes.length > 0) {
                redoStack.push(shapes.pop());
                redrawCanvas();
            } else if (currentPoints.length > 0) {
                currentPoints.pop();
                redrawCanvas();
            }
        };

        // Redo the last undone action
        window.canvasInterop.redoLastAction = function () {
            if (redoStack.length > 0) {
                shapes.push(redoStack.pop());
                redrawCanvas();
            }
        };

        // Redraw the entire canvas
        function redrawCanvas() {
            clearCanvas(context);
            drawShapes(context, shapes);
            drawPoints(context, currentPoints);

            // Update the shapes in .NET
            dotNetObjectRef.invokeMethodAsync('UpdateShapes', shapes)
                .catch(error => console.error('Error invoking UpdateShapes:', error));
        }


        // Function to delete a shape
        window.canvasInterop.deleteShape = function(index) {
            if (index >= 0 && index < shapes.length) {
                shapes.splice(index, 1);
                redrawCanvas();
                dotNetObjectRef.invokeMethodAsync('ShapeClosed', shapes)
                    .catch(error => console.error('Error invoking ShapeClosed:', error));
            }
        }

        // Function to select a shape for editing (to be implemented)
        function selectShape(index) {
            // Logic to allow shape editing
        }
    }
};

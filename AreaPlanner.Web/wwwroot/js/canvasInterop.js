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

        let shapes = [];
        let currentPoints = [];

        canvasElement.addEventListener('mousedown', function (event) {
            const rect = canvasElement.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            if (currentPoints.length === 0) {
                // First point of a new shape
                currentPoints.push({ x: x, y: y });
                drawPoints(context, currentPoints);
            } else {
                // Check if the click is close to the first point to close the shape
                if (isCloseToFirstPoint(currentPoints[0], { x: x, y: y })) {
                    // Close the shape
                    shapes.push([...currentPoints]); // No need to add the first point again
                    currentPoints = [];

                    // Draw all shapes
                    drawShapes(context, shapes);

                    // Notify Blazor of the closed shape
                    dotNetObjectRef.invokeMethodAsync('ShapeClosed', shapes)
                        .catch(error => console.error('Error invoking ShapeClosed:', error));
                } else {
                    // Subsequent points
                    currentPoints.push({ x: x, y: y });
                    drawPoints(context, currentPoints);
                }
            }
        });

        function drawPoints(ctx, points) {
            clearCanvas(context);
            drawShapes(ctx, shapes);

            // Draw all points in the current shape
            points.forEach((point, index) => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'blue';
                ctx.fill();
                ctx.closePath();

                // Draw lines between consecutive points
                if (index > 0) {
                    const prevPoint = points[index - 1];
                    ctx.beginPath();
                    ctx.moveTo(prevPoint.x, prevPoint.y);
                    ctx.lineTo(point.x, point.y);
                    ctx.strokeStyle = 'blue';
                    ctx.stroke();
                    ctx.closePath();
                }
            });
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
            });
        }

        function clearCanvas(ctx) {
            ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        }

        function isCloseToFirstPoint(firstPoint, currentPoint) {
            const distance = Math.sqrt(Math.pow(currentPoint.x - firstPoint.x, 2) + Math.pow(currentPoint.y - firstPoint.y, 2));
            return distance < 10; // Adjust threshold as needed
        }
    }
};

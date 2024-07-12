namespace AreaPlanner.Web;

public interface IShapeHandlerService
{
    double CalculateShapeArea(List<List<Point>> shapes, double pixelsPerMeter, List<string> shapeInformation);
}

public class ShapeHandlerService(IShapeCalculatorService shapeCalculatorService) : IShapeHandlerService
{
    public IShapeCalculatorService ShapeCalculatorService { get; } = shapeCalculatorService;

    public double CalculateShapeArea(List<List<Point>> shapes, double pixelsPerMeter, List<string> shapeInformation)
    {
        double totalArea = 0.0;

        for (int i = 0; i < shapes.Count; i++)
        {
            var shape = shapes[i];
            if (shape.Count < 3)
                continue;

            double shapeArea = ShapeCalculatorService.CalculatePolygonArea(shape, pixelsPerMeter);
            shapeInformation.Add($"Shape {i + 1}: {shape.Count - 1} points, {shapeArea:F2} square meters");

            totalArea += shapeArea;
        }

        return totalArea;
    }
}

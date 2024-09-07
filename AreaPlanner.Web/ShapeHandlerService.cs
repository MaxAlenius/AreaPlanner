using System.Globalization;

namespace AreaPlanner.Web;

public interface IShapeHandlerService
{
    List<ShapeInfo> CalculateShapeArea(List<List<Point>> shapes);
}

public class ShapeHandlerService : IShapeHandlerService
{
    public List<ShapeInfo> CalculateShapeArea(List<List<Point>> shapes)
    {
        var shapeInfos = new List<ShapeInfo>();

        foreach (var shape in shapes)
        {
            double area = CalculatePolygonArea(shape);
            shapeInfos.Add(new ShapeInfo(area, shape.Count));
        }

        return shapeInfos;
    }

    private static double CalculatePolygonArea(List<Point> points)
    {
        int numPoints = points.Count;
        double area = 0.0;

        for (int i = 0; i < numPoints; i++)
        {
            Point currentPoint = points[i];
            Point nextPoint = points[(i + 1) % numPoints];
            area += currentPoint.X * nextPoint.Y;
            area -= currentPoint.Y * nextPoint.X;
        }

        area = Math.Abs(area) / 2.0;
        return area;
    }
}
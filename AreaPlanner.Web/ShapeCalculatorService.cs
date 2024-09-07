namespace AreaPlanner.Web;

public interface IShapeCalculatorService
{
    double CalculatePolygonArea(List<Point> points, double pixelsPerMeter);
}
public class ShapeCalculatorService : IShapeCalculatorService
{
    public double CalculatePolygonArea(List<Point> points, double pixelsPerMeter)
    {
        {
            int n = points.Count;
            double area = 0.0;

            for (int i = 0; i < n; i++)
            {
                Point current = points[i];
                Point next = points[(i + 1) % n];
                area += current.X * next.Y - next.X * current.Y;
            }

            return Math.Abs(area) / 2.0 / (pixelsPerMeter * pixelsPerMeter);
        }
    }
}
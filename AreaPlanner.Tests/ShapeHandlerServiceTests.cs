using AreaPlanner.Web;
using Shouldly;
using Point = AreaPlanner.Web.Point;

namespace AreaPlanner.Tests;

public class ShapeHandlerServiceTests
{
    private readonly IShapeHandlerService _shapeHandlerService;
    private readonly IShapeCalculatorService _shapeCalculatorService;

    public ShapeHandlerServiceTests()
    {
        _shapeCalculatorService = new ShapeCalculatorService();
        _shapeHandlerService = new ShapeHandlerService();
    }

    [Fact]
    public void CalculateShapeArea_ShouldReturnCorrectShapeInfoForRectangle()
    {
        // Arrange
        var rectanglePoints = new List<Point>
    {
        new Point(10, 10), // Pixel coordinates
        new Point(50, 10), // Pixel coordinates
        new Point(50, 30), // Pixel coordinates
        new Point(10, 30)  // Pixel coordinates
    };
        var shapes = new List<List<Point>> { rectanglePoints };

        // Act
        var shapeInfos = _shapeHandlerService.CalculateShapeArea(shapes);

        // Assert
        Assert.Single(shapeInfos); // Ensure there is exactly one shape info object
        var rectangleInfo = shapeInfos[0];
        const double expectedArea = 800.0; // Expected area in square pixels
        const int expectedNumberOfPoints = 4;

        Assert.Equal(expectedArea, rectangleInfo.Area, 2); // Tolerance of 2 for precision
        Assert.Equal(expectedNumberOfPoints, rectangleInfo.NumberOfPoints);
    }

    [Fact]
    public void CalculateShapeArea_ShouldReturnCorrectShapeInfoForTriangle()
    {
        // Arrange
        var trianglePoints = new List<Point>
    {
        new Point(20, 10), // Pixel coordinates
        new Point(50, 30), // Pixel coordinates
        new Point(10, 30)  // Pixel coordinates
    };
        var shapes = new List<List<Point>> { trianglePoints };

        // Act
        List<ShapeInfo> shapeInfos = _shapeHandlerService.CalculateShapeArea(shapes);

        // Assert
        Assert.Single(shapeInfos); // Ensure there is exactly one shape info object
        var triangleInfo = shapeInfos[0];
        const double expectedArea = 400.0; // Expected area in square pixels
        const int expectedNumberOfPoints = 3;

        Assert.Equal(expectedArea, triangleInfo.Area, 2); // Tolerance of 2 for precision
        Assert.Equal(expectedNumberOfPoints, triangleInfo.NumberOfPoints);
    }

    [Fact]
    public void CalculateShapeArea_ShouldReturnCorrectShapeInfoForIrregularPolygon()
    {
        // Arrange
        var irregularPoints = new List<Point>
    {
        new Point(10, 10), // Pixel coordinates
        new Point(40, 50), // Pixel coordinates
        new Point(70, 80), // Pixel coordinates
        new Point(30, 70), // Pixel coordinates
        new Point(0, 40)   // Pixel coordinates
    };
        var shapes = new List<List<Point>> { irregularPoints };

        // Act
        List<ShapeInfo> shapeInfos = _shapeHandlerService.CalculateShapeArea(shapes);

        // Assert
        Assert.Single(shapeInfos); // Ensure there is exactly one shape info object
        var irregularInfo = shapeInfos[0];
        const double expectedArea = 1550; // Expected area in square pixels
        const int expectedNumberOfPoints = 5;

        Assert.Equal(expectedArea, irregularInfo.Area, 2); // Tolerance of 15 for precision
        Assert.Equal(expectedNumberOfPoints, irregularInfo.NumberOfPoints);
    }

    [Fact]
    public void CalculateTotalShapeArea_ShouldReturnCorrectTotalAreaForMultipleShapes()
    {
        // Arrange
        var shapes = new List<List<Point>>
        {
            new List<Point> { new Point(10, 10), new Point(20, 20), new Point(30, 10) }, // Shape 1
            new List<Point> { new Point(40, 40), new Point(50, 50), new Point(60, 40) }  // Shape 2
            // Add more shapes as needed
        };

        // Act
        var shapeInfos = _shapeHandlerService.CalculateShapeArea(shapes);
        var totalArea = shapeInfos.Sum(si => si.Area);

        // Assert
        totalArea.ShouldBeGreaterThan(0); // Ensure total area is greater than zero
        // Add more specific assertions as needed based on your implementation

        // Example of additional assertion: Check if all shapes are correctly identified in shapeInfos
        foreach (var shape in shapes)
        {
            var matchingShapeInfo = shapeInfos.Find(si => si.NumberOfPoints == shape.Count);
            matchingShapeInfo.ShouldNotBeNull();
            // Add more specific assertions about area, description, etc.
        }
    }
}

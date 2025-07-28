using NetTopologySuite.Geometries;

namespace InternProject.Models
{
    public class GeoPolygon
    {
        public int Id { get; set; }

        public string Name { get; set; } = null!;
        public Polygon Polygon { get; set; } = null!;
    }
}

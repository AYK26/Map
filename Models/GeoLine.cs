using NetTopologySuite.Geometries;

namespace InternProject.Models
{
    public class GeoLine
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public LineString Line { get; set; } = null!;
    }
}

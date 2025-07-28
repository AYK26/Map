using NetTopologySuite.Geometries;

namespace InternProject.Models
{
    public class GeoPoint
    {
        public int Id { get; set; }
     
        public string Name { get; set; } = null!;
        public Point Location { get; set; } = null!;
    }
}

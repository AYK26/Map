using InternProject.Models;
using InternProject.Repositories.Generic;

namespace InternProject.Repositories
{
    public class PolygonRepository(IGenericRepository<GeoPolygon> genericRepository)
    {
        private readonly IGenericRepository<GeoPolygon> _genericRepository = genericRepository;
    }
}

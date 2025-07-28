using InternProject.Models;
using InternProject.Repositories.Generic;
using InternProject.Data;

namespace InternProject.Repositories
{
    public class PointRepository
    {
        private readonly IGenericRepository<GeoPoint> _genericRepository;

        public PointRepository(IGenericRepository<GeoPoint> genericRepository)
        {
            _genericRepository = genericRepository;
        }

        
    }
}

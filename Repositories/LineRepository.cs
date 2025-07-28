using InternProject.Models;
using InternProject.Repositories.Generic;

namespace InternProject.Repositories
{
    public class LineRepository(IGenericRepository<GeoLine> genericRepository)
    {
        private readonly IGenericRepository<GeoLine> _genericRepository = genericRepository;
    }
}

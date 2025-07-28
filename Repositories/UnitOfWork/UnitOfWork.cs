using InternProject.Data;
using InternProject.Models;
using InternProject.Repositories.Generic;
using System.Threading.Tasks;

namespace InternProject.Repositories.UnitOfWork
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;

        public IGenericRepository<GeoPoint> PointRepository { get; }
        public IGenericRepository<GeoLine> LineRepository { get; }
        public IGenericRepository<GeoPolygon> PolygonRepository { get; }

        public UnitOfWork(AppDbContext context)
        {
            _context = context;
            PointRepository = new GenericRepository<GeoPoint>(_context);
            LineRepository = new GenericRepository<GeoLine>(_context);
            PolygonRepository = new GenericRepository<GeoPolygon>(_context);
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

    }
}

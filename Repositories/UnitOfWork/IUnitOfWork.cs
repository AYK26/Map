using InternProject.Models;
using InternProject.Repositories.Generic;
using System.Threading.Tasks;

namespace InternProject.Repositories.UnitOfWork
{
    public interface IUnitOfWork
    {
        IGenericRepository<GeoPoint> PointRepository { get; }
        IGenericRepository<GeoLine> LineRepository { get; }
        IGenericRepository<GeoPolygon> PolygonRepository { get; }
        Task<int> SaveChangesAsync();
    }
}

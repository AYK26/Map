using InternProject.DTOs;
using InternProject.Models;
using InternProject.Repositories.UnitOfWork;
using InternProject.Services.Interfaces;
using InternProject.Validators;

namespace InternProject.Services
{
    public class PointService : IPointService
    {
        private readonly IUnitOfWork _unitOfWork;

        public PointService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<List<PointResponseDto>> GetAllAsync()
        {
            var points = await _unitOfWork.PointRepository.GetAllAsync();

            return points.Select(p => new PointResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                PointX = p.Location.X,
                PointY = p.Location.Y
            }).ToList();
        }

        public async Task<PointResponseDto?> GetByIdAsync(int id)
        {
            var point = await _unitOfWork.PointRepository.GetByIdAsync(id);
            if (point == null) return null;

            return new PointResponseDto
            {
                Id = point.Id,
                Name = point.Name,
                PointX = point.Location.X,
                PointY = point.Location.Y
            };
        }

        public async Task<PointResponseDto?> CreateAsync(PointCreateDto dto)
        {
            if (!PointValidator.IsValid(dto, out string error))
                return null;

            var geometryServices = NetTopologySuite.NtsGeometryServices.Instance;
            var wktReader = new NetTopologySuite.IO.WKTReader(geometryServices);
            var point = wktReader.Read(dto.WKT) as NetTopologySuite.Geometries.Point;

            var entity = new GeoPoint
            {
                Name = dto.Name,
                Location = point!
            };

            await _unitOfWork.PointRepository.AddAsync(entity);
            await _unitOfWork.SaveChangesAsync();

            return new PointResponseDto
            {
                Id = entity.Id,
                Name = entity.Name,
                PointX = entity.Location.X,
                PointY = entity.Location.Y
            };
        }

        public async Task<bool> UpdateAsync(PointUpdateDto dto)
        {
            if (!PointValidator.IsValid(dto, out string error))
                return false;

            var existing = await _unitOfWork.PointRepository.GetByIdAsync(dto.Id);
            if (existing == null) return false;

            var geometryServices = NetTopologySuite.NtsGeometryServices.Instance;
            var wktReader = new NetTopologySuite.IO.WKTReader(geometryServices);
            var updatedPoint = wktReader.Read(dto.WKT) as NetTopologySuite.Geometries.Point;

            existing.Name = dto.Name;
            existing.Location = updatedPoint!;

            await _unitOfWork.PointRepository.UpdateAsync(existing);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _unitOfWork.PointRepository.GetByIdAsync(id);
            if (entity == null) return false;

            await _unitOfWork.PointRepository.DeleteAsync(entity);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}


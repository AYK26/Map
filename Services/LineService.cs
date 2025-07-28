using InternProject.DTOs;
using InternProject.Models;
using InternProject.Repositories.UnitOfWork;
using InternProject.Services.Interfaces;
using InternProject.Validators;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;

namespace InternProject.Services
{
    public class LineService : ILineService
    {
        private readonly IUnitOfWork _unitOfWork;

        public LineService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<List<LineResponseDto>> GetAllAsync()
        {
            var lines = await _unitOfWork.LineRepository.GetAllAsync();

            return lines.Select(l => new LineResponseDto
            {
                Id = l.Id,
                Name = l.Name,
                WKT = l.Line.AsText() // WKT formatına çevirdik
            }).ToList();
        }

        public async Task<LineResponseDto?> GetByIdAsync(int id)
        {
            var line = await _unitOfWork.LineRepository.GetByIdAsync(id);
            if (line == null) return null;

            return new LineResponseDto
            {
                Id = line.Id,
                Name = line.Name,
                WKT = line.Line.AsText()
            };
        }

        public async Task<LineResponseDto?> CreateAsync(LineCreateDto dto)
        {
            if (!LineValidator.IsValid(dto, out string error))
                return null;

            var geometryServices = NetTopologySuite.NtsGeometryServices.Instance;
            var wktReader = new WKTReader(geometryServices);
            var line = wktReader.Read(dto.WKT) as LineString;

            var entity = new GeoLine
            {
                Name = dto.Name,
                Line = line!
            };

            await _unitOfWork.LineRepository.AddAsync(entity);
            await _unitOfWork.SaveChangesAsync();

            return new LineResponseDto
            {
                Id = entity.Id,
                Name = entity.Name,
                WKT = entity.Line.AsText()
            };
        }

        public async Task<bool> UpdateAsync(LineUpdateDto dto)
        {
            if (!LineValidator.IsValid(dto, out string error))
                return false;

            var existing = await _unitOfWork.LineRepository.GetByIdAsync(dto.Id);
            if (existing == null) return false;

            var geometryServices = NetTopologySuite.NtsGeometryServices.Instance;
            var wktReader = new WKTReader(geometryServices);
            var updatedLine = wktReader.Read(dto.WKT) as LineString;

            existing.Name = dto.Name;
            existing.Line = updatedLine!;

            await _unitOfWork.LineRepository.UpdateAsync(existing);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _unitOfWork.LineRepository.GetByIdAsync(id);
            if (entity == null) return false;

            await _unitOfWork.LineRepository.DeleteAsync(entity);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}

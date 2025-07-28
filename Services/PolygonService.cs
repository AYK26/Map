using InternProject.DTOs;
using InternProject.Models;
using InternProject.Repositories.UnitOfWork;
using InternProject.Services.Interfaces;
using InternProject.Validators;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using System;

namespace InternProject.Services
{
    public class PolygonService : IPolygonService
    {
        private readonly IUnitOfWork _unitOfWork;

        public PolygonService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<List<PolygonResponseDto>> GetAllAsync()
        {
            var polygons = await _unitOfWork.PolygonRepository.GetAllAsync();

            return polygons.Select(p => new PolygonResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                WKT = p.Polygon.AsText()
            }).ToList();
        }

        public async Task<PolygonResponseDto?> GetByIdAsync(int id)
        {
            var polygon = await _unitOfWork.PolygonRepository.GetByIdAsync(id);
            if (polygon == null) return null;

            return new PolygonResponseDto
            {
                Id = polygon.Id,
                Name = polygon.Name,
                WKT = polygon.Polygon.AsText()
            };
        }

        public async Task<PolygonResponseDto?> CreateAsync(PolygonCreateDto dto)
        {
            if (!PolygonValidator.IsValid(dto, out string error))
                return null;

            var geometryServices = NetTopologySuite.NtsGeometryServices.Instance;
            var wktReader = new WKTReader(geometryServices);
            var polygon = wktReader.Read(dto.WKT) as Polygon;

            var entity = new GeoPolygon
            {
                Name = dto.Name,
                Polygon = polygon!
            };

            await _unitOfWork.PolygonRepository.AddAsync(entity);
            await _unitOfWork.SaveChangesAsync();

            return new PolygonResponseDto
            {
                Id = entity.Id,
                Name = entity.Name,
                WKT = entity.Polygon.AsText()
            };
        }

        public async Task<bool> UpdateAsync(PolygonUpdateDto dto)
        {
            if (!PolygonValidator.IsValid(dto, out string error))
                return false;

            var existing = await _unitOfWork.PolygonRepository.GetByIdAsync(dto.Id);
            if (existing == null) return false;

            var geometryServices = NetTopologySuite.NtsGeometryServices.Instance;
            var wktReader = new WKTReader(geometryServices);
            var updatedPolygon = wktReader.Read(dto.WKT) as Polygon;

            existing.Name = dto.Name;
            existing.Polygon = updatedPolygon!;

            await _unitOfWork.PolygonRepository.UpdateAsync(existing);
            await _unitOfWork.SaveChangesAsync();

            return true;
            
        }
        

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _unitOfWork.PolygonRepository.GetByIdAsync(id);
            if (entity == null) return false;

            await _unitOfWork.PolygonRepository.DeleteAsync(entity);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}

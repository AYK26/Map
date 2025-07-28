using System.Text.RegularExpressions;
using InternProject.DTOs;
using NetTopologySuite.IO;

namespace InternProject.Validators
{
    public static class PointValidator
    {
        public static bool IsValid(PointCreateDto dto, out string error)
        {
            error = "";

            // Name boş ya da hatalı karakter içeriyorsa
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                error = "İsim alanı boş olamaz.";
                return false;
            }

            if (!Regex.IsMatch(dto.Name, @"^[a-zA-ZğüşöçıİĞÜŞÖÇ ]+$"))
            {
                error = "İsim yalnızca harf ve boşluk içerebilir.";
                return false;
            }

            // WKT boşsa
            if (string.IsNullOrWhiteSpace(dto.WKT))
            {
                error = "WKT alanı boş olamaz.";
                return false;
            }

            // WKT format kontrolü
            try
            {
                var reader = new WKTReader();
                var geom = reader.Read(dto.WKT);

                if (geom == null || !geom.IsValid)
                {
                    error = "Geçersiz WKT geometrisi.";
                    return false;
                }
            }
            catch
            {
                error = "WKT formatı hatalı. Örn: POINT(30 10)";
                return false;
            }

            return true;
        }

        public static bool IsValid(PointUpdateDto dto, out string error)
        {
            return IsValid(new PointCreateDto { Name = dto.Name, WKT = dto.WKT }, out error);
        }
    }
}

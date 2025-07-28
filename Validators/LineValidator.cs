using InternProject.DTOs;
using System.Text.RegularExpressions;

namespace InternProject.Validators
{
    public static class LineValidator
    {
        public static bool IsValid(LineCreateDto dto, out string error)
        {
            error = "";

            if (string.IsNullOrWhiteSpace(dto.Name) || !Regex.IsMatch(dto.Name, @"^[a-zA-ZğüşöçıİĞÜŞÖÇ ]+$"))
            {
                error = "Name yalnızca harf ve boşluk içermelidir.";
                return false;
            }

            if (string.IsNullOrWhiteSpace(dto.WKT))
            {
                error = "WKT değeri boş olamaz.";
                return false;
            }

            return true;
        }

        public static bool IsValid(LineUpdateDto dto, out string error)
        {
            return IsValid(new LineCreateDto { Name = dto.Name, WKT = dto.WKT }, out error);
        }
    }
}

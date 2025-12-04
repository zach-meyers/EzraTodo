using System.Diagnostics.CodeAnalysis;

namespace TodoApi.Extensions;

public static class StringExtensions
{
    public static bool IsNullOrWhiteSpace([NotNullWhen(false)] this string? value)
    {
        return string.IsNullOrWhiteSpace(value);
    }
}

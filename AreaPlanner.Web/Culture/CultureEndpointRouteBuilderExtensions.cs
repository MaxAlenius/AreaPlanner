using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;

namespace AreaPlanner.Web.Culture;

public static class CultureEndpointRouteBuilderExtensions
{
    public static void MapCultureEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/Culture/Set", (
            HttpContext context,
            [FromQuery] string culture,
            [FromQuery] string? returnUrl) =>
        {
            if (culture != null)
            {
                context.Response.Cookies.Append(
                    CookieRequestCultureProvider.DefaultCookieName,
                    CookieRequestCultureProvider.MakeCookieValue(
                        new RequestCulture(culture, culture)));
            }

            return TypedResults.LocalRedirect($"~/{returnUrl}");
        });
    }
}

using System.Linq;
using System.Security.Claims;
using Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace Infrastructure.Security
{
    //useraccessor potrebno dodati kao servis isto ko i jwtgenerator
    public class UserAccessor : IUserAccessor
    {
        private readonly IHttpContextAccessor httpContextAccesor;
        public UserAccessor(IHttpContextAccessor httpContextAccesor)
        {
            this.httpContextAccesor = httpContextAccesor;

        }
        public string GetCurrentUsername()
        {
            var username = httpContextAccesor.HttpContext.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;
            return username;
        }
    }
}
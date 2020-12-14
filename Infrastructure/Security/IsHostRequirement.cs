using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Persistence;

namespace Infrastructure.Security
{
    public class IsHostRequirement : IAuthorizationRequirement
    {

    }


    public class IsHostRequirementHandler : AuthorizationHandler<IsHostRequirement>
    {
        private readonly IHttpContextAccessor httpContextAccessor;
        private readonly DataContext _context;

        public IsHostRequirementHandler(IHttpContextAccessor httpContextAccessor, DataContext context)
        {
            this.httpContextAccessor = httpContextAccessor;
            _context = context;
        }

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, IsHostRequirement requirement)
        {
            var currentUserName = httpContextAccessor.HttpContext.User?.Claims?.SingleOrDefault(c => c.Type == ClaimTypes.NameIdentifier)
            ?.Value;

            var activityId = Guid.Parse(httpContextAccessor.HttpContext.Request.RouteValues.SingleOrDefault(c => c.Key == "id")
            .Value.ToString());

            var activity = _context.Activities.FindAsync(activityId).Result;

            var host = activity.UserActivities.FirstOrDefault(c => c.IsHost);

            if (host?.AppUser?.UserName == currentUserName)
                context.Succeed(requirement);

            return Task.CompletedTask;


        }
    }
}
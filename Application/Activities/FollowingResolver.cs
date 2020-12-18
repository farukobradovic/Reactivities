using System.Linq;
using Application.Interfaces;
using AutoMapper;
using Domain;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities
{
    public class FollowingResolver : IValueResolver<UserActivity, AtendeeDto, bool>
    {
        private readonly DataContext _context;
        private readonly IUserAccessor userAccessor;
        public FollowingResolver(DataContext context, IUserAccessor userAccessor)
        {
            this.userAccessor = userAccessor;
            _context = context;

        }
        public bool Resolve(UserActivity source, AtendeeDto destination, bool destMember, ResolutionContext context)
        {
            var currentUser = _context.Users.SingleOrDefaultAsync(c => c.UserName == userAccessor.GetCurrentUsername()).Result;

            if (currentUser.Followings.Any(c => c.TargetId == source.AppUserId))
            {
                return true;
            }
            return false;
        }
    }
}
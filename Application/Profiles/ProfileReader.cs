using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Application.Errors;
using Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles
{
    public class ProfileReader : IProfileReader
    {
        private readonly DataContext context;
        private readonly IUserAccessor userAccessor;
        public ProfileReader(DataContext context, IUserAccessor userAccessor)
        {
            this.userAccessor = userAccessor;
            this.context = context;

        }
        public async Task<Profile> ReadProfile(string username)
        {
            var user = await context.Users.SingleOrDefaultAsync(c => c.UserName == username);
            if (user == null)
                throw new RestException(HttpStatusCode.NotFound, new { User = "Not Found" });

            var currentUser = await context.Users.SingleOrDefaultAsync(c => c.UserName == userAccessor.GetCurrentUsername());

            var profile = new Profile
            {
                DisplayName = user.DisplayName,
                Username = user.UserName,
                Image = user.Photos.FirstOrDefault(c => c.IsMain)?.Url,
                Photos = user.Photos,
                Bio = user.Bio,
                FollowersCount = user.Followers.Count(),
                FollowingCount = user.Followings.Count()
            };

            if (currentUser.Followings.Any(c => c.TargetId == user.Id))
            {
                profile.IsFollowed = true;
            }
            return profile;
        }
    }
}
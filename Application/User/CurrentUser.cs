using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Persistence;

namespace Application.User
{

    public class CurrentUser
    {
        public class Querry : IRequest<User> { }
        public class Handler : IRequestHandler<Querry, User>
        {
            private readonly UserManager<AppUser> userManager;
            private readonly IJwtGenerator jwtGenrator;
            private readonly IUserAccessor userAccessor;

            public Handler(UserManager<AppUser> userManager, IJwtGenerator jwtGenrator, IUserAccessor userAccessor)
            {
                this.userAccessor = userAccessor;
                this.jwtGenrator = jwtGenrator;
                this.userManager = userManager;
            }

            public async Task<User> Handle(Querry request, CancellationToken cancellationToken)
            {
                //handler logic goes here
                var user = await userManager.FindByNameAsync(userAccessor.GetCurrentUsername());
                return new User
                {
                    DisplayName = user.DisplayName,
                    Username = user.UserName,
                    Token = jwtGenrator.CreateToken(user),
                    Image = user.Photos.FirstOrDefault(c => c.IsMain)?.Url
                };
            }
        }
    }
}
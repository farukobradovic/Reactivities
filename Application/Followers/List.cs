using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Profiles;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Followers
{
    public class List
    {
        public class Querry : IRequest<List<Profile>>
        {
            public string Username { get; set; }
            public string Predicate { get; set; }
        }
        public class Handler : IRequestHandler<Querry, List<Profile>>
        {
            private readonly DataContext _context;
            private readonly IProfileReader profileReader;

            public Handler(DataContext context, IProfileReader profileReader)
            {
                this.profileReader = profileReader;
                _context = context;
            }

            public async Task<List<Profile>> Handle(Querry request, CancellationToken cancellationToken)
            {
                //handler logic goes here
                var queryable = _context.Followings.AsQueryable();

                var userFollowings = new List<UserFollowing>();
                var profiles = new List<Profile>();

                switch (request.Predicate)
                {
                    case "followers":
                        {
                            userFollowings = await queryable.Where(c => c.Target.UserName == request.Username).ToListAsync();

                            foreach (var u in userFollowings)
                            {
                                profiles.Add(await profileReader.ReadProfile(u.Observer.UserName));
                            }
                            break;
                        }
                    case "following":
                        {
                            userFollowings = await queryable.Where(c => c.Observer.UserName == request.Username).ToListAsync();

                            foreach (var u in userFollowings)
                            {
                                profiles.Add(await profileReader.ReadProfile(u.Target.UserName));
                            }
                            break;
                        }
                }
                return profiles;
            }
        }
    }
}
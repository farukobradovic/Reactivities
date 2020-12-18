using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles
{
    public class Details
    {
        public class Querry : IRequest<Profile>
        {
            public string Username { get; set; }
        }
        public class Handler : IRequestHandler<Querry, Profile>
        {

            private readonly IProfileReader profileReader;

            public Handler(IProfileReader profileReader)
            {
                this.profileReader = profileReader;

            }

            public async Task<Profile> Handle(Querry request, CancellationToken cancellationToken)
            {
                //handler logic goes here
                return await profileReader.ReadProfile(request.Username);


            }
        }
    }
}
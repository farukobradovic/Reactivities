using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Application.Errors;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities
{
    public class Attend
    {
        public class Command : IRequest
        {
            public Guid Id { get; set; }

        }

        public class Handler : IRequestHandler<Command>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _context = context;
                this.userAccessor = userAccessor;
            }

            public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
            {
                //Provjera aktivnosti
                var activity = await _context.Activities.FindAsync(request.Id);
                if (activity == null)
                    throw new RestException(HttpStatusCode.NotFound, new { Activity = "Could not find activity" });

                //Pronalazak korisnika
                var user = await _context.Users.SingleOrDefaultAsync(c => c.UserName == userAccessor.GetCurrentUsername());

                //Provjera da li je korisnik vec prijavljen na aktivnosti
                var attendence = await _context.UserActivities.SingleOrDefaultAsync(c => c.ActivityId == activity.Id &&
                c.AppUserId == user.Id);

                if (attendence != null)
                    throw new RestException(HttpStatusCode.BadRequest, new { Attendence = "Already attending this activity" });

                attendence = new UserActivity
                {
                    Activity = activity,
                    AppUser = user,
                    IsHost = false,
                    DateJoined = DateTime.Now
                };

                _context.UserActivities.Add(attendence);

                var success = await _context.SaveChangesAsync() > 0;
                //Ako je odg veci od 0 OK je
                if (success)
                    return Unit.Value;

                throw new Exception("Problem saving changes");

            }
        }
    }
}

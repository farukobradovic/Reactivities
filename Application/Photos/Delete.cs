using System;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Application.Errors;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Photos
{
    public class Delete
    {
        public class Command : IRequest
        {
            public string Id { get; set; }
        }

        public class Handler : IRequestHandler<Command>
        {
            private readonly DataContext _context;
            private readonly IPhotoAccessor photoAccessor;
            private readonly IUserAccessor userAccessor;
            public Handler(DataContext context, IUserAccessor userAccessor, IPhotoAccessor photoAccessor)
            {
                this.userAccessor = userAccessor;
                this.photoAccessor = photoAccessor;
                _context = context;
            }

            public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
            {
                var user = await _context.Users.SingleOrDefaultAsync(c => c.UserName == userAccessor.GetCurrentUsername());

                var photo = user.Photos.FirstOrDefault(c => c.Id == request.Id);

                if (photo == null)
                    throw new RestException(HttpStatusCode.NotFound, new { Photo = "Not found" });


                if (photo.IsMain)
                    throw new RestException(HttpStatusCode.BadRequest, new { Photo = "You cannot delete your main photo" });

                var result = photoAccessor.DeletePhoto(photo.Id);
                if (result == null)
                    throw new Exception("Problem deleting the photo");

                user.Photos.Remove(photo);



                var success = await _context.SaveChangesAsync() > 0;
                //Ako je odg veci od 0 OK je
                if (success)
                    return Unit.Value;

                throw new Exception("Problem saving changes");

            }
        }
    }
}
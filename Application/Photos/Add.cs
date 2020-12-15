using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Photos
{
    public class Add
    {
        public class Command : IRequest<Photo>
        {
            public IFormFile File { get; set; }
        }

        public class Handler : IRequestHandler<Command, Photo>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor userAccessor;
            private readonly IPhotoAccessor photoAccessor;
            public Handler(DataContext context, IUserAccessor userAccessor, IPhotoAccessor photoAccessor)
            {
                this.photoAccessor = photoAccessor;
                this.userAccessor = userAccessor;
                _context = context;
            }

            public async Task<Photo> Handle(Command request, CancellationToken cancellationToken)
            {

                var photoUploadResult = photoAccessor.AddPhoto(request.File);

                var user = await _context.Users.SingleOrDefaultAsync(c => c.UserName == userAccessor.GetCurrentUsername());

                var photo = new Photo
                {
                    Url = photoUploadResult.Url,
                    Id = photoUploadResult.PublicId
                };

                //Provjeravamo da li psotoji gavna fotografija, ako ne postavljamo ovu
                if (!user.Photos.Any(c => c.IsMain))
                {
                    photo.IsMain = true;
                }

                user.Photos.Add(photo);


                var success = await _context.SaveChangesAsync() > 0;
                //Ako je odg veci od 0 OK je
                if (success)
                    return photo;

                throw new Exception("Problem saving changes");

            }
        }
    }
}
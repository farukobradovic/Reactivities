using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Application.Errors;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities
{
    public class Details
    {
        public class Query : IRequest<ActivityDto>
        {
            public Guid Id { get; set; }
        }
        public class Handler : IRequestHandler<Query, ActivityDto>
        {
            private readonly DataContext _context;
            private readonly IMapper mapper;

            public Handler(DataContext context, IMapper mapper)
            {
                _context = context;
                this.mapper = mapper;
            }

            public async Task<ActivityDto> Handle(Query request, CancellationToken cancellationToken)
            {

                // var activity = await _context.Activities.Include(c => c.UserActivities).ThenInclude(c => c.AppUser)
                // .SingleOrDefaultAsync(c => c.Id == request.Id);
                //Inace koristen je findAsync ali ne moze se kompinovati sa eager ladingom

                //Sa lazy loading moze se kortisti standardna findAsync

                var activity = await _context.Activities.FindAsync(request.Id);


                if (activity == null)
                    throw new RestException(HttpStatusCode.NotFound, new { activity = "Not found" });

                var activityToReturn = mapper.Map<Activity, ActivityDto>(activity);

                return activityToReturn;
            }
        }
    }
}
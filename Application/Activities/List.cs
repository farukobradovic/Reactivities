using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Interfaces;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Persistence;

namespace Application.Activities
{
    public class List
    {
        //Paging activity list

        public class ActivitiesEnvelope
        {
            public List<ActivityDto> Activities { get; set; }
            public int ActivityCount { get; set; }
        }
        public class Querry : IRequest<ActivitiesEnvelope>
        {
            public Querry(int? limit, int? offset, bool isGoing, bool isHost, DateTime? startDate)
            {
                Limit = limit;
                Offset = offset;
                IsGoing = isGoing;
                IsHost = isHost;
                StartDate = startDate ?? DateTime.Now;
            }
            public int? Limit { get; set; }
            public int? Offset { get; set; }
            public bool IsGoing { get; set; }
            public bool IsHost { get; set; }
            public DateTime? StartDate { get; set; }
        }
        public class Handler : IRequestHandler<Querry, ActivitiesEnvelope>
        {
            private readonly DataContext _context;
            private readonly IMapper mapper;
            private readonly IUserAccessor userAccessor;

            public Handler(DataContext context, IMapper mapper, IUserAccessor userAccessor)
            {
                this.userAccessor = userAccessor;
                _context = context;
                this.mapper = mapper;
            }

            public async Task<ActivitiesEnvelope> Handle(Querry request, CancellationToken cancellationToken)
            {
                var queryable = _context.Activities
                .Where(c => c.Date >= request.StartDate)
                .OrderBy(c => c.Date)
                .AsQueryable();

                if (request.IsGoing && !request.IsHost)
                {
                    queryable = queryable.Where(c => c.UserActivities.Any(a => a.AppUser.UserName == userAccessor.GetCurrentUsername()));
                }

                if (request.IsHost && !request.IsGoing)
                {
                    queryable = queryable.Where(c => c.UserActivities.Any(a => a.AppUser.UserName == userAccessor.GetCurrentUsername()
                    && a.IsHost));

                }

                var activities = await queryable.Skip(request.Offset ?? 0).Take(request.Limit ?? 3).ToListAsync();
                //eager loading
                // var activities = await _context.Activities.ToListAsync();


                // return mapper.Map<List<Activity>, List<ActivityDto>>(activities);

                return new ActivitiesEnvelope
                {
                    Activities = mapper.Map<List<Activity>, List<ActivityDto>>(activities),
                    ActivityCount = queryable.Count()
                };

            }
        }

    }
}
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
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
        public class Querry : IRequest<List<ActivityDto>> { }
        public class Handler : IRequestHandler<Querry, List<ActivityDto>>
        {
            private readonly DataContext _context;
            private readonly IMapper mapper;

            public Handler(DataContext context, IMapper mapper)
            {
                _context = context;
                this.mapper = mapper;
            }

            public async Task<List<ActivityDto>> Handle(Querry request, CancellationToken cancellationToken)
            {
                //eager loading
                var activities = await _context.Activities.ToListAsync();


                return mapper.Map<List<Activity>, List<ActivityDto>>(activities);
            }
        }

    }
}
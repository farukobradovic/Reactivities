using System;

namespace Domain
{
    public class UserActivity
    {
        public string AppUserId { get; set; }
        //virtual se korsti za lazy loading, treba i servise ubacii
        public virtual AppUser AppUser { get; set; }
        public Guid ActivityId { get; set; }
        public virtual Activity Activity { get; set; }
        public DateTime DateJoined { get; set; }
        public bool IsHost { get; set; }
    }
}
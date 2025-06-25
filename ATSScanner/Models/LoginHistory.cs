using System;

namespace ATSScanner.Models
{
    public class LoginHistory
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
        public DateTime LoginTime { get; set; }
        public string IpAddress { get; set; }
        public string UserAgent { get; set; }
        public bool IsSuccessful { get; set; }
    }
} 
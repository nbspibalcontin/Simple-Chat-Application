namespace Simple_Chat_Application.Entity
{
    public class ChatMessage
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string Message { get; set; }
        public DateTime Timestamp { get; set; }
    }
}

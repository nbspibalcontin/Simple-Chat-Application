using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Simple_Chat_Application.Data;
using Simple_Chat_Application.Entity;

namespace Simple_Chat_Application.Services
{
    public class ChatHub : Hub
    {
        private readonly AppDbContext _dbContext;
        private readonly ILogger<ChatHub> _logger;

        public ChatHub(AppDbContext dbContext, ILogger<ChatHub> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        //Connects a user to the chat and notifies all connected clients.
        public async Task ConnectUser(string userName)
        {
            try
            {
                // Notify all clients that a user has joined the chat
                await Clients.All.SendAsync("JoinMessage", $"{userName}", "connectUser");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while connecting user.");
                await SendSystemErrorMessage("An error occurred while joining. Please try again.");
            }
        }
     
        public async Task SendMessage(string userName, string message)
        {
            try
            {
                // Create a new chat message entity
                var chatMessage = new ChatMessage
                {
                    UserName = userName,
                    Message = message,
                    Timestamp = DateTime.UtcNow
                };

                // Add the chat message to the database context and save changes
                _dbContext.ChatMessages.Add(chatMessage);
                await _dbContext.SaveChangesAsync();

                // Send the message to all connected clients with the current timestamp
                await Clients.All.SendAsync("ReceiveMessage", userName, message, DateTime.Now);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while connecting user.");
                await SendSystemErrorMessage("An error occurred while sending your message. Please try again.");
            }
        }

        public async Task RetrieveMessages()
        {
            try
            {
                // Fetch the messages from the database
                var messages = await _dbContext.ChatMessages
                                               .OrderByDescending(m => m.Timestamp)
                                               .Take(50) // Fetch the last 50 messages
                                               .ToListAsync();

                // Send the messages to the client that requested them
                await Clients.Caller.SendAsync("RetrievePreviousMessages", messages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving messages.");
                await SendSystemErrorMessage("An error occurred while retrieving messages. Please try again.");
            }
        }

        // Helper method to send system error messages
        private async Task SendSystemErrorMessage(string message)
        {
            await Clients.Caller.SendAsync("ErrorMessage",message);
        }
    }
}

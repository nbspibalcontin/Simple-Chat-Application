document.addEventListener("DOMContentLoaded", function () {
    // Create a SignalR connection
    var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

    // Cache DOM elements for later use
    var userInput = document.getElementById("userInput");
    var connectButton = document.getElementById("connectButton");
    var sendButton = document.getElementById("sendButton");
    var messageInput = document.getElementById("messageInput");
    var previousChatHeading = document.getElementById("previousChatHeading");

    // Enable the connect button only if the userInput field has a value
    userInput.addEventListener("input", function () {
        connectButton.disabled = userInput.value.trim() === "";
    });

    // Start the SignalR connection
    connection.start().then(function () {
        console.log("SignalR Connected");
    }).catch(function (err) {
        handleError("Failed to connect to the server. Please try again.", err);
    });

    // Handle connect button click event
    connectButton.addEventListener("click", function () {
        var userName = userInput.value.trim();
        connection.invoke("ConnectUser", userName).then(function () {
            connection.invoke("RetrieveMessages").catch(function (err) {
                handleError("Failed to retrieve messages.", err);
            });

            // Show the message input section and hide the connect button
            toggleMessageSection(true);
            userInput.readOnly = true;
        }).catch(function (err) {
            handleError("Failed to connect user.", err);
        });
    });

    // Enable the send button only if the messageInput field has a value
    messageInput.addEventListener("input", function () {
        sendButton.disabled = messageInput.value.trim() === "";
    });

    // Handle send button click event
    sendButton.addEventListener("click", function () {
        var userName = userInput.value;
        var message = messageInput.value.trim();
        connection.invoke("SendMessage", userName, message).then(function () {
            // Clear the message input and disable the send button
            messageInput.value = "";
            sendButton.disabled = true;
        }).catch(function (err) {
            handleError("Failed to send message.", err);
        });
    });

    // Handle receiving a message when a user joins
    connection.on("JoinMessage", function (userName) {
        addToConnectedUsersList(userName);
    });

    // Handle receiving previous messages from the server
    connection.on("RetrievePreviousMessages", function (messages) {
        displayPreviousMessages(messages);
    });

    // Handle receiving new messages from the server
    connection.on("ReceiveMessage", function (userName, message, sentAt) {
        displayNewMessage(userName, message, sentAt);
    });

    // Handle receiving error messages from the server
    connection.on("ErrorMessage", function (message) {
        alert(message);
    });

    // Handle errors and provide user-friendly messages
    function handleError(message, error) {
        console.error(message, error.toString());
        alert(message);
    }

    // Show or hide the message input section
    function toggleMessageSection(show) {
        document.getElementById("messageSection").style.display = show ? "block" : "none";
        sendButton.style.display = show ? "block" : "none";
        connectButton.style.display = show ? "none" : "block";
    }

    // Add a user to the connected users list
    function addToConnectedUsersList(userName) {
        var listItem = document.createElement("li");
        listItem.textContent = userName;
        document.getElementById("connectedUsersList").appendChild(listItem);
    }

    // Display previous messages
    function displayPreviousMessages(messages) {
        var messageList = document.getElementById("retrieveMessages");
        messageList.innerHTML = "";

        messages.forEach(function (message) {
            var listItem = document.createElement("li");
            listItem.textContent = `${message.userName} says ${message.message} at ${message.timestamp}`;
            messageList.appendChild(listItem);
        });

        previousChatHeading.textContent = messages.length > 0 ? "Previous Conversation" : "No Previous Conversation";
        previousChatHeading.style.display = "block";
    }

    // Display new messages
    function displayNewMessage(userName, message, sentAt) {
        var listItem = document.createElement("li");
        listItem.textContent = `${userName} says ${message} at ${sentAt}`;
        document.getElementById("messagesList").appendChild(listItem);
    }
});

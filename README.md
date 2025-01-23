# Collaborative Drawing App

This is a real-time collaborative drawing application that allows multiple users to draw on the same canvas simultaneously. The app uses WebSockets for real-time communication between the client and server.

## Features:
- *Live Drawing Sync:* Users can draw on the canvas, and all connected clients will see the updates in real time.
- *Brush Settings:* Change the brush color and size.
- *Canvas Reset:* Clear the canvas for all users.

---
Setup Instructions
Clone the Repository

Clone the repository to your local machine by running the following command:

bash
Copy
git clone https://github.com/Rajeswaran149/Collaborative-Drawing-client.git
Open the Frontend with Live Server

After cloning, navigate to the project folder and open it in your code editor (e.g., VS Code).
Install the Live Server extension if you haven't already.
Right-click on index.html and select "Open with Live Server" to launch the app in your browser.
Test with Multiple Users

You can test the app with multiple users by opening the app in multiple tabs or different devices. All users will be able to draw in real-time on the shared canvas.
If the Deployment Server Is Not Working

If the deployed server isn't working, you can run the app on a local server. Make sure the backend server is running (e.g., Express + Socket.io on http://localhost:3000).

To run the backend locally, clone or download the backend project, install dependencies, and start the server with the following commands:

Once both the frontend and backend are running, open the frontend on multiple browser tabs or devices to test the real-time drawing functionality.

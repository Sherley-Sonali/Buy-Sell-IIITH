# Buy-Sell @ IIITH

## Introduction

- Buy-Sell @ IIITH is a marketplace web application built using the MERN stack. The platform allows IIIT students to buy and sell items within the community. Users can register, list items for sale, search for products, place orders, and manage transactions securely.

## Tech Stack

- Frontend: React.js

- Backend: Node.js with Express.js

- Database: MongoDB

- Authentication: JWT, bcrypt.js, xml2js (CAS login)


## Installation & Setup

### Prerequisites

- Ensure you have the following installed:

- Node.js

- MongoDB (locally or via MongoDB Atlas)

### Steps to Run

- Clone the repository

-     git clone <repository-url>
-     cd buy-sell-iiith

- Install dependencies In the root directory, run:

-     npm install express mongoose body-parser bcryptjs cors express-session axios xml2js jsonwebtoken cookie-parser http socket.io

- Set up environment variables Create a .env file inside the backend/ directory and add the following:

-     MONGO_DB_URL=<your_mongodb_connection_string>
-     BACKEND_PORT=5000
-     CHATBOT_API_KEY=<your_chatbot_api_key>
-     JWT_SECRET=<your_jwt_secret>
-     RECAPTCHA_SECRET=<your_recaptcha_secret>
-     RECAPTCHA_SITE_KEY=<your_recaptcha_site_key>

- Start MongoDB If running locally, start MongoDB with:

-     mongod

- Run the backend Navigate to the backend folder and start the server:

-     cd backend
-     node mongoDB.js

- Run the frontend In the root directory, start the frontend server:

-     npm start

### API and Frontend Ports

- Chatbot API runs on: http://localhost:5001

- Frontend runs on: http://localhost:3000
- Backend runs on: http://localhost:5000

### Contributing

- Fork the repository

- Create a feature branch (git checkout -b feature-branch)

- Commit changes (git commit -m 'Add feature')

- Push to branch (git push origin feature-branch)

- Create a Pull Request
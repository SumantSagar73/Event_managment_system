# EventHub - Event Management System

EventHub is a comprehensive event management platform built with the MERN stack (MongoDB, Express.js, React, Node.js). It allows users to discover, book, and manage events while providing organizers with tools to create and manage their events.

![EventHub Screenshot](https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80)

## Features

### For Users
- **Event Discovery**: Browse events by category, search by keywords, or view featured events
- **Event Details**: View comprehensive information about events including venue, date, and ticket options
- **Ticket Booking**: Purchase tickets for events with multiple tier options
- **My Tickets**: View and manage purchased tickets
- **User Authentication**: Secure login and registration system

### For Organizers
- **Event Creation**: Create and publish new events with detailed information
- **Event Management**: Edit existing events, manage ticket tiers, and view event statistics
- **Ticket Check-in**: Scan and verify tickets at event venues
- **Dashboard**: View analytics and manage all your events in one place

### For Administrators
- **User Management**: Manage user accounts and permissions
- **Content Moderation**: Review and approve events before publication
- **System Configuration**: Configure system settings and parameters

## Technology Stack

### Frontend
- **React.js**: UI library for building the user interface
- **Bootstrap 5**: CSS framework for responsive design
- **React Router**: For client-side routing
- **Axios**: For API requests
- **Context API**: For state management
- **Bootstrap Icons**: For UI icons

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for data storage
- **Mongoose**: ODM for MongoDB
- **JWT**: For authentication
- **Bcrypt**: For password hashing
- **Multer**: For file uploads

## Project Structure

```
Event_managment_system/
├── Client/                 # Frontend React application
│   ├── public/             # Static files
│   │   └── assets/         # Additional assets
│   ├── src/                # Source files
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context for state management
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main application component
│   │   └── index.jsx       # Entry point
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
│
├── server/                 # Backend Node.js application
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── uploads/            # Uploaded files
│   ├── .env                # Environment variables
│   ├── package.json        # Backend dependencies
│   └── server.js           # Entry point
│
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/event-management-system.git
cd event-management-system
```

2. Install backend dependencies
```bash
cd server
npm install
```

3. Create a `.env` file in the server directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eventhub
JWT_SECRET=your_jwt_secret
```

4. Install frontend dependencies
```bash
cd ../Client
npm install
```

5. Start the development servers

For backend:
```bash
cd server
npm run dev
```

For frontend:
```bash
cd Client
npm run dev
```

6. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create a new event
- `PUT /api/events/:id` - Update an event
- `DELETE /api/events/:id` - Delete an event

### Tickets
- `GET /api/tickets` - Get user's tickets
- `POST /api/tickets` - Purchase tickets
- `GET /api/tickets/:id` - Get ticket by ID
- `PUT /api/tickets/:id/check-in` - Check-in a ticket

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

## User Roles

1. **User**: Can browse events, purchase tickets, and view their tickets
2. **Organizer**: Can create and manage events, view event statistics, and check-in tickets
3. **Admin**: Has full access to all features and can manage users and content

## Deployment

### Backend Deployment
1. Set up a MongoDB Atlas account and create a cluster
2. Update the `.env` file with your MongoDB Atlas connection string
3. Deploy to a platform like Heroku, Render, or DigitalOcean

### Frontend Deployment
1. Build the frontend application
```bash
cd Client
npm run build
```
2. Deploy the built files to a static hosting service like Netlify, Vercel, or GitHub Pages

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Bootstrap](https://getbootstrap.com/) for the UI components
- [MongoDB](https://www.mongodb.com/) for the database
- [Express.js](https://expressjs.com/) for the backend framework
- [React](https://reactjs.org/) for the frontend library
- [Node.js](https://nodejs.org/) for the runtime environment

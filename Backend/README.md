# DATASPRINT 2K26 - Node.js PostgreSQL Backend

A complete Node.js backend with Express.js, PostgreSQL, and Prisma ORM for the DATASPRINT 2K26 hackathon project.

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v14 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your PostgreSQL credentials:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/datasprint_db?schema=public"
   ```

3. **Create the database:**
   ```bash
   # Using psql
   createdb datasprint_db
   
   # Or using SQL
   psql -U postgres -c "CREATE DATABASE datasprint_db;"
   ```

4. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

5. **Seed the database (optional):**
   ```bash
   npm run db:seed
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## 📁 Project Structure

```
Backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.js                # Database seeding
├── src/
│   ├── index.js               # App entry point
│   ├── config/
│   │   └── database.js        # Prisma client
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   └── errorHandler.js   # Error handling
│   └── routes/
│       ├── auth.routes.js     # Auth endpoints
│       ├── user.routes.js     # User endpoints
│       └── post.routes.js     # Post endpoints
├── .env.example               # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Health Check
- `GET /health` - Server health check

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users (Protected)
- `GET /api/users/me` - Get current user profile
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

### Posts
- `GET /api/posts` - Get all published posts
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create post (protected)
- `PUT /api/posts/:id` - Update post (protected)
- `DELETE /api/posts/:id` - Delete post (protected)

## 🔑 Authentication

This backend uses JWT (JSON Web Tokens) for authentication.

### Register/Login Response:
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Using Protected Routes:
Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## 🛠️ Development

### Database Commands

```bash
# Generate Prisma Client
npm run db:generate

# Create a new migration
npm run db:migrate

# Push schema changes without migration
npm run db:push

# Open Prisma Studio (GUI for database)
npm run db:studio

# Seed the database
npm run db:seed
```

### Adding New Models

1. Edit `prisma/schema.prisma`
2. Run `npm run db:migrate` to create migration
3. Run `npm run db:generate` to update Prisma Client

### Example: Adding a new model

```prisma
model Comment {
  id        String   @id @default(uuid())
  content   String
  postId    String
  userId    String
  createdAt DateTime @default(now())
  
  @@map("comments")
}
```

## 📝 Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRES_IN` - Token expiration time
- `CORS_ORIGIN` - Allowed CORS origin

## 🧪 Testing the API

### Using curl:

```bash
# Health check
curl http://localhost:3000/health

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get posts
curl http://localhost:3000/api/posts

# Create post (with auth)
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"My Post","content":"Post content","published":true}'
```

### Using Postman or Thunder Client:
Import the endpoints and test them with a REST client.

## 🚢 Deployment

### Environment Setup
1. Set up PostgreSQL database on your hosting platform
2. Update `DATABASE_URL` with production credentials
3. Set `NODE_ENV=production`
4. Generate a secure `JWT_SECRET`

### Platforms
- **Railway**: Connect GitHub repo, add PostgreSQL addon
- **Render**: Create Web Service + PostgreSQL database
- **Heroku**: Add Heroku Postgres addon
- **Vercel**: Use with Vercel Postgres or external DB

### Build Command:
```bash
npm install && npm run db:generate && npm run db:migrate
```

### Start Command:
```bash
npm start
```

## 🔒 Security Best Practices

- ✅ Passwords are hashed with bcrypt
- ✅ JWT tokens for authentication
- ✅ CORS configured
- ✅ Input validation with express-validator
- ✅ Environment variables for secrets
- ✅ Error handling middleware

## 📚 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcryptjs
- **Validation**: express-validator

## 🤝 Contributing

This is a hackathon project. Feel free to modify and extend as needed!

## 📄 License

MIT

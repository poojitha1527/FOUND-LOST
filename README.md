# FOUND&LOST

A full-stack campus lost-and-found board. Users can report lost or found items, search and filter listings, register and sign in, submit claims, and mark items as reunited.

## Features

- Create lost and found listings with image uploads
- Search by keyword and filter by status and category
- View item details and board statistics
- Register, sign in, and manage profiles with JWT authentication
- Submit claims and mark items as resolved
- Responsive vanilla JavaScript frontend
- Express REST API with MongoDB, validation, rate limiting, and security headers

## Technology

- Frontend: HTML, CSS, and vanilla JavaScript
- Backend: Node.js, Express, and Mongoose
- Database: MongoDB or the development in-memory fallback
- Authentication: JSON Web Tokens and bcryptjs

## Requirements

- Node.js 14 or newer
- npm 6 or newer
- MongoDB for persistent data, or MongoDB Atlas

## Quick Start

### Install dependencies

From the project root:

```powershell
cd backend
npm install
```

### Configure the backend

Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

Recommended local development values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus-lost-found
NODE_ENV=development
JWT_SECRET=replace-this-with-a-long-random-value
CORS_ORIGIN=http://localhost:8080
```

When `NODE_ENV=development` and the URI points to localhost, the server can use an in-memory MongoDB instance. Use MongoDB or MongoDB Atlas when data must persist between restarts.

### Start the API

In the `backend` directory:

```powershell
npm run dev
```

The API runs at `http://localhost:5000`. Check it at `http://localhost:5000/api/health`.

### Start the frontend

Open a second terminal at the project root and serve the frontend:

```powershell
npx http-server frontend -p 8080
```

Open `http://localhost:8080` in a browser. The frontend currently expects the API at `http://localhost:5000/api`; update `API_URL` in `frontend/app.js` when using a different API host.

## Deploying on Render

The repository includes `render.yaml` for a Render Blueprint with two services:

- `found-lost-api`: Node web service rooted at `backend`
- `found-lost-frontend`: static site publishing `frontend` directly; no `build` directory is required

Create the Blueprint from the repository, then set these environment variables for the API service:

```text
MONGODB_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<a long random secret>
CORS_ORIGIN=<the deployed frontend URL>
```

After deployment, update `API_URL` near the top of `frontend/app.js` to the API service URL followed by `/api`, then redeploy the static site.

## Commands

From the project root:

```powershell
npm run dev       # Start the backend with nodemon
npm start         # Start the backend in production mode
npm run seed      # Load sample data
```

From `backend`:

```powershell
npm install
npm run dev
npm start
npm run seed
```

## API Overview

### Items

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/items` | List items with filters and pagination |
| `GET` | `/api/items/stats/overview` | Get board statistics |
| `GET` | `/api/items/:id` | Get one item |
| `POST` | `/api/items` | Create an item |
| `PATCH` | `/api/items/:id` | Update an item |
| `POST` | `/api/items/:id/resolve` | Mark an item resolved |
| `POST` | `/api/items/:id/claim` | Submit a claim |

### Users

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/users/register` | Register a user |
| `POST` | `/api/users/login` | Sign in and receive a JWT |
| `GET` | `/api/users/me` | Get the authenticated user |
| `GET` | `/api/users/:id` | Get a user profile |
| `PATCH` | `/api/users/:id` | Update an authenticated user profile |

Protected routes use this header:

```http
Authorization: Bearer <token>
```

## Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `5000` | API port |
| `MONGODB_URI` | Local campus database URI | MongoDB connection string |
| `NODE_ENV` | Unset | Set to `development` to enable the in-memory fallback |
| `JWT_SECRET` | None | Secret used to sign authentication tokens |
| `JWT_EXPIRE` | `30d` | Token lifetime |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed frontend origin |
| `MAX_FILE_SIZE` | `5242880` | Maximum image size in bytes |

## Project Structure

```text
backend/
  controllers/    Request handlers
  middleware/     Authentication middleware
  models/         Mongoose models
  routes/         API routes
  scripts/        Seed script
  utils/          Image utilities
  server.js       Express application entry point
frontend/
  index.html      Application page
  app.js          Frontend state and API integration
```

## Troubleshooting

- **MongoDB connection errors:** Start MongoDB, check `MONGODB_URI`, or use MongoDB Atlas. Development mode can use the in-memory fallback.
- **CORS errors:** Set `CORS_ORIGIN` to the exact frontend origin, such as `http://localhost:8080`.
- **Port already in use:** Change `PORT` in `backend/.env` or use another frontend port with `npx http-server frontend -p 8081`.
- **Image upload errors:** Upload an image under the configured `MAX_FILE_SIZE` limit. The API accepts image MIME types only.
- **401 responses:** Sign in first and send the returned JWT as a Bearer token.

## Repository

GitHub: [poojitha1527/FOUND-LOST](https://github.com/poojitha1527/FOUND-LOST)

## License

MIT
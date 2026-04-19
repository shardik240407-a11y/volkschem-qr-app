# Volkschem QR Verification App

Full-stack MVP for Volkschem Crop Science PVT LTD to support QR-based product and batch verification.

## Tech Stack

- Backend: Node.js, Express, MongoDB (Mongoose), JWT, Multer, Cloudinary
- Frontend: React (Vite), Tailwind CSS, Axios, React Router

## Project Structure

- backend/
  - src/models
  - src/routes
  - src/controllers
  - src/middleware
  - src/config
- frontend/
  - src/components
  - src/pages
  - src/services

## 1. Backend Setup

1. Open terminal:
   - `cd backend`
2. Create env file:
   - Copy `.env.example` to `.env`
3. Fill env values:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `FRONTEND_BASE_URL`
4. Install dependencies:
   - `npm install`
5. Run backend:
   - `npm run dev`

### Backend API Endpoints

- Auth
  - `POST /api/auth/login`
- Product
  - `POST /api/products` (protected)
  - `GET /api/products`
  - `GET /api/products/:slug`
  - `PUT /api/products/:id` (protected)
  - `DELETE /api/products/:id` (protected)
- Batch
  - `POST /api/batches` (protected)
  - `GET /api/batches/:productId` (protected)
  - `GET /api/batch/:slug/:batchNo` (public verification)

### Default Admin

- Email: `admin@volkschem.com`
- Password: `Admin@123`

You can override these using `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

## 2. Frontend Setup

1. Open terminal:
   - `cd frontend`
2. Create env file:
   - Copy `.env.example` to `.env`
3. Set backend URL:
   - `VITE_API_URL=http://localhost:5000/api`
4. Install dependencies:
   - `npm install`
5. Run frontend:
   - `npm run dev`

## Branding Assets

Add the official logo file at:

- `frontend/public/brand/volkschem-logo.png`

The app uses this logo in login, admin navbar/sidebar, and public verification page.

## 3. Integration Flow

- Admin logs in
- Admin adds product (one-time)
- Admin adds multiple batches for selected product
- System returns verification URL:
  - `https://yourdomain.com/p/:slug/:batchNo`
- QR code should be generated using that URL
- Customer scans QR and sees authenticity page

## 4. Deployment Guide

### Backend (Render/Railway)

1. Deploy `backend` as Node service.
2. Set environment variables from `.env.example`.
3. Build command: `npm install`
4. Start command: `npm start`

### Database (MongoDB Atlas)

1. Create cluster and user.
2. Whitelist backend IP or use proper network rules.
3. Set `MONGO_URI` in backend environment.

### Cloudinary

1. Create product documents/images folder automatically via uploads.
2. Add Cloudinary credentials in backend env.

### Frontend (Vercel)

1. Deploy `frontend` project.
2. Add env: `VITE_API_URL=https://your-backend-domain/api`
3. Ensure backend `FRONTEND_BASE_URL` includes frontend domain.

## Sample Data

- Use `backend/sample-data.json` as initial reference payloads.

## Notes

- Duplicate batch numbers are prevented per product.
- Slug is auto-generated from product name.
- Product + batch verification returns `Invalid or Fake Product` when no match exists.

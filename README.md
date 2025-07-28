# Vera Gayrimenkul

Modern real estate website built with Next.js and deployed on CapRover.

## Technologies

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT with HTTP-only cookies
- **Deployment:** Docker + CapRover
- **Storage:** Local file system with upload support

## Features

- Property listings management
- Admin panel with authentication
- Team member management
- Career application system
- Responsive design
- SEO optimization

## Local Development

```bash
cd frontend
npm install
npm run dev
```

## Production Deployment

This project is configured for CapRover deployment:

```bash
# Build and push Docker image
docker buildx build --platform linux/amd64 -f Dockerfile.caprover -t your-registry/vera-gayrimenkul:latest --push .

# Deploy via CapRover dashboard
# Use "Deploy via ImageName" with the image above
```

See `caprover-config.md` for detailed deployment instructions.

## Project Structure

```
vera_gayrimenkul/
├── frontend/                 # Next.js application
├── Dockerfile.caprover      # Production Docker configuration
├── captain-definition       # CapRover deployment config
└── caprover-config.md      # Setup and deployment guide
```

## Environment Variables

Required for production:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=hashed_password
JWT_SECRET=your_jwt_secret
```

## License

Private project for Vera Real Estate Group. 
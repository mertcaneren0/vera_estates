# CapRover Configuration - Vera Gayrimenkul

## Project Identification
- **App Name**: `vera-gayrimenkul`
- **Subdomain**: `vera-gayrimenkul.yourdomain.com`
- **Container Port**: 3000
- **Database Name**: `vera_gayrimenkul_db`

## 1. Pre-Deployment Setup

### Create App in CapRover
```bash
# Login to CapRover
caprover login

# Create new app
caprover apps create vera-gayrimenkul
```

### Database Setup (PostgreSQL)
1. Go to CapRover Dashboard → Apps → One-Click Apps
2. Install PostgreSQL
3. App name: `vera-gayrimenkul-db`
4. Database name: `vera_gayrimenkul_db`
5. Username: `vera_user`
6. Password: `[strong-password]`

## 2. Environment Variables

Set these in CapRover Dashboard → Apps → vera-gayrimenkul → App Configs → Environment Variables:

```
NODE_ENV=production
DATABASE_URL=postgresql://vera_user:[password]@srv-captain--vera-gayrimenkul-db:5432/vera_gayrimenkul_db
NEXTAUTH_SECRET=[generate-32-char-secret]
NEXTAUTH_URL=https://vera-gayrimenkul.yourdomain.com
JWT_SECRET=[generate-another-secret]
PORT=3000
HOSTNAME=0.0.0.0

# Cloud Storage (Recommended - Optional)
USE_CLOUD_STORAGE=true
CLOUDINARY_CLOUD_NAME=[your-cloudinary-name]
CLOUDINARY_API_KEY=[your-api-key]
CLOUDINARY_API_SECRET=[your-api-secret]
```

### Cloud Storage Setup (Recommended)

For production deployments, using cloud storage like Cloudinary is highly recommended:

1. **Create Cloudinary Account**: 
   - Go to https://cloudinary.com and create free account
   - Get your Cloud Name, API Key, and API Secret from dashboard

2. **Configure Environment Variables**:
   - Set `USE_CLOUD_STORAGE=true`
   - Add your Cloudinary credentials
   - Images will be stored in cloud instead of container

3. **Benefits**:
   - Images persist across deployments
   - Automatic CDN distribution
   - Image optimization and transformations
   - No volume mount configuration needed

### Local Storage Alternative

If you prefer local storage (requires persistent volumes):
- Set `USE_CLOUD_STORAGE=false` or leave undefined
- Follow persistent storage configuration below

## 3. Persistent Storage Configuration

**CRITICAL**: For image uploads to persist across container restarts, you MUST configure persistent storage:

### Step 1: Create Persistent Directory
1. SSH into your CapRover server
2. Create uploads directory:
```bash
sudo mkdir -p /captain/data/vera-gayrimenkul-uploads
sudo chown -R 1001:1001 /captain/data/vera-gayrimenkul-uploads
sudo chmod 755 /captain/data/vera-gayrimenkul-uploads
```

### Step 2: Configure Volume Mount in CapRover
1. Go to CapRover Dashboard → Apps → vera-gayrimenkul → App Configs
2. Scroll down to "Persistent Directories"
3. Add new persistent directory:
   - **Path in App**: `/app/public/uploads`
   - **Label**: `vera-gayrimenkul-uploads`
4. Click "Save & Update"

### Step 3: Alternative - Use CapRover UI Volume Mount
If the above doesn't work, try this approach:
1. CapRover Dashboard → Apps → vera-gayrimenkul → App Configs
2. Add Volume Mapping:
   - **Host Path**: `/captain/data/vera-gayrimenkul-uploads`
   - **Container Path**: `/app/public/uploads`
   - **Volume Name**: `vera-gayrimenkul-uploads`

## 4. Deployment Commands

```bash
# From project root
./deploy-caprover.sh

# Then deploy
caprover deploy -a vera-gayrimenkul
```

## 5. Post-Deployment Steps

1. **Enable HTTPS**: CapRover Dashboard → Apps → vera-gayrimenkul → HTTP Settings → Enable HTTPS

2. **Verify Upload Directory**: 
   ```bash
   # SSH to server and check
   docker exec -it $(docker ps | grep vera-gayrimenkul | awk '{print $1}') ls -la /app/public/uploads
   ```

3. **Test File Upload**:
   - Go to admin panel
   - Try uploading an image
   - Check if file persists after container restart

4. **Custom Domain** (if needed):
   - CapRover Dashboard → Apps → vera-gayrimenkul → HTTP Settings
   - Add: `gayrimenkul.yourdomain.com`

## 6. Troubleshooting Upload Issues

### If images still don't persist:

1. **Check Volume Mount**:
```bash
# SSH to CapRover server
docker inspect $(docker ps | grep vera-gayrimenkul | awk '{print $1}') | grep Mounts -A 10
```

2. **Check File Permissions**:
```bash
# In container
docker exec -it $(docker ps | grep vera-gayrimenkul | awk '{print $1}') ls -la /app/public/uploads
```

3. **Check Upload API**:
```bash
# Test upload endpoint
curl -X POST https://vera-gayrimenkul.yourdomain.com/api/upload \
  -F "files=@test-image.jpg"
```

4. **Alternative Solution - External Storage**:
If persistent volumes continue to cause issues, consider using:
- AWS S3
- DigitalOcean Spaces
- Cloudinary
- Any cloud storage service

## 7. Database Migration

The app will automatically run Prisma migrations on startup via `migrate-and-start.sh`.

## 8. Monitoring

- **Health Check**: `https://vera-gayrimenkul.yourdomain.com/api/health`
- **Logs**: CapRover Dashboard → Apps → vera-gayrimenkul → Logs
- **Upload Test**: Try uploading images through admin panel

## 9. Avoiding Conflicts

- Use unique app name: `vera-gayrimenkul`
- Use unique database name: `vera_gayrimenkul_db` 
- Use different subdomain for each project
- Separate persistent storage paths

## 10. SSL Setup

After deployment, enable Force HTTPS in CapRover dashboard for security. 

## 11. Important Notes

- **Upload Directory**: Must be persistent or images will disappear on restart
- **File Permissions**: Container runs as user 1001 (nextjs)
- **Volume Persistence**: Critical for production image storage
- **Backup Strategy**: Consider regular backups of upload directory 
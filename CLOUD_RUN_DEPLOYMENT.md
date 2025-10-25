# Google Cloud Run Deployment Guide

This guide explains how to deploy the Housing Data POC to Google Cloud Run, including solutions for the large default CSV file.

## The Challenge: Large CSV File (86MB)

The default Zillow ZHVI dataset (`public/data/default-housing-data.csv`) is **86MB**, which can cause deployment issues with Cloud Run:

- Large container images slow down deployments
- GitHub may warn about large files
- Cold starts take longer with large static assets

## Solution Options

### Option 1: Host CSV on Google Cloud Storage (Recommended for Production)

This is the best approach for serverless deployments - serve the CSV from Cloud Storage instead of bundling it in the container.

**Steps:**

1. **Upload CSV to Google Cloud Storage**
   ```bash
   # Create a bucket (one-time setup)
   gsutil mb gs://your-housing-data-assets

   # Make bucket public for reading
   gsutil iam ch allUsers:objectViewer gs://your-housing-data-assets

   # Upload the CSV file
   gsutil cp housing-data-poc/public/data/default-housing-data.csv \
     gs://your-housing-data-assets/default-housing-data.csv

   # Set cache control for better performance
   gsutil setmeta -h "Cache-Control:public, max-age=86400" \
     gs://your-housing-data-assets/default-housing-data.csv
   ```

2. **Update CSV Provider to use Cloud Storage URL**

   Edit `src/services/providers/csv.provider.ts`:

   ```typescript
   // Change this line:
   const DEFAULT_CSV_PATH = '/data/default-housing-data.csv';

   // To this (use your bucket name):
   const DEFAULT_CSV_PATH = import.meta.env.VITE_DEFAULT_CSV_URL ||
     'https://storage.googleapis.com/your-housing-data-assets/default-housing-data.csv';
   ```

3. **Remove CSV from public folder (optional)**

   To reduce container size, remove the local CSV:
   ```bash
   # Create .dockerignore to exclude during build
   echo "public/data/*.csv" >> .dockerignore
   ```

4. **Set environment variable in Cloud Run**
   ```bash
   gcloud run deploy housing-data-poc \
     --set-env-vars VITE_DEFAULT_CSV_URL=https://storage.googleapis.com/your-housing-data-assets/default-housing-data.csv
   ```

**Benefits:**
- ✅ Small container image (fast deployments)
- ✅ Fast cold starts
- ✅ Easy to update CSV without redeploying
- ✅ CDN-backed storage for global performance
- ✅ Version control with GCS versioning

---

### Option 2: Use Compressed CSV

Compress the CSV file and decompress it in the browser.

**Steps:**

1. **Compress the CSV file**
   ```bash
   cd housing-data-poc/public/data
   gzip -9 -k default-housing-data.csv
   # Creates default-housing-data.csv.gz (much smaller)
   ```

2. **Update CSV provider to handle gzip**

   Modify the fetch call to handle compressed files:
   ```typescript
   const response = await fetch(DEFAULT_CSV_PATH + '.gz');
   const blob = await response.blob();
   const decompressedStream = blob.stream().pipeThrough(new DecompressionStream('gzip'));
   const decompressedBlob = await new Response(decompressedStream).blob();
   const csvContent = await decompressedBlob.text();
   ```

**Benefits:**
- ✅ Significantly smaller file size (CSV compresses very well, typically 80-90% reduction)
- ✅ Faster network transfer
- ⚠️ Requires browser support for DecompressionStream API (modern browsers only)

---

### Option 3: Deploy Without Default CSV (Smallest)

For the absolute smallest deployment, don't include default data at all. Users upload their own CSV.

**Steps:**

1. **Remove default CSV from repository**
   ```bash
   git rm housing-data-poc/public/data/default-housing-data.csv
   ```

2. **Update CSV provider to skip default loading**

   Modify `loadDataFromStorage()` to not call `loadDefaultCSV()`:
   ```typescript
   // In loadDataFromStorage(), comment out:
   // await this.loadDefaultCSV();

   // Instead, just return with empty state
   console.log('[CSV Provider] No default data - ready for user upload');
   ```

3. **Update UI messaging**

   Show a message prompting users to upload their own CSV file.

**Benefits:**
- ✅ Smallest possible container
- ✅ Fastest deployments and cold starts
- ⚠️ Users must upload CSV to use the app

---

### Option 4: Use Smaller Sample Dataset

Create a smaller sample dataset for demo/testing purposes.

**Steps:**

1. **Create smaller CSV with fewer cities/years**
   ```bash
   # Keep only last 5 years of data for 10 major cities
   # This could reduce file from 86MB to ~5MB
   ```

2. **Replace default CSV with smaller version**

**Benefits:**
- ✅ Good balance between functionality and size
- ✅ Works well for demos
- ⚠️ Less comprehensive data

---

## Recommended Deployment Workflow

For **production**, use **Option 1 (Cloud Storage)**:

```bash
# 1. Upload CSV to Cloud Storage (one-time)
gsutil cp public/data/default-housing-data.csv gs://your-bucket/

# 2. Build the app without including large CSV
echo "public/data/*.csv" >> .dockerignore

# 3. Create Dockerfile
cat > Dockerfile <<'EOF'
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
EOF

# 4. Create nginx.conf
cat > nginx.conf <<'EOF'
server {
    listen 8080;
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
EOF

# 5. Build and deploy
gcloud builds submit --tag gcr.io/PROJECT_ID/housing-data-poc
gcloud run deploy housing-data-poc \
  --image gcr.io/PROJECT_ID/housing-data-poc \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars VITE_DEFAULT_CSV_URL=https://storage.googleapis.com/your-bucket/default-housing-data.csv
```

---

## Alternative: Deploy to Vercel (Easier)

Vercel handles large static assets better than Cloud Run for this use case:

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy from housing-data-poc directory
cd housing-data-poc
vercel

# 3. Set environment variables (if using Cloud Storage)
vercel env add VITE_DEFAULT_CSV_URL
```

Vercel automatically:
- Serves static files from CDN
- Handles large files efficiently
- Provides instant rollbacks
- Zero configuration needed

---

## Troubleshooting

### CSV returns 404 on Cloud Run

**Cause:** Static file not being served by nginx

**Solution:** Verify nginx.conf includes proper static file serving:
```nginx
location /data/ {
    alias /usr/share/nginx/html/data/;
    add_header Cache-Control "public, max-age=86400";
}
```

### CORS errors when loading from Cloud Storage

**Cause:** CORS policy not configured on bucket

**Solution:** Set CORS policy:

PowerShell:
```powershell
# Create cors.json file
@'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Content-Length", "Cache-Control"],
    "maxAgeSeconds": 3600
  }
]
'@ | Out-File -FilePath cors.json -Encoding utf8

# Apply CORS configuration
gcloud storage buckets update gs://your-bucket --cors-file=cors.json
```

Bash:
```bash
cat > cors.json <<'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Content-Length", "Cache-Control"],
    "maxAgeSeconds": 3600
  }
]
EOF

gcloud storage buckets update gs://your-bucket --cors-file=cors.json
```

### Container build times out

**Cause:** Large CSV included in build context

**Solution:** Add to `.dockerignore`:
```
public/data/*.csv
node_modules
.git
dist
*.log
```

---

## Performance Comparison

| Option | Container Size | Build Time | Cold Start | Data Load Time |
|--------|---------------|------------|------------|----------------|
| Bundled CSV (current) | ~100MB | ~3min | ~10s | Fast (local) |
| Cloud Storage | ~15MB | ~1min | ~2s | Fast (CDN) |
| Compressed CSV | ~30MB | ~1.5min | ~4s | Medium (decompress) |
| No default CSV | ~15MB | ~1min | ~2s | N/A (user upload) |

---

## Conclusion

For **Cloud Run deployments**, we recommend **Option 1 (Cloud Storage)** because:
- Smallest container size
- Fastest deployments and cold starts
- Easy to update CSV data independently
- Best practices for serverless architecture
- Better for production scaling

For **quick demos/testing**, Vercel is the easiest option with zero configuration.

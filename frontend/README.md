# Sports Podcast Frontend

React + Vite frontend for the Sports Podcast Generator service.

## Features

- **File Upload**: Drag-and-drop audio files for processing
- **Real-time Progress**: Visual progress tracker for the entire pipeline
- **Status Polling**: Polls backend for processing status
- **Audio Player**: Built-in player to listen to generated podcasts
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
frontend/
├── api/
│   ├── upload-url.js       # Generate signed URLs for GCS upload
│   └── status.js           # Check processing status
├── src/
│   ├── components/
│   │   ├── FileDropzone.jsx     # Drag-drop file input
│   │   ├── ProgressTracker.jsx  # Visual progress stages
│   │   ├── PodcastPlayer.jsx    # Audio player
│   │   └── StatusBadge.jsx      # Status indicator
│   ├── hooks/
│   │   ├── useUpload.js    # Handle file upload to GCS
│   │   └── usePolling.js   # Poll processing status
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── vercel.json
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Build

```bash
npm run build
```

Output goes to `dist/` directory.

## Environment Variables

Create a `.env.local` file:

```env
VITE_BACKEND_URL=http://localhost:8000
```

## API Integration

### Upload Flow

1. **Get Signed URL** → `POST /api/upload-url`
   - Returns: `{ signedUrl, gcsUri }`
2. **Upload to GCS** → `PUT {signedUrl}`
   - File uploaded directly to Cloud Storage
3. **Start Polling** → `GET /api/status?gcsUri={uri}`
   - Polls until processing completes

### Backend Requirements

Your backend needs these endpoints:

```
POST /generate-signed-url
  Body: { filename, contentType }
  Returns: { signedUrl, gcsUri }

GET /status?gcsUri=...
  Returns: { 
    status: "processing|complete|error",
    sport?: "...",
    match_title?: "...",
    overview?: "...",
    podcast_url?: "...",
    message?: "..."
  }
```

## Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Import your repo at vercel.com
   - Set `REACT_APP_BACKEND_URL` environment variable
   - Deploy!

## Customization

### Styling

All components have `.css` files. Modify colors in:
- `src/App.css` - Main theme (gradient: #667eea → #764ba2)
- `src/components/*.css` - Component-specific styles

### Polling Interval

Edit `usePolling.js` line with `setInterval(poll, 2000)` to change from 2s.

### Upload Validation

Edit `FileDropzone.jsx` to add file size checks or format restrictions.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Ensure backend sends `Access-Control-Allow-Origin: *` |
| Upload fails | Check signed URL generation and GCS bucket permissions |
| Status polling times out | Increase polling interval or backend timeout |
| Files not uploading to GCS | Verify signed URLs are valid and not expired |

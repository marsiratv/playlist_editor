import express from 'express';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// In-memory storage untuk Render (persist selama instance hidup)
let playlists = [];

// API Routes untuk menyimpan playlist
app.get('/api/playlists', (req, res) => {
  res.json(playlists);
});

app.post('/api/playlists', (req, res) => {
  try {
    const playlist = {
      ...req.body,
      id: Date.now().toString(),
      dateCreated: new Date().toISOString()
    };
    
    // Remove existing playlist dengan nama yang sama
    playlists = playlists.filter(p => p.name !== playlist.name);
    playlists.push(playlist);
    
    res.json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save playlist' });
  }
});

app.delete('/api/playlists/:id', (req, res) => {
  try {
    const { id } = req.params;
    playlists = playlists.filter(p => p.id !== id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
});

// Health check endpoint untuk Render
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    playlists: playlists.length 
  });
});

// Serve React app untuk semua routes lainnya
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 M3U Editor running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

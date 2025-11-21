import React from 'react';
import MediaPlaylistEditor from './MediaPlaylistEditor';

// Render-compatible storage API
if (typeof window !== 'undefined') {
  window.storage = {
    async set(key, value) {
      try {
        const playlistData = JSON.parse(value);
        const response = await fetch('/api/playlists', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: key.replace('playlist:', ''),
            ...playlistData
          })
        });
        
        if (!response.ok) throw new Error('Network error');
        return await response.json();
      } catch (error) {
        console.error('Storage set error:', error);
        // Fallback ke localStorage jika API gagal
        try {
          localStorage.setItem(key, value);
          return { success: true };
        } catch (e) {
          return { success: false, error: e.message };
        }
      }
    },
    
    async get(key) {
      try {
        const response = await fetch('/api/playlists');
        if (response.ok) {
          const playlists = await response.json();
          const playlistName = key.replace('playlist:', '');
          const playlist = playlists.find(p => p.name === playlistName);
          return playlist ? { value: JSON.stringify(playlist) } : null;
        }
        throw new Error('Network error');
      } catch (error) {
        // Fallback ke localStorage
        try {
          const item = localStorage.getItem(key);
          return item ? { value: item } : null;
        } catch (e) {
          return null;
        }
      }
    },
    
    async list(prefix) {
      try {
        const response = await fetch('/api/playlists');
        if (response.ok) {
          const playlists = await response.json();
          return { 
            keys: playlists.map(p => `playlist:${p.name.replace(/[^a-zA-Z0-9]/g, '_')}`) 
          };
        }
        throw new Error('Network error');
      } catch (error) {
        // Fallback ke localStorage
        try {
          const keys = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(prefix)) {
              keys.push(key);
            }
          }
          return { keys };
        } catch (e) {
          return { keys: [] };
        }
      }
    },
    
    async delete(key) {
      try {
        // Cari ID playlist dari nama
        const response = await fetch('/api/playlists');
        if (response.ok) {
          const playlists = await response.json();
          const playlistName = key.replace('playlist:', '');
          const playlist = playlists.find(p => p.name === playlistName);
          
          if (playlist && playlist.id) {
            await fetch(`/api/playlists/${playlist.id}`, { 
              method: 'DELETE' 
            });
          }
        }
        return { success: true };
      } catch (error) {
        // Fallback ke localStorage
        try {
          localStorage.removeItem(key);
          return { success: true };
        } catch (e) {
          return { success: false, error: e.message };
        }
      }
    }
  };
}

function App() {
  return <MediaPlaylistEditor />;
}

export default App;

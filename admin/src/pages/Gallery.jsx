import { useEffect, useRef, useState } from 'react';
import api, { ASSET_URL } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import './Gallery.css';

const CATEGORIES = ['Portrait Photography', 'Wedding Photography', 'Product Photography', 'Landscape Photography', 'General'];

export default function Gallery() {
  const toast = useToast();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('');
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    setLoading(true);
    api
      .get('/gallery')
      .then((res) => setPhotos(res.data))
      .finally(() => setLoading(false));
  };

  const handleUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    Promise.all(
      files.map((file) => {
        const fd = new FormData();
        fd.append('image', file);
        return api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((res) =>
          api.post('/gallery', { image_url: `${ASSET_URL}${res.data.url}`, category: 'General', alt: file.name })
        );
      })
    )
      .then(() => {
        toast.push(`${files.length} photo${files.length > 1 ? 's' : ''} uploaded`);
        load();
      })
      .catch(() => toast.push('Some uploads failed', 'error'))
      .finally(() => setUploading(false));
  };

  const updateCategory = (photo, category) => {
    api
      .put(`/gallery/${photo.id}`, { category })
      .then(() => setPhotos((p) => p.map((x) => (x.id === photo.id ? { ...x, category } : x))))
      .catch(() => toast.push('Failed to update category', 'error'));
  };

  const remove = (photo) => {
    if (!window.confirm('Delete this photo?')) return;
    api
      .delete(`/gallery/${photo.id}`)
      .then(() => {
        toast.push('Photo deleted');
        load();
      })
      .catch(() => toast.push('Failed to delete', 'error'));
  };

  const handleDragStart = (index) => {
    dragItem.current = index;
  };
  const handleDragEnter = (index) => {
    dragOverItem.current = index;
  };
  const handleDragEnd = () => {
    const list = [...photos];
    const from = dragItem.current;
    const to = dragOverItem.current;
    if (from === null || to === null || from === to) return;
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    setPhotos(list);
    dragItem.current = null;
    dragOverItem.current = null;
    api.patch('/gallery/reorder', { order: list.map((p) => p.id) }).catch(() => toast.push('Failed to save order', 'error'));
  };

  const filtered = filter ? photos.filter((p) => p.category === filter) : photos;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Gallery</h1>
          <p>Drag photos to reorder. Assign a category so photos show under the right service.</p>
        </div>
        <label className="btn btn-accent gallery-upload-btn">
          {uploading ? 'Uploading…' : '+ Upload Photos'}
          <input type="file" accept="image/*" multiple hidden onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      <div className="gallery-filter-row">
        <button className={`chip ${filter === '' ? 'chip--active' : ''}`} onClick={() => setFilter('')}>
          All
        </button>
        {CATEGORIES.map((c) => (
          <button key={c} className={`chip ${filter === c ? 'chip--active' : ''}`} onClick={() => setFilter(c)}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-block">
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">No photos in this category yet.</div>
      ) : (
        <div className="gallery-grid">
          {filtered.map((p, i) => (
            <div
              className="gallery-item"
              key={p.id}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragEnter={() => handleDragEnter(i)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              <img src={p.image_url} alt={p.alt || 'Gallery photo'} />
              <div className="gallery-item__overlay">
                <select value={p.category} onChange={(e) => updateCategory(p, e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button className="btn btn-sm btn-danger" onClick={() => remove(p)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

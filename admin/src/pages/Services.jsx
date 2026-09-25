import { useEffect, useState } from 'react';
import api, { ASSET_URL } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import './Services.css';

const emptyForm = { title: '', description: '', price: '', thumbnail: '', active: true };

export default function Services() {
  const toast = useToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    setLoading(true);
    api
      .get('/services')
      .then((res) => setServices(res.data))
      .finally(() => setLoading(false));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditingId(s.id);
    setForm({ title: s.title, description: s.description || '', price: s.price, thumbnail: s.thumbnail || '', active: !!s.active });
    setModalOpen(true);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    setUploading(true);
    api
      .post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => setForm((f) => ({ ...f, thumbnail: `${ASSET_URL}${res.data.url}` })))
      .catch(() => toast.push('Image upload failed', 'error'))
      .finally(() => setUploading(false));
  };

  const save = () => {
    if (!form.title.trim()) {
      toast.push('Title is required', 'error');
      return;
    }
    const payload = { ...form, price: Number(form.price) || 0, active: form.active ? 1 : 0 };
    const req = editingId ? api.put(`/services/${editingId}`, payload) : api.post('/services', payload);
    req
      .then(() => {
        toast.push(editingId ? 'Service updated' : 'Service added');
        setModalOpen(false);
        load();
      })
      .catch(() => toast.push('Failed to save service', 'error'));
  };

  const remove = (s) => {
    if (!window.confirm(`Delete "${s.title}"?`)) return;
    api
      .delete(`/services/${s.id}`)
      .then(() => {
        toast.push('Service deleted');
        load();
      })
      .catch(() => toast.push('Failed to delete', 'error'));
  };

  const toggleActive = (s) => {
    api
      .put(`/services/${s.id}`, { active: s.active ? 0 : 1 })
      .then(load)
      .catch(() => toast.push('Failed to update', 'error'));
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Services</h1>
          <p>Manage the photography services shown on your website.</p>
        </div>
        <button className="btn btn-accent" onClick={openCreate}>
          + Add Service
        </button>
      </div>

      {loading ? (
        <div className="loading-block">
          <div className="spinner" />
        </div>
      ) : services.length === 0 ? (
        <div className="card empty-state">No services yet. Add your first one!</div>
      ) : (
        <div className="services-grid">
          {services.map((s) => (
            <div className="card service-card" key={s.id}>
              <div className="service-card__img">
                {s.thumbnail ? <img src={s.thumbnail} alt={s.title} /> : <div className="service-card__img-placeholder">No image</div>}
                <span className={`badge ${s.active ? 'badge-green' : 'badge-muted'} service-card__badge`}>{s.active ? 'Active' : 'Hidden'}</span>
              </div>
              <div className="service-card__body">
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                <div className="service-card__price">₹{Number(s.price).toLocaleString('en-IN')}</div>
              </div>
              <div className="service-card__actions">
                <button className="btn btn-sm" onClick={() => openEdit(s)}>
                  Edit
                </button>
                <button className="btn btn-sm" onClick={() => toggleActive(s)}>
                  {s.active ? 'Hide' : 'Show'}
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => remove(s)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Service' : 'Add Service'}</h2>
            <div className="grid-form">
              <div className="field span-2">
                <label>Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Portrait Photography" />
              </div>
              <div className="field span-2">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description shown on the website" />
              </div>
              <div className="field">
                <label>Price (₹)</label>
                <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="2500" />
              </div>
              <div className="field">
                <label>Visible on website</label>
                <select value={form.active ? '1' : '0'} onChange={(e) => setForm({ ...form, active: e.target.value === '1' })}>
                  <option value="1">Active</option>
                  <option value="0">Hidden</option>
                </select>
              </div>
              <div className="field span-2">
                <label>Thumbnail</label>
                <input type="file" accept="image/*" onChange={handleUpload} />
                {uploading && <span className="upload-hint">Uploading…</span>}
                {form.thumbnail && <img src={form.thumbnail} alt="preview" className="thumb-preview" />}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={save}>
                {editingId ? 'Save Changes' : 'Add Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

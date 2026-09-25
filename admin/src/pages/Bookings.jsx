import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import './Bookings.css';

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function Bookings() {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // booking being rescheduled/edited

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search]);

  const load = () => {
    setLoading(true);
    api
      .get('/bookings', { params: { status: status || undefined, search: search || undefined, limit: 100 } })
      .then((res) => {
        setBookings(res.data.data);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
  };

  const updateStatus = (booking, newStatus) => {
    api
      .patch(`/bookings/${booking.id}`, { status: newStatus })
      .then(() => {
        toast.push(`Booking marked as ${newStatus}`);
        load();
      })
      .catch((err) => toast.push(err.response?.data?.error || 'Failed to update', 'error'));
  };

  const removeBooking = (booking) => {
    if (!window.confirm(`Delete booking for ${booking.name}? This cannot be undone.`)) return;
    api
      .delete(`/bookings/${booking.id}`)
      .then(() => {
        toast.push('Booking deleted');
        load();
      })
      .catch(() => toast.push('Failed to delete', 'error'));
  };

  const saveEdit = (form) => {
    api
      .patch(`/bookings/${editing.id}`, form)
      .then(() => {
        toast.push('Booking updated');
        setEditing(null);
        load();
      })
      .catch((err) => toast.push(err.response?.data?.error || 'Failed to update', 'error'));
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Bookings</h1>
          <p>{total} total booking{total === 1 ? '' : 's'}</p>
        </div>
      </div>

      <div className="card bookings-filters">
        <input
          className="bookings-search"
          placeholder="Search by name, email, phone or service…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="bookings-status-tabs">
          <button className={`chip ${status === '' ? 'chip--active' : ''}`} onClick={() => setStatus('')}>
            All
          </button>
          {STATUSES.map((s) => (
            <button key={s} className={`chip ${status === s ? 'chip--active' : ''}`} onClick={() => setStatus(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-block">
          <div className="spinner" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="card empty-state">No bookings match your filters.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Contact</th>
                <th>Service</th>
                <th>Date &amp; Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td data-label="Client">{b.name}</td>
                  <td data-label="Contact">
                    <div className="stack-cell">
                      <span>{b.email}</span>
                      <span className="muted">{b.phone}</span>
                    </div>
                  </td>
                  <td data-label="Service">{b.service_name || '—'}</td>
                  <td data-label="Date & Time">
                    <div className="stack-cell">
                      <span>{b.date}</span>
                      <span className="muted">{b.time}</span>
                    </div>
                  </td>
                  <td data-label="Status">
                    <select
                      className={`status-select status-select--${b.status}`}
                      value={b.status}
                      onChange={(e) => updateStatus(b, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td data-label="Actions">
                    <div className="row-actions">
                      <button className="btn btn-sm" onClick={() => setEditing(b)}>
                        Reschedule
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => removeBooking(b)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <EditBookingModal booking={editing} onClose={() => setEditing(null)} onSave={saveEdit} />}
    </>
  );
}

function EditBookingModal({ booking, onClose, onSave }) {
  const [form, setForm] = useState({
    date: booking.date,
    time: booking.time,
    notes: booking.notes || '',
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Reschedule Booking — {booking.name}</h2>
        <div className="grid-form">
          <div className="field">
            <label>Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="field">
            <label>Time</label>
            <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </div>
          <div className="field span-2">
            <label>Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Internal notes about this booking…" />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

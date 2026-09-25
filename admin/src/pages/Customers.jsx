import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import './Customers.css';

export default function Customers() {
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const load = () => {
    setLoading(true);
    api
      .get('/customers', { params: { search: search || undefined } })
      .then((res) => setCustomers(res.data))
      .finally(() => setLoading(false));
  };

  const openCustomer = (c) => {
    setSelected(c);
    setDetail(null);
    api.get(`/customers/${c.id}`).then((res) => {
      setDetail(res.data);
      setNotes(res.data.notes || '');
    });
  };

  const saveNotes = () => {
    api
      .patch(`/customers/${selected.id}`, { notes })
      .then(() => toast.push('Notes saved'))
      .catch(() => toast.push('Failed to save notes', 'error'));
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>{customers.length} client{customers.length === 1 ? '' : 's'} on file</p>
        </div>
        <input className="bookings-search" placeholder="Search clients…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="loading-block">
          <div className="spinner" />
        </div>
      ) : customers.length === 0 ? (
        <div className="card empty-state">No customers yet.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Bookings</th>
                <th>Client Since</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td data-label="Name">{c.name}</td>
                  <td data-label="Email">{c.email || '—'}</td>
                  <td data-label="Phone">{c.phone || '—'}</td>
                  <td data-label="Bookings">
                    <span className="badge badge-blue">{c.bookingCount}</span>
                  </td>
                  <td data-label="Client Since">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td data-label="">
                    <button className="btn btn-sm" onClick={() => openCustomer(c)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal customer-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selected.name}</h2>
            {!detail ? (
              <div className="loading-block">
                <div className="spinner" />
              </div>
            ) : (
              <>
                <div className="customer-info-row">
                  <div>
                    <span className="label">Email</span>
                    <p>{detail.email || '—'}</p>
                  </div>
                  <div>
                    <span className="label">Phone</span>
                    <p>{detail.phone || '—'}</p>
                  </div>
                </div>

                <div className="field">
                  <label>Notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add internal notes about this client…" />
                </div>
                <button className="btn btn-sm" onClick={saveNotes}>
                  Save Notes
                </button>

                <h3 className="customer-modal__subhead">Booking History</h3>
                {detail.bookings.length === 0 ? (
                  <p className="empty-state">No bookings yet.</p>
                ) : (
                  <div className="booking-history-list">
                    {detail.bookings.map((b) => (
                      <div className="booking-history-item" key={b.id}>
                        <div>
                          <strong>{b.service_name || 'Session'}</strong>
                          <span className="muted"> · {b.date} at {b.time}</span>
                        </div>
                        <span className={`badge status-pill badge-${statusColor(b.status)}`}>{b.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            <div className="modal-actions">
              <button className="btn" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function statusColor(status) {
  switch (status) {
    case 'pending':
      return 'amber';
    case 'confirmed':
      return 'blue';
    case 'completed':
      return 'green';
    case 'cancelled':
      return 'red';
    default:
      return 'muted';
  }
}

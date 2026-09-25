import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import './Payments.css';

const emptyForm = { booking_id: '', amount: '', type: 'deposit', status: 'pending', method: '', note: '' };

export default function Payments() {
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    load();
    api.get('/bookings', { params: { limit: 200 } }).then((res) => setBookings(res.data.data));
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const load = () => {
    setLoading(true);
    api
      .get('/payments', { params: { status: statusFilter || undefined } })
      .then((res) => setPayments(res.data))
      .finally(() => setLoading(false));
  };

  const openCreate = () => {
    setForm(emptyForm);
    setModalOpen(true);
  };

  const save = () => {
    if (!form.booking_id || !form.amount) {
      toast.push('Booking and amount are required', 'error');
      return;
    }
    api
      .post('/payments', { ...form, amount: Number(form.amount) })
      .then(() => {
        toast.push('Payment recorded');
        setModalOpen(false);
        load();
      })
      .catch((err) => toast.push(err.response?.data?.error || 'Failed to save', 'error'));
  };

  const markPaid = (p) => {
    api
      .patch(`/payments/${p.id}`, { status: p.status === 'paid' ? 'pending' : 'paid' })
      .then(load)
      .catch(() => toast.push('Failed to update', 'error'));
  };

  const remove = (p) => {
    if (!window.confirm('Delete this payment record?')) return;
    api
      .delete(`/payments/${p.id}`)
      .then(() => {
        toast.push('Payment deleted');
        load();
      })
      .catch(() => toast.push('Failed to delete', 'error'));
  };

  const totalPending = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const totalPaid = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Payments</h1>
          <p>Track deposits and outstanding balances per booking.</p>
        </div>
        <button className="btn btn-accent" onClick={openCreate}>
          + Record Payment
        </button>
      </div>

      <div className="payments-summary">
        <div className="card payments-summary__item">
          <span>Total Paid</span>
          <strong className="green">₹{totalPaid.toLocaleString('en-IN')}</strong>
        </div>
        <div className="card payments-summary__item">
          <span>Total Pending</span>
          <strong className="red">₹{totalPending.toLocaleString('en-IN')}</strong>
        </div>
      </div>

      <div className="bookings-status-tabs payments-filter-row">
        <button className={`chip ${statusFilter === '' ? 'chip--active' : ''}`} onClick={() => setStatusFilter('')}>
          All
        </button>
        <button className={`chip ${statusFilter === 'pending' ? 'chip--active' : ''}`} onClick={() => setStatusFilter('pending')}>
          Pending
        </button>
        <button className={`chip ${statusFilter === 'paid' ? 'chip--active' : ''}`} onClick={() => setStatusFilter('paid')}>
          Paid
        </button>
      </div>

      {loading ? (
        <div className="loading-block">
          <div className="spinner" />
        </div>
      ) : payments.length === 0 ? (
        <div className="card empty-state">No payments recorded yet.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Booking</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td data-label="Client">{p.customer_name || '—'}</td>
                  <td data-label="Booking">
                    {p.service_name || '—'} <span className="muted">({p.booking_date})</span>
                  </td>
                  <td data-label="Amount">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                  <td data-label="Type" className="capitalize">
                    {p.type}
                  </td>
                  <td data-label="Method">{p.method || '—'}</td>
                  <td data-label="Status">
                    <span className={`badge status-pill ${p.status === 'paid' ? 'badge-green' : 'badge-amber'}`}>{p.status}</span>
                  </td>
                  <td data-label="Actions">
                    <div className="row-actions">
                      <button className="btn btn-sm" onClick={() => markPaid(p)}>
                        Mark {p.status === 'paid' ? 'Pending' : 'Paid'}
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => remove(p)}>
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

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Record Payment</h2>
            <div className="grid-form">
              <div className="field span-2">
                <label>Booking</label>
                <select value={form.booking_id} onChange={(e) => setForm({ ...form, booking_id: e.target.value })}>
                  <option value="">Select a booking…</option>
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} — {b.service_name || 'Session'} ({b.date})
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Amount (₹)</label>
                <input type="number" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="field">
                <label>Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="deposit">Deposit</option>
                  <option value="full">Full Payment</option>
                  <option value="balance">Balance</option>
                </select>
              </div>
              <div className="field">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div className="field">
                <label>Method</label>
                <input value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} placeholder="Cash, UPI, Card…" />
              </div>
              <div className="field span-2">
                <label>Note</label>
                <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={save}>
                Save Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

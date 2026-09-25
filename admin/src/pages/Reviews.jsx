import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import './Reviews.css';

export default function Reviews() {
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const load = () => {
    setLoading(true);
    const params = filter === 'approved' ? { approved: 1 } : filter === 'pending' ? { approved: 0 } : {};
    api
      .get('/reviews', { params })
      .then((res) => setReviews(res.data))
      .finally(() => setLoading(false));
  };

  const toggleApprove = (r) => {
    api
      .patch(`/reviews/${r.id}`, { approved: r.approved ? 0 : 1 })
      .then(() => {
        toast.push(r.approved ? 'Review hidden' : 'Review approved');
        load();
      })
      .catch(() => toast.push('Failed to update', 'error'));
  };

  const remove = (r) => {
    if (!window.confirm('Delete this review?')) return;
    api
      .delete(`/reviews/${r.id}`)
      .then(() => {
        toast.push('Review deleted');
        load();
      })
      .catch(() => toast.push('Failed to delete', 'error'));
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Reviews</h1>
          <p>Approve testimonials before they appear on the website.</p>
        </div>
      </div>

      <div className="bookings-status-tabs payments-filter-row">
        <button className={`chip ${filter === '' ? 'chip--active' : ''}`} onClick={() => setFilter('')}>
          All
        </button>
        <button className={`chip ${filter === 'pending' ? 'chip--active' : ''}`} onClick={() => setFilter('pending')}>
          Pending
        </button>
        <button className={`chip ${filter === 'approved' ? 'chip--active' : ''}`} onClick={() => setFilter('approved')}>
          Approved
        </button>
      </div>

      {loading ? (
        <div className="loading-block">
          <div className="spinner" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="card empty-state">No reviews here.</div>
      ) : (
        <div className="reviews-grid">
          {reviews.map((r) => (
            <div className="card review-card" key={r.id}>
              <div className="review-card__top">
                <strong>{r.name}</strong>
                <span className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
              </div>
              <p className="review-card__msg">{r.message}</p>
              <div className="review-card__footer">
                <span className={`badge ${r.approved ? 'badge-green' : 'badge-amber'}`}>{r.approved ? 'Approved' : 'Pending'}</span>
                <div className="row-actions">
                  <button className="btn btn-sm" onClick={() => toggleApprove(r)}>
                    {r.approved ? 'Hide' : 'Approve'}
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => remove(r)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

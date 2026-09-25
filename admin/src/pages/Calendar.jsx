import { useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import './Calendar.css';

function toMonthStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function CalendarPage() {
  const toast = useToast();
  const [cursor, setCursor] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [loading, setLoading] = useState(true);

  const month = toMonthStr(cursor);

  useEffect(() => {
    setLoading(true);
    api
      .get('/calendar', { params: { month } })
      .then((res) => {
        setBookings(res.data.bookings);
        setBlocked(res.data.blocked);
      })
      .finally(() => setLoading(false));
  }, [month]);

  const days = useMemo(() => buildMonthGrid(cursor), [cursor]);

  const bookingsByDate = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      if (!map[b.date]) map[b.date] = [];
      map[b.date].push(b);
    });
    return map;
  }, [bookings]);

  const blockedDates = useMemo(() => new Set(blocked.map((b) => b.date)), [blocked]);

  const changeMonth = (delta) => {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));
  };

  const toggleBlock = (dateStr) => {
    const existing = blocked.find((b) => b.date === dateStr);
    if (existing) {
      api
        .delete(`/calendar/blocked-dates/${existing.id}`)
        .then(() => {
          setBlocked((b) => b.filter((x) => x.id !== existing.id));
          toast.push('Date unblocked');
        })
        .catch(() => toast.push('Failed to unblock date', 'error'));
    } else {
      setSelectedDate(dateStr);
    }
  };

  const confirmBlock = () => {
    api
      .post('/calendar/blocked-dates', { date: selectedDate, reason: blockReason })
      .then((res) => {
        setBlocked((b) => [...b, res.data]);
        setSelectedDate(null);
        setBlockReason('');
        toast.push('Date blocked');
      })
      .catch((err) => toast.push(err.response?.data?.error || 'Failed to block date', 'error'));
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Calendar</h1>
          <p>View bookings by date and block off holidays or personal leave.</p>
        </div>
        <div className="cal-nav">
          <button className="btn btn-sm" onClick={() => changeMonth(-1)}>
            ‹ Prev
          </button>
          <span className="cal-nav__label">
            {cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button className="btn btn-sm" onClick={() => changeMonth(1)}>
            Next ›
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-block">
          <div className="spinner" />
        </div>
      ) : (
        <div className="card cal-card">
          <div className="cal-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="cal-grid">
            {days.map((d, i) => {
              if (!d) return <div key={i} className="cal-cell cal-cell--empty" />;
              const dateStr = toDateStr(d);
              const dayBookings = bookingsByDate[dateStr] || [];
              const isBlocked = blockedDates.has(dateStr);
              return (
                <div key={dateStr} className={`cal-cell ${isBlocked ? 'cal-cell--blocked' : ''}`}>
                  <div className="cal-cell__head">
                    <span>{d.getDate()}</span>
                    <button
                      className="cal-cell__block-btn"
                      title={isBlocked ? 'Unblock this date' : 'Block this date'}
                      onClick={() => toggleBlock(dateStr)}
                    >
                      {isBlocked ? '✕' : '⊘'}
                    </button>
                  </div>
                  <div className="cal-cell__bookings">
                    {isBlocked && <span className="cal-blocked-label">Blocked</span>}
                    {dayBookings.slice(0, 3).map((b) => (
                      <span key={b.id} className={`cal-booking-chip cal-booking-chip--${b.status}`}>
                        {b.time} {b.name}
                      </span>
                    ))}
                    {dayBookings.length > 3 && <span className="cal-more">+{dayBookings.length - 3} more</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedDate && (
        <div className="modal-overlay" onClick={() => setSelectedDate(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Block {selectedDate}</h2>
            <div className="field">
              <label>Reason (optional)</label>
              <input value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Holiday, personal leave, etc." />
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setSelectedDate(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={confirmBlock}>
                Block Date
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function buildMonthGrid(cursor) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstDay.getDay();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

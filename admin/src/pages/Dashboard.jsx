import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import StatCard from '../components/StatCard.jsx';
import '../components/StatCard.css';
import './Dashboard.css';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/summary')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-block">
        <div className="spinner" />
      </div>
    );
  }

  if (!data) return null;

  const maxTrend = Math.max(1, ...data.trend.map((t) => t.count));

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Workspace</h1>
          <p>Welcome back — here's what's happening with your studio today.</p>
        </div>
        <Link to="/bookings" className="btn btn-accent">
          + View Bookings
        </Link>
      </div>

      <div className="stats-grid">
        <StatCard label="Today's Bookings" value={data.todayBookings} sub="Sessions scheduled today" badge={`${data.weekBookings} this week`} badgeType="blue" />
        <StatCard label="Pending Requests" value={data.pending} sub="Awaiting confirmation" badge={data.pending > 0 ? 'Needs attention' : 'All clear'} badgeType={data.pending > 0 ? 'amber' : 'green'} />
        <StatCard label="Revenue This Month" value={`₹${data.monthRevenue.toLocaleString('en-IN')}`} sub={`₹${data.totalRevenue.toLocaleString('en-IN')} all-time`} badge="Paid" badgeType="green" />
        <StatCard label="Pending Payments" value={`₹${data.pendingPayments.toLocaleString('en-IN')}`} sub="Deposits / balances due" badge={data.pendingPayments > 0 ? 'Follow up' : 'Settled'} badgeType={data.pendingPayments > 0 ? 'red' : 'green'} />
      </div>

      <div className="dash-grid">
        <div className="card dash-trend">
          <div className="dash-card-head">
            <div>
              <h2>Bookings Trend</h2>
              <p>Last 6 months</p>
            </div>
          </div>
          <div className="trend-chart">
            {data.trend.length === 0 && <p className="empty-state">No bookings yet.</p>}
            {data.trend.map((t) => (
              <div className="trend-bar" key={t.month}>
                <div className="trend-bar__fill" style={{ height: `${(t.count / maxTrend) * 100}%` }} title={`${t.count} bookings`} />
                <span>{t.month.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card dash-status">
          <div className="dash-card-head">
            <div>
              <h2>Booking Status</h2>
              <p>All-time breakdown</p>
            </div>
          </div>
          <StatusRow label="Pending" value={data.pending} total={data.totalBookings} color="var(--amber)" />
          <StatusRow label="Confirmed" value={data.confirmed} total={data.totalBookings} color="var(--blue)" />
          <StatusRow label="Completed" value={data.completed} total={data.totalBookings} color="var(--green)" />
          <StatusRow label="Cancelled" value={data.cancelled} total={data.totalBookings} color="var(--red)" />
        </div>
      </div>

      <div className="card dash-upcoming">
        <div className="dash-card-head">
          <div>
            <h2>Upcoming Sessions</h2>
            <p>Next scheduled bookings</p>
          </div>
          <Link to="/bookings" className="btn btn-sm">
            View all
          </Link>
        </div>
        {data.upcoming.length === 0 ? (
          <p className="empty-state">No upcoming sessions scheduled.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.upcoming.map((b) => (
                  <tr key={b.id}>
                    <td data-label="Client">{b.name}</td>
                    <td data-label="Service">{b.service_name || '—'}</td>
                    <td data-label="Date">{b.date}</td>
                    <td data-label="Time">{b.time}</td>
                    <td data-label="Status">
                      <span className={`badge status-pill badge-${statusColor(b.status)}`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function StatusRow({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="status-row">
      <div className="status-row__top">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="status-row__bar">
        <div className="status-row__fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
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

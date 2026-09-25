import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import './Topbar.css';

const LABELS = {
  '': 'Overview',
  bookings: 'Bookings',
  calendar: 'Calendar',
  services: 'Services',
  gallery: 'Gallery',
  customers: 'Customers',
  payments: 'Payments',
  reviews: 'Reviews',
  settings: 'Settings',
};

export default function Topbar({ onToggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState({ data: [], unread: 0 });
  const notifRef = useRef(null);
  const menuRef = useRef(null);

  const segment = location.pathname.split('/')[1] || '';
  const label = LABELS[segment] ?? segment;

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const loadNotifications = () => {
    api
      .get('/notifications')
      .then((res) => setNotifications(res.data))
      .catch(() => {});
  };

  const markAllRead = () => {
    api.patch('/notifications/read-all').then(loadNotifications);
  };

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="topbar__hamburger" onClick={onToggleSidebar} aria-label="Toggle menu">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <div className="topbar__crumb">
          <span className="topbar__crumb-muted">Dashboard</span>
          <span className="topbar__crumb-sep">›</span>
          <span>{label}</span>
        </div>
      </div>

      <div className="topbar__right">
        <div className="topbar__notif" ref={notifRef}>
          <button className="topbar__icon-btn" onClick={() => setNotifOpen((v) => !v)} aria-label="Notifications">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none">
              <path
                d="M6 9a6 6 0 1112 0c0 4.5 1.5 6 1.5 6h-15S6 13.5 6 9z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M10 19a2 2 0 004 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            {notifications.unread > 0 && <span className="topbar__dot" />}
          </button>
          {notifOpen && (
            <div className="topbar__dropdown">
              <div className="topbar__dropdown-head">
                <span>Notifications</span>
                {notifications.unread > 0 && (
                  <button className="topbar__mark-read" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="topbar__dropdown-list">
                {notifications.data.length === 0 && <p className="topbar__empty">No notifications yet.</p>}
                {notifications.data.map((n) => (
                  <div key={n.id} className={`topbar__notif-item ${n.is_read ? '' : 'topbar__notif-item--unread'}`}>
                    <p>{n.message}</p>
                    <span>{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="topbar__profile" ref={menuRef}>
          <button className="topbar__profile-btn" onClick={() => setMenuOpen((v) => !v)}>
            <span className="topbar__avatar">{(admin?.username || 'A')[0].toUpperCase()}</span>
            <span className="topbar__profile-name">{admin?.username}</span>
          </button>
          {menuOpen && (
            <div className="topbar__dropdown topbar__dropdown--right">
              <button className="topbar__menu-item" onClick={() => navigate('/settings')}>
                Settings
              </button>
              <button className="topbar__menu-item topbar__menu-item--danger" onClick={logout}>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

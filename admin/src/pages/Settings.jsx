import { useState } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import './Settings.css';

export default function Settings() {
  const { admin } = useAuth();
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.push('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      toast.push('New password must be at least 6 characters', 'error');
      return;
    }
    setSaving(true);
    api
      .post('/auth/change-password', { currentPassword, newPassword })
      .then(() => {
        toast.push('Password updated');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      })
      .catch((err) => toast.push(err.response?.data?.error || 'Failed to update password', 'error'))
      .finally(() => setSaving(false));
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your admin account.</p>
        </div>
      </div>

      <div className="card settings-card">
        <h2>Account</h2>
        <div className="settings-account-row">
          <span className="label">Username</span>
          <p>{admin?.username}</p>
        </div>
        {admin?.email && (
          <div className="settings-account-row">
            <span className="label">Email</span>
            <p>{admin.email}</p>
          </div>
        )}
      </div>

      <div className="card settings-card">
        <h2>Change Password</h2>
        <form className="settings-form" onSubmit={submit}>
          <div className="field">
            <label>Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>
          <div className="field">
            <label>New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <div className="field">
            <label>Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Update Password'}
          </button>
        </form>
      </div>
    </>
  );
}

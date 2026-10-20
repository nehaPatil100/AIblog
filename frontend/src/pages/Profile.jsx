import { useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [info, setInfo] = useState({ name: user.name, bio: user.bio || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [busy, setBusy] = useState('');

  const saveInfo = async (e) => {
    e.preventDefault();
    setBusy('info');
    try {
      const { data } = await api.put('/auth/profile', info);
      setUser(data.user);
      toast('Profile updated');
    } catch (err) {
      toast(errMsg(err), 'error');
    } finally {
      setBusy('');
    }
  };

  const savePw = async (e) => {
    e.preventDefault();
    setBusy('pw');
    try {
      await api.put('/auth/password', pw);
      setPw({ currentPassword: '', newPassword: '' });
      toast('Password changed');
    } catch (err) {
      toast(errMsg(err), 'error');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-serif text-3xl font-semibold">Profile</h1>
      <p className="mt-1 text-sm text-muted">{user.email}{user.role === 'admin' && ' (admin)'}</p>

      <form onSubmit={saveInfo} className="mt-8 space-y-4">
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input id="name" required className="input" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="bio">Bio</label>
          <textarea id="bio" rows={3} maxLength={300} className="input" value={info.bio}
            placeholder="Apne baare mein kuch likho. Ye tumhare posts ke neeche dikhega."
            onChange={(e) => setInfo({ ...info, bio: e.target.value })} />
        </div>
        <button className="btn btn-primary" disabled={busy === 'info'}>{busy === 'info' ? 'Saving...' : 'Save profile'}</button>
      </form>

      <form onSubmit={savePw} className="mt-12 space-y-4 border-t border-line pt-8">
        <h2 className="font-serif text-xl font-semibold">Change password</h2>
        <div>
          <label className="label" htmlFor="cur">Current password</label>
          <input id="cur" type="password" required autoComplete="current-password" className="input" value={pw.currentPassword}
            onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="new">New password</label>
          <input id="new" type="password" required minLength={6} autoComplete="new-password" className="input" value={pw.newPassword}
            onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
        </div>
        <button className="btn btn-outline" disabled={busy === 'pw'}>{busy === 'pw' ? 'Updating...' : 'Update password'}</button>
      </form>
    </div>
  );
}

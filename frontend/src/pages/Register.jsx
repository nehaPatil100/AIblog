import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';

export default function Register() {
  const { user, register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form.name, form.email, form.password);
      nav('/dashboard', { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const bind = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-serif text-3xl font-semibold">Create your account</h1>
      <p className="mt-1 text-sm text-muted">Free hai. Likhna shuru karo.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input id="name" required autoComplete="name" className="input" {...bind('name')} />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" required autoComplete="email" className="input" {...bind('email')} />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={6} autoComplete="new-password" className="input" {...bind('password')} />
          <p className="mt-1 text-xs text-muted">Kam se kam 6 characters.</p>
        </div>
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Creating...' : 'Sign up'}</button>
      </form>
      <p className="mt-6 text-sm text-muted">
        Pehle se account hai? <Link to="/login" className="font-medium text-brand">Log in</Link>
      </p>
    </div>
  );
}

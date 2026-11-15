import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, homeFor } from '../context/AuthContext.jsx';
import { errMsg } from '../api';
import { Alert, Field, BLOOD_GROUPS } from '../components/ui.jsx';

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { const u = await login(f); nav(homeFor(u.role)); } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="panel mx-auto max-w-md space-y-4">
      <h1 className="text-2xl">Sign in</h1>
      <Alert>{err}</Alert>
      <Field label="Email"><input className="input" type="email" required autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
      <Field label="Password"><input className="input" type="password" required autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
      <button className="btn-primary btn w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      <p className="text-center text-sm text-slate-600">New here? <Link className="font-semibold text-blood" to="/register">Create an account</Link></p>
    </form>
  );
}

export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const [f, setF] = useState({ role: sp.get('role') === 'receiver' ? 'receiver' : 'donor', name: '', email: '', password: '', bloodGroup: '', phone: '', city: '', gender: '', dob: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { const u = await register(f); nav(homeFor(u.role)); } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="panel mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl">Create your account</h1>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="I want to">
        {[['donor', 'Donate blood'], ['receiver', 'Request blood']].map(([v, l]) => (
          <button type="button" key={v} role="radio" aria-checked={f.role === v} onClick={() => setF({ ...f, role: v })}
            className={`rounded-lg border px-3 py-2.5 text-sm font-semibold ${f.role === v ? 'border-blood bg-rose text-blood' : 'border-line bg-white'}`}>{l}</button>
        ))}
      </div>
      <Alert>{err}</Alert>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name"><input className="input" required value={f.name} onChange={set('name')} /></Field>
        <Field label="Blood group">
          <select className="input" required value={f.bloodGroup} onChange={set('bloodGroup')}>
            <option value="">Select</option>{BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </Field>
        <Field label="Email"><input className="input" type="email" required value={f.email} onChange={set('email')} /></Field>
        <Field label="Password" hint="At least 6 characters"><input className="input" type="password" required minLength={6} value={f.password} onChange={set('password')} /></Field>
        <Field label="Phone"><input className="input" type="tel" value={f.phone} onChange={set('phone')} /></Field>
        <Field label="City"><input className="input" value={f.city} onChange={set('city')} /></Field>
        {f.role === 'donor' && (
          <>
            <Field label="Date of birth"><input className="input" type="date" required value={f.dob} onChange={set('dob')} /></Field>
            <Field label="Gender">
              <select className="input" required value={f.gender} onChange={set('gender')}>
                <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
              </select>
            </Field>
          </>
        )}
      </div>
      <button className="btn-primary btn w-full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      <p className="text-center text-sm text-slate-600">Already registered? <Link className="font-semibold text-blood" to="/login">Sign in</Link></p>
    </form>
  );
}

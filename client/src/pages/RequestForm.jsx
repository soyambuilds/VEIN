import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { Alert, Field, PageHead, BLOOD_GROUPS } from '../components/ui.jsx';

export default function RequestForm() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ patientName: '', bloodGroup: user.bloodGroup || '', units: 1, hospital: '', city: user.city || '', contactPhone: user.phone || '', urgency: 'normal', requiredBy: '', reason: '' });
  const [file, setFile] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => fd.append(k, v));
    fd.append('document', file);
    try { await api.post('/requests', fd); nav('/receiver'); } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-5">
      <PageHead title="Request blood" />
      <Alert>{err}</Alert>
      <div className="panel grid gap-4 sm:grid-cols-2">
        <Field label="Patient name"><input className="input" required value={f.patientName} onChange={set('patientName')} /></Field>
        <Field label="Blood group needed">
          <select className="input" required value={f.bloodGroup} onChange={set('bloodGroup')}>
            <option value="">Select</option>{BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </Field>
        <Field label="Units"><input className="input" type="number" min="1" max="10" required value={f.units} onChange={set('units')} /></Field>
        <Field label="Urgency">
          <select className="input" value={f.urgency} onChange={set('urgency')}>
            <option value="normal">Normal</option><option value="urgent">Urgent</option><option value="critical">Critical</option>
          </select>
        </Field>
        <Field label="Hospital"><input className="input" required value={f.hospital} onChange={set('hospital')} /></Field>
        <Field label="City"><input className="input" value={f.city} onChange={set('city')} /></Field>
        <Field label="Contact phone"><input className="input" type="tel" required value={f.contactPhone} onChange={set('contactPhone')} /></Field>
        <Field label="Required by"><input className="input" type="date" required min={new Date().toISOString().slice(0, 10)} value={f.requiredBy} onChange={set('requiredBy')} /></Field>
        <div className="sm:col-span-2"><Field label="Reason (optional)"><textarea className="input" rows={3} maxLength={500} value={f.reason} onChange={set('reason')} /></Field></div>
        <div className="sm:col-span-2"><Field label="Doctor’s prescription or hospital letter" hint="PDF, JPG or PNG, up to 5 MB"><input className="input" type="file" required accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0])} /></Field></div>
      </div>
      <button className="btn-primary btn w-full" disabled={busy}>{busy ? 'Submitting…' : 'Submit request'}</button>
    </form>
  );
}

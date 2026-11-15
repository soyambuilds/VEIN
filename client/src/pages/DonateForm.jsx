import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import { Alert, Field, PageHead } from '../components/ui.jsx';

const QUESTIONS = {
  hivHepatitis: 'I have had HIV, hepatitis B or hepatitis C',
  chronicIllness: 'I have a chronic illness such as diabetes on insulin, epilepsy or cancer',
  heartOrBloodDisorder: 'I have heart disease or a blood disorder',
  recentSurgery: 'I had surgery in the last 6 months',
  recentTattooOrPiercing: 'I got a tattoo or piercing in the last 6 months',
  recentFever: 'I had a fever or infection in the last 14 days',
  onAntibiotics: 'I am taking antibiotics',
  pregnantOrNursing: 'I am pregnant or breastfeeding',
  alcoholLast24h: 'I had alcohol in the last 24 hours',
};

export default function DonateForm() {
  const nav = useNavigate();
  const [f, setF] = useState({ appointmentDate: '', weight: '', hemoglobin: '' });
  const [decl, setDecl] = useState({});
  const [consent, setConsent] = useState(false);
  const [file, setFile] = useState(null);
  const [err, setErr] = useState('');
  const [reasons, setReasons] = useState([]);
  const [busy, setBusy] = useState(false);
  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr(''); setReasons([]);
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => fd.append(k, v));
    fd.append('declaration', JSON.stringify(decl));
    fd.append('consent', consent);
    if (file) fd.append('document', file);
    try { await api.post('/donations', fd); nav('/donor'); }
    catch (x) { setErr(errMsg(x)); setReasons(x.response?.data?.reasons || []); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-5">
      <PageHead title="Book a donation" />
      <Alert>{err}{reasons.length > 0 && <ul className="mt-2 list-disc pl-5">{reasons.map((r) => <li key={r}>{r}</li>)}</ul>}</Alert>
      <div className="panel grid gap-4 sm:grid-cols-3">
        <Field label="Appointment date"><input className="input" type="date" min={tomorrow} required value={f.appointmentDate} onChange={(e) => setF({ ...f, appointmentDate: e.target.value })} /></Field>
        <Field label="Weight (kg)"><input className="input" type="number" min="1" step="0.1" required value={f.weight} onChange={(e) => setF({ ...f, weight: e.target.value })} /></Field>
        <Field label="Hemoglobin (g/dL)"><input className="input" type="number" min="1" step="0.1" required value={f.hemoglobin} onChange={(e) => setF({ ...f, hemoglobin: e.target.value })} /></Field>
      </div>
      <fieldset className="panel space-y-3">
        <legend className="px-1 font-display text-lg font-extrabold">Health declaration</legend>
        <p className="text-sm text-slate-600">Tick anything that applies to you. Leave the rest empty.</p>
        {Object.entries(QUESTIONS).map(([k, q]) => (
          <label key={k} className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-0.5 accent-blood" checked={!!decl[k]} onChange={(e) => setDecl({ ...decl, [k]: e.target.checked })} />{q}</label>
        ))}
      </fieldset>
      <div className="panel space-y-4">
        <Field label="Medical certificate (optional)" hint="PDF, JPG or PNG, up to 5 MB"><input className="input" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0])} /></Field>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-0.5 accent-blood" checked={consent} onChange={(e) => setConsent(e.target.checked)} />I confirm these answers are true and complete.</label>
      </div>
      <button className="btn-primary btn w-full" disabled={busy || !consent}>{busy ? 'Checking eligibility…' : 'Submit for approval'}</button>
    </form>
  );
}

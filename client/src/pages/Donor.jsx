import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { Alert, Badge, Empty, FileLink, PageHead, fmtDate } from '../components/ui.jsx';

export default function Donor() {
  const { user } = useAuth();
  const [list, setList] = useState(null);
  const [err, setErr] = useState('');
  const load = useCallback(() => api.get('/donations/mine').then((r) => setList(r.data)).catch((e) => setErr(errMsg(e))), []);
  useEffect(() => { load(); }, [load]);

  const cancel = (id) => api.patch(`/donations/${id}/cancel`).then(load).catch((e) => setErr(errMsg(e)));
  const next = user.lastDonationDate ? new Date(new Date(user.lastDonationDate).getTime() + 90 * 864e5) : null;
  const waiting = next && next > new Date();

  return (
    <>
      <PageHead title={`Hello, ${user.name.split(' ')[0]}`}>
        <Link to="/donor/donate" className="btn-primary btn"><CalendarPlus size={16} /> Book a donation</Link>
      </PageHead>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="panel"><div className="text-sm text-slate-500">Your blood group</div><div className="font-display text-3xl font-extrabold text-blood">{user.bloodGroup}</div></div>
        <div className="panel"><div className="text-sm text-slate-500">Last donation</div><div className="text-xl font-semibold">{fmtDate(user.lastDonationDate)}</div></div>
        <div className="panel"><div className="text-sm text-slate-500">Next donation</div><div className="text-xl font-semibold">{waiting ? `From ${fmtDate(next)}` : 'You can donate now'}</div></div>
      </div>
      <Alert>{err}</Alert>
      <h2 className="mb-3 mt-4 text-xl">Your donations</h2>
      {list === null ? <p className="text-slate-500">Loading…</p> : list.length === 0 ? <Empty>No donations yet. Book your first appointment.</Empty> : (
        <div className="space-y-3">
          {list.map((d) => (
            <div key={d._id} className="panel flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold">Appointment on {fmtDate(d.appointmentDate)}</div>
                <div className="text-xs text-slate-500">{d.weight} kg · Hb {d.hemoglobin} g/dL · requested {fmtDate(d.createdAt)}</div>
                {d.adminNote && <div className="mt-1 text-sm text-slate-600">Admin note: {d.adminNote}</div>}
              </div>
              <div className="flex items-center gap-3">
                <FileLink name={d.document} />
                <Badge value={d.status} />
                {['pending', 'approved'].includes(d.status) && <button className="btn-ghost btn btn-sm" onClick={() => cancel(d._id)}>Cancel</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

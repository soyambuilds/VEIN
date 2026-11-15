import { useEffect, useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { Alert, Empty, PageHead, fmtDate } from '../components/ui.jsx';

export default function Reviews() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [err, setErr] = useState('');
  const load = () => api.get('/reviews').then((r) => setList(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setErr('');
    try { await api.post('/reviews', { rating, comment }); setComment(''); load(); } catch (x) { setErr(errMsg(x)); }
  };
  const del = (id) => api.delete(`/reviews/${id}`).then(load).catch((x) => setErr(errMsg(x)));
  const canWrite = user && user.role !== 'admin';

  return (
    <div className="mx-auto max-w-2xl">
      <PageHead title="Reviews" />
      {canWrite && (
        <form onSubmit={submit} className="panel mb-6 space-y-3">
          <Alert>{err}</Alert>
          <div className="flex gap-1" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => setRating(n)}>
                <Star size={24} className={n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
              </button>
            ))}
          </div>
          <textarea className="input" rows={3} maxLength={400} required placeholder="Tell others about your experience" value={comment} onChange={(e) => setComment(e.target.value)} />
          <button className="btn-primary btn">Post review</button>
        </form>
      )}
      {list.length === 0 ? <Empty>No reviews yet.</Empty> : (
        <div className="space-y-3">
          {list.map((r) => (
            <div key={r._id} className="panel">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{r.user?.name || 'Former user'} <span className="text-xs font-normal capitalize text-slate-500">{r.user?.role} · {fmtDate(r.createdAt)}</span></div>
                <div className="flex items-center gap-2">
                  <span className="flex" aria-label={`${r.rating} out of 5`}>{[1, 2, 3, 4, 5].map((n) => <Star key={n} size={14} className={n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />)}</span>
                  {user && (user.role === 'admin' || user._id === r.user?._id) && <button aria-label="Delete review" onClick={() => del(r._id)}><Trash2 size={14} className="text-slate-400 hover:text-blood" /></button>}
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-700">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

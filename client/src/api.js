import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('vein_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export const errMsg = (e) => e?.response?.data?.message || 'Something went wrong. Try again';

// Documents are private, so fetch with the token and open the blob
export async function openFile(name) {
  const { data } = await api.get(`/files/${name}`, { responseType: 'blob' });
  window.open(URL.createObjectURL(data), '_blank');
}

export default api;

import { useEffect, useState } from 'react';
import axios from 'axios';

interface LoginEntry {
  ipAddress: string;
  browser: string;
  os: string;
  deviceType: string;
  createdAt: string;
}

export default function LoginHistoryPage() {
  const [history, setHistory] = useState<LoginEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (!storedEmail) {
      setError('User email not found in localStorage');
      setLoading(false);
      return;
    }

    setEmail(storedEmail);

    axios
      .get(`http://localhost:5000/api/auth/login-history?email=${storedEmail}`)
      .then((res) => {
        setHistory(res.data.history);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load login history');
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🔐 Login History</h2>
      <p>Email: <strong>{email}</strong></p>

      {loading && <p>Loading history...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && history.length === 0 && <p>No login history found.</p>}

      {!loading && history.length > 0 && (
        <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>IP Address</th>
              <th>Browser</th>
              <th>OS</th>
              <th>Device</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, i) => (
              <tr key={i}>
                <td>{entry.ipAddress}</td>
                <td>{entry.browser}</td>
                <td>{entry.os}</td>
                <td>{entry.deviceType}</td>
                <td>{new Date(entry.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

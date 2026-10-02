import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TextField } from '../components/ui/FormField';
import { ROUTES } from '../config/navigation';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

/**
 * Login UI, ready for Supabase Auth.
 * There is no fake login: while Supabase is not configured the form explains that.
 */
export default function LoginPage() {
  const { signIn, isAuthConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setSubmitting(true);
    try {
      await signIn({ email, password });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="login animate-scale-in">
      <div className="login__header">
        <span className="login__logo" aria-hidden="true">
          🌸
        </span>
        <h1>Welcome back ♡</h1>
        <p className="text-soft">Masuk ke dunia kecil kita.</p>
      </div>

      <form className="stack" onSubmit={handleSubmit}>
        <TextField label="Email" type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField label="Password" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {message && (
          <p className="login__message" role="alert">
            {message}
          </p>
        )}
        <Button type="submit" size="lg" block loading={submitting}>
          Login
        </Button>
      </form>

      {!isAuthConfigured && (
        <p className="login__note">
          🔒 Login akan aktif setelah Supabase Auth dihubungkan. Untuk sekarang kamu bisa melihat preview lewat{' '}
          <Link to={ROUTES.home} className="link">
            halaman utama
          </Link>
          .
        </p>
      )}

      <Link to={ROUTES.landing} className="login__back">
        ← Back
      </Link>
    </Card>
  );
}

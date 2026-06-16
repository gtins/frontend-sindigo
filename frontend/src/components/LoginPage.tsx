import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import AuthService from '../services/authService';
import '../styles/login.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (AuthService.hasToken()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await AuthService.login({
        email,
        password
      });

      // Token foi salvo automaticamente no localStorage
      navigate('/', { replace: true });
    } catch (err: any) {
      if (err.response && err.response.status === 429) {
        setError('Muitas tentativas falhas. Por segurança, aguarde 15 minutos e tente novamente.');
      } else {
        const rawMsg = err.response?.data?.message || err.message || '';
        let msg = 'Erro ao fazer login. Verifique suas credenciais.';
        if (rawMsg) {
          const msgLower = rawMsg.toLowerCase();
          if (msgLower.includes('bad credentials') || msgLower.includes('invalid credentials') || msgLower.includes('incorrect password') || msgLower.includes('senha incorreta')) {
            msg = 'E-mail ou senha incorretos.';
          } else if (msgLower.includes('no refresh token') || msgLower.includes('refresh token') || msgLower.includes('sessão expirada')) {
            msg = 'Sessão expirada. Por favor, faça login novamente.';
          } else if (msgLower.includes('user not found')) {
            msg = 'Usuário não encontrado.';
          } else {
            msg = rawMsg;
          }
        }
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-accent-light)', marginBottom: 'var(--space-16)' }}>
            <Building2 size={28} color="var(--color-accent)" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.025em' }}>Sindigo</h1>
          <h2 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)', margin: '8px 0 0 0' }}>Acesse sua conta para continuar</h2>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={isLoading} className="login-button" style={{ marginBottom: '15px' }}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: 'var(--space-16)' }}>
            <Link to="/register" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
              Não tem uma conta? Cadastre-se
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;


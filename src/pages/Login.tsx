import React, { useState } from 'react';

interface LoginProps {
  onLogin: (user: any) => void;
}

type AuthMode = 'login' | 'signup' | 'reset';

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Simulate Network Delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      if (mode === 'login') {
        // Mock successful login
        onLogin({ email: email, full_name: email.split('@')[0] });
      } else if (mode === 'signup') {
        // Mock successful signup
        setMessage('Cadastro simulado realizado com sucesso! Pode fazer login.');
        setMode('login');
      } else if (mode === 'reset') {
        setMessage('E-mail de recuperação simulado enviado!');
      }
    } catch (err: any) {
      setError('Erro na simulação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-dark border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="relative h-[240px] flex flex-col justify-end p-8">
          <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAuZ0LFsU2O-aaqnVh3AgctBbcg7FK_SjyhxYtibtw6-0YIx1BWIFloB08jL_6a0_Q9Mz0TKMNrftACy42I7wUFODg5bcLFM69tuSBOLYzXqSqFPHucum1o_XY8tMlttRLH7DR3BU5gNbrxWfFM64buPW4pl9TJo2TlagVbmBx_ogF1DCK0oXg13IN9DgxgPrsQs3BmAedlGY1ZPXrNoB9cbly0YNf-jr0Q59r-QE632ai9T4ClOCh-3Sr-_2IAZz5mGcu4G7YGczI")' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/40 to-black/20 z-10" />

          <div className="relative z-20">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center shadow-xl shadow-primary/40">
                <span className="material-symbols-outlined text-white text-2xl">hub</span>
              </div>
              <span className="text-white font-bold text-2xl">COP Rede</span>
            </div>
            <h1 className="text-white text-3xl font-bold leading-tight">
              {mode === 'login' ? 'Acesso ao Dashboard' : mode === 'signup' ? 'Novo Cadastro' : 'Recuperar Senha'}
            </h1>
            <p className="text-white/60 text-sm mt-2 font-medium">Gestão de ocorrências em tempo real</p>
          </div>
        </div>

        <form className="p-8 space-y-6" onSubmit={handleAuth}>
          {error && <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-400 text-sm">{error}</div>}
          {message && <div className="bg-success/10 border border-success/50 p-4 rounded-xl text-success text-sm">{message}</div>}

          {mode === 'signup' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4 mb-2">
                <div className="relative group cursor-pointer" onClick={() => document.getElementById('signup-avatar')?.click()}>
                  <div className="h-24 w-24 rounded-3xl bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden hover:border-primary/50 transition-all">
                    {avatar ? (
                      <img src={avatar} className="h-full w-full object-cover" alt="Avatar" />
                    ) : (
                      <span className="material-symbols-outlined text-3xl text-primary/40">add_a_photo</span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-sm">upload</span>
                  </div>
                </div>
                <input
                  id="signup-avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setAvatar(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Sua Foto de Perfil</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Nome Completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-500">person</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nome e Sobrenome"
                    className="w-full bg-[#1a0f10] border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Endereço</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-500">location_on</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, Número, Bairro, Cidade"
                    className="w-full bg-[#1a0f10] border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">E-mail Corporativo</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-500">mail</span>
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@claro.com.br"
                className="w-full bg-[#1a0f10] border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-300">Senha (Simulada)</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-xs font-bold text-primary"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-500">lock</span>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite qualquer coisa"
                  className="w-full bg-[#1a0f10] border-white/5 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 group"
          >
            {loading ? (
              <span className="animate-spin material-symbols-outlined">sync</span>
            ) : (
              <>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  {mode === 'login' ? 'login' : mode === 'signup' ? 'person_add' : 'mail'}
                </span>
                {mode === 'login' ? 'Acessar Sistema' : mode === 'signup' ? 'Criar Conta' : 'Enviar Link'}
              </>
            )}
          </button>

          <div className="text-center space-y-4">
            {mode === 'login' ? (
              <p className="text-sm text-gray-400">
                Não possui conta?{' '}
                <button type="button" onClick={() => setMode('signup')} className="text-primary font-bold">Cadastrar-se</button>
              </p>
            ) : (
              <p className="text-sm text-gray-400">
                Já possui conta?{' '}
                <button type="button" onClick={() => setMode('login')} className="text-primary font-bold">Acessar Login</button>
              </p>
            )}
          </div>
        </form>

        <div className="p-8 text-center border-t border-white/5">
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            © 2024 COP REDE. V2.1.0 • SUPORTE RAMAL 1020
          </p>
        </div>
      </div>
    </div>
  );
};

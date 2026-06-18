import { useState } from 'react';
import { User, LogIn, UserPlus, Check } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { maskPhone } from '@/lib/cep';

export interface Identification {
  name: string;
  email: string;
  phone: string;
}

interface IdentificationStepProps {
  value: Identification;
  onChange: (id: Identification) => void;
  onValid: (valid: boolean) => void;
}

type Mode = 'guest' | 'login' | 'register';

export function IdentificationStep({ value, onChange, onValid }: IdentificationStepProps) {
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('guest');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Se já está logado, mostra resumo e libera
  if (user) {
    if (value.email !== user.email) {
      onChange({ name: user.name, email: user.email, phone: user.phone || '' });
      onValid(true);
    }
    return (
      <div className="flex items-center gap-3 rounded-xl2 border border-green-200 bg-green-50 px-5 py-4">
        <div className="rounded-full bg-green-100 p-2">
          <Check className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="font-medium">Você está identificada como {user.name}</p>
          <p className="text-sm text-carvao/60">{user.email}</p>
        </div>
      </div>
    );
  }

  function update(patch: Partial<Identification>) {
    const next = { ...value, ...patch };
    onChange(next);
    onValid(!!next.name && /\S+@\S+\.\S+/.test(next.email));
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(value.email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ name: value.name, email: value.email, password, phone: value.phone });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Seletor de modo */}
      <div className="mb-5 grid grid-cols-3 gap-2 rounded-xl2 bg-rosa-50 p-1.5">
        <ModeTab active={mode === 'guest'} onClick={() => setMode('guest')} icon={<User className="h-4 w-4" />} label="Convidada" />
        <ModeTab active={mode === 'login'} onClick={() => setMode('login')} icon={<LogIn className="h-4 w-4" />} label="Entrar" />
        <ModeTab active={mode === 'register'} onClick={() => setMode('register')} icon={<UserPlus className="h-4 w-4" />} label="Criar conta" />
      </div>

      {mode === 'guest' && (
        <div className="space-y-4">
          <p className="text-sm text-carvao/60">
            Compre sem criar conta. Você receberá as atualizações do pedido por e-mail e WhatsApp ✦
          </p>
          <Field label="Nome completo" value={value.name} onChange={(v) => update({ name: v })} placeholder="Seu nome" />
          <Field label="E-mail" type="email" value={value.email} onChange={(v) => update({ email: v })} placeholder="seu@email.com" />
          <Field label="WhatsApp / Telefone" value={value.phone} onChange={(v) => update({ phone: maskPhone(v) })} placeholder="(00) 00000-0000" />
        </div>
      )}

      {mode === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <Field label="E-mail" type="email" value={value.email} onChange={(v) => update({ email: v })} placeholder="seu@email.com" />
          <Field label="Senha" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
          {error && <p className="text-sm text-rosa-500">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      )}

      {mode === 'register' && (
        <form onSubmit={handleRegister} className="space-y-4">
          <p className="text-sm text-carvao/60">
            Crie sua conta para acompanhar pedidos e salvar favoritos.
          </p>
          <Field label="Nome completo" value={value.name} onChange={(v) => update({ name: v })} placeholder="Seu nome" />
          <Field label="E-mail" type="email" value={value.email} onChange={(v) => update({ email: v })} placeholder="seu@email.com" />
          <Field label="WhatsApp / Telefone" value={value.phone} onChange={(v) => update({ phone: maskPhone(v) })} placeholder="(00) 00000-0000" />
          <Field label="Senha" type="password" value={password} onChange={setPassword} placeholder="Crie uma senha" />
          {error && <p className="text-sm text-rosa-500">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Criando...' : 'Criar conta e continuar'}
          </button>
        </form>
      )}
    </div>
  );
}

function ModeTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
        active ? 'bg-white text-rosa-500 shadow-sm' : 'text-carvao/60 hover:text-carvao'
      }`}
    >
      {icon} <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-carvao/80">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-rosa-500"
      />
    </label>
  );
}

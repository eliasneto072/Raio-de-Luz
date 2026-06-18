import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { maskPhone } from '@/lib/cep';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
      }
      navigate('/conta');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-rl flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="font-display text-2xl font-semibold text-rosa-500">Raio de Luz ✦</div>
          <h1 className="mt-4 font-display text-3xl font-semibold">
            {mode === 'login' ? 'Bem-vinda de volta' : 'Criar sua conta'}
          </h1>
          <p className="mt-2 text-sm text-carvao/60">
            {mode === 'login'
              ? 'Entre para acompanhar pedidos e favoritos.'
              : 'Cadastre-se para uma experiência completa.'}
          </p>
        </div>

        <div className="mt-8 rounded-xl2 border border-rosa-100 bg-white p-8 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <Field label="Nome completo" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Seu nome" />
            )}
            <Field label="E-mail" type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} placeholder="seu@email.com" />
            {mode === 'register' && (
              <Field label="WhatsApp / Telefone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: maskPhone(v) }))} placeholder="(00) 00000-0000" />
            )}
            <Field label="Senha" type="password" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} placeholder="••••••••" />

            {error && <p className="text-sm text-rosa-500">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-carvao/60">
            {mode === 'login' ? (
              <>
                Não tem conta?{' '}
                <button onClick={() => { setMode('register'); setError(null); }} className="font-medium text-rosa-500 hover:underline">
                  Cadastre-se
                </button>
              </>
            ) : (
              <>
                Já tem conta?{' '}
                <button onClick={() => { setMode('login'); setError(null); }} className="font-medium text-rosa-500 hover:underline">
                  Entrar
                </button>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-carvao/50">
          Quer só comprar?{' '}
          <Link to="/produtos" className="font-medium text-rosa-500 hover:underline">
            Continue sem cadastro ✦
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = 'text', placeholder,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-carvao/80">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-rosa-500"
      />
    </label>
  );
}

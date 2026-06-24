import { useState, useEffect } from 'react';
import { Type, Check, Loader2 } from 'lucide-react';
import { useSiteTextsAdmin, useUpdateSiteTexts, type SiteTexts } from '@/hooks/useAdmin';

const EMPTY: SiteTexts = {
  announcementBar: '', heroEyebrow: '', heroTitle: '',
  badge1Title: '', badge1Sub: '', badge2Title: '', badge2Sub: '', badge3Title: '', badge3Sub: '',
  couponEyebrow: '', couponTitle: '', couponText: '', couponButton: '',
};

export function AdminAppearance() {
  const { data, isLoading } = useSiteTextsAdmin();
  const update = useUpdateSiteTexts();
  const [form, setForm] = useState<SiteTexts>(EMPTY);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  function set(key: keyof SiteTexts, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaved(false);
    await update.mutateAsync(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (isLoading) {
    return <div className="flex items-center gap-2 text-carvao/50"><Loader2 className="h-5 w-5 animate-spin" /> Carregando...</div>;
  }

  return (
    <div className="max-w-2xl pb-10">
      <h1 className="font-display text-3xl font-semibold">Personalização</h1>
      <p className="mt-1 text-carvao/50">Edite os textos que aparecem na loja</p>

      <div className="mt-8 space-y-6">
        {/* Barra de anúncio */}
        <Section title="Barra de anúncio (topo do site)">
          <TextField label="Texto da barra" value={form.announcementBar} onChange={(v) => set('announcementBar', v)} hint="Aparece no topo de todas as páginas, com um ✦ antes." />
          <div className="mt-3 rounded-lg bg-rosa-500 py-2 text-center text-xs font-medium text-dourado-300">
            ✦ {form.announcementBar || 'Prévia do texto'}
          </div>
        </Section>

        {/* Hero da home */}
        <Section title="Destaque da página inicial">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Linha 1 (título)" value={form.heroEyebrow} onChange={(v) => set('heroEyebrow', v)} placeholder="Nova Coleção" />
            <TextField label="Linha 2 (tema/estação)" value={form.heroTitle} onChange={(v) => set('heroTitle', v)} placeholder="São João / Outono..." />
          </div>
          <div className="mt-3 inline-block rounded-xl2 bg-dourado-300 px-6 py-4 text-carvao">
            <p className="font-display text-2xl font-semibold">{form.heroEyebrow || 'Nova Coleção'}</p>
            <p className="text-sm">{form.heroTitle || 'Tema'}</p>
          </div>
        </Section>

        {/* Selos (3 blocos) */}
        <Section title="Selos da home (os 3 destaques)">
          <p className="mb-3 text-sm text-carvao/50">Aparecem logo abaixo do banner principal, em três colunas.</p>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Selo 1 — título" value={form.badge1Title} onChange={(v) => set('badge1Title', v)} placeholder="Frete grátis" />
              <TextField label="Selo 1 — subtítulo" value={form.badge1Sub} onChange={(v) => set('badge1Sub', v)} placeholder="Acima de R$ 250" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Selo 2 — título" value={form.badge2Title} onChange={(v) => set('badge2Title', v)} placeholder="Parcele em 6x" />
              <TextField label="Selo 2 — subtítulo" value={form.badge2Sub} onChange={(v) => set('badge2Sub', v)} placeholder="Sem juros" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Selo 3 — título" value={form.badge3Title} onChange={(v) => set('badge3Title', v)} placeholder="Troca fácil" />
              <TextField label="Selo 3 — subtítulo" value={form.badge3Sub} onChange={(v) => set('badge3Sub', v)} placeholder="Até 30 dias" />
            </div>
          </div>
          {/* Prévia dos selos */}
          <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-creme p-4 text-center">
            {[[form.badge1Title, form.badge1Sub], [form.badge2Title, form.badge2Sub], [form.badge3Title, form.badge3Sub]].map(([t, s], i) => (
              <div key={i}>
                <p className="font-display text-sm font-semibold text-rosa-500">{t || '—'}</p>
                <p className="text-xs text-carvao/60">{s || '—'}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Banner do cupom */}
        <Section title="Banner do cupom (primeira compra)">
          <p className="mb-3 text-sm text-carvao/50">O bloco escuro que destaca o cupom de desconto.</p>
          <div className="space-y-4">
            <TextField label="Linha de cima (eyebrow)" value={form.couponEyebrow} onChange={(v) => set('couponEyebrow', v)} placeholder="Primeira compra" />
            <TextField label="Título" value={form.couponTitle} onChange={(v) => set('couponTitle', v)} placeholder="Ganhe 10% de desconto" />
            <TextField label="Texto (mencione o cupom)" value={form.couponText} onChange={(v) => set('couponText', v)} placeholder="Use o cupom BEMVINDA10 em compras acima de R$ 100." />
            <TextField label="Texto do botão" value={form.couponButton} onChange={(v) => set('couponButton', v)} placeholder="Quero aproveitar" hint="O botão sempre leva para a página de produtos." />
          </div>
          {/* Prévia do banner */}
          <div className="mt-4 rounded-xl2 bg-carvao px-6 py-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-dourado-300">✦ {form.couponEyebrow || 'Primeira compra'}</p>
            <p className="mt-2 font-display text-2xl font-semibold text-creme">{form.couponTitle || 'Título'}</p>
            <p className="mt-2 text-sm text-creme/70">{form.couponText || 'Texto do cupom'}</p>
            <span className="btn-gold mt-4 inline-block">{form.couponButton || 'Botão'}</span>
          </div>
        </Section>

        <button onClick={handleSave} disabled={update.isPending} className="btn-primary">
          {update.isPending ? 'Salvando...' : saved ? <><Check className="h-4 w-4" /> Salvo!</> : 'Salvar textos'}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl2 border border-rosa-100 bg-white p-6">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        <Type className="h-5 w-5 text-rosa-500" /> {title}
      </h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, hint }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-carvao/80">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500"
      />
      {hint && <span className="mt-1 block text-xs text-carvao/40">{hint}</span>}
    </label>
  );
}

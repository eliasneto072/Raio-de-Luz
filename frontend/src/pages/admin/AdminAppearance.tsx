import { useState, useEffect } from 'react';
import { Type, Check, Loader2 } from 'lucide-react';
import { useSiteTextsAdmin, useUpdateSiteTexts } from '@/hooks/useAdmin';

export function AdminAppearance() {
  const { data, isLoading } = useSiteTextsAdmin();
  const update = useUpdateSiteTexts();

  const [announcementBar, setAnnouncementBar] = useState('');
  const [heroEyebrow, setHeroEyebrow] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) {
      setAnnouncementBar(data.announcementBar);
      setHeroEyebrow(data.heroEyebrow);
      setHeroTitle(data.heroTitle);
    }
  }, [data]);

  async function handleSave() {
    setSaved(false);
    await update.mutateAsync({ announcementBar, heroEyebrow, heroTitle });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (isLoading) {
    return <div className="flex items-center gap-2 text-carvao/50"><Loader2 className="h-5 w-5 animate-spin" /> Carregando...</div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold">Personalização</h1>
      <p className="mt-1 text-carvao/50">Edite os textos que aparecem na loja</p>

      <div className="mt-8 space-y-6">
        {/* Barra de anúncio */}
        <div className="rounded-xl2 border border-rosa-100 bg-white p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Type className="h-5 w-5 text-rosa-500" /> Barra de anúncio (topo do site)
          </h2>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-medium text-carvao/80">Texto da barra</span>
            <input
              value={announcementBar}
              onChange={(e) => setAnnouncementBar(e.target.value)}
              className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500"
            />
            <span className="mt-1 block text-xs text-carvao/40">
              Aparece no topo de todas as páginas, com um ✦ antes.
            </span>
          </label>
          {/* Prévia */}
          <div className="mt-3 rounded-lg bg-rosa-500 py-2 text-center text-xs font-medium text-dourado-300">
            ✦ {announcementBar || 'Prévia do texto'}
          </div>
        </div>

        {/* Hero da home */}
        <div className="rounded-xl2 border border-rosa-100 bg-white p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Type className="h-5 w-5 text-rosa-500" /> Destaque da página inicial
          </h2>
          <p className="mt-1 text-sm text-carvao/50">O selo que aparece no banner principal</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-carvao/80">Linha 1 (título)</span>
              <input
                value={heroEyebrow}
                onChange={(e) => setHeroEyebrow(e.target.value)}
                placeholder="Nova Coleção"
                className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-carvao/80">Linha 2 (tema/estação)</span>
              <input
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="São João / Outono / Verão..."
                className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500"
              />
            </label>
          </div>
          {/* Prévia */}
          <div className="mt-3 inline-block rounded-xl2 bg-dourado-300 px-6 py-4 text-carvao">
            <p className="font-display text-2xl font-semibold">{heroEyebrow || 'Nova Coleção'}</p>
            <p className="text-sm">{heroTitle || 'Tema'}</p>
          </div>
        </div>

        <button onClick={handleSave} disabled={update.isPending} className="btn-primary">
          {update.isPending ? 'Salvando...' : saved ? <><Check className="h-4 w-4" /> Salvo!</> : 'Salvar textos'}
        </button>
      </div>
    </div>
  );
}

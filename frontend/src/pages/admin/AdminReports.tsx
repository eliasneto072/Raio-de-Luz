import { useState } from 'react';
import { FileText, Download, Calendar, Package } from 'lucide-react';
import { downloadReport } from '@/hooks/useAdmin';

type Preset = 'hoje' | '7dias' | 'mes' | 'personalizado';

function toISO(date: Date) {
  return date.toISOString().split('T')[0];
}

function presetRange(preset: Preset): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  if (preset === 'hoje') {
    // start = hoje 00:00
  } else if (preset === '7dias') {
    start.setDate(start.getDate() - 7);
  } else if (preset === 'mes') {
    start.setDate(1);
  }
  return { startDate: toISO(start), endDate: toISO(end) };
}

export function AdminReports() {
  const [preset, setPreset] = useState<Preset>('mes');
  const [custom, setCustom] = useState({ startDate: toISO(new Date(new Date().setDate(1))), endDate: toISO(new Date()) });
  const [loading, setLoading] = useState<string | null>(null);

  const range = preset === 'personalizado' ? custom : presetRange(preset);

  async function handleDownload(type: 'orders' | 'products') {
    setLoading(type);
    try {
      if (type === 'orders') {
        await downloadReport('orders', range);
      } else {
        await downloadReport('products');
      }
    } catch (e) {
      alert('Erro ao gerar relatório: ' + (e as Error).message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Relatórios</h1>
      <p className="mt-1 text-carvao/50">Gere relatórios em PDF para análise e contabilidade</p>

      {/* Seleção de período */}
      <div className="mt-8 rounded-xl2 border border-rosa-100 bg-white p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <Calendar className="h-5 w-5 text-rosa-500" /> Período
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {([
            ['hoje', 'Hoje'],
            ['7dias', 'Últimos 7 dias'],
            ['mes', 'Este mês'],
            ['personalizado', 'Personalizado'],
          ] as [Preset, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPreset(key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                preset === key ? 'bg-rosa-500 text-white' : 'bg-rosa-50 text-carvao/70 hover:text-rosa-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {preset === 'personalizado' && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-carvao/80">Data inicial</span>
              <input
                type="date"
                value={custom.startDate}
                onChange={(e) => setCustom((c) => ({ ...c, startDate: e.target.value }))}
                className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-carvao/80">Data final</span>
              <input
                type="date"
                value={custom.endDate}
                onChange={(e) => setCustom((c) => ({ ...c, endDate: e.target.value }))}
                className="w-full rounded-lg border border-carvao/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rosa-500"
              />
            </label>
          </div>
        )}

        <p className="mt-4 text-sm text-carvao/50">
          Período selecionado: <span className="font-medium text-carvao">{range.startDate}</span> até{' '}
          <span className="font-medium text-carvao">{range.endDate}</span>
        </p>
      </div>

      {/* Cards de relatórios */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <ReportCard
          icon={<FileText className="h-6 w-6" />}
          title="Relatório de Pedidos"
          description="Pedidos do período com receita total, ticket médio e detalhamento. Ideal para contabilidade e análise de vendas."
          buttonLabel={loading === 'orders' ? 'Gerando...' : 'Baixar PDF'}
          loading={loading === 'orders'}
          onClick={() => handleDownload('orders')}
        />
        <ReportCard
          icon={<Package className="h-6 w-6" />}
          title="Relatório de Produtos"
          description="Inventário completo: produtos, estoque por variante, preços e total vendido. Use para controle de catálogo."
          buttonLabel={loading === 'products' ? 'Gerando...' : 'Baixar PDF'}
          loading={loading === 'products'}
          onClick={() => handleDownload('products')}
          note="Não depende de período"
        />
      </div>
    </div>
  );
}

function ReportCard({
  icon, title, description, buttonLabel, loading, onClick, note,
}: {
  icon: React.ReactNode; title: string; description: string;
  buttonLabel: string; loading: boolean; onClick: () => void; note?: string;
}) {
  return (
    <div className="flex flex-col rounded-xl2 border border-rosa-100 bg-white p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rosa-50 text-rosa-500">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-carvao/60">{description}</p>
      {note && <p className="mt-2 text-xs text-dourado-600">✦ {note}</p>}
      <button onClick={onClick} disabled={loading} className="btn-primary mt-5 w-full">
        <Download className="h-4 w-4" /> {buttonLabel}
      </button>
    </div>
  );
}

import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Algo deu errado',
  message = 'Não conseguimos carregar este conteúdo. Verifique sua conexão e tente novamente.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-rosa-200 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rosa-50">
        <AlertCircle className="h-7 w-7 text-rosa-400" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-carvao">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-carvao/60">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline mt-5 inline-flex items-center gap-2">
          <RefreshCw className="h-4 w-4" /> Tentar novamente
        </button>
      )}
    </div>
  );
}

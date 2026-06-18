import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="container-rl flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-7xl font-semibold text-rosa-500">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold">Página não encontrada</h1>
      <p className="mt-2 text-carvao/60">A peça que você procura não está mais por aqui.</p>
      <Link to="/" className="btn-primary mt-6">
        Voltar para a loja
      </Link>
    </div>
  );
}

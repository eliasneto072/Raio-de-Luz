import { Link } from 'react-router-dom';
import clsx from 'clsx';

interface LogoProps {
  className?: string;
  /** Variante de exibição: a imagem da marca ou versão tipográfica */
  variant?: 'image' | 'text';
}

export function Logo({ className, variant = 'text' }: LogoProps) {
  if (variant === 'image') {
    return (
      <Link to="/" className={clsx('inline-block', className)} aria-label="Raio de Luz — página inicial">
        <img
          src="/brand/logo-redonda.png"
          alt="Raio de Luz"
          className="h-12 w-auto rounded-full object-cover"
        />
      </Link>
    );
  }

  // Versão tipográfica — reproduz a hierarquia da logo (Raio de / Luz com estrela)
  return (
    <Link
      to="/"
      className={clsx('group inline-flex items-baseline gap-1.5 font-display leading-none', className)}
      aria-label="Raio de Luz — página inicial"
    >
      <span className="text-2xl font-semibold tracking-tight text-rosa-500 transition-colors group-hover:text-rosa-600">
        Raio de Luz
      </span>
      <span className="text-dourado-400" aria-hidden="true">
        ✦
      </span>
    </Link>
  );
}
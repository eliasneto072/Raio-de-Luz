// Extrai uma mensagem de erro legível de qualquer formato.
// O axios aninha o erro do servidor em response.data; nossa API usa
// o formato { error: { message } }. Esta função cobre todos os casos
// e evita o famoso "[object Object]" na tela.
export function getErrorMessage(err: unknown, fallback = 'Algo deu errado. Tente novamente.'): string {
  const ax = err as any;
  const msg =
    ax?.response?.data?.error?.message ||  // formato padrão da nossa API
    ax?.response?.data?.message ||
    ax?.response?.data?.error ||
    (err instanceof Error ? err.message : null) ||
    (typeof err === 'string' ? err : null) ||
    fallback;
  return typeof msg === 'string' ? msg : fallback;
}

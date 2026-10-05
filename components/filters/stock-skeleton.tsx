/** Estado de carregamento do estoque: mesma geometria do conteúdo final (sem salto de layout). */
export function StockSkeleton() {
  return (
    <div className="container-x pb-24 pt-8 lg:grid lg:grid-cols-[17.5rem_1fr] lg:gap-12 lg:pt-12 xl:grid-cols-[19rem_1fr] xl:gap-16" aria-busy="true" aria-label="Carregando estoque">
      <div className="hidden space-y-4 lg:block">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-11 animate-pulse bg-paper-2" />
        ))}
      </div>
      <div>
        <div className="h-11 w-48 animate-pulse bg-paper-2" />
        <ul className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i}>
              <div className="aspect-[3/2] animate-pulse bg-paper-2" />
              <div className="mt-4 h-4 w-1/3 animate-pulse bg-paper-2" />
              <div className="mt-3 h-7 w-2/3 animate-pulse bg-paper-2" />
              <div className="mt-6 h-7 w-1/2 animate-pulse bg-paper-2" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

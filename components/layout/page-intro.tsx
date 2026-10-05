import type { ReactNode } from "react";

/** Abertura escura das páginas internas (compensa o header fixo). */
export function PageIntro({ eyebrow, title, children }: { eyebrow?: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="bg-ink pb-12 pt-28 text-paper lg:pb-16 lg:pt-36">
      <div className="container-x">
        {eyebrow ? <p className="eyebrow mb-4 text-mute-dark">{eyebrow}</p> : null}
        <h1 className="display max-w-4xl text-5xl sm:text-6xl lg:text-7xl">{title}</h1>
        {children ? <div className="mt-6 max-w-2xl text-base leading-relaxed text-paper/75">{children}</div> : null}
      </div>
    </section>
  );
}

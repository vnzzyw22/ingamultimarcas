import type { ReactNode } from "react";

interface Props {
  eyebrow?: string;
  title: ReactNode;
  action?: ReactNode;
  tone?: "light" | "dark";
  as?: "h1" | "h2";
  id?: string;
}

/** Cabeçalho de seção: índice pequeno + título display + ação alinhada à direita. */
export function SectionHeading({ eyebrow, title, action, tone = "light", as: Tag = "h2", id }: Props) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className={`eyebrow mb-3 ${tone === "dark" ? "text-mute-dark" : "text-mute"}`}>{eyebrow}</p>
        ) : null}
        <Tag id={id} className="display text-[2.5rem] sm:text-5xl lg:text-6xl">
          {title}
        </Tag>
      </div>
      {action}
    </div>
  );
}

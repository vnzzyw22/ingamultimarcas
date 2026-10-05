"use client";

import { useActionState } from "react";
import { changePasswordAction, type FormState } from "@/app/admin/actions";
import { Field, btnPrimary, inputCls } from "@/components/admin/ui";

const initial: FormState = {};

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initial);
  const e = state.errors ?? {};
  return (
    <form action={action} className="grid max-w-md gap-4" noValidate>
      <Field label="Senha atual" name="current" error={e.current}>
        <input id="current" name="current" type="password" autoComplete="current-password" required className={inputCls} aria-invalid={e.current ? true : undefined} />
      </Field>
      <Field label="Nova senha" name="next" error={e.next} hint="Pelo menos 10 caracteres. Frases longas são melhores que palavras difíceis.">
        <input id="next" name="next" type="password" autoComplete="new-password" required className={inputCls} aria-invalid={e.next ? true : undefined} />
      </Field>
      <Field label="Repita a nova senha" name="confirm" error={e.confirm}>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className={inputCls} aria-invalid={e.confirm ? true : undefined} />
      </Field>
      {state.message ? (
        <p role="status" className={`border px-3 py-2 text-sm font-semibold ${state.saved ? "border-ok/30 bg-ok/10 text-ok" : "border-red/40 bg-red/5 text-red-text"}`}>
          {state.message}
        </p>
      ) : null}
      <div>
        <button type="submit" className={btnPrimary} disabled={pending}>
          {pending ? "Salvando…" : "Trocar senha"}
        </button>
      </div>
    </form>
  );
}

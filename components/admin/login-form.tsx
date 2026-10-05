"use client";

import { useActionState } from "react";
import { loginAction, type FormState } from "@/app/admin/actions";
import { Field, btnPrimary, inputCls } from "@/components/admin/ui";

const initial: FormState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);
  return (
    <form action={action} className="grid gap-5" noValidate>
      <Field label="E-mail" name="email">
        {/* o React 19 limpa o formulário após cada envio: devolvemos o e-mail digitado para ele não sumir */}
        <input id="email" name="email" type="email" autoComplete="username" required autoFocus defaultValue={state.values?.email as string | undefined} className={inputCls} />
      </Field>
      <Field label="Senha" name="password">
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputCls} />
      </Field>
      {state.message ? (
        <p role="alert" className="border border-red/40 bg-red/5 px-3 py-2 text-sm font-semibold text-red-text">
          {state.message}
        </p>
      ) : null}
      <button type="submit" className={btnPrimary} disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}

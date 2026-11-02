import React, { useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { Button, Field, FieldHint, Input, errorMessage } from "../admin";
import GoogleSignInButton, { googleSignInEnabled } from "./GoogleSignInButton";
import { loginCustomer, loginCustomerWithGoogle, registerCustomer } from "../../services/endpoints/customer";
import { setCurrentCustomer } from "../../util/customerSession";
import { formataNumeroTelefone } from "../../util/format";

const Tabs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: 999px;
  background: #f3f4f6;
  margin-bottom: 1.25rem;
`;

const Tab = styled.button`
  height: 36px;
  border: none;
  border-radius: 999px;
  background: ${(p) => (p.$active ? "#fff" : "transparent")};
  box-shadow: ${(p) => (p.$active ? "0 1px 3px rgba(0, 0, 0, 0.1)" : "none")};
  color: ${(p) => (p.$active ? "var(--ui-text)" : "var(--ui-muted)")};
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
`;

const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.1rem 0;
  font-size: 0.75rem;
  color: var(--ui-muted);

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--ui-border);
  }
`;

const Submit = styled(Button)`
  justify-content: center;
  width: 100%;
  height: 42px;
  font-size: 0.9rem;
  font-weight: 600;
`;

// Entrar ou criar conta de cliente final (e-mail e senha) e "Continuar com o Google"
export default function CustomerAuthForm({ onSuccess, initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", telephone: "", password: "" });

  const set = (field) => (e) =>
    setForm((prev) => ({
      ...prev,
      [field]: field === "telephone" ? formataNumeroTelefone(e.target.value) : e.target.value,
    }));

  const finish = (customer) => {
    setCurrentCustomer(customer);
    onSuccess?.(customer);
  };

  const handleGoogle = async (credential) => {
    try {
      const response = await loginCustomerWithGoogle(credential);
      finish(response.data);
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível entrar com o Google."));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "register" && form.telephone && form.telephone.replace(/\D/g, "").length < 11) {
      toast.error("Informe o WhatsApp com DDD.");
      return;
    }
    setSaving(true);
    try {
      const response = mode === "login"
        ? await loginCustomer(form.email, form.password)
        : await registerCustomer({
            name: form.name,
            email: form.email,
            password: form.password,
            telephone: form.telephone.replace(/\D/g, "") || null,
          });
      finish(response.data);
    } catch (error) {
      toast.error(errorMessage(error, mode === "login" ? "Não foi possível entrar." : "Não foi possível criar a conta."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {googleSignInEnabled && (
        <>
          <GoogleSignInButton onCredential={handleGoogle} />
          <Divider>ou com e-mail</Divider>
        </>
      )}

      <Tabs role="tablist">
        <Tab type="button" $active={mode === "login"} onClick={() => setMode("login")}>Entrar</Tab>
        <Tab type="button" $active={mode === "register"} onClick={() => setMode("register")}>Criar conta</Tab>
      </Tabs>

      <form onSubmit={handleSubmit} style={{ padding: 0, boxShadow: "none", background: "transparent", borderRadius: 0 }}>
        <Fields>
          {mode === "register" && (
            <Field>
              Nome
              <Input value={form.name} onChange={set("name")} placeholder="Seu nome" autoComplete="name" required />
            </Field>
          )}
          <Field>
            E-mail
            <Input type="email" value={form.email} onChange={set("email")} placeholder="voce@email.com" autoComplete="email" required />
          </Field>
          {mode === "register" && (
            <Field>
              WhatsApp
              <Input value={form.telephone} onChange={set("telephone")} placeholder="(00) 0 0000-0000" autoComplete="tel" />
              <FieldHint>Usado para preencher seus agendamentos e receber os lembretes.</FieldHint>
            </Field>
          )}
          <Field>
            Senha
            <Input
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder={mode === "register" ? "Mínimo de 6 caracteres" : "Sua senha"}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              minLength={mode === "register" ? 6 : undefined}
              required
            />
          </Field>
          <Submit type="submit" disabled={saving}>
            {saving ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </Submit>
        </Fields>
      </form>
    </div>
  );
}

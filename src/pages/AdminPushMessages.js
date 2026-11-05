import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { getAdminClients } from "../services/endpoints/admin";
import { sendAdminPush } from "../services/endpoints/pushNotifications";
import {
  AdminLayout,
  Button,
  Card,
  Field,
  FieldHint,
  FormActions,
  FormGrid,
  Input,
  Notice,
  Select,
  errorMessage,
} from "../components/admin";

const TITLE_MAX = 65;
const MESSAGE_MAX = 240;

// Telas que o app abre ao tocar na notificação
const ROUTES = [
  { value: "", label: "Só abrir o app" },
  { value: "/dashboard", label: "Dashboard" },
  { value: "/assinatura", label: "Assinatura" },
  { value: "/configuracoes", label: "Configurações" },
  { value: "/servicos", label: "Serviços" },
  { value: "/divulgacao", label: "Divulgação" },
  { value: "/ajuda", label: "Ajuda" },
];

const TextArea = styled.textarea`
  box-sizing: border-box;
  margin: 0;
  min-height: 96px;
  resize: vertical;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.6rem 0.75rem;
  font: inherit;
  font-size: 0.875rem;
  color: #111827;
  width: 100%;

  &:focus {
    outline: none;
    border-color: var(--ui-primary);
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(260px, 1fr);
  gap: 1.25rem;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Counter = styled.span`
  align-self: flex-end;
  font-size: 0.72rem;
  font-weight: 400;
  color: ${({ $over }) => ($over ? "var(--ui-danger)" : "#6b7280")};
`;

// Prévia no formato de notificação de celular
const Phone = styled.div`
  background: #1f2937;
  border-radius: 1.25rem;
  padding: 1rem;
`;

const PushPreview = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 0.9rem;
  padding: 0.75rem 0.85rem;
  font-size: 0.8rem;
  color: #111827;
  line-height: 1.4;

  small {
    display: block;
    color: #6b7280;
    font-size: 0.7rem;
    margin-bottom: 0.25rem;
  }

  strong {
    display: block;
    margin-bottom: 0.15rem;
  }
`;

export default function AdminPushMessages() {
  const [clients, setClients] = useState([]);
  const [audience, setAudience] = useState("all");
  const [companyId, setCompanyId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [route, setRoute] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getAdminClients()
      .then((response) => setClients(response.data || []))
      .catch((error) => toast.error(errorMessage(error, "Erro ao carregar os clientes")));
  }, []);

  const sortedClients = useMemo(
    () => [...clients].sort((a, b) => (a.companyName || "").localeCompare(b.companyName || "", "pt-BR")),
    [clients]
  );
  const selectedClient = sortedClients.find((c) => String(c.companyId) === String(companyId));

  const titleOver = title.length > TITLE_MAX;
  const messageOver = message.length > MESSAGE_MAX;
  const canSend =
    title.trim() && message.trim() && !titleOver && !messageOver && (audience === "all" || companyId) && !sending;

  const handleSend = async (event) => {
    event.preventDefault();
    if (!canSend) return;
    const target = audience === "all" ? "todos os clientes" : `"${selectedClient?.companyName}"`;
    if (!window.confirm(`Enviar a notificação para ${target}?`)) return;

    try {
      setSending(true);
      const response = await sendAdminPush({
        title: title.trim(),
        description: message.trim(),
        route: route || null,
        companyId: audience === "all" ? null : Number(companyId),
      });
      const sent = response.data?.sent ?? 0;
      if (sent === 0) {
        toast.info("Nenhum aparelho recebeu: o cliente não ativou as notificações no app.");
      } else {
        toast.success(`Notificação enviada para ${sent} ${sent === 1 ? "aparelho" : "aparelhos"}.`);
        setTitle("");
        setMessage("");
      }
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível enviar a notificação"));
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout
      title="Notificações push"
      subtitle="Envie um aviso para o celular dos clientes que usam o app com as notificações ativadas."
    >
      <Layout>
        <Card as="form" onSubmit={handleSend} style={{ flexDirection: "column" }}>
          <FormGrid>
            <Field>
              Para quem
              <Select value={audience} onChange={(e) => setAudience(e.target.value)}>
                <option value="all">Todos os clientes</option>
                <option value="one">Um cliente específico</option>
              </Select>
            </Field>
            {audience === "one" ? (
              <Field>
                Cliente
                <Select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                  <option value="">Selecione o estabelecimento</option>
                  {sortedClients.map((client) => (
                    <option key={client.companyId} value={client.companyId}>
                      {client.companyName} ({client.companyUrl})
                    </option>
                  ))}
                </Select>
              </Field>
            ) : (
              <Field>
                Ao tocar, abrir
                <Select value={route} onChange={(e) => setRoute(e.target.value)}>
                  {ROUTES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </Select>
              </Field>
            )}
          </FormGrid>

          {audience === "one" && (
            <Field style={{ marginTop: "1rem" }}>
              Ao tocar, abrir
              <Select value={route} onChange={(e) => setRoute(e.target.value)}>
                {ROUTES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </Select>
            </Field>
          )}

          <Field style={{ marginTop: "1rem" }}>
            Título
            <Input value={title} maxLength={TITLE_MAX + 20} placeholder="Ex.: Novidade no Horário Certo" onChange={(e) => setTitle(e.target.value)} />
            <Counter $over={titleOver}>{title.length}/{TITLE_MAX}</Counter>
          </Field>

          <Field style={{ marginTop: "0.5rem" }}>
            Mensagem
            <TextArea
              value={message}
              maxLength={MESSAGE_MAX + 50}
              placeholder="Ex.: Agora seus clientes podem remarcar o horário sozinhos pela área do cliente."
              onChange={(e) => setMessage(e.target.value)}
            />
            <Counter $over={messageOver}>{message.length}/{MESSAGE_MAX}</Counter>
          </Field>

          <FieldHint style={{ marginTop: "0.5rem" }}>
            A notificação vai só para o dono de cada estabelecimento (não para a equipe) e só chega para quem usa o app
            com as notificações ativadas.
          </FieldHint>

          <FormActions>
            <Button type="submit" disabled={!canSend}>
              {sending ? "Enviando..." : audience === "all" ? "Enviar para todos" : "Enviar para o cliente"}
            </Button>
          </FormActions>
        </Card>

        <div style={{ display: "grid", gap: "1rem" }}>
          <Phone>
            <PushPreview>
              <small>Horário Certo · agora</small>
              <strong>{title.trim() || "Título da notificação"}</strong>
              {message.trim() || "O texto da mensagem aparece aqui."}
            </PushPreview>
          </Phone>
          <Notice>
            Use com moderação: notificações demais fazem o cliente desativar o push e deixar de receber os avisos de
            agenda e de cobrança.
          </Notice>
        </div>
      </Layout>
    </AdminLayout>
  );
}

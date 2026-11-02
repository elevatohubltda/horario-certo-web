import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { Copy, KeyRound, Pencil, Plus } from "lucide-react";
import {
  AdminLayout,
  Badge,
  Button,
  Card,
  Field,
  IconButton,
  Input,
  Message,
  Modal,
  Muted,
  Table,
  TableCard,
  errorMessage,
  formatDate,
} from "../components/admin";
import {
  createProfessional,
  getProfessionals,
  setProfessionalAccess,
  updateProfessional,
} from "../services/endpoints/professional";

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const PasswordRow = styled.div`
  display: flex;
  gap: 0.5rem;

  input {
    flex: 1;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: #374151;
  cursor: pointer;
`;

const Notice = styled(Card)`
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e3a8a;
  font-size: 0.82rem;
  margin-bottom: 1rem;
  box-shadow: none;
`;

const CredentialsBox = styled.div`
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 0.5rem;
  padding: 0.75rem;
  font-size: 0.85rem;
  line-height: 1.6;
`;

// Senha inicial legível para o dono repassar ao profissional (ele pode trocar em "Alterar senha")
const generatePassword = () => {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const suggestUsername = (name) =>
  name
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 30);

function Professionals() {
  const companyUrl = Cookies.get("companyUrl");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  // Formulários: novo profissional, edição (nome/status) e acesso (usuário/senha)
  const [createForm, setCreateForm] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [accessForm, setAccessForm] = useState(null);
  // Acesso recém-gerado, exibido uma vez para o dono copiar e repassar
  const [credentials, setCredentials] = useState(null);

  const fetchProfessionals = useCallback(async () => {
    try {
      const response = await getProfessionals(companyUrl);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(errorMessage(err, "Não foi possível carregar os profissionais."));
    } finally {
      setLoading(false);
    }
  }, [companyUrl]);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  const canAddMore = data && data.activeCount < data.maxProfessionals;

  const runSave = async (action, successMessage) => {
    setSaving(true);
    try {
      await action();
      toast.success(successMessage);
      await fetchProfessionals();
      return true;
    } catch (err) {
      toast.error(errorMessage(err, "Não foi possível salvar."));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    const name = createForm.name.trim();
    if (!name) return toast.error("Informe o nome do profissional");
    const withAccess = createForm.withAccess;
    if (withAccess && (!createForm.username.trim() || createForm.password.length < 6)) {
      return toast.error("Informe o usuário e uma senha com pelo menos 6 caracteres");
    }
    const ok = await runSave(
      () =>
        createProfessional(companyUrl, {
          name,
          username: withAccess ? createForm.username.trim() : null,
          password: withAccess ? createForm.password : null,
        }),
      "Profissional cadastrado"
    );
    if (ok) {
      setCreateForm(null);
      if (withAccess) setCredentials({ name, username: createForm.username.trim().toLowerCase(), password: createForm.password });
    }
  };

  const handleEdit = async () => {
    if (!editForm.name.trim()) return toast.error("Informe o nome do profissional");
    const ok = await runSave(
      () => updateProfessional(companyUrl, editForm.id, { name: editForm.name.trim(), active: editForm.active }),
      "Profissional atualizado"
    );
    if (ok) setEditForm(null);
  };

  const handleAccess = async () => {
    if (!accessForm.username.trim() || accessForm.password.length < 6) {
      return toast.error("Informe o usuário e uma senha com pelo menos 6 caracteres");
    }
    const ok = await runSave(
      () =>
        setProfessionalAccess(companyUrl, accessForm.id, {
          username: accessForm.username.trim(),
          password: accessForm.password,
        }),
      "Acesso salvo"
    );
    if (ok) {
      setCredentials({ name: accessForm.name, username: accessForm.username.trim().toLowerCase(), password: accessForm.password });
      setAccessForm(null);
    }
  };

  const credentialsText = credentials
    ? `Seu acesso ao Horário Certo:\nEndereço: ${window.location.origin}/login\nUsuário: ${credentials.username}\nSenha: ${credentials.password}`
    : "";

  const copyCredentials = async () => {
    try {
      await navigator.clipboard.writeText(credentialsText);
      toast.success("Acesso copiado");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  return (
    <AdminLayout
      requireAdmin={false}
      title="Profissionais"
      subtitle={data ? `${data.activeCount} de ${data.maxProfessionals} profissionais ativos no seu plano.` : undefined}
      actions={
        data && data.maxProfessionals > 1 && (
          <Button
            onClick={() => setCreateForm({ name: "", withAccess: true, username: "", password: generatePassword() })}
            disabled={!canAddMore}
            title={canAddMore ? undefined : "Limite de profissionais do plano atingido"}
          >
            <Plus size={16} /> Novo profissional
          </Button>
        )
      }
    >
      {loading ? (
        <Message>Carregando...</Message>
      ) : error ? (
        <Message>{error}</Message>
      ) : (
        <>
          {data.maxProfessionals <= 1 ? (
            <Notice>
              Seu plano permite 1 profissional (você). Para cadastrar sua equipe, mude para o plano
              <strong> com mais profissionais</strong> em "Assinatura".
            </Notice>
          ) : (
            <Notice>
              Cada profissional tem os próprios serviços, horários e agendamentos, e só pode alterar os
              agendamentos dele. Seus clientes escolhem com quem agendar (ou "sem preferência"). Configure os
              horários de cada um em "Configuração Horários" e os serviços em "Serviços".
            </Notice>
          )}

          <TableCard>
            <Table $minWidth="640px">
              <thead>
                <tr>
                  <th>Profissional</th>
                  <th>Status</th>
                  <th>Acesso ao sistema</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.professionals.map((professional) => (
                  <tr key={professional.id}>
                    <td>
                      <strong>{professional.name}</strong>
                      {professional.isOwner && (
                        <div style={{ marginTop: "0.3rem" }}>
                          <Badge $tone="blue">Você (dono)</Badge>
                        </div>
                      )}
                      <Muted>Desde {formatDate(professional.createdAt)}</Muted>
                    </td>
                    <td>
                      <Badge $tone={professional.active ? "green" : "gray"}>
                        {professional.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </td>
                    <td>
                      {professional.isOwner ? (
                        <Muted style={{ marginTop: 0 }}>Usa o seu acesso</Muted>
                      ) : professional.username ? (
                        professional.username
                      ) : (
                        <Muted style={{ marginTop: 0 }}>Sem acesso</Muted>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.35rem" }}>
                        <IconButton
                          title="Editar"
                          onClick={() => setEditForm({ id: professional.id, name: professional.name, active: professional.active, isOwner: professional.isOwner })}
                        >
                          <Pencil size={15} />
                        </IconButton>
                        {!professional.isOwner && (
                          <IconButton
                            title={professional.username ? "Alterar acesso" : "Gerar acesso"}
                            onClick={() =>
                              setAccessForm({
                                id: professional.id,
                                name: professional.name,
                                username: professional.username || suggestUsername(professional.name),
                                password: generatePassword(),
                                isNew: !professional.username,
                              })
                            }
                          >
                            <KeyRound size={15} />
                          </IconButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableCard>
        </>
      )}

      {/* Novo profissional */}
      <Modal
        open={Boolean(createForm)}
        title="Novo profissional"
        onClose={() => !saving && setCreateForm(null)}
        footer={
          <>
            <Button $variant="outline" onClick={() => setCreateForm(null)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? "Salvando..." : "Cadastrar"}</Button>
          </>
        }
      >
        {createForm && (
          <>
            <Field>
              Nome
              <Input
                value={createForm.name}
                placeholder="Ex.: João Silva"
                onChange={(e) => {
                  const name = e.target.value;
                  setCreateForm((prev) => ({
                    ...prev,
                    name,
                    // Sugere o usuário a partir do nome até o dono editar o campo
                    username: prev.usernameTouched ? prev.username : suggestUsername(name),
                  }));
                }}
              />
            </Field>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={createForm.withAccess}
                onChange={(e) => setCreateForm({ ...createForm, withAccess: e.target.checked })}
              />
              Gerar acesso ao sistema agora
            </CheckboxLabel>
            {createForm.withAccess && (
              <FormRow>
                <Field>
                  Usuário
                  <Input
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value, usernameTouched: true })}
                  />
                </Field>
                <Field>
                  Senha inicial
                  <PasswordRow>
                    <Input value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} />
                    <Button type="button" $variant="outline" onClick={() => setCreateForm({ ...createForm, password: generatePassword() })}>
                      Gerar
                    </Button>
                  </PasswordRow>
                </Field>
              </FormRow>
            )}
          </>
        )}
      </Modal>

      {/* Editar nome/status */}
      <Modal
        open={Boolean(editForm)}
        title="Editar profissional"
        onClose={() => !saving && setEditForm(null)}
        footer={
          <>
            <Button $variant="outline" onClick={() => setEditForm(null)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
          </>
        }
      >
        {editForm && (
          <>
            <Field>
              Nome
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </Field>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={editForm.active}
                onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
              />
              Ativo (aparece para os clientes e conta no limite do plano)
            </CheckboxLabel>
            {editForm.isOwner && !editForm.active && (
              <Muted style={{ marginTop: 0 }}>
                Desativando você mesmo, seus clientes deixam de poder agendar com você. Você continua
                administrando o negócio normalmente.
              </Muted>
            )}
          </>
        )}
      </Modal>

      {/* Gerar/alterar acesso */}
      <Modal
        open={Boolean(accessForm)}
        title={accessForm?.isNew ? `Gerar acesso de ${accessForm?.name}` : `Alterar acesso de ${accessForm?.name}`}
        onClose={() => !saving && setAccessForm(null)}
        footer={
          <>
            <Button $variant="outline" onClick={() => setAccessForm(null)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleAccess} disabled={saving}>{saving ? "Salvando..." : "Salvar acesso"}</Button>
          </>
        }
      >
        {accessForm && (
          <>
            <FormRow>
              <Field>
                Usuário
                <Input value={accessForm.username} onChange={(e) => setAccessForm({ ...accessForm, username: e.target.value })} />
              </Field>
              <Field>
                {accessForm.isNew ? "Senha inicial" : "Nova senha"}
                <PasswordRow>
                  <Input value={accessForm.password} onChange={(e) => setAccessForm({ ...accessForm, password: e.target.value })} />
                  <Button type="button" $variant="outline" onClick={() => setAccessForm({ ...accessForm, password: generatePassword() })}>
                    Gerar
                  </Button>
                </PasswordRow>
              </Field>
            </FormRow>
            <Muted style={{ marginTop: 0 }}>
              O profissional entra pela mesma tela de login e pode trocar a senha depois em "Alterar senha".
            </Muted>
          </>
        )}
      </Modal>

      {/* Acesso gerado: mostrado uma única vez para copiar e enviar */}
      <Modal
        open={Boolean(credentials)}
        title="Acesso pronto"
        onClose={() => setCredentials(null)}
        footer={
          <>
            <Button $variant="outline" onClick={copyCredentials}><Copy size={15} /> Copiar</Button>
            <Button onClick={() => setCredentials(null)}>Concluir</Button>
          </>
        }
      >
        {credentials && (
          <>
            <Muted style={{ marginTop: 0 }}>
              Envie estes dados para {credentials.name}. A senha não será exibida novamente.
            </Muted>
            <CredentialsBox>
              Endereço: {window.location.origin}/login<br />
              Usuário: <strong>{credentials.username}</strong><br />
              Senha: <strong>{credentials.password}</strong>
            </CredentialsBox>
          </>
        )}
      </Modal>
    </AdminLayout>
  );
}

export default Professionals;

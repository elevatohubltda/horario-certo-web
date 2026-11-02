import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { Pencil, Plus, QrCode } from "lucide-react";
import {
  AdminLayout,
  Badge,
  Button,
  Field,
  Input,
  Message,
  Modal,
  Muted,
  Select,
  Table,
  TableCard,
  errorMessage,
  formatDate,
  formatMoney,
} from "../components/admin";
import PartnerQrShare from "../components/admin/PartnerQrShare";
import { createDiscountCode, getDiscountCodes, updateDiscountCode } from "../services/endpoints/admin";

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FormSectionTitle = styled.div`
  margin-top: 0.25rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6b7280;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: #374151;
  cursor: pointer;
`;

const RowActions = styled.div`
  display: flex;
  gap: 0.4rem;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const FIRST_MONTH_FREE = "FIRST_MONTH_FREE";

const EMPTY_FORM = {
  name: "",
  partnerName: "",
  discountType: "FIXED",
  discountValue: "",
  expiry: "",
  registrationDeadline: "",
  maxRegistrations: "",
  isActive: true,
};

// Link que a empresa parceira divulga: abre o cadastro com o cupom já preenchido
const partnerLink = (code) => `${window.location.origin}/registro?cupom=${encodeURIComponent(code.name)}`;

// O backend devolve o campo booleano como "isActive" ou "active", dependendo da serialização
const isCodeActive = (code) => code.isActive ?? code.active;

const toForm = (code) => ({
  id: code.id,
  name: code.name,
  partnerName: code.partnerName || "",
  discountType: code.discountType,
  discountValue: code.discountType === FIRST_MONTH_FREE ? "" : String(code.discountValue).replace(".", ","),
  expiry: code.expiry ? code.expiry.slice(0, 10) : "",
  registrationDeadline: code.registrationDeadline ? code.registrationDeadline.slice(0, 10) : "",
  maxRegistrations: code.maxRegistrations ? String(code.maxRegistrations) : "",
  isActive: Boolean(isCodeActive(code)),
});

// Ordem importa: o primeiro motivo encontrado é o que aparece
const codeStatus = (code) => {
  const now = new Date();
  if (!isCodeActive(code)) return { label: "Inativo", tone: "gray" };
  if (code.expiry && new Date(code.expiry) < now) return { label: "Expirado", tone: "red" };
  if (code.maxRegistrations && (code.usageCount ?? 0) >= code.maxRegistrations) return { label: "Esgotado", tone: "yellow" };
  if (code.registrationDeadline && new Date(code.registrationDeadline) < now) return { label: "Cadastros encerrados", tone: "yellow" };
  return { label: "Ativo", tone: "green" };
};

const formatValue = (code) => {
  if (code.discountType === FIRST_MONTH_FREE) return "1ª mensalidade grátis";
  return code.discountType === "PERCENTAGE"
    ? `${Number(code.discountValue).toLocaleString("pt-BR")}%`
    : formatMoney(code.discountValue);
};

const describeType = (code) => {
  if (code.discountType === FIRST_MONTH_FREE) return "Só a primeira mensalidade";
  return `${code.discountType === "PERCENTAGE" ? "Percentual" : "Valor fixo"} na mensalidade`;
};

// Texto do desconto usado nas artes do QR Code
const discountLabel = (code) => {
  if (code.discountType === FIRST_MONTH_FREE) return "1ª mensalidade grátis";
  return `${formatValue(code)} de desconto`;
};

function AdminDiscountCodes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(null);

  const fetchCodes = useCallback(async () => {
    try {
      const response = await getDiscountCodes();
      setCodes(response.data);
      setError(null);
    } catch (err) {
      setError(errorMessage(err, "Não foi possível carregar os cupons."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const handleSave = async () => {
    const freeMonth = form.discountType === FIRST_MONTH_FREE;
    const value = freeMonth ? 0 : Number(String(form.discountValue).replace(",", "."));
    const maxRegistrations = form.maxRegistrations ? Number(form.maxRegistrations) : null;
    if (!form.name.trim()) return toast.error("Informe o código do cupom");
    if (!freeMonth && (Number.isNaN(value) || value <= 0)) return toast.error("Informe um valor de desconto válido");
    if (form.discountType === "PERCENTAGE" && value > 100) return toast.error("O percentual não pode passar de 100%");
    if (maxRegistrations !== null && (!Number.isInteger(maxRegistrations) || maxRegistrations <= 0)) {
      return toast.error("O limite de cadastros precisa ser um número inteiro maior que zero");
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        partnerName: form.partnerName.trim() || null,
        discountType: form.discountType,
        discountValue: value,
        // Datas valem até o fim do dia escolhido
        expiry: form.expiry ? `${form.expiry}T23:59:59` : null,
        registrationDeadline: form.registrationDeadline ? `${form.registrationDeadline}T23:59:59` : null,
        maxRegistrations,
        isActive: form.isActive,
      };
      if (form.id) {
        await updateDiscountCode(form.id, payload);
        toast.success("Cupom atualizado");
      } else {
        await createDiscountCode(payload);
        toast.success("Cupom criado");
      }
      setForm(null);
      await fetchCodes();
    } catch (err) {
      toast.error(errorMessage(err, "Não foi possível salvar o cupom. Verifique se o código já existe."));
    } finally {
      setSaving(false);
    }
  };

  const sharingStatus = sharing ? codeStatus(sharing) : null;

  return (
    <AdminLayout
      title="Cupons de desconto"
      subtitle="Cupons para o cadastro. Para parcerias, gere o link ou o QR Code que já abre o cadastro com o cupom preenchido."
      actions={
        <Button onClick={() => setForm({ ...EMPTY_FORM })}>
          <Plus size={16} /> Novo cupom
        </Button>
      }
    >
      {loading ? (
        <Message>Carregando...</Message>
      ) : error ? (
        <Message>{error}</Message>
      ) : codes.length === 0 ? (
        <Message>Nenhum cupom cadastrado.</Message>
      ) : (
        <TableCard>
          <Table $minWidth="1000px">
            <thead>
              <tr>
                <th>Código</th>
                <th>Parceiro</th>
                <th>Desconto</th>
                <th>Cadastros</th>
                <th>Desconto vale até</th>
                <th>Status</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {codes.map((code) => {
                const status = codeStatus(code);
                const usage = code.usageCount ?? 0;
                return (
                  <tr key={code.id}>
                    <td>
                      <strong>{code.name}</strong>
                      <Muted>Criado em {formatDate(code.createdAt)}</Muted>
                    </td>
                    <td>{code.partnerName || <Muted style={{ marginTop: 0 }}>—</Muted>}</td>
                    <td>
                      {formatValue(code)}
                      <Muted>{describeType(code)}</Muted>
                    </td>
                    <td>
                      {code.maxRegistrations ? `${usage} de ${code.maxRegistrations}` : usage}
                      <Muted>
                        {code.registrationDeadline ? `Cadastros até ${formatDate(code.registrationDeadline)}` : "Sem data limite"}
                      </Muted>
                    </td>
                    <td>{code.expiry ? formatDate(code.expiry) : "Sem validade"}</td>
                    <td>
                      <Badge $tone={status.tone}>{status.label}</Badge>
                    </td>
                    <td>
                      <RowActions>
                        <Button $variant="outline" onClick={() => setSharing(code)}>
                          <QrCode size={15} /> Link e QR Code
                        </Button>
                        <Button $variant="outline" onClick={() => setForm(toForm(code))} aria-label={`Editar ${code.name}`}>
                          <Pencil size={15} />
                        </Button>
                      </RowActions>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableCard>
      )}

      <Modal
        open={Boolean(form)}
        title={form?.id ? "Editar cupom" : "Novo cupom"}
        onClose={() => !saving && setForm(null)}
        footer={
          <>
            <Button $variant="outline" onClick={() => setForm(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : form?.id ? "Salvar" : "Criar cupom"}
            </Button>
          </>
        }
      >
        {form && (
          <>
            <Field>
              Código
              <Input
                value={form.name}
                placeholder="Ex.: FUNDADOR20"
                maxLength={50}
                onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase() })}
              />
            </Field>
            {form.id && (
              <Muted style={{ marginTop: 0 }}>
                Mudar o código invalida links e QR Codes que já foram divulgados.
              </Muted>
            )}
            <Field>
              Empresa parceira (opcional)
              <Input
                value={form.partnerName}
                placeholder="Ex.: Escola de Estética Bella"
                maxLength={120}
                onChange={(e) => setForm({ ...form, partnerName: e.target.value })}
              />
            </Field>

            <FormSectionTitle>Desconto</FormSectionTitle>
            <FormRow>
              <Field>
                Tipo de desconto
                <Select
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                >
                  <option value="FIXED">Valor fixo (R$)</option>
                  <option value="PERCENTAGE">Percentual (%)</option>
                  <option value={FIRST_MONTH_FREE}>1ª mensalidade grátis</option>
                </Select>
              </Field>
              {form.discountType !== FIRST_MONTH_FREE ? (
                <Field>
                  {form.discountType === "PERCENTAGE" ? "Percentual (%)" : "Valor (R$)"}
                  <Input
                    inputMode="decimal"
                    value={form.discountValue}
                    placeholder={form.discountType === "PERCENTAGE" ? "10" : "20,00"}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  />
                </Field>
              ) : (
                <Muted style={{ alignSelf: "end", marginBottom: "0.5rem" }}>
                  No fim do teste, a 1ª mensalidade é quitada pelo cupom e o WhatsApp é liberado. Da 2ª em diante, valor cheio.
                </Muted>
              )}
            </FormRow>
            <Field>
              Desconto vale até (opcional)
              <Input
                type="date"
                value={form.expiry}
                onChange={(e) => setForm({ ...form, expiry: e.target.value })}
              />
            </Field>

            <FormSectionTitle>Regras para novos cadastros</FormSectionTitle>
            <FormRow>
              <Field>
                Cadastros permitidos até (opcional)
                <Input
                  type="date"
                  value={form.registrationDeadline}
                  onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
                />
              </Field>
              <Field>
                Limite de cadastros (opcional)
                <Input
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={form.maxRegistrations}
                  placeholder="Ex.: 50"
                  onChange={(e) => setForm({ ...form, maxRegistrations: e.target.value })}
                />
              </Field>
            </FormRow>
            <Muted style={{ marginTop: 0 }}>
              Depois da data limite ou ao atingir o limite, o cupom deixa de valer para novos cadastros. Quem já se cadastrou
              continua com o desconto.
            </Muted>

            <CheckboxLabel>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Ativo (já pode ser usado)
            </CheckboxLabel>
          </>
        )}
      </Modal>

      <Modal
        open={Boolean(sharing)}
        title={sharing?.partnerName ? `Link de parceria: ${sharing.partnerName}` : "Link de parceria"}
        onClose={() => setSharing(null)}
        footer={
          <Button $variant="outline" onClick={() => setSharing(null)}>
            Fechar
          </Button>
        }
      >
        {sharing && (
          <>
            <Muted style={{ marginTop: 0, textAlign: "center" }}>
              Quem abrir o link ou ler o QR Code vai direto para o cadastro com o cupom <strong>{sharing.name}</strong>{" "}
              ({discountLabel(sharing)}) já preenchido.
            </Muted>
            {sharingStatus.tone !== "green" && (
              <div style={{ textAlign: "center" }}>
                <Badge $tone="red">Cupom {sharingStatus.label.toLowerCase()}: o desconto não será aplicado em novos cadastros</Badge>
              </div>
            )}
            <PartnerQrShare
              link={partnerLink(sharing)}
              info={{
                code: sharing.name,
                partnerName: sharing.partnerName || null,
                discountLabel: discountLabel(sharing),
                deadlineLabel: sharing.registrationDeadline ? `cadastros até ${formatDate(sharing.registrationDeadline)}` : null,
              }}
            />
          </>
        )}
      </Modal>
    </AdminLayout>
  );
}

export default AdminDiscountCodes;

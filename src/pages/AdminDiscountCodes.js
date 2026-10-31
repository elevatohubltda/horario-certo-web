import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";
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
import { createDiscountCode, getDiscountCodes } from "../services/endpoints/admin";

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
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

const EMPTY_FORM = { name: "", discountType: "FIXED", discountValue: "", expiry: "", isActive: true };

// O backend devolve o campo booleano como "isActive" ou "active", dependendo da serialização
const isCodeActive = (code) => code.isActive ?? code.active;

const codeStatus = (code) => {
  if (!isCodeActive(code)) return { label: "Inativo", tone: "gray" };
  if (code.expiry && new Date(code.expiry) < new Date()) return { label: "Expirado", tone: "red" };
  return { label: "Ativo", tone: "green" };
};

const formatValue = (code) =>
  code.discountType === "PERCENTAGE"
    ? `${Number(code.discountValue).toLocaleString("pt-BR")}%`
    : formatMoney(code.discountValue);

function AdminDiscountCodes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

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
    const value = Number(String(form.discountValue).replace(",", "."));
    if (!form.name.trim()) return toast.error("Informe o código do cupom");
    if (Number.isNaN(value) || value <= 0) return toast.error("Informe um valor de desconto válido");
    if (form.discountType === "PERCENTAGE" && value > 100) return toast.error("O percentual não pode passar de 100%");

    setSaving(true);
    try {
      await createDiscountCode({
        name: form.name.trim(),
        discountType: form.discountType,
        discountValue: value,
        // Vale até o fim do dia escolhido
        expiry: form.expiry ? `${form.expiry}T23:59:59` : null,
        isActive: form.isActive,
      });
      toast.success("Cupom criado");
      setForm(null);
      await fetchCodes();
    } catch (err) {
      toast.error(errorMessage(err, "Não foi possível criar o cupom. Verifique se o código já existe."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Cupons de desconto"
      subtitle="Cupons disponíveis para os clientes informarem no cadastro."
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
          <Table $minWidth="680px">
            <thead>
              <tr>
                <th>Código</th>
                <th>Desconto</th>
                <th>Validade</th>
                <th>Clientes usando</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((code) => {
                const status = codeStatus(code);
                return (
                  <tr key={code.id}>
                    <td>
                      <strong>{code.name}</strong>
                      <Muted>Criado em {formatDate(code.createdAt)}</Muted>
                    </td>
                    <td>
                      {formatValue(code)}
                      <Muted>{code.discountType === "PERCENTAGE" ? "Percentual" : "Valor fixo"} na mensalidade</Muted>
                    </td>
                    <td>{code.expiry ? formatDate(code.expiry) : "Sem validade"}</td>
                    <td>{code.usageCount ?? 0}</td>
                    <td>
                      <Badge $tone={status.tone}>{status.label}</Badge>
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
        title="Novo cupom"
        onClose={() => !saving && setForm(null)}
        footer={
          <>
            <Button $variant="outline" onClick={() => setForm(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Criar cupom"}
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
            <FormRow>
              <Field>
                Tipo de desconto
                <Select
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                >
                  <option value="FIXED">Valor fixo (R$)</option>
                  <option value="PERCENTAGE">Percentual (%)</option>
                </Select>
              </Field>
              <Field>
                {form.discountType === "PERCENTAGE" ? "Percentual (%)" : "Valor (R$)"}
                <Input
                  inputMode="decimal"
                  value={form.discountValue}
                  placeholder={form.discountType === "PERCENTAGE" ? "10" : "20,00"}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                />
              </Field>
            </FormRow>
            <Field>
              Válido até (opcional)
              <Input
                type="date"
                value={form.expiry}
                onChange={(e) => setForm({ ...form, expiry: e.target.value })}
              />
            </Field>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Ativo (já pode ser usado)
            </CheckboxLabel>
            <Muted style={{ marginTop: 0 }}>
              O desconto é aplicado sobre a mensalidade enquanto o cupom estiver ativo e dentro da validade.
            </Muted>
          </>
        )}
      </Modal>
    </AdminLayout>
  );
}

export default AdminDiscountCodes;

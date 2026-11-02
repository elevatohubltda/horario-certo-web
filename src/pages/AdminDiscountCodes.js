import React, { useCallback, useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { Copy, Download, Pencil, Plus, QrCode } from "lucide-react";
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
import { createDiscountCode, getDiscountCodes, updateDiscountCode } from "../services/endpoints/admin";

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

const RowActions = styled.div`
  display: flex;
  gap: 0.4rem;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const ShareBox = styled.div`
  display: grid;
  justify-items: center;
  gap: 1rem;
  text-align: center;

  canvas {
    border: 1px solid var(--ui-border);
    border-radius: var(--ui-radius-sm);
    padding: 0.5rem;
    background: #fff;
  }
`;

const LinkRow = styled.div`
  display: flex;
  gap: 0.5rem;
  width: 100%;

  input {
    flex: 1;
    min-width: 0;
  }
`;

const EMPTY_FORM = { name: "", partnerName: "", discountType: "FIXED", discountValue: "", expiry: "", isActive: true };

// Link que a empresa parceira divulga: abre o cadastro com o cupom já preenchido
const partnerLink = (code) => `${window.location.origin}/registro?cupom=${encodeURIComponent(code.name)}`;

const toForm = (code) => ({
  id: code.id,
  name: code.name,
  partnerName: code.partnerName || "",
  discountType: code.discountType,
  discountValue: String(code.discountValue).replace(".", ","),
  expiry: code.expiry ? code.expiry.slice(0, 10) : "",
  isActive: Boolean(isCodeActive(code)),
});

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
  const [sharing, setSharing] = useState(null);
  const qrRef = useRef(null);

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
      const payload = {
        name: form.name.trim(),
        partnerName: form.partnerName.trim() || null,
        discountType: form.discountType,
        discountValue: value,
        // Vale até o fim do dia escolhido
        expiry: form.expiry ? `${form.expiry}T23:59:59` : null,
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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(partnerLink(sharing));
      toast.success("Link copiado");
    } catch {
      toast.error("Não foi possível copiar. Selecione o link e copie manualmente.");
    }
  };

  const handleDownloadQr = () => {
    const canvas = qrRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `qrcode-cupom-${sharing.name.toLowerCase()}.png`;
    link.click();
  };

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
          <Table $minWidth="900px">
            <thead>
              <tr>
                <th>Código</th>
                <th>Parceiro</th>
                <th>Desconto</th>
                <th>Validade</th>
                <th>Clientes usando</th>
                <th>Status</th>
                <th aria-label="Ações" />
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
                    <td>{code.partnerName || <Muted style={{ marginTop: 0 }}>—</Muted>}</td>
                    <td>
                      {formatValue(code)}
                      <Muted>{code.discountType === "PERCENTAGE" ? "Percentual" : "Valor fixo"} na mensalidade</Muted>
                    </td>
                    <td>{code.expiry ? formatDate(code.expiry) : "Sem validade"}</td>
                    <td>{code.usageCount ?? 0}</td>
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
          <ShareBox>
            <Muted style={{ marginTop: 0 }}>
              Quem abrir este link ou ler o QR Code vai direto para o cadastro com o cupom <strong>{sharing.name}</strong>{" "}
              ({formatValue(sharing)} de desconto) já preenchido.
            </Muted>
            {codeStatus(sharing).tone !== "green" && (
              <Badge $tone="red">Cupom {codeStatus(sharing).label.toLowerCase()}: o desconto não será aplicado</Badge>
            )}
            <QRCodeCanvas ref={qrRef} value={partnerLink(sharing)} size={220} marginSize={2} level="M" />
            <LinkRow>
              <Input readOnly value={partnerLink(sharing)} onFocus={(e) => e.target.select()} aria-label="Link de parceria" />
              <Button onClick={handleCopyLink}>
                <Copy size={15} /> Copiar
              </Button>
            </LinkRow>
            <Button $variant="outline" onClick={handleDownloadQr}>
              <Download size={15} /> Baixar QR Code (PNG)
            </Button>
          </ShareBox>
        )}
      </Modal>
    </AdminLayout>
  );
}

export default AdminDiscountCodes;

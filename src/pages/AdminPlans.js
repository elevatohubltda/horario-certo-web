import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { Pencil, Plus } from "lucide-react";
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
  errorMessage,
  formatMoney,
  formatNumber,
} from "../components/admin";
import { createAdminPlan, getAdminPlans, updateAdminPlan } from "../services/endpoints/admin";

const PlanGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
`;

const PlanHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.75rem;

  h3 {
    margin: 0;
    font-size: 1.05rem;
    color: var(--color-dark);
  }
`;

const Price = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0.25rem 0 0.5rem;
`;

const FeatureList = styled.ul`
  list-style: none;
  margin: 0.75rem 0 0;
  padding: 0.6rem 0 0;
  border-top: 1px solid #f3f4f6;
  font-size: 0.8rem;
  color: #374151;

  li {
    padding: 0.2rem 0;
  }

  li::before {
    content: "✓ ";
    color: #16a34a;
    font-weight: 700;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.6rem 0.75rem;
  max-height: 260px;
  overflow-y: auto;

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.82rem;
    color: #374151;
    cursor: pointer;
  }
`;

const EMPTY_FORM = { id: null, name: "", price: "", expectedWhatsappMessages: "700", featureIds: [] };

function AdminPlans() {
  const [data, setData] = useState({ plans: [], features: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await getAdminPlans();
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(errorMessage(err, "Não foi possível carregar os planos."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const openCreate = () => setForm({ ...EMPTY_FORM });

  const openEdit = (plan) =>
    setForm({
      id: plan.id,
      name: plan.name,
      price: String(plan.price),
      expectedWhatsappMessages: String(plan.expectedWhatsappMessages),
      featureIds: plan.features.map((f) => f.id),
      clients: plan.clients,
    });

  const toggleFeature = (featureId) =>
    setForm((prev) => ({
      ...prev,
      featureIds: prev.featureIds.includes(featureId)
        ? prev.featureIds.filter((id) => id !== featureId)
        : [...prev.featureIds, featureId],
    }));

  const handleSave = async () => {
    const price = Number(String(form.price).replace(",", "."));
    if (!form.name.trim()) return toast.error("Informe o nome do plano");
    if (Number.isNaN(price) || price < 0) return toast.error("Informe um preço válido");
    if (form.id && form.clients > 0 &&
      !window.confirm(`Este plano tem ${form.clients} cliente(s). As mudanças valem para todos eles a partir da próxima fatura. Continuar?`)) {
      return;
    }

    const payload = {
      name: form.name.trim(),
      price,
      expectedWhatsappMessages: Number(form.expectedWhatsappMessages) || 0,
      featureIds: form.featureIds,
    };

    setSaving(true);
    try {
      if (form.id) {
        await updateAdminPlan(form.id, payload);
        toast.success("Plano atualizado");
      } else {
        await createAdminPlan(payload);
        toast.success("Plano criado");
      }
      setForm(null);
      await fetchPlans();
    } catch (err) {
      toast.error(errorMessage(err, "Não foi possível salvar o plano."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Planos"
      subtitle="Planos à venda e as features incluídas em cada um."
      actions={
        <Button onClick={openCreate}>
          <Plus size={16} /> Novo plano
        </Button>
      }
    >
      {loading ? (
        <Message>Carregando...</Message>
      ) : error ? (
        <Message>{error}</Message>
      ) : data.plans.length === 0 ? (
        <Message>Nenhum plano cadastrado.</Message>
      ) : (
        <PlanGrid>
          {data.plans.map((plan) => (
            <Card key={plan.id} $padding="1.1rem">
              <PlanHeader>
                <div>
                  <h3>{plan.name}</h3>
                  <Badge $tone={plan.clients > 0 ? "green" : "gray"}>
                    {plan.clients} cliente{plan.clients === 1 ? "" : "s"}
                  </Badge>
                </div>
                <IconButton title="Editar plano" onClick={() => openEdit(plan)}>
                  <Pencil size={15} />
                </IconButton>
              </PlanHeader>
              <Price>
                {formatMoney(plan.price)}
                <span style={{ fontSize: "0.8rem", fontWeight: 400, color: "#6b7280" }}>/mês</span>
              </Price>
              <Muted>
                {plan.expectedWhatsappMessages > 0
                  ? `${formatNumber(plan.expectedWhatsappMessages)} mensagens WhatsApp esperadas/mês`
                  : "Sem referência de mensagens WhatsApp"}
              </Muted>
              {plan.features.length === 0 ? (
                <Muted style={{ marginTop: "0.75rem" }}>Nenhuma feature incluída.</Muted>
              ) : (
                <FeatureList>
                  {plan.features.map((feature) => (
                    <li key={feature.id}>{feature.name}</li>
                  ))}
                </FeatureList>
              )}
            </Card>
          ))}
        </PlanGrid>
      )}

      <Modal
        open={Boolean(form)}
        title={form?.id ? `Editar plano ${form?.name}` : "Novo plano"}
        onClose={() => !saving && setForm(null)}
        footer={
          <>
            <Button $variant="outline" onClick={() => setForm(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </>
        }
      >
        {form && (
          <>
            <FormRow>
              <Field>
                Nome
                <Input
                  value={form.name}
                  placeholder="Ex.: SOLO"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field>
                Preço mensal (R$)
                <Input
                  inputMode="decimal"
                  value={form.price}
                  placeholder="79,90"
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </Field>
              <Field>
                Mensagens WhatsApp/mês
                <Input
                  type="number"
                  min="0"
                  value={form.expectedWhatsappMessages}
                  onChange={(e) => setForm({ ...form, expectedWhatsappMessages: e.target.value })}
                />
              </Field>
            </FormRow>
            <Muted style={{ marginTop: 0 }}>
              O nome é salvo em maiúsculas. Mensagens esperadas é a referência usada na tela "Uso WhatsApp"
              (cerca de 700 por profissional).
            </Muted>
            <Field as="div">
              Features incluídas ({form.featureIds.length} de {data.features.length})
              <FeatureOptions>
                {data.features.map((feature) => (
                  <label key={feature.id}>
                    <input
                      type="checkbox"
                      checked={form.featureIds.includes(feature.id)}
                      onChange={() => toggleFeature(feature.id)}
                    />
                    {feature.name}
                    {Number(feature.price) > 0 && <Muted style={{ margin: 0 }}>({formatMoney(feature.price)} como extra)</Muted>}
                  </label>
                ))}
              </FeatureOptions>
            </Field>
          </>
        )}
      </Modal>
    </AdminLayout>
  );
}

export default AdminPlans;

import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Cookies from "js-cookie";

import Topbar from "../components/topbar";
import Sidebar from "../components/sidebar";
import { Container } from "../components/container/style";
import { Title } from "../components/title";
import { Separator } from "../components/separator/style";
import { Button } from "../components/button";
import { isMobile } from "../util/util";
import { getSubscriptionPlans, updateSubscription } from "../services/endpoints/payment";
import { ToastContainer, toast } from "react-toastify";

const PageContent = styled.div`
  width: calc(100% - 2rem);
  margin: 0 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled(Container)`
  width: 100%;
  margin: 0;
  flex-direction: column;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  padding: 1rem;
  border: ${(props) => (props.$selected ? "2px solid var(--color-sage)" : "1px solid #e5e7eb")};
`;

const PlanCard = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ItemTitle = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
`;

const Price = styled.div`
  margin-top: 0.35rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: #111827;
`;

const Bullet = styled.div`
  font-size: 0.82rem;
  color: #374151;
  margin-top: 0.45rem;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const OptionItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #f9fafb;
  padding: 0.7rem;
  font-size: 0.82rem;
  color: #374151;
`;

const Actions = styled(Container)`
  width: 100%;
  margin: 0;
  background: transparent;
  box-shadow: none;
  display: flex;
  justify-content: flex-end;
`;

export default function ChangeSubscription() {
  const companyInfo = JSON.parse(Cookies.get("companyInfo"));
  const companyUrl = Cookies.get("companyUrl");
  const mobile = isMobile();

  const [plans, setPlans] = useState([]);
  const [extraFeatures, setExtraFeatures] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await getSubscriptionPlans(companyUrl);
        const data = response.data;
        setPlans(data.plans || []);
        setExtraFeatures(data.extraFeatures || []);
        setSelectedPlanId(data.currentPlan || null);
        setSelectedExtras(data.currentExtras || []);
      } catch (error) {
        console.error("Erro ao buscar planos:", error);
      }
    };

    fetchPlans();
  }, [companyUrl]);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId),
    [plans, selectedPlanId]
  );

  const availableExtras = useMemo(() => {
    const planFeatures = selectedPlan?.features || [];
    return extraFeatures.filter((feature) => !planFeatures.includes(feature.name));
  }, [extraFeatures, selectedPlan]);

  const selectedExtraItems = useMemo(
    () => availableExtras.filter((feature) => selectedExtras.includes(feature.name)),
    [availableExtras, selectedExtras]
  );

  const finalFeatures = useMemo(() => {
    const base = selectedPlan ? selectedPlan.features : [];
    const extras = selectedExtraItems.map((item) => item.name);
    return [...base, ...extras];
  }, [selectedPlan, selectedExtraItems]);

  const extrasTotal = useMemo(
    () => selectedExtraItems.reduce((sum, item) => sum + item.price, 0),
    [selectedExtraItems]
  );

  const planPrice = selectedPlan ? selectedPlan.price : 0;
  const finalPrice = planPrice + extrasTotal;

  const formatCurrency = (value) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSubscription(companyUrl, {
        plan: selectedPlanId,
        extras: selectedExtras,
      });
      toast.success("Assinatura atualizada com sucesso!", { containerId: "change-subscription" });
    } catch (error) {
      console.error("Erro ao salvar assinatura:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleExtra = (featureName) => {
    setSelectedExtras((prev) =>
      prev.includes(featureName)
        ? prev.filter((item) => item !== featureName)
        : [...prev, featureName]
    );
  };

  return (
    <>
      <Topbar {...companyInfo} loggedIn />

      <Container
        $width="100%"
        $display="flex"
        $flexdirection="column"
        $padding={!mobile ? "0" : "1rem"}
        $margin="0"
        $backgroundcolor="transparent"
        $borderRadius="0"
        $boxshadow="0"
      >
        <Sidebar>
          <Title
            $padding="1rem"
            $margin="1rem 0 0 0"
            $fontweight="600"
            $fontsize="2rem"
            $color="var(--color-dark)"
            $width="max-content"
          >
            Mudar assinatura
          </Title>

          <Separator
            $width="calc(100% - 2rem)"
            $bordercolor="var(--color-olive)"
            $margin="0 1rem 1rem 1rem"
            $style="dotted"
          />

          <PageContent>
            <Card>
              <ItemTitle>Escolha seu plano</ItemTitle>
              <Separator $margin="0.75rem 0" $width="100%" $style="dotted" />

              <PlansGrid>
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    $selected={plan.id === selectedPlanId}
                    style={{ padding: "0.9rem", cursor: "pointer" }}
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
                    <ItemTitle>{plan.name}</ItemTitle>
                    <Price>
                      {Number(plan.price).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                      <span style={{ fontSize: "0.78rem", fontWeight: 500 }}> / mes</span>
                    </Price>
                    <Separator $margin="0.75rem 0" $width="100%" $style="dotted" />

                    {plan.features.map((feature) => (
                      <Bullet key={feature}>- {feature}</Bullet>
                    ))}
                  </PlanCard>
                ))}
              </PlansGrid>
            </Card>

            <Card>
              <ItemTitle>Recursos adicionais</ItemTitle>
              <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.35rem" }}>
                Adicione ou remova recursos extras fora do plano selecionado.
              </div>
              <Separator $margin="0.75rem 0" $width="100%" $style="dotted" />

              {availableExtras.length === 0 ? (
                <div style={{ fontSize: "0.82rem", color: "#6b7280" }}>
                  Todos os recursos adicionais já estão inclusos no plano selecionado.
                </div>
              ) : (
                <OptionsGrid>
                  {availableExtras.map((feature) => (
                    <OptionItem key={feature.id}>
                      <input
                        type="checkbox"
                        checked={selectedExtras.includes(feature.name)}
                        onChange={() => toggleExtra(feature.name)}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", gap: "0.5rem" }}>
                        <span>{feature.name}</span>
                        <span style={{ fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }}>
                          + {formatCurrency(feature.price)}
                        </span>
                      </div>
                    </OptionItem>
                  ))}
                </OptionsGrid>
              )}
            </Card>

            <Card>
              <ItemTitle>Resumo da assinatura</ItemTitle>
              <Separator $margin="0.75rem 0" $width="100%" $style="dotted" />

              <div style={{ fontSize: "0.9rem", color: "#111827", marginBottom: "0.8rem" }}>
                <strong>Plano selecionado:</strong> {selectedPlan ? selectedPlan.name : "-"} ({formatCurrency(planPrice)}/mes)
              </div>
              <div style={{ fontSize: "0.9rem", color: "#111827", marginBottom: "0.6rem" }}>
                <strong>Adicionais selecionados:</strong>
              </div>
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.75rem",
                  background: "#f9fafb",
                  padding: "0.75rem",
                  marginBottom: "0.8rem",
                }}
              >
                {selectedExtraItems.length === 0 ? (
                  <div style={{ fontSize: "0.82rem", color: "#6b7280" }}>
                    Nenhum adicional selecionado.
                  </div>
                ) : (
                  selectedExtraItems.map((item, index) => (
                    <div
                      key={item.id}
                      style={{
                        fontSize: "0.82rem",
                        color: "#374151",
                        padding: "0.35rem 0",
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "0.5rem",
                        borderBottom:
                          index !== selectedExtraItems.length - 1 ? "1px solid #e5e7eb" : "none",
                      }}
                    >
                      <span>{item.name}</span>
                      <strong>+ {formatCurrency(item.price)}</strong>
                    </div>
                  ))
                )}
              </div>

              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.75rem",
                  background: "#f9fafb",
                  padding: "0.75rem",
                  marginBottom: "0.8rem",
                }}
              >
                {finalFeatures.length === 0 ? (
                  <div style={{ fontSize: "0.82rem", color: "#6b7280" }}>
                    Nenhum recurso selecionado.
                  </div>
                ) : (
                  finalFeatures.map((feature, index) => (
                    <div
                      key={feature}
                      style={{
                        fontSize: "0.82rem",
                        color: "#374151",
                        padding: "0.35rem 0",
                        borderBottom:
                          index !== finalFeatures.length - 1 ? "1px solid #e5e7eb" : "none",
                      }}
                    >
                      - {feature}
                    </div>
                  ))
                )}
              </div>

              <div
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: "0.75rem",
                  background: "#ffffff",
                  padding: "0.75rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#374151", marginBottom: "0.35rem" }}>
                  <span>Plano ({selectedPlan ? selectedPlan.name : "-"})</span>
                  <strong>{formatCurrency(planPrice)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#374151", marginBottom: "0.35rem" }}>
                  <span>Recursos adicionais ({selectedExtraItems.length})</span>
                  <strong>{formatCurrency(extrasTotal)}</strong>
                </div>
                <Separator $margin="0.5rem 0" $width="100%" $style="dotted" />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", color: "#111827" }}>
                  <strong>Total final da assinatura</strong>
                  <strong>{formatCurrency(finalPrice)}/mes</strong>
                </div>
              </div>

              <Actions>
                <Button
                  variant="confirm"
                  style={{ marginTop: "1rem", fontSize: "0.8rem" }}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Salvando..." : "Salvar nova assinatura"}
                </Button>
              </Actions>
            </Card>
          </PageContent>
        </Sidebar>
      </Container>
      <ToastContainer containerId="change-subscription" position="top-right" autoClose={3000} />
    </>
  );
}

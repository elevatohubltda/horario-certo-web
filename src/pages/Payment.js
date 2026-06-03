import React, { useCallback, useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import Cookies from "js-cookie";

import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";
import { Container } from "../components/container/style";
import { Button } from "../components/button";
import { Separator } from "../components/separator/style";
import { Title } from "../components/title";
import { isMobile } from "../util/util";
import { useNavigate } from "react-router-dom";
import { getPayment, validatePayment } from "../services/endpoints/payment";
import { toast } from "react-toastify";

/* ================= ANIMATIONS ================= */

const shimmer = keyframes`
  0% { background-position: -450px 0; }
  100% { background-position: 450px 0; }
`;

/* ================= STYLES ================= */

const InvoiceCard = styled(Container)`
  width: ${(props) => props.width || "100%"};
  margin: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${(props) => props.background};
  border-radius: ${(props) => props.borderradius || "1rem"};
  padding: 1.25rem;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    height: auto;
  }
`;

const PageGrid = styled.div`
  width: calc(100% - 2rem);
  margin: 0 1rem 1rem;
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActionsRow = styled.div`
  width: calc(100% - 2rem);
  margin: 0 1rem 1rem;
  display: flex;
  justify-content: flex-end;
`;

const SectionCard = styled(Container)`
  width: 100%;
  margin: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  background: ${(props) => props.background || "#fff"};
  border-radius: ${(props) => props.borderradius || "1rem"};
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    height: auto;
  }
`;

const FullWidthCard = styled(SectionCard)`
  grid-column: 1 / -1;
`;

const HistoryItem = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #f9fafb;
  padding: 0.75rem;
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const HistoryStatus = styled.span`
  display: inline-block;
  margin-top: 0.4rem;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  background: ${(props) => (props.$paid ? "#ecfdf5" : "#fff7ed")};
  color: ${(props) => (props.$paid ? "#065f46" : "#9a3412")};
  border: 1px solid ${(props) => (props.$paid ? "#6ee7b7" : "#fed7aa")};
`;

const PlanInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PlanInfoItem = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #f9fafb;
  padding: 0.75rem;
  font-size: 0.82rem;
  color: #374151;
`;

const FeatureList = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  font-size: 0.8rem;
  color: #374151;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  font-size: 0.85rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const QRCodeBox = styled.div`
  margin: 1.5rem auto 0.75rem;
  padding: 1rem;
  background: #f8f8f8;
  border-radius: 0.75rem;
  width: fit-content;
`;

const QRCode = styled.img`
  width: 160px;
  height: 160px;
`;

const Timer = styled.div`
  text-align: center;
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 1rem;
`;

const PixCopyBox = styled.div`
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 0.75rem;
  padding: 1rem;
  font-size: 0.75rem;
`;

const PixCode = styled.div`
  word-break: break-word;
  margin-bottom: 0.75rem;
`;

const CopyButton = styled.button`
  width: 100%;
  background: #111827;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
`;

const InlineFeedback = styled.div`
  text-align: center;
  font-size: 0.75rem;
  color: #16a34a;
  margin-top: 0.5rem;
`;

const BadgeWaiting = styled.div`
  display: inline-block;
  background: #fff7ed;
  color: #9a3412;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  border: 1px solid #fed7aa;
  width: fit-content;
`;

const Skeleton = styled.div`
  height: ${(props) => props.height || "1rem"};
  width: ${(props) => props.width || "100%"};
  border-radius: 0.5rem;
  background: linear-gradient(
    90deg,
    #e5e7eb 25%,
    #f3f4f6 37%,
    #e5e7eb 63%
  );
  background-size: 400% 100%;
  animation: ${shimmer} 1.4s ease infinite;
`;

const ButtonSkeleton = styled.div`
  width: 100%;
  margin-top: 1.5rem;
  height: 31px;
  border-radius: 0.5rem;
  background: linear-gradient(
    90deg,
    #e5e7eb 25%,
    #f3f4f6 37%,
    #e5e7eb 63%
  );
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;

  @keyframes shimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }
`;

const BadgeTrial = styled.div`
  display: inline-block;
  background: #eff6ff;
  color: #1d4ed8;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  border: 1px solid #bfdbfe;
`;



/* ================= PAGE ================= */

function Payment() {
  const companyInfo = JSON.parse(Cookies.get("companyInfo"));
  const companyUrl = Cookies.get("companyUrl");
  const mobile = isMobile();
  const navigate = useNavigate();

  const [paymentProps, setPaymentProps] = useState(null);

  const hasPayment = paymentProps?.status === "paid" || paymentProps?.status === "pending";
  const isPaid = hasPayment && paymentProps?.status === "paid";

  const getRemainingTime = useCallback(() => {
    if (!paymentProps?.dateExpiration) return 0;
    const target = new Date(paymentProps?.dateExpiration).getTime();
    return Math.max(Math.floor((target - Date.now()) / 1000), 0);
  }, [paymentProps?.dateExpiration]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }

    return `${minutes}m ${seconds}s`;
  };

  const [timeLeft, setTimeLeft] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);

  const fetchPaymentData = useCallback(async () => {
    try {
      const response = await getPayment(companyUrl);
      setPaymentProps(response.data);
    } catch (error) {
      console.error("Erro ao buscar informações de pagamento:", error);
    }
  }, [companyUrl]);

  useEffect(() => {
    const load = async () => {
      await fetchPaymentData();
      setLoading(false);
    };

    load();
  }, [fetchPaymentData]);

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getRemainingTime()), 1000);
    return () => clearInterval(interval);
  }, [getRemainingTime]);

  const handleConfirmPayment = async () => {
    if (isConfirming || !paymentProps?.paymentId) return;

    try {
      setIsConfirming(true);
      await validatePayment(paymentProps.paymentId, companyUrl);
      await fetchPaymentData();
    } catch (error) {
      if (error?.response?.status === 402) {
        toast.error(error?.response?.data?.message || error?.response?.message || "Pagamento ainda não confirmado");
      }
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCopyPix = async () => {
    await navigator.clipboard.writeText(paymentProps?.pixCopyPaste);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseLocalDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return new Date(year, month - 1, day);
  };

  const TRIAL_DAYS = 14;

  const getTrialDaysLeft = () => {
    if (!paymentProps?.subscriptionDate) return TRIAL_DAYS;

    const startDate = parseLocalDate(paymentProps?.subscriptionDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + TRIAL_DAYS);

    const diffMs = endDate.getTime() - Date.now();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return Math.max(diffDays, 0);
  };

  const trialDaysLeft = getTrialDaysLeft();

  const trialEndDate = paymentProps?.subscriptionDate
  ? (() => {
      const startDate = parseLocalDate(paymentProps?.subscriptionDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + TRIAL_DAYS);
      return endDate;
    })()
  : null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-");
    if (!year || !month || !day) return "-";
    return `${day}/${month}/${year}`;
  };

  const formatAmount = (amount) => {
    return Number(amount).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const invoiceHistory = paymentProps?.invoiceHistory || [];

  const latestInvoices = invoiceHistory.slice(0, 4);

  return (
    <>
      <Topbar {...companyInfo} loggedIn />

      <Container
        $width="100%"
        $display="flex"
        $flexdirection="column"
        $backgroundcolor="#fff"
        $boxshadow="none"
        $margin="0"
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
            Assinatura
          </Title>

          <Separator
            $width="calc(100% - 2rem)"
            $bordercolor="var(--color-olive)"
            $margin="0 1rem 1rem 1rem"
            $style="dotted"
          />

          <ActionsRow>
            <Button
              variant="confirm"
              style={{ 
                fontSize: "0.8rem", 
                padding: "0.5rem 1rem", 
                borderRadius: "999px",
                background: "transparent",
                color: "var(--color-dark)",
                border: "1px solid var(--color-dark)", 
              }}
              onClick={() => navigate("/mudar-assinatura")}
            >
              Mudar assinatura
            </Button>
          </ActionsRow>

          <PageGrid>
            <InvoiceCard
              width="100%"
              background="#ffffff"
              borderradius={mobile ? "1rem" : "0 1rem 2rem 1rem"}
            >
              {loading ? (
                <>
                  <Skeleton height="1.2rem" width="100%" />
                  <Separator $margin="1rem 0" $width="100%" $style="dotted" />
                  <Skeleton height="6rem" width="100%" />
                </>
              ) : hasPayment ? (
                <>
                  <Title $fontsize="1.2rem">
                    Fatura #{paymentProps?.paymentId}
                  </Title>

                  <BadgeWaiting
                    style={
                      isPaid
                        ? {
                            background: "#ecfdf5",
                            color: "#065f46",
                            border: "1px solid #6ee7b7",
                          }
                        : {}
                    }
                  >
                    {isPaid ? "Fatura paga" : "Aguardando pagamento"}
                  </BadgeWaiting>
                  <Separator $margin="1rem 0" $width="100%" $style="dotted"/>
                  <InfoGrid>
                    <div>
                      <strong>Plano</strong>
                      <br />
                      {paymentProps?.plan}
                    </div>
                    <div>
                      <strong>Forma de pagamento</strong>
                      <br />
                      {paymentProps?.paymentMethod}
                    </div>
                    {isPaid ? (
                      <>
                        <div>
                          <strong>Data do pagamento</strong>
                          <br />
                          {formatDate(paymentProps?.paymentDate)}
                        </div>
                        <div>
                          <strong>Próximo vencimento</strong>
                          <br />
                          {formatDate(paymentProps?.nextDueDate)}
                        </div>
                      </>
                    ) : (
                      <div>
                        <strong>Data vencimento</strong>
                        <br />
                        {formatDate(paymentProps?.nextDueDate)}
                      </div>
                    )}
                  </InfoGrid>

                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      marginTop: "1rem",
                    }}
                  >
                    {formatAmount(paymentProps?.amount)}
                  </div>

                  {!isPaid ? (
                    <>
                      <QRCodeBox>
                        <QRCode
                          src={`data:image/png;base64,${paymentProps?.qrCodeBase64}`}
                        />
                      </QRCodeBox>

                      <Timer>
                        {timeLeft > 0
                          ? `Expira em ${formatTime(timeLeft)}`
                          : "QR Code expirado"}
                      </Timer>

                      <PixCopyBox>
                        <PixCode>{paymentProps?.pixCopyPaste}</PixCode>
                        <CopyButton onClick={handleCopyPix}>
                          Copiar código PIX
                        </CopyButton>
                        {copied && (
                          <InlineFeedback>Codigo copiado</InlineFeedback>
                        )}
                      </PixCopyBox>

                      {isConfirming ? (
                        <ButtonSkeleton />
                      ) : (
                        <Button
                          style={{ marginTop: "1.5rem", width: "100%" }}
                          variant="confirm"
                          onClick={handleConfirmPayment}
                          disabled={timeLeft <= 0}
                        >
                          Ja fiz o pagamento
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Separator $margin="1.5rem 0" $width="100%" $style="dotted" />

                      <div
                        style={{
                          textAlign: "center",
                          fontSize: "1rem",
                          fontWeight: 600,
                          color: "#065f46",
                        }}
                      >
                        Pagamento confirmado com sucesso
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Title $fontsize="1.2rem" $margin="1rem 0">Periodo de teste gratuito</Title>

                  <BadgeTrial>
                    Teste gratis ativo • faltam {trialDaysLeft} dia{trialDaysLeft !== 1 ? "s" : ""}
                  </BadgeTrial>

                  <Separator $margin="1rem 0" $width="100%" $style="dotted" />

                  <InfoGrid>
                    <div>
                      <strong>Plano</strong>
                      <br />
                      {paymentProps?.plan}
                    </div>

                    <div>
                      <strong>Forma de pagamento</strong>
                      <br />
                      {paymentProps?.paymentMethod}
                    </div>

                    <div>
                      <strong>Data de assinatura</strong>
                      <br />
                      {formatDate(paymentProps?.subscriptionDate)}
                    </div>

                    <div>
                      <strong>Fim do teste</strong>
                      <br />
                      {trialEndDate ? trialEndDate.toLocaleDateString("pt-BR") : "-"}
                    </div>
                  </InfoGrid>

                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      marginTop: "1rem",
                    }}
                  >
                    {formatAmount(paymentProps?.amount)}
                  </div>
                </>
              )}
            </InvoiceCard>

            <SectionCard background="#fff" borderradius="1rem">
              <Title $fontsize="1.1rem" $margin="0 0 1rem 0">
                Ultimas faturas
              </Title>
              <Separator $margin="0 0 1rem 0" $width="100%" $style="dotted"/>

              {latestInvoices.length === 0 ? (
                <div
                  style={{
                    border: "1px dashed #d1d5db",
                    borderRadius: "0.75rem",
                    background: "#f9fafb",
                    padding: "1rem",
                    fontSize: "0.82rem",
                    color: "#6b7280",
                  }}
                >
                  Nenhuma fatura encontrada ate o momento. Assim que houver cobrancas, o historico sera exibido aqui.
                </div>
              ) : (
                latestInvoices.map((invoice) => (
                  <HistoryItem key={invoice.id}>
                    <div style={{ fontSize: "0.82rem", color: "#6b7280" }}>
                      Fatura #{invoice.id}
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 700, marginTop: "0.25rem" }}>
                      {formatAmount(invoice.amount)}
                    </div>
                    <div style={{ fontSize: "0.78rem", marginTop: "0.4rem", color: "#374151" }}>
                      Vencimento: {formatDate(invoice.dueDate)}
                    </div>
                    <div style={{ fontSize: "0.78rem", marginTop: "0.2rem", color: "#374151" }}>
                      Pagamento: {formatDate(invoice.paidDate)}
                    </div>
                    <HistoryStatus $paid={invoice.status === "paid"}>
                      {invoice.status === "paid" ? "Pago" : "Pendente"}
                    </HistoryStatus>
                  </HistoryItem>
                ))
              )}
            </SectionCard>

            <FullWidthCard background="#fff" borderradius="1rem">
              <Title $fontsize="1.1rem" $margin="0 0 1rem 0">
                Informacoes do plano
              </Title>
              <Separator $margin="0 0 1rem 0" $width="100%" $style="dotted"/>
              <PlanInfoGrid>
                <PlanInfoItem>
                  <strong>Plano contratado</strong>
                  <br />
                  {paymentProps?.plan}
                </PlanInfoItem>
                <PlanInfoItem>
                  <strong>Forma de pagamento</strong>
                  <br />
                  {paymentProps?.paymentMethod}
                </PlanInfoItem>
                <PlanInfoItem>
                  <strong>Data base de assinatura</strong>
                  <br />
                  {formatDate(paymentProps?.subscriptionDate)}
                </PlanInfoItem>
                <PlanInfoItem>
                  <strong>Status atual</strong>
                  <br />
                  {paymentProps?.status === "paid" ? "Pago" : paymentProps?.status === "pending" ? "Pendente" : "Teste"}
                </PlanInfoItem>
                {paymentProps?.discountDisplay && (
                  <PlanInfoItem style={{ gridColumn: "1 / -1" }}>
                    <strong>Desconto aplicado</strong>
                    <br />
                    <span style={{ color: "#16a34a", fontWeight: 600 }}>
                      {paymentProps.discountDisplay}
                    </span>
                  </PlanInfoItem>
                )}
              </PlanInfoGrid>

              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                }}
              >
                Recursos inclusos no plano
              </div>

              <FeatureList>
                {paymentProps?.features.map((item, index) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.35rem 0",
                      borderBottom:
                        index !== paymentProps?.features.length - 1 ? "1px solid #e5e7eb" : "none",
                    }}
                  >
                    <span
                      style={{
                        color: "#16a34a",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                      }}
                    >
                      ✓
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </FeatureList>
            </FullWidthCard>
          </PageGrid>
        </Sidebar>
      </Container>
    </>
  );
}

export default Payment;

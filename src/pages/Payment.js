import React, { useCallback, useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import Cookies from "js-cookie";

import { Container } from "../components/container/style";
import { Clock } from "lucide-react";
import { Field, Input, Modal, Notice, PageLayout, Select, Button as UiButton } from "../components/admin";
import { Button } from "../components/button";
import { Separator } from "../components/separator/style";
import { Title } from "../components/title";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getPayment,
  validatePayment,
  getClientStatus,
  generateOverdueInvoice,
  createCardSubscription,
  subscribeNow,
  cancelCardSubscription,
  openCardPortal,
  cancelSubscription,
  reactivateSubscription,
} from "../services/endpoints/payment";
import { toast } from "react-toastify";

// Cobrança automática no cartão (Stripe) aparece só com REACT_APP_CARD_PAYMENT_ENABLED=true na Vercel
const CARD_PAYMENT_ENABLED = process.env.REACT_APP_CARD_PAYMENT_ENABLED === "true";

// Id da Stripe é longo (pi_3Qx...): mostra só o final, como um número de fatura
export const invoiceNumber = (paymentId) => {
  const id = String(paymentId ?? "");
  return id.startsWith("pi_") ? id.slice(-8).toUpperCase() : id;
};

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
  background: #fff;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  padding: 1.25rem;
  box-shadow: var(--ui-card-shadow);

  @media (max-width: 768px) {
    height: auto;
  }
`;

const PageGrid = styled.div`
  width: 100%;
  margin: 0 0 1rem;
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SectionCard = styled(Container)`
  width: 100%;
  margin: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  background: #fff;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  box-shadow: var(--ui-card-shadow);

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

const SubscribeNowBox = styled.div`
  display: grid;
  gap: 0.5rem;
  justify-items: start;
  margin-top: 1.25rem;
  padding: 1rem;
  border-radius: var(--ui-radius-sm);
  background: var(--ui-accent-soft);
  border: 1px solid #f6d49a;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--ui-text-secondary);

  strong {
    color: var(--ui-text);
  }
`;

const PendingTag = styled.span`
  margin-left: auto;
  padding: 0.1rem 0.55rem;
  border-radius: 999px;
  background: var(--ui-accent-soft);
  color: var(--ui-accent-ink);
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;
`;

const CANCEL_REASONS = [
  "O preço não cabe no meu orçamento",
  "Não usei o suficiente",
  "Faltou um recurso que eu preciso",
  "Vou usar outro sistema",
  "Encerrei ou pausei as atividades",
  "Outro motivo",
];

const CancelOption = styled.label`
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  padding: 0.75rem;
  border: 1px solid ${({ $checked }) => ($checked ? "var(--ui-primary)" : "var(--ui-border)")};
  border-radius: var(--ui-radius-sm);
  font-size: 0.85rem;
  color: var(--ui-text-secondary);
  cursor: pointer;

  input {
    accent-color: var(--ui-primary);
    margin-top: 0.2rem;
  }

  strong {
    display: block;
    color: var(--ui-text);
  }
`;

const CopyButton = styled.button`
  width: 100%;
  background: var(--ui-primary);
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
  align-self: flex-start;
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

const CardActionButton = styled.button`
  width: fit-content;
  background: ${(props) => (props.$outline ? "transparent" : "var(--ui-primary)")};
  color: ${(props) => (props.$outline ? "var(--ui-text)" : "#fff")};
  border: 1px solid ${(props) => (props.$outline ? "var(--ui-input-border)" : "var(--ui-primary)")};
  border-radius: 999px;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const CardNotice = styled.div`
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #9a3412;
  border-radius: 0.75rem;
  padding: 0.75rem;
  font-size: 0.82rem;
  margin-bottom: 0.75rem;
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
  width: fit-content;
  align-self: flex-start;
`;



/* ================= PAGE ================= */

function Payment() {
  const companyUrl = Cookies.get("companyUrl");
  const navigate = useNavigate();

  const [paymentProps, setPaymentProps] = useState(null);
  const [clientStatus, setClientStatus] = useState(null);
  const [isGeneratingOverdue, setIsGeneratingOverdue] = useState(false);
  const [isUpdatingCard, setIsUpdatingCard] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  // A Stripe devolve com ?cartao=ok após o cadastro do cartão
  const [returnedFromCheckout] = useState(() => searchParams.has("cartao"));

  const cardStatus = paymentProps?.cardSubscriptionStatus;
  // Só pela Stripe dá para trocar o cartão pelo portal
  const canManageCard = paymentProps?.cardProvider === "STRIPE";
  // No teste grátis os recursos de WhatsApp aparecem, mas só funcionam após a primeira mensalidade
  const isWhatsAppPending = (feature) => paymentProps?.whatsappAvailable === false && /whatsapp/i.test(feature);
  const isCardActive = cardStatus === "authorized";

  const hasPayment = paymentProps?.status === "paid" || paymentProps?.status === "pending";
  const isPaid = hasPayment && paymentProps?.status === "paid";
  const isBlocked = clientStatus?.badge === "error";
  const showOverdueButton = isBlocked && paymentProps?.status !== "pending";

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

  const fetchClientStatus = useCallback(async () => {
    try {
      const response = await getClientStatus(companyUrl);
      setClientStatus(response.data);
    } catch (error) {
      console.error("Erro ao buscar status do cliente:", error);
    }
  }, [companyUrl]);

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchPaymentData(), fetchClientStatus()]);
      setLoading(false);
    };

    load();
  }, [fetchPaymentData, fetchClientStatus]);

  useEffect(() => {
    if (!returnedFromCheckout) return;
    toast.info("Recebemos seu cartão! A confirmação pode levar alguns instantes.");
    setSearchParams({}, { replace: true });
  }, [returnedFromCheckout, setSearchParams]);

  const [isSubscribing, setIsSubscribing] = useState(false);
  // Quem ainda não pagou nada pode encerrar o teste e assinar já (libera o WhatsApp assim que o Pix for pago)
  const canSubscribeNow = paymentProps?.status === "trial" && paymentProps?.whatsappAvailable === false && !isCardActive && !paymentProps?.cancelRequestedAt;
  // Cupom de 1ª mensalidade grátis ainda não usado: assinar não gera Pix
  const firstMonthFree = Boolean(paymentProps?.firstMonthFree);

  // Primeira mensalidade: escolha entre Pix e cartão (o cartão só aparece com a cobrança no cartão ligada)
  const canChoosePaymentMethod = CARD_PAYMENT_ENABLED && !firstMonthFree;
  const [payChoiceOpen, setPayChoiceOpen] = useState(false);
  const [payChoice, setPayChoice] = useState("card");

  const handleSubscribeNow = () => {
    if (isSubscribing) return;
    if (canChoosePaymentMethod) {
      setPayChoice("card");
      setPayChoiceOpen(true);
      return;
    }
    const dueDay = new Date().getDate();
    const question = firstMonthFree
      ? `Encerrar o teste grátis e ativar a assinatura agora? Seu cupom cobre a 1ª mensalidade e as próximas passam a vencer todo dia ${dueDay}.`
      : `Encerrar o teste grátis e gerar agora o Pix da primeira mensalidade? A partir do pagamento, sua mensalidade passa a vencer todo dia ${dueDay}.`;
    if (!window.confirm(question)) return;
    startSubscriptionWithPix();
  };

  const handleConfirmPayChoice = async () => {
    if (isSubscribing) return;
    if (payChoice === "pix") {
      setPayChoiceOpen(false);
      startSubscriptionWithPix();
      return;
    }
    try {
      setIsSubscribing(true);
      const response = await createCardSubscription(companyUrl, true);
      window.location.href = response.data.initPoint;
    } catch (error) {
      toast.error(error?.response?.data || "Não foi possível abrir o pagamento com cartão");
      setIsSubscribing(false);
    }
  };

  const startSubscriptionWithPix = async () => {
    try {
      setIsSubscribing(true);
      const response = await subscribeNow(companyUrl);
      await Promise.all([fetchPaymentData(), fetchClientStatus()]);
      toast.success(
        response?.data?.status === "approved"
          ? "Assinatura ativada! A 1ª mensalidade é por conta do cupom e o WhatsApp já está liberado."
          : "Pix gerado! Assim que o pagamento for confirmado, sua assinatura e o WhatsApp são ativados."
      );
    } catch (error) {
      toast.error(error?.response?.data || "Não foi possível gerar o Pix da assinatura");
    } finally {
      setIsSubscribing(false);
    }
  };

  // Cancelamento da assinatura
  const isCancelled = Boolean(paymentProps?.cancelRequestedAt);
  const refundableAmount = paymentProps?.refundableAmount;
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelDetail, setCancelDetail] = useState("");
  const [cancelWithRefund, setCancelWithRefund] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const openCancel = () => {
    setCancelReason("");
    setCancelDetail("");
    setCancelWithRefund(false);
    setCancelOpen(true);
  };

  const handleCancelSubscription = async () => {
    if (isCancelling) return;
    const reason = [cancelReason, cancelDetail.trim()].filter(Boolean).join(" · ");
    try {
      setIsCancelling(true);
      await cancelSubscription(companyUrl, { reason, refund: cancelWithRefund });
      setCancelOpen(false);
      await Promise.all([fetchPaymentData(), fetchClientStatus()]);
      toast.success(
        cancelWithRefund
          ? "Assinatura cancelada. O reembolso foi solicitado e volta em até 10 dias úteis."
          : "Assinatura cancelada. Você continua usando até o fim do período."
      );
    } catch (error) {
      toast.error(error?.response?.data || "Não foi possível cancelar a assinatura");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReactivate = async () => {
    if (isCancelling) return;
    try {
      setIsCancelling(true);
      await reactivateSubscription(companyUrl);
      await Promise.all([fetchPaymentData(), fetchClientStatus()]);
      toast.success("Cancelamento desfeito. Sua assinatura continua normalmente.");
    } catch (error) {
      toast.error(error?.response?.data || "Não foi possível manter a assinatura");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleActivateCard = async () => {
    if (isUpdatingCard) return;
    try {
      setIsUpdatingCard(true);
      const response = await createCardSubscription(companyUrl);
      window.location.href = response.data.initPoint;
    } catch (error) {
      toast.error(error?.response?.data || "Erro ao ativar a cobrança no cartão");
      setIsUpdatingCard(false);
    }
  };

  const handleManageCard = async () => {
    if (isUpdatingCard) return;
    try {
      setIsUpdatingCard(true);
      const response = await openCardPortal(companyUrl);
      window.location.href = response.data.url;
    } catch (error) {
      toast.error(error?.response?.data || "Erro ao abrir a troca de cartão");
      setIsUpdatingCard(false);
    }
  };

  const handleCancelCard = async () => {
    if (isUpdatingCard) return;
    if (!window.confirm("Cancelar a cobrança automática no cartão? As próximas faturas serão geradas via Pix.")) return;
    try {
      setIsUpdatingCard(true);
      await cancelCardSubscription(companyUrl);
      toast.success("Cobrança no cartão cancelada. As próximas faturas serão via Pix.");
      await fetchPaymentData();
    } catch (error) {
      toast.error(error?.response?.data || "Erro ao cancelar a cobrança no cartão");
    } finally {
      setIsUpdatingCard(false);
    }
  };

  const handleGenerateOverdueInvoice = async () => {
    if (isGeneratingOverdue) return;
    try {
      setIsGeneratingOverdue(true);
      await generateOverdueInvoice(companyUrl);
      await Promise.all([fetchPaymentData(), fetchClientStatus()]);
    } catch (error) {
      toast.error(error?.response?.data || "Erro ao gerar fatura em atraso");
    } finally {
      setIsGeneratingOverdue(false);
    }
  };

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
      <PageLayout
        title="Assinatura"
        subtitle="Acompanhe seu plano, faturas e forma de pagamento."
        actions={
          <>
            <UiButton $variant="outline" onClick={() => navigate("/mudar-assinatura")}>
              Mudar assinatura
            </UiButton>
            {showOverdueButton && (
              <UiButton $variant="danger" onClick={handleGenerateOverdueInvoice} disabled={isGeneratingOverdue}>
                {isGeneratingOverdue ? "Gerando..." : "Gerar fatura em atraso"}
              </UiButton>
            )}
          </>
        }
      >

          <PageGrid>
            <InvoiceCard width="100%">
              {loading ? (
                <>
                  <Skeleton height="1.2rem" width="100%" />
                  <Separator $margin="1rem 0" $width="100%" $style="dotted" />
                  <Skeleton height="6rem" width="100%" />
                </>
              ) : hasPayment ? (
                <>
                  <Title $fontsize="1.2rem">
                    Fatura #{invoiceNumber(paymentProps?.paymentId)}
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

                  {paymentProps?.lateFeeAmount && (
                    <div
                      style={{
                        marginTop: "0.75rem",
                        padding: "0.75rem",
                        background: "#fef2f2",
                        borderRadius: "0.5rem",
                        fontSize: "0.85rem",
                        color: "#991b1b",
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: "0.4rem" }}>
                        Encargos de mora
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Valor original</span>
                        <span>
                          {formatAmount(
                            Number(paymentProps.amount) -
                              Number(paymentProps.lateFeeAmount) -
                              Number(paymentProps.interestAmount)
                          )}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Multa por atraso (2%)</span>
                        <span>{formatAmount(paymentProps.lateFeeAmount)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Juros de mora (1% a.m. pro-rata)</span>
                        <span>{formatAmount(paymentProps.interestAmount)}</span>
                      </div>
                    </div>
                  )}

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
                          <InlineFeedback>Código copiado</InlineFeedback>
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
                  <Title $fontsize="1.2rem" $margin="1rem 0">Período de teste gratuito</Title>

                  <BadgeTrial>
                    Teste grátis ativo • faltam {trialDaysLeft} dia{trialDaysLeft !== 1 ? "s" : ""}
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

                  {canSubscribeNow && (
                    <SubscribeNowBox>
                      <strong>Não quer esperar o fim do teste?</strong>
                      {firstMonthFree ? (
                        <span>
                          Seu cupom cobre a 1ª mensalidade. Ative agora e o WhatsApp é liberado na hora, sem pagar nada.
                          As próximas mensalidades passam a vencer todo dia {new Date().getDate()}.
                        </span>
                      ) : (
                        <span>
                          Assine agora e libere o envio de mensagens pelo WhatsApp assim que o pagamento for confirmado.
                          O teste grátis termina e sua mensalidade passa a vencer todo dia {new Date().getDate()}.
                          {canChoosePaymentMethod && " Pague com Pix ou cartão de crédito."}
                        </span>
                      )}
                      <UiButton type="button" onClick={handleSubscribeNow} disabled={isSubscribing}>
                        {isSubscribing
                          ? firstMonthFree ? "Ativando..." : "Aguarde..."
                          : firstMonthFree ? "Ativar assinatura grátis" : `Assinar agora por ${formatAmount(paymentProps?.amount)}`}
                      </UiButton>
                    </SubscribeNowBox>
                  )}
                </>
              )}
            </InvoiceCard>

            <SectionCard>
              <Title $fontsize="1.1rem" $margin="0 0 1rem 0">
                Últimas faturas
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
                  Nenhuma fatura encontrada até o momento. Assim que houver cobranças, o histórico será exibido aqui.
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

            <FullWidthCard>
              <Title $fontsize="1.1rem" $margin="0 0 1rem 0">
                Forma de pagamento
              </Title>
              <Separator $margin="0 0 1rem 0" $width="100%" $style="dotted"/>

              {loading ? (
                <Skeleton height="3rem" width="100%" />
              ) : isCancelled ? (
                <div style={{ fontSize: "0.85rem", color: "#374151" }}>
                  Sua assinatura está cancelada: nenhuma cobrança nova será feita.
                </div>
              ) : isCardActive ? (
                <>
                  <BadgeWaiting
                    style={{ background: "#ecfdf5", color: "#065f46", border: "1px solid #6ee7b7" }}
                  >
                    Cobrança automática no cartão ativa
                  </BadgeWaiting>
                  <div style={{ fontSize: "0.85rem", color: "#374151", margin: "0.75rem 0" }}>
                    Sua mensalidade é cobrada todo mês no cartão de crédito. Você não precisa gerar nem pagar faturas.
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {canManageCard && (
                      <CardActionButton onClick={handleManageCard} disabled={isUpdatingCard}>
                        Trocar cartão
                      </CardActionButton>
                    )}
                    <CardActionButton $outline onClick={handleCancelCard} disabled={isUpdatingCard}>
                      {isUpdatingCard ? "Aguarde..." : "Voltar a pagar via Pix"}
                    </CardActionButton>
                  </div>
                </>
              ) : cardStatus === "paused" && canManageCard ? (
                <>
                  {/* Cartão recusado: a Stripe segue tentando cobrar; dá para trocar o cartão ou voltar ao Pix */}
                  <CardNotice>
                    Não conseguimos cobrar sua mensalidade no cartão (ele pode ter vencido ou sido recusado).
                    A Stripe tenta cobrar de novo nos próximos dias, mas o mais rápido é atualizar o cartão. Se a mensalidade
                    não for paga em até 3 dias após o vencimento, sua agenda é bloqueada e o valor passa a ter multa de 2% e
                    juros de 1% ao mês (no cartão, eles entram na cobrança seguinte).
                  </CardNotice>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
                    <CardActionButton onClick={handleManageCard} disabled={isUpdatingCard}>
                      {isUpdatingCard ? "Abrindo..." : "Atualizar cartão"}
                    </CardActionButton>
                    <CardActionButton $outline onClick={handleCancelCard} disabled={isUpdatingCard}>
                      Voltar a pagar via Pix
                    </CardActionButton>
                  </div>
                </>
              ) : (
                <>
                  {cardStatus === "paused" && (
                    <CardNotice>
                      A cobrança no cartão foi pausada (o cartão pode ter sido recusado).
                      Cadastre o cartão novamente ou pague a fatura via Pix.
                    </CardNotice>
                  )}
                  {cardStatus === "pending" && returnedFromCheckout && (
                    <CardNotice>
                      Estamos aguardando a confirmação do cartão. Atualize a página em alguns instantes.
                    </CardNotice>
                  )}
                  {CARD_PAYMENT_ENABLED ? (
                    <>
                      <div style={{ fontSize: "0.85rem", color: "#374151", marginBottom: "0.75rem" }}>
                        Hoje você paga via <strong>Pix</strong>, gerando a fatura todo mês. Ative a cobrança automática
                        no cartão de crédito e esqueça as faturas: a primeira cobrança acontece no seu próximo vencimento
                        (se houver fatura vencida, ela é cobrada na hora).
                        O cartão é cadastrado numa página segura da Stripe; o Horário Certo não vê nem guarda os dados dele.
                      </div>
                      <CardActionButton onClick={handleActivateCard} disabled={isUpdatingCard}>
                        {isUpdatingCard ? "Abrindo página segura..." : "Ativar cobrança automática no cartão"}
                      </CardActionButton>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: "0.85rem", color: "#374151", marginBottom: "0.75rem" }}>
                        Hoje você paga via <strong>Pix</strong>, gerando a fatura todo mês. Em breve você poderá
                        ativar a cobrança automática no cartão de crédito e esquecer as faturas.
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        <CardActionButton disabled>Cobrança automática no cartão</CardActionButton>
                        <BadgeTrial>Em breve</BadgeTrial>
                      </div>
                    </>
                  )}
                </>
              )}
            </FullWidthCard>

            <FullWidthCard>
              <Title $fontsize="1.1rem" $margin="0 0 1rem 0">
                Informações do plano
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

              {paymentProps?.whatsappAvailable === false && (
                <Notice>
                  <Clock size={18} />
                  <span>
                    <strong>O WhatsApp é liberado após a primeira mensalidade.</strong> {canSubscribeNow && "Se não quiser esperar o fim do teste, use o botão Assinar agora. "}Durante o teste grátis seus clientes não recebem confirmação, lembrete nem mensagem de retorno pelo WhatsApp. Assim que o pagamento da primeira mensalidade for confirmado, o envio começa automaticamente.
                  </span>
                </Notice>
              )}

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
                        color: isWhatsAppPending(item) ? "#9ca3af" : "#16a34a",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                      }}
                    >
                      ✓
                    </span>
                    <span>{item}</span>
                    {isWhatsAppPending(item) && <PendingTag>Após a 1ª mensalidade</PendingTag>}
                  </div>
                ))}
              </FeatureList>
            </FullWidthCard>

            {!loading && paymentProps && (
              <FullWidthCard>
                <Title $fontsize="1.1rem" $margin="0 0 1rem 0">
                  {isCancelled ? "Assinatura cancelada" : "Cancelar assinatura"}
                </Title>
                <Separator $margin="0 0 1rem 0" $width="100%" $style="dotted"/>

                {isCancelled ? (
                  <>
                    <Notice>
                      <Clock size={18} />
                      <span>
                        {paymentProps.refundRequested ? (
                          <>
                            <strong>Cancelada em {formatDate(paymentProps.cancelRequestedAt)}, com reembolso solicitado.</strong>{" "}
                            O valor volta pelo mesmo meio do pagamento em até 10 dias úteis. A agenda é desativada a partir de amanhã.
                          </>
                        ) : (
                          <>
                            <strong>Você usa normalmente até {formatDate(paymentProps.accessUntil)}.</strong>{" "}
                            Depois disso a agenda é desativada e nenhuma cobrança nova é feita.
                          </>
                        )}
                      </span>
                    </Notice>
                    {paymentProps.canReactivate && (
                      <UiButton type="button" onClick={handleReactivate} disabled={isCancelling}>
                        {isCancelling ? "Mantendo..." : "Manter minha assinatura"}
                      </UiButton>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: "0.85rem", color: "#374151", marginBottom: "0.75rem" }}>
                      Sem multa e sem fidelidade. Se cancelar, você continua usando até{" "}
                      <strong>{formatDate(paymentProps.cancelPreviewUntil)}</strong> e nenhuma cobrança nova é feita.
                      {refundableAmount && (
                        <> Como seu primeiro pagamento foi há menos de 7 dias, você também pode pedir o reembolso integral.</>
                      )}
                    </div>
                    <UiButton type="button" $variant="outline" onClick={openCancel}>
                      Cancelar assinatura
                    </UiButton>
                  </>
                )}
              </FullWidthCard>
            )}
          </PageGrid>

          <Modal
            open={payChoiceOpen}
            title="Como você quer pagar?"
            onClose={() => !isSubscribing && setPayChoiceOpen(false)}
            footer={
              <>
                <UiButton type="button" $variant="outline" onClick={() => setPayChoiceOpen(false)} disabled={isSubscribing}>
                  Voltar
                </UiButton>
                <UiButton type="button" onClick={handleConfirmPayChoice} disabled={isSubscribing}>
                  {isSubscribing
                    ? "Abrindo página segura..."
                    : payChoice === "card" ? "Continuar para o cartão" : "Gerar Pix"}
                </UiButton>
              </>
            }
          >
            <div style={{ fontSize: "0.85rem", color: "#374151" }}>
              Primeira mensalidade de <strong>{formatAmount(paymentProps?.amount)}</strong>. O teste grátis termina e sua
              mensalidade passa a vencer todo dia {new Date().getDate()}.
            </div>
            <div style={{ display: "grid", gap: "0.5rem" }}>
              <CancelOption $checked={payChoice === "card"}>
                <input type="radio" name="pay-choice" checked={payChoice === "card"} onChange={() => setPayChoice("card")} />
                <span>
                  <strong>Cartão de crédito</strong>
                  Cobrança automática todo mês, sem precisar gerar nem pagar faturas. O cartão é cadastrado numa página
                  segura da Stripe; o Horário Certo não vê nem guarda os dados dele.
                </span>
              </CancelOption>
              <CancelOption $checked={payChoice === "pix"}>
                <input type="radio" name="pay-choice" checked={payChoice === "pix"} onChange={() => setPayChoice("pix")} />
                <span>
                  <strong>Pix</strong>
                  Pague agora pelo QR Code. Todo mês geramos uma nova fatura Pix para você pagar até o vencimento.
                </span>
              </CancelOption>
            </div>
          </Modal>

          <Modal
            open={cancelOpen}
            title="Cancelar assinatura"
            onClose={() => !isCancelling && setCancelOpen(false)}
            footer={
              <>
                <UiButton type="button" $variant="outline" onClick={() => setCancelOpen(false)} disabled={isCancelling}>
                  Voltar
                </UiButton>
                <UiButton type="button" $variant="danger" onClick={handleCancelSubscription} disabled={isCancelling}>
                  {isCancelling ? "Cancelando..." : "Confirmar cancelamento"}
                </UiButton>
              </>
            }
          >
            <Field>
              Por que você está cancelando? (opcional)
              <Select value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}>
                <option value="">Prefiro não dizer</option>
                {CANCEL_REASONS.map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </Select>
            </Field>
            <Field>
              Quer contar mais? (opcional)
              <Input
                value={cancelDetail}
                maxLength={300}
                placeholder="Ex.: faltou lembrete por SMS"
                onChange={(e) => setCancelDetail(e.target.value)}
              />
            </Field>

            {refundableAmount ? (
              <div style={{ display: "grid", gap: "0.5rem" }}>
                <CancelOption $checked={!cancelWithRefund}>
                  <input type="radio" name="cancel-mode" checked={!cancelWithRefund} onChange={() => setCancelWithRefund(false)} />
                  <span>
                    <strong>Cancelar no fim do período</strong>
                    Você usa até {formatDate(paymentProps?.cancelPreviewUntil)} e não é mais cobrado.
                  </span>
                </CancelOption>
                <CancelOption $checked={cancelWithRefund}>
                  <input type="radio" name="cancel-mode" checked={cancelWithRefund} onChange={() => setCancelWithRefund(true)} />
                  <span>
                    <strong>Cancelar agora e receber {formatAmount(refundableAmount)} de volta</strong>
                    Direito de arrependimento: vale até 7 dias do primeiro pagamento. A agenda é desativada a partir de amanhã.
                  </span>
                </CancelOption>
              </div>
            ) : (
              <div style={{ fontSize: "0.85rem", color: "#374151" }}>
                Você continua usando até <strong>{formatDate(paymentProps?.cancelPreviewUntil)}</strong>. Depois disso a agenda
                é desativada e nenhuma cobrança nova é feita. Até lá, dá para desfazer o cancelamento por aqui.
              </div>
            )}
          </Modal>
      </PageLayout>
    </>
  );
}

export default Payment;

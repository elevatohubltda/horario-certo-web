import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import Cookies from "js-cookie";

import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";
import { Container } from "../components/container/style";
import { Button } from "../components/button";
import { Separator } from "../components/separator/style";
import { Title } from "../components/title";
import { isMobile } from "../util/util";

/* ================= MOCK ================= */

// PAID
// const PaymentProps = {
//     paymentId: 1343689865,
//     status: 'paid',
//     plan: 'Premium',
//     features: ['Agendamentos ilimitados', 'Gestão de horários em tempo real', 'Notificações automáticas para clientes', 'Dashboard completo de gestão', 'Suporte prioritário'],   
//     paymentMethod: 'PIX',
//     amount: 49.90,
//     paymentDate: '2026-01-11',
//     nextDueDate: '2026-02-11'
// };

// ACTIVE
const PaymentProps = {
    paymentId: 1343689865,
    dateExpiration: "2026-01-11T19:17:40.570-04:00",
    qrCodeBase64: "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",
    pixCopyPaste:
    "00020126580014br.gov.bcb.pix0136b76aa9c2-2ec4-4110-954e-ebfe34f05b61520400005303986540510.005802BR5908LUTqGvS_6007FoSiNga62230519mpqrinter132584451463049B58",
    status: 'pending',
    plan: 'Premium',
    features: ['Agendamentos ilimitados', 'Gestão de horários em tempo real', 'Notificações automáticas para clientes', 'Dashboard completo de gestão', 'Suporte prioritário'],   
    paymentMethod: 'PIX',
    amount: 49.90,
    nextDueDate: '2026-01-25'
};

//TEST
// const PaymentProps = {
//     subscriptionDate: "2026-01-11",
//     status: 'trial',
//     plan: 'Premium',
//     features: ['Agendamentos ilimitados', 'Gestão de horários em tempo real', 'Notificações automáticas para clientes', 'Dashboard completo de gestão', 'Suporte prioritário'],   
//     paymentMethod: 'PIX',
//     amount: 49.90
// };

/* ================= ANIMATIONS ================= */

const shimmer = keyframes`
  0% { background-position: -450px 0; }
  100% { background-position: 450px 0; }
`;

/* ================= STYLES ================= */

const InvoiceCard = styled(Container)`
  width: ${(props) => props.width || "100%"};
  margin: 1rem auto;
  background: ${(props) => props.background};
  border-radius: ${(props) => props.borderradius || "1rem"};
  padding: 1.25rem;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
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
  const mobile = isMobile();

  const hasPayment = PaymentProps.status === "paid" || PaymentProps.status === "pending";
  const isPaid = hasPayment && PaymentProps.status === "paid";

  const getRemainingTime = () => {
    const target = new Date(PaymentProps.dateExpiration).getTime();
    return Math.max(Math.floor((target - Date.now()) / 1000), 0);
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }

    return `${minutes}m ${seconds}s`;
  };

  const [timeLeft, setTimeLeft] = useState(getRemainingTime());
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
    const interval = setInterval(() => setTimeLeft(getRemainingTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleConfirmPayment = async () => {
    if (isConfirming) return;
    try {
      setIsConfirming(true);
      // chamada backend
    } catch {
      setIsConfirming(false);
    }
  };

  const handleCopyPix = async () => {
    await navigator.clipboard.writeText(PaymentProps.pixCopyPaste);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseLocalDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return new Date(year, month - 1, day);
  };

  const TRIAL_DAYS = 14;

  const getTrialDaysLeft = () => {
    if (!PaymentProps.subscriptionDate) return TRIAL_DAYS;

    const startDate = parseLocalDate(PaymentProps.subscriptionDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + TRIAL_DAYS);

    const diffMs = endDate.getTime() - Date.now();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return Math.max(diffDays, 0);
  };

  const trialDaysLeft = getTrialDaysLeft();

  const trialEndDate = PaymentProps.subscriptionDate
  ? (() => {
      const startDate = parseLocalDate(PaymentProps.subscriptionDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + TRIAL_DAYS);
      return endDate;
    })()
  : null;

  const Content = (
    <InvoiceCard
      width="90%"
      background={mobile ? "#ffffff" : "var(--color-background)"}
      borderradius={mobile ? "1rem" : "0 1rem 2rem 1rem"}
    >
      {loading ? (
        <>
          <Skeleton height="1.2rem" width="100%" />
          <Separator $margin="1rem 0" $width="100%" />
          <Skeleton height="6rem" width="100%" />
        </>
      ) : hasPayment ? (
        <>
          <Title $fontsize="1.2rem">
            Fatura #{PaymentProps.paymentId}
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

          <Separator $margin="1rem 0" $width="100%" />

          {/* DADOS FINANCEIROS — SEMPRE VISÍVEIS */}
          <InfoGrid>
            <div>
              <strong>Plano</strong>
              <br />
              Premium
            </div>
            <div>
              <strong>Forma de pagamento</strong>
              <br />
              {PaymentProps.paymentMethod}
            </div>
            {isPaid ? (
              <>
                <div>
                    <strong>Data do pagamento</strong>
                    <br />
                    {PaymentProps.paymentDate
                    ? (() => {
                        const [year, month, day] = PaymentProps.paymentDate.split("-");
                        return `${day}/${month}/${year}`;
                      })()
                    : "-"}
                </div>
                <div>
                  <strong>Próximo vencimento</strong>
                  <br />
                  {PaymentProps.nextDueDate
                  ? (() => {
                      const [year, month, day] = PaymentProps.nextDueDate.split("-");
                      return `${day}/${month}/${year}`;
                    })()
                  : "-"}
                </div>
              </>
            ) : (
              <div>
                  <strong>Data vencimento</strong>
                  <br />
                  {PaymentProps.nextDueDate
                  ? (() => {
                      const [year, month, day] = PaymentProps.nextDueDate.split("-");
                      return `${day}/${month}/${year}`;
                    })()
                  : "-"}
                </div>
            )
          }
          </InfoGrid>

          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              marginTop: "1rem",
            }}
          >
            {Number(PaymentProps.amount).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>

          {/* BLOCO CONDICIONAL */}
          {!isPaid ? (
            <>
              <QRCodeBox>
                <QRCode
                  src={`data:image/png;base64,${PaymentProps.qrCodeBase64}`}
                />
              </QRCodeBox>

              <Timer>
                {timeLeft > 0
                  ? `Expira em ${formatTime(timeLeft)}`
                  : "QR Code expirado"}
              </Timer>

              <PixCopyBox>
                <PixCode>{PaymentProps.pixCopyPaste}</PixCode>
                <CopyButton onClick={handleCopyPix}>
                  Copiar código PIX
                </CopyButton>
                {copied && (
                  <InlineFeedback>✔ Código copiado</InlineFeedback>
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
                  Já fiz o pagamento
                </Button>
              )}
              <Separator $margin="1.5rem 0" $width="100%" />
              <div
                  style={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      marginBottom: "0.75rem",
                  }}
              >
                  Recursos inclusos no seu plano
              </div>

              <div
                  style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.75rem",
                      padding: "0.75rem 1rem",
                      background: "#f9fafb",
                      fontSize: "0.8rem",
                      color: "#374151",
                  }}
              >
                {PaymentProps.features.map((item, index) => (
                  <div
                    key={index}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.35rem 0",
                        borderBottom:
                        index !== 4 ? "1px solid #e5e7eb" : "none",
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
              </div>
            </>
            
          ) : (
            <>
              <Separator $margin="1.5rem 0" $width="100%" />

              <div
                style={{
                  textAlign: "center",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "#065f46",
                }}
              >
                Pagamento confirmado com sucesso 🎉
              </div>

              <div
                style={{
                  textAlign: "center",
                  fontSize: "0.85rem",
                  marginTop: "0.75rem",
                  color: "#374151",
                }}
              >
                A <strong>Horário Certo</strong> agradece a sua confiança.
              </div>

              <div
                style={{
                  textAlign: "center",
                  fontSize: "0.8rem",
                  marginTop: "0.5rem",
                  color: "#6b7280",
                }}
              >
                Utilize nossos serviços no dia a dia para organizar seus
                horários, otimizar sua agenda e oferecer a melhor experiência
                para seus clientes.
              </div>

              <Separator $margin="1.5rem 0" $width="100%" />

              <div
                  style={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      marginBottom: "0.75rem",
                  }}
              >
                  Recursos inclusos no seu plano
              </div>

              <div
                  style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.75rem",
                      padding: "0.75rem 1rem",
                      background: "#f9fafb",
                      fontSize: "0.8rem",
                      color: "#374151",
                  }}
              >
                {PaymentProps.features.map((item, index) => (
                  <div
                    key={index}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.35rem 0",
                        borderBottom:
                        index !== 4 ? "1px solid #e5e7eb" : "none",
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

          <Separator $margin="1rem 0" $width="100%" />

          <InfoGrid>
            <div>
              <strong>Plano</strong>
              <br />
              {PaymentProps.plan}
            </div>

            <div>
              <strong>Forma de pagamento</strong>
              <br />
              {PaymentProps.paymentMethod}
            </div>

            <div>
              <strong>Data de assinatura</strong>
              <br />
              {PaymentProps.subscriptionDate
              ? (() => {
                  const [year, month, day] = PaymentProps.subscriptionDate.split("-");
                  return `${day}/${month}/${year}`;
                })()
              : "-"}
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
            {Number(PaymentProps.amount).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>

          <div
            style={{
              marginTop: "1rem",
              border: "1px solid #e5e7eb",
              borderRadius: "0.75rem",
              padding: "0.75rem 1rem",
              background: "#f9fafb",
              fontSize: "0.85rem",
              color: "#374151",
            }}
          >
            <strong>📌 Importante:</strong>
            <br />
            Nenhuma cobrança será feita durante o período de teste.
            <br />
            Quando o teste terminar, sua primeira fatura será gerada automaticamente e aparecerá aqui para pagamento via PIX.
          </div>

          <Separator $margin="1.5rem 0" $width="100%" />

          <div
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
            }}
          >
            Recursos inclusos no seu plano
          </div>

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "0.75rem",
              padding: "0.75rem 1rem",
              background: "#f9fafb",
              fontSize: "0.8rem",
              color: "#374151",
            }}
          >
            {PaymentProps.features.map((item, index) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.35rem 0",
                  borderBottom: index !== 4 ? "1px solid #e5e7eb" : "none",
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
          </div>
        </>
      )}
    </InvoiceCard>
  );

  return (
    <>
      <Topbar {...companyInfo} loggedIn />

      <Container
        $width="100%"
        $display="flex"
        $flexdirection="column"
        $backgroundcolor={mobile ? "var(--color-background)" : "#fff"}
        $boxshadow="none"
        $margin="0"
      >
        <Sidebar>
          {mobile ? (
            <div
              style={{
                background: "var(--color-background)",
                borderTopLeftRadius: "1rem",
                borderTopRightRadius: "1rem",
                padding: "2rem",
                minHeight: "calc(100dvh - 60px - 2rem)",
              }}
            >
              {Content}
            </div>
          ) : (
            Content
          )}
        </Sidebar>
      </Container>
    </>
  );
}

export default Payment;

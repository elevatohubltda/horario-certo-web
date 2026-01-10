import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from '../components/button';
import { Separator } from '../components/separator/style';
import { Container } from '../components/container/style';
import styled from 'styled-components';
import { isMobile } from '../util/util';
import Sidebar from '../components/sidebar';
import { Title } from '../components/title';
import Topbar from '../components/topbar';
import Cookies from "js-cookie";
import { Tag } from '../components/tag';
import { VerticalSeparator } from '../components/verticalSeparator/style';

const PixPaymentProps = {
  qrCodeBase64: "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",
  paymentId: 1343689865,
}

const QRCode = styled.img`
  width: 120px;
  height: 120px;
  margin: 16px auto;
`;

const Timer = styled.div`
    text-align: center;
    font-size: 14px;
    color: #555;
`;

const BenefitsList = styled.ul`
  list-style: none;
  padding: 0 2rem;
  margin: 16px 0;

  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BenefitItem = styled.li`
  position: relative;
  padding-left: 28px;
  font-size: 12px;
  color: #333;
  line-height: 1.4;

  &::before {
    content: "✔";
    position: absolute;
    left: 0;
    top: 0;
    color: #00b37e;
    font-weight: bold;
  }
`;

const Table = styled.table`
  width: 90%;
  border-collapse: collapse;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
`;

const Thead = styled.thead`
  background-color: #f5f5f5;
`;

const Th = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  color: #333;
  text-align: center;
`;

const Td = styled.td`
  padding: 12px 16px;
  font-size: 14px;
  color: #444;
  border-top: 1px solid #eaeaea;
  text-align: center;
`;

const paymentsHistory = [
    { month: '01/2026', status: 'pendente' },
    { month: '12/2025', status: 'paga' },
    { month: '11/2025', status: 'paga' },
];
// const paymentsHistory = [
// ];

const tagStatusStyle = {
    paga: { background: 'green', color: '#fff' },
    pendente: { background: 'yellow', color: '#000' },
    vencida: { background: 'red', color: '#fff' },
}

function Payment() {
    const EXPIRATION_TIME = 5 * 60; // 5 minutos em segundos
    const [timeLeft, setTimeLeft] = useState(EXPIRATION_TIME);
    const [loading, setLoading] = React.useState(false);
    const [mobile, setMobile] = React.useState();
    const [companyInfo, setCompanyInfo] = React.useState(
    JSON.parse(Cookies.get("companyInfo"))
    );

    useEffect(() => {
        setMobile(isMobile());
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, "0")}`;
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'paga':
                return 'green';
            case 'pendente':
                return 'yellow';
            case 'vencida':
                return 'red';
            default:
                return 'gray';
        }
    };

    return (
        <>
            <Topbar {...companyInfo} loggedIn />
            <Container
                $width={!mobile ? "100%" : "90%"}
                $display="flex"
                $flexdirection="column"
                $padding={!mobile ? "0" : "1rem"}
                $margin="0"
                $backgroundcolor="transparent"
                $borderradius="0"
            >
                <Sidebar>
                    {!loading  && (
                        <>
                            <Container
                                $width={!mobile ? "100%" : "90%"}
                                $display="grid"
                                $flexdirection="column"
                                $padding={!mobile ? "0" : "1rem"}
                                $margin="0"
                                $backgroundcolor="transparent"
                                $borderradius="0"
                                $boxshadow="none"
                            >
                                <Container
                                    $width="100%"
                                    $backgroundcolor="var(--color-background)"
                                    $borderradius="0 1rem 2rem 1rem"
                                    $padding="0"
                                    $display="flex"
                                    $flexdirection="column"
                                >
                                    <Title
                                        $padding="1rem"
                                        $margin="0"
                                        $fontweight="600"
                                        $fontsize="1.25rem"
                                        $color="var(--color-dark)"
                                        $texttransform="uppercase"
                                    >
                                        Minha assinatura
                                    </Title>

                                    <Separator
                                        $width="calc(100% - 2rem)"
                                        $bordercolor="var(--color-dark)"
                                        $margin="0 1rem 1rem 1rem"
                                    />
                                    <Container
                                        $width="100%"
                                        $backgroundcolor="transparent"
                                        $borderradius="0"
                                        $padding="0"
                                        $display="flex"
                                        $flexdirection="row"
                                        $margin="0"
                                        $boxshadow="0"
                                        $justifycontent="space-between"
                                    >
                                        <Container
                                            $width="70%"
                                            $backgroundcolor="transparent"
                                            $borderradius="0"
                                            $padding="1rem"
                                            $display="flex"
                                            $flexdirection="row"
                                            $alignitems="center"
                                            $margin="0"
                                            $boxshadow="0"
                                        >
                                            <Container
                                                $width="max-content"
                                                $backgroundcolor="transparent"
                                                $borderradius="0"
                                                $padding="1rem"
                                                $display="flex"
                                                $flexdirection="column"
                                                $margin="0"
                                                $boxshadow="none"
                                                $alignitems="center"
                                            >
                                                <span style={{ fontSize: '0.9rem' }}>
                                                    Valor: R$ 49,90<br/>
                                                    Forma de pagamento: PIX<br/>
                                                    ID do pagamento: {PixPaymentProps.paymentId}
                                                </span>
                                                <Button
                                                    style={{marginTop: '1rem'}}
                                                    disabled={timeLeft <= 0}
                                                    variant="confirm"
                                                    onClick={() => alert("Pagamento confirmado")}
                                                >
                                                    Já fiz o pagamento
                                                </Button>
                                            </Container>
                                            <Container
                                                $width="max-content"
                                                $backgroundcolor="transparent"
                                                $borderradius="0"
                                                $padding="1rem"
                                                $display="flex"
                                                $flexdirection="column"
                                                $margin="0"
                                                $boxshadow="0"
                                            >
                                                <QRCode
                                                    src={`data:image/png;base64,${PixPaymentProps.qrCodeBase64}`}
                                                    alt="QR Code PIX"
                                                />
                                                <Timer>
                                                    {timeLeft > 0
                                                    ? `Expira em ${formatTime(timeLeft)}`
                                                    : "QR Code expirado"}
                                                </Timer>
                                            </Container>
                                        </Container>
                                        <Container
                                            $width="30%"
                                            $height="--webkit-fill-available"
                                            $justifycontent="center"
                                            $alignitems="center"
                                            $backgroundcolor="transparent"
                                            $borderradius="0"
                                            $padding="1rem"
                                            $display="flex"
                                            $flexdirection="row"
                                            $margin="0"
                                            $boxshadow="none"
                                        >
                                            <VerticalSeparator 
                                                $margintop="0"
                                            />
                                            <span style={{ fontSize: '0.9rem', lineHeight: '2', textAlign: 'left', paddingLeft: '1rem', verticalAlign: 'center' }}>
                                                Plano: <b>PREMIUM</b><br/>
                                                Data de assinatura: 01/01/2026<br/>
                                                Data fim teste: 14/01/2026<br/>
                                                Data próxima fatura: 14/01/2026<br/>
                                                Status da assinatura: <span style={{ color: tagStatusStyle['paga'].background, fontWeight: '600'}}> ATIVA</span>
                                            </span>
                                        </Container>
                                    </Container>
                                </Container>
                            </Container>
                            <Container
                                $width={!mobile ? "100%" : "90%"}
                                $display="flex"
                                $flexdirection="row"
                                $padding={!mobile ? "0" : "1rem"}
                                $margin="0"
                                $backgroundcolor="transparent"
                                $borderradius="0"
                                $boxshadow="none"
                            >
                                <Container
                                    $width="calc(50% - 0.5rem)"
                                    $backgroundcolor="var(--color-background)"
                                    $borderradius="0 1rem 2rem 1rem"
                                    $padding="1rem 0"
                                    $display="flex"
                                    $flexdirection="column"
                                    $justifycontent="space-between"
                                >
                                    <Title
                                        $padding="1rem"
                                        $margin="0"
                                        $fontweight="600"
                                        $fontsize="0.8rem"
                                        $color="var(--color-dark)"
                                        $width="-webkit-fill-available"
                                        $align="center"
                                        $texttransform="uppercase"
                                    >
                                        Conteúdo da assinatura 
                                    </Title>
                                    <Separator
                                        $width="calc(100% - 6rem)"
                                        $bordercolor="rgba(0,0,0,0.15)"
                                        $margin="0 3rem 1rem 3rem"
                                    />
                                    <BenefitsList>
                                        <BenefitItem>Agenda para 1 colaborador</BenefitItem>
                                        <BenefitItem>Agendamento com duração fixa</BenefitItem>
                                        <BenefitItem>Acesso ao sistema de agendamentos</BenefitItem>
                                        <BenefitItem>Suporte via WhatsApp</BenefitItem>
                                        <BenefitItem>Atualizações regulares do sistema</BenefitItem>
                                        <BenefitItem>Segurança e privacidade dos dados</BenefitItem>
                                    </BenefitsList>
                                </Container>
                                <Container
                                    $width="calc(50% - 0.5rem)"
                                    $backgroundcolor="var(--color-background)"
                                    $borderradius="0 1rem 2rem 1rem"
                                    $padding="1rem 0"
                                    $display="flex"
                                    $flexdirection="column"
                                    $height="auto"
                                    $alignitems="center"
                                >
                                    <Title
                                        $padding="1rem"
                                        $margin="0"
                                        $fontweight="600"
                                        $fontsize="0.8rem"
                                        $color="var(--color-dark)"
                                        $width="-webkit-fill-available"
                                        $align="center"
                                        $texttransform="uppercase"
                                    >
                                        Histórico de faturas
                                    </Title>
                                    <Separator
                                        $width="calc(100% - 6rem)"
                                        $bordercolor="rgba(0,0,0,0.15)"
                                        $margin="0 3rem 1rem 3rem"
                                    />
                                    {paymentsHistory.length > 0 ? (
                                        <Table>
                                            <Thead>
                                            <tr>
                                                <Th>Mês referência</Th>
                                                <Th>Situação</Th>
                                            </tr>
                                            </Thead>
                                            <tbody>
                                            {paymentsHistory.map((payment, index) => (
                                                <tr key={`${payment.month}-${index}`}>
                                                <Td>{payment.month}</Td>
                                                <Td>
                                                    <Tag
                                                        $color={tagStatusStyle[payment.status].color}
                                                        $background={tagStatusStyle[payment.status].background}
                                                        $texttransform="uppercase"
                                                        $margin="auto"
                                                    >
                                                        {payment.status}
                                                    </Tag>
                                                </Td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </Table>
                                        ) : (
                                            <span style={{ fontSize: "0.8rem", margin: 'auto' }}>
                                                Nenhuma fatura encontrada.
                                            </span>
                                        )}
                                </Container>
                            </Container>
                        </>
                    )}

                    {loading &&
                        <Container 
                            $width="100%" 
                            $height="90vh" 
                            $margin="0" 
                            $padding="0" 
                            $backgroundcolor="none"
                            $borderradius="0" 
                            $border="none"
                            $display="flex" 
                            $justifycontent="center" 
                            $alignitems="center"
                            $boxshadow="none"
                        >
                            <span className="loader"></span>
                        </Container>
                    }
                    <ToastContainer position="top-right" autoClose={3000} />
                    </Sidebar>

                <ToastContainer
                    position={mobile ? "bottom-center" : "top-right"}
                    autoClose={3000}
                />
            </Container>
        </>
    );
}

export default Payment;
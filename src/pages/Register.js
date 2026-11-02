import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from "react-toastify";
import { useLocation, useNavigate } from 'react-router-dom';
import "react-toastify/dist/ReactToastify.css";
import { login } from '../services/endpoints/auth';
import { registerUser } from '../services/endpoints/user';
import { createCompany } from '../services/endpoints/company';
import { validateDiscountCode, getPublicSubscriptionPlans, updateSubscription } from '../services/endpoints/payment';
import { formataNumeroTelefone } from '../util/format';
import styled from 'styled-components';

// Faixa de quem chega pelo link de uma empresa parceira
const PartnerBanner = styled.div`
    margin: 0 0 1rem;
    padding: 0.75rem 1rem;
    border-radius: var(--ui-radius-sm);
    background: var(--ui-accent-soft);
    border: 1px solid #f6d49a;
    color: var(--ui-accent-ink);
    font-size: 0.85rem;
    line-height: 1.5;

    strong {
        color: #5c3906;
    }
`;

// Link de parceria: /registro?cupom=CODIGO
// "20% de desconto na mensalidade", "1ª mensalidade grátis"... sem repetir o código como o displayText faz
const describeDiscount = (data) => {
    if (!data) return '';
    if (data.discountType === 'FIRST_MONTH_FREE') return '1ª mensalidade grátis';
    const value = Number(data.discountValue);
    return data.discountType === 'PERCENTAGE'
        ? `${value.toLocaleString('pt-BR')}% de desconto na mensalidade`
        : `${value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de desconto na mensalidade`;
};

// O backend explica por que o cupom não vale (prazo, limite de cadastros, inativo...)
const couponError = (err, fallback) => (typeof err?.response?.data === 'string' && err.response.data) || fallback;

const formatDay = (iso) => (iso ? new Date(iso).toLocaleDateString('pt-BR') : '');
const readLinkCoupon = (search) => (new URLSearchParams(search).get('cupom') || '').trim().toUpperCase();

const Page = styled.main`
    min-height: 100vh;
    width: 100%;
    box-sizing: border-box;
    padding: 2rem 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
`;

const Shell = styled.section`
    width: min(1080px, 100%);
    min-height: 640px;
    background: #ffffff;
    border: 1px solid var(--ui-border);
    border-radius: 1.25rem;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    display: grid;
    grid-template-columns: 1fr 1fr;

    @media (max-width: 980px) {
        grid-template-columns: 1fr;
        min-height: auto;
    }
`;

const StoryPanel = styled.div`
    position: relative;
    padding: 2.4rem;
    background: radial-gradient(circle at 70% 80%, rgba(240, 160, 48, 0.32) 0%, rgba(46, 52, 99, 0.35) 32%, rgba(20, 23, 46, 0.96) 72%),
        linear-gradient(145deg, #2e3463 0%, #1e2240 50%, #14172e 100%);
    color: #eaf3f0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    @media (max-width: 980px) {
        min-height: 340px;
  }
`;

const StoryTitle = styled.h2`
    margin: 0;
    font-size: clamp(2rem, 4vw, 2.7rem);
    line-height: 1.1;
    max-width: 280px;
`;

const StoryDescription = styled.p`
    margin: 1rem 0 0;
    max-width: 360px;
    color: rgba(232, 234, 246, 0.86);
    line-height: 1.5;
`;

const StepList = styled.div`
    margin-top: 2.2rem;
    display: grid;
    grid-template-columns: repeat(3, minmax(110px, 1fr));
    gap: 0.8rem;

    @media (max-width: 980px) {
        grid-template-columns: 1fr;
    }
`;

const StepCard = styled.div`
    border-radius: 0.85rem;
    padding: 0.95rem;
    min-height: 96px;
    border: 1px solid ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.4)' : 'rgba(220, 224, 245, 0.16)')};
    background: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.92)' : 'rgba(245, 246, 255, 0.12)')};
    color: ${({ $active }) => ($active ? '#1e2240' : 'rgba(240, 242, 252, 0.92)')};
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const StepBadge = styled.span`
    width: 24px;
    height: 24px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.72rem;
    font-weight: 700;
    background: ${({ $active }) => ($active ? '#1e2240' : 'rgba(255, 255, 255, 0.2)')};
    color: ${({ $active }) => ($active ? '#e9f4ef' : '#f4fffc')};
`;

const StepText = styled.span`
    display: block;
    margin-top: 0.75rem;
    font-size: 0.82rem;
    line-height: 1.3;
`;

const FormPanel = styled.div`
    padding: 3.1rem 2.3rem;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: center;

    @media (max-width: 980px) {
        padding: 2.2rem 1.3rem;
    }
`;

const FormTitle = styled.h1`
    margin: 0;
    color: var(--ui-text);
    font-size: 1.9rem;
`;

const FormSubtitle = styled.p`
    margin: 0.6rem 0 1.5rem;
    color: var(--ui-muted);
    font-size: 0.9rem;
`;

const Form = styled.form`
    margin: 0;
    padding: 0;
    box-shadow: none;
    background: transparent;
    border-radius: 0;
`;

const Label = styled.label`
    font-size: 0.8rem;
    color: var(--ui-text-secondary);
    margin: 0 0 0.45rem;
    display: block;
`;

const Input = styled.input`
    height: 2.8rem;
    width: 100%;
    box-sizing: border-box;
    margin: 0 0 0.95rem;
    padding: 0 0.85rem;
    border-radius: 0.6rem;
    border: 1px solid var(--ui-input-border);
    background: #ffffff;
    color: var(--ui-text);
    font-size: 0.9rem;

    &::placeholder {
        color: #9ca3af;
    }

    &:focus {
        outline: none;
        border-color: var(--ui-primary);
        box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.11);
    }
`;

const Row = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem;

    @media (max-width: 520px) {
        grid-template-columns: 1fr;
    }
`;

const Hint = styled.span`
    font-size: 0.76rem;
    color: var(--ui-muted);
    margin-top: -0.45rem;
    margin-bottom: 0.9rem;
    display: block;
`;

const Divider = styled.div`
    margin: 1.15rem 0;
    border-top: 1px solid var(--ui-border);
`;

const Actions = styled.div`
    display: flex;
    justify-content: ${({ $step }) => ($step > 0 ? 'space-between' : 'flex-end')};
    align-items: center;
    gap: 0.8rem;
`;

const GhostButton = styled.button`
    border: none;
    background: transparent;
    color: var(--ui-muted);
    cursor: pointer;
    font-size: 0.88rem;
    font-weight: 600;

    &:hover {
        color: var(--ui-text);
    }
`;

const SubmitButton = styled.button`
    border: none;
    min-width: 130px;
    height: 2.9rem;
    border-radius: 999px;
    background: var(--ui-primary);
    color: #ffffff;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        background: var(--ui-primary-hover);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const FooterText = styled.p`
    margin: 1.2rem 0 0;
    color: var(--ui-muted);
    font-size: 0.82rem;
    text-align: center;
`;

const FooterLink = styled.button`
    border: none;
    background: transparent;
    color: var(--ui-text);
    padding: 0;
    cursor: pointer;

    &:hover {
        text-decoration: underline;
    }
`;

const PlanCard = styled.div`
    border: 1px solid ${({ $selected }) => ($selected ? 'var(--ui-primary)' : 'var(--ui-input-border)')};
    border-radius: 0.75rem;
    padding: 0.9rem 1rem;
    background: ${({ $selected }) => ($selected ? 'rgba(17, 24, 39, 0.05)' : '#ffffff')};
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
`;

const FeatureCheckbox = styled.label`
    display: grid;
    grid-template-columns: 18px 1fr auto;
    align-items: center;
    gap: 0.65rem;
    padding: 0.8rem 1rem;
    border-radius: 0.65rem;
    border: 1px solid ${({ $checked }) => ($checked ? 'rgba(17, 24, 39, 0.27)' : 'var(--ui-border)')};
    background: ${({ $checked }) => ($checked ? 'rgba(17, 24, 39, 0.04)' : '#ffffff')};
    cursor: pointer;
    margin-bottom: 0.45rem;
    color: var(--ui-text-secondary);
    font-size: 0.85rem;
    transition: border-color 0.15s, background 0.15s;

    &:hover {
        border-color: rgba(17, 24, 39, 0.18);
    }

    input {
        appearance: none;
        -webkit-appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 5px;
        border: 1.5px solid ${({ $checked }) => ($checked ? 'var(--ui-primary)' : 'var(--ui-input-border)')};
        background: ${({ $checked }) => ($checked ? 'var(--ui-primary)' : 'transparent')};
        cursor: pointer;
        flex-shrink: 0;
        position: relative;
        transition: background 0.15s, border-color 0.15s;

        &::after {
            content: '';
            display: ${({ $checked }) => ($checked ? 'block' : 'none')};
            position: absolute;
            left: 4px;
            top: 1px;
            width: 5px;
            height: 9px;
            border: 2px solid #ffffff;
            border-top: none;
            border-left: none;
            transform: rotate(45deg);
        }
    }
`;

const PriceSummary = styled.div`
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 0.75rem;
    background: rgba(17, 24, 39, 0.04);
    border: 1px solid rgba(17, 24, 39, 0.15);
`;

const ErrorHint = styled.span`
    font-size: 0.76rem;
    color: #ef4444;
    margin-top: -0.45rem;
    margin-bottom: 0.9rem;
    display: block;
`;

const TrialBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: rgba(17, 24, 39, 0.09);
    color: var(--ui-primary);
    border-radius: 999px;
    padding: 0.3rem 0.75rem;
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 0.6rem;
`;

function Register() {
    const navigate = useNavigate();
    // Endereço digitado na barra da landing chega pré-preenchido
    const location = useLocation();
        const [isMobileViewport, setIsMobileViewport] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);

    const [userData, setUserData] = useState({
        username: '',
        password: { stepOne: '', stepTwo: '' }
    });

    const [companyData, setCompanyData] = useState({
        name: '',
        url: location.state?.url || '',
        whatsapp: '',
        instagram: '',
        discountCode: readLinkCoupon(location.search),
        email: '',
        cpfCnpj: ''
    });
    const [emailError, setEmailError] = useState('');
    const [cpfCnpjError, setCpfCnpjError] = useState('');

    const [discountInfo, setDiscountInfo] = useState(null);
    const [discountData, setDiscountData] = useState(null);
    const [discountError, setDiscountError] = useState('');
    // Parceiro dono do cupom que veio no link (só aparece se o cupom for válido)
    const [partnerName, setPartnerName] = useState(null);
    const [linkCouponApplied, setLinkCouponApplied] = useState(false);

    const [plans, setPlans] = useState([]);
    const [extraFeatures, setExtraFeatures] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedExtras, setSelectedExtras] = useState([]);

    const trialEndDate = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 14);
        return d.toLocaleDateString('pt-BR');
    })();

    const firstMonthFree = discountData?.discountType === 'FIRST_MONTH_FREE';

    const { subtotal, discountAmount, totalAmount } = (() => {
        const planPrice = Number(selectedPlan?.price ?? 0);
        const extrasPrice = selectedExtras.reduce((sum, name) => {
            const f = extraFeatures.find(f => f.name === name);
            return sum + (f ? Number(f.price) : 0);
        }, 0);
        const sub = planPrice + extrasPrice;

        let discount = 0;
        if (discountData) {
            const val = Number(discountData.discountValue);
            if (discountData.discountType === 'PERCENTAGE') {
                discount = sub * (val / 100);
            } else if (discountData.discountType === 'FIXED') {
                discount = Math.min(val, sub);
            }
        }

        const fmt = (n) => n.toFixed(2).replace('.', ',');
        return {
            subtotal: fmt(sub),
            discountAmount: fmt(discount),
            totalAmount: fmt(Math.max(0, sub - discount))
        };
    })();

    const toggleExtra = (name) => {
        setSelectedExtras(prev =>
            prev.includes(name) ? prev.filter(e => e !== name) : [...prev, name]
        );
    };

    const formatCpfCnpj = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 14);
        if (digits.length <= 11) {
            return digits
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        }
        return digits
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    };

    const isValidEmail = (email) =>
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

    const calcCpfDigit = (digits, len) => {
        let sum = 0;
        for (let i = 0; i < len; i++) sum += parseInt(digits[i]) * (len + 1 - i);
        const rem = sum % 11;
        return rem < 2 ? 0 : 11 - rem;
    };

    const isValidCpf = (value) => {
        const d = value.replace(/\D/g, '');
        if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
        return calcCpfDigit(d, 9) === parseInt(d[9]) && calcCpfDigit(d, 10) === parseInt(d[10]);
    };

    const isValidCnpj = (value) => {
        const d = value.replace(/\D/g, '');
        if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
        const w1 = [5,4,3,2,9,8,7,6,5,4,3,2];
        const w2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];
        const calc = (digits, weights) => {
            const sum = weights.reduce((acc, w, i) => acc + parseInt(digits[i]) * w, 0);
            const rem = sum % 11;
            return rem < 2 ? 0 : 11 - rem;
        };
        const d1 = calc(d, w1);
        const d2 = calc(d.slice(0,12) + d1, w2);
        return parseInt(d[12]) === d1 && parseInt(d[13]) === d2;
    };

    const isValidCpfOrCnpj = (value) => {
        const digits = value.replace(/\D/g, '');
        return digits.length === 11 ? isValidCpf(digits) : digits.length === 14 ? isValidCnpj(digits) : false;
    };

    const handleError = (error) => toast.error(error);

    const handleDiscountCodeBlur = async () => {
        const code = companyData.discountCode.trim();
        setDiscountInfo(null);
        setDiscountData(null);
        setDiscountError('');
        if (!code) return;
        try {
            const res = await validateDiscountCode(code);
            setDiscountInfo(res.data.displayText);
            setDiscountData(res.data);
        } catch (err) {
            setDiscountError(couponError(err, 'Código inválido ou expirado'));
        }
    };

    // Cupom do link de parceria: valida assim que a página abre, para o desconto já aparecer no resumo
    useEffect(() => {
        const code = readLinkCoupon(location.search);
        if (!code) return;
        validateDiscountCode(code)
            .then((res) => {
                setDiscountInfo(res.data.displayText);
                setDiscountData(res.data);
                setPartnerName(res.data.partnerName || null);
                setLinkCouponApplied(true);
            })
            .catch((err) => setDiscountError(couponError(err, 'O cupom deste link não é mais válido')));
    }, [location.search]);

    const handleNext = async () => {
        if (step === 0) {
            if (!companyData.name || !companyData.url) {
                handleError("Preencha os dados da empresa!");
                return;
            }
            if (!companyData.email || !isValidEmail(companyData.email)) {
                setEmailError('Informe um e-mail válido');
                handleError("Informe um e-mail válido");
                return;
            }
            if (!companyData.cpfCnpj || !isValidCpfOrCnpj(companyData.cpfCnpj)) {
                setCpfCnpjError('CPF ou CNPJ inválido');
                handleError("Informe um CPF ou CNPJ válido");
                return;
            }
            setEmailError('');
            setCpfCnpjError('');
            setStep(1);
        } else if (step === 1) {
            const code = companyData.discountCode.trim();
            if (code) {
                try {
                    const res = await validateDiscountCode(code);
                    setDiscountInfo(res.data.displayText);
                    setDiscountError('');
                } catch (err) {
                    setDiscountError(couponError(err, 'Código inválido ou expirado'));
                    setDiscountInfo(null);
                    setDiscountData(null);
                    return;
                }
            }
            setStep(2);
        } else {
            handleRegister();
        }
    };

    const handleBack = () => { 
        if(step > 0){
            setStep(step - 1);
        } else {
            navigate('/login');
        }
    };

    const handleRegister = async () => {
        setLoading(true);

        if (
            !userData.username ||
            !userData.password.stepOne ||
            userData.password.stepOne !== userData.password.stepTwo
        ) {
            setLoading(false);
            handleError("Preencha usuário e senha corretamente!");
            return;
        }

        try {
            const res = await registerUser({
                username: userData.username,
                password: userData.password.stepOne
            });

            if (res.status === 200) {
                // O login aqui já roda no navegador (não app mobile), então o
                // backend entrega o token via cookie httpOnly (Set-Cookie) —
                // não precisamos armazená-lo manualmente.
                await login({
                    username: userData.username,
                    password: userData.password.stepOne
                });

                await createCompany({
                    ...companyData,
                    user: userData.username,
                    whatsapp: companyData.whatsapp.replace(/\D/g, ''),
                    discountCode: companyData.discountCode.trim() || undefined
                });

                // Sem plano escolhido (lista de planos não carregou), fica o plano padrão definido no cadastro do usuário
                if (selectedPlan) {
                    await updateSubscription(companyData.url, {
                        plan: selectedPlan.name,
                        extras: selectedExtras
                    });
                }

                toast.success("Empresa criada com sucesso!");
                navigate('/login');
            }
        } catch (err) {
            handleError(err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleResize = () => setIsMobileViewport(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        getPublicSubscriptionPlans().then(res => {
            const fetchedPlans = res.data.plans ?? [];
            const fetchedExtras = res.data.extraFeatures ?? [];
            setPlans(fetchedPlans);
            setExtraFeatures(fetchedExtras);
            if (fetchedPlans.length > 0) setSelectedPlan(fetchedPlans[0]);
        }).catch(() => {});
    }, []);

    return (
        <Page>
            <Shell>
                <StoryPanel>
                    <StoryTitle>Comece com a gente</StoryTitle>
                    <StoryDescription>
                        Complete as etapas abaixo para criar seu ambiente e liberar seu painel.
                    </StoryDescription>

                    <StepList>
                        <StepCard $active={step === 0}>
                            <StepBadge $active={step === 0}>1</StepBadge>
                            <StepText>Configure os dados da empresa</StepText>
                        </StepCard>
                        <StepCard $active={step === 1}>
                            <StepBadge $active={step === 1}>2</StepBadge>
                            <StepText>Defina seu plano e recursos adicionais</StepText>
                        </StepCard>
                        <StepCard $active={step === 2}>
                            <StepBadge $active={step === 2}>3</StepBadge>
                            <StepText>Defina seu acesso inicial</StepText>
                        </StepCard>
                    </StepList>
                </StoryPanel>

                <FormPanel>
                    <FormTitle>Criar conta</FormTitle>
                    <FormSubtitle>
                        Preencha os campos para registrar sua conta de administracao.
                    </FormSubtitle>

                    {linkCouponApplied && discountInfo && companyData.discountCode === readLinkCoupon(location.search) && (
                        <PartnerBanner>
                            {partnerName ? <><strong>Indicação de {partnerName}.</strong> </> : null}
                            Seu cupom <strong>{companyData.discountCode}</strong> já está aplicado: {describeDiscount(discountData)}.
                            {discountData?.registrationDeadline && <> Válido para cadastros até {formatDay(discountData.registrationDeadline)}.</>}
                        </PartnerBanner>
                    )}

                    <Form>
                        {step === 0 && (
                            <>
                                <Label htmlFor="company-name">Nome da empresa</Label>
                                <Input
                                    id="company-name"
                                    placeholder="ex: Studio Beleza"
                                    value={companyData.name}
                                    onChange={(e) =>
                                        setCompanyData(prev => ({ ...prev, name: e.target.value }))
                                    }
                                />

                                <Row>
                                    <div>
                                        <Label htmlFor="company-whatsapp">Whatsapp</Label>
                                        <Input
                                            id="company-whatsapp"
                                            placeholder="(00) 00000-0000"
                                            value={formataNumeroTelefone(companyData.whatsapp)}
                                            onChange={(e) =>
                                                setCompanyData(prev => ({ ...prev, whatsapp: e.target.value }))
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="company-instagram">Instagram</Label>
                                        <Input
                                            id="company-instagram"
                                            placeholder="usuario"
                                            value={companyData.instagram}
                                            onChange={(e) => {
                                                let value = e.target.value
                                                .toLowerCase()
                                                .replace(/[^a-z0-9._]/g, '')
                                                .replace(/\.{2,}/g, '.');

                                                if (value.startsWith('.')) value = value.slice(1);
                                                if (value.length > 30) value = value.slice(0, 30);

                                                setCompanyData(prev => ({ ...prev, instagram: value }));
                                            }}
                                            onKeyDown={(e) => {
                                                if (
                                                e.key.length === 1 &&
                                                !/[a-z0-9._]/i.test(e.key)
                                                ) {
                                                e.preventDefault();
                                                }
                                            }}
                                        />
                                    </div>
                                </Row>

                                <Label htmlFor="company-url">Link da empresa</Label>
                                <Input
                                    id="company-url"
                                    placeholder="nome-da-empresa"
                                    value={companyData.url}
                                    onChange={(e) => {
                                        const value = e.target.value
                                        .toLowerCase()
                                        .replace(/[^a-z0-9]/g, '');

                                        setCompanyData(prev => ({ ...prev, url: value }));
                                    }}
                                    onKeyDown={(e) => {
                                        if (
                                        e.key.length === 1 &&
                                        !/[a-z0-9]/i.test(e.key)
                                        ) {
                                        e.preventDefault();
                                        }
                                    }}
                                />

                                <Hint>
                                    horariocerto.elevatohub.com.br/{companyData.url}
                                </Hint>

                                <Label htmlFor="company-email">E-mail para cobrança</Label>
                                <Input
                                    id="company-email"
                                    type="email"
                                    placeholder="contato@empresa.com"
                                    value={companyData.email}
                                    onChange={(e) => {
                                        setEmailError('');
                                        setCompanyData(prev => ({ ...prev, email: e.target.value }));
                                    }}
                                    onBlur={() => {
                                        if (companyData.email && !isValidEmail(companyData.email)) {
                                            setEmailError('Informe um e-mail válido');
                                        }
                                    }}
                                    style={emailError ? { borderColor: '#ef4444' } : {}}
                                />
                                {emailError && <ErrorHint>{emailError}</ErrorHint>}

                                <Label htmlFor="company-cpfcnpj">CPF / CNPJ</Label>
                                <Input
                                    id="company-cpfcnpj"
                                    placeholder="000.000.000-00 ou 00.000.000/0001-00"
                                    value={formatCpfCnpj(companyData.cpfCnpj)}
                                    onChange={(e) => {
                                        setCpfCnpjError('');
                                        const digits = e.target.value.replace(/\D/g, '').slice(0, 14);
                                        setCompanyData(prev => ({ ...prev, cpfCnpj: digits }));
                                    }}
                                    onBlur={() => {
                                        if (companyData.cpfCnpj && !isValidCpfOrCnpj(companyData.cpfCnpj)) {
                                            setCpfCnpjError('CPF ou CNPJ inválido');
                                        }
                                    }}
                                    style={cpfCnpjError ? { borderColor: '#ef4444' } : {}}
                                />
                                {cpfCnpjError && <ErrorHint>{cpfCnpjError}</ErrorHint>}
                            </>
                        )}

                        {step === 1 && (
                            <>
                                <Label>Plano</Label>
                                {plans.map(plan => (
                                    <div key={plan.id}>
                                        <PlanCard
                                            $selected={selectedPlan?.id === plan.id}
                                            onClick={() => setSelectedPlan(plan)}
                                        >
                                            <span style={{ color: 'var(--ui-text)', fontSize: '0.9rem', fontWeight: 600 }}>
                                                {plan.name}
                                            </span>
                                            <span style={{ color: 'var(--ui-primary)', fontWeight: 700 }}>
                                                R$ {Number(plan.price).toFixed(2).replace('.', ',')}/mês
                                            </span>
                                        </PlanCard>
                                        {selectedPlan?.id === plan.id && plan.features?.length > 0 && (
                                            <div style={{
                                                background: '#f9fafb',
                                                border: '1px solid var(--ui-border)',
                                                borderTop: 'none',
                                                borderRadius: '0 0 0.75rem 0.75rem',
                                                padding: '0.75rem 1rem',
                                                marginBottom: '0.5rem',
                                                marginTop: '-0.5rem'
                                            }}>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--ui-muted)', display: 'block', marginBottom: '0.4rem' }}>
                                                    Incluso no plano:
                                                </span>
                                                {[...(plan.highlights || []), ...(plan.displayFeatures?.length ? plan.displayFeatures : plan.features)].map((f, i) => (
                                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                        <span style={{ color: 'var(--ui-primary)', fontSize: '0.8rem', marginTop: '0.05rem' }}>✓</span>
                                                        <span style={{ color: i < (plan.highlights || []).length ? 'var(--ui-text)' : 'var(--ui-muted)', fontWeight: i < (plan.highlights || []).length ? 600 : 400, fontSize: '0.8rem' }}>{f}</span>
                                                    </div>
                                                ))}
                                                <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--ui-accent-ink)' }}>
                                                    O envio de mensagens pelo WhatsApp é liberado após o pagamento da primeira mensalidade.
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {extraFeatures.length > 0 && (
                                    <>
                                        <Label style={{ marginTop: '0.75rem' }}>
                                            Recursos adicionais <span style={{ color: '#9ca3af' }}>(opcional)</span>
                                        </Label>
                                        {extraFeatures.map(f => (
                                            <FeatureCheckbox
                                                key={f.id}
                                                $checked={selectedExtras.includes(f.name)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedExtras.includes(f.name)}
                                                    onChange={() => toggleExtra(f.name)}
                                                />
                                                <span>{f.name}</span>
                                                <span style={{ color: 'var(--ui-primary)', fontWeight: 600, whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                                                    + R$ {Number(f.price).toFixed(2).replace('.', ',')}/mês
                                                </span>
                                            </FeatureCheckbox>
                                        ))}
                                    </>
                                )}

                                <Label style={{ marginTop: '0.75rem' }}>
                                    Código de desconto <span style={{ color: '#9ca3af' }}>(opcional)</span>
                                </Label>
                                <Input
                                    placeholder="ex: BLACKFRIDAY"
                                    value={companyData.discountCode}
                                    onChange={(e) =>
                                        setCompanyData(prev => ({
                                            ...prev,
                                            discountCode: e.target.value.toUpperCase()
                                        }))
                                    }
                                    onBlur={handleDiscountCodeBlur}
                                    style={
                                        discountInfo
                                            ? { borderColor: 'var(--ui-primary)' }
                                            : discountError
                                            ? { borderColor: '#ef4444' }
                                            : {}
                                    }
                                />
                                {discountInfo && (
                                    <Hint style={{ color: 'var(--ui-primary)' }}>✓ {discountInfo}</Hint>
                                )}
                                {discountError && (
                                    <Hint style={{ color: '#ef4444' }}>{discountError}</Hint>
                                )}

                                <PriceSummary>
                                    <TrialBadge>🎁 14 dias grátis</TrialBadge>
                                    <div style={{ color: 'var(--ui-muted)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                                        {firstMonthFree ? (
                                            <>Primeira mensalidade grátis; o primeiro pagamento fica para um mês depois de <strong style={{ color: 'var(--ui-text)' }}>{trialEndDate}</strong></>
                                        ) : (
                                            <>Primeiro pagamento em <strong style={{ color: 'var(--ui-text)' }}>{trialEndDate}</strong></>
                                        )}
                                    </div>
                                    {discountData && (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                                <span style={{ color: 'var(--ui-muted)', fontSize: '0.82rem' }}>Subtotal</span>
                                                <span style={{ color: 'var(--ui-muted)', fontSize: '0.85rem' }}>R$ {subtotal}</span>
                                            </div>
                                            <div style={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                marginBottom: '0.5rem', padding: '0.45rem 0.6rem',
                                                background: 'rgba(17, 24, 39, 0.07)', borderRadius: '0.5rem',
                                                border: '1px solid rgba(17, 24, 39, 0.18)'
                                            }}>
                                                <span style={{ color: 'var(--ui-primary)', fontSize: '0.82rem', fontWeight: 600 }}>
                                                    🏷️ {firstMonthFree ? `1ª mensalidade grátis (${discountData.name})` : `Desconto (${discountData.name})`}
                                                </span>
                                                <span style={{ color: 'var(--ui-primary)', fontWeight: 700, fontSize: '1rem' }}>
                                                    {firstMonthFree ? `− R$ ${subtotal}` : `− R$ ${discountAmount}`}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: discountData ? '1px solid var(--ui-border)' : 'none', paddingTop: discountData ? '0.5rem' : 0 }}>
                                        <span style={{ color: 'var(--ui-muted)', fontSize: '0.85rem' }}>
                                            {firstMonthFree ? 'Total mensal a partir da 2ª mensalidade' : 'Total mensal após o teste'}
                                        </span>
                                        <span style={{ color: 'var(--ui-text)', fontWeight: 700, fontSize: '1.15rem' }}>
                                            R$ {totalAmount}
                                        </span>
                                    </div>
                                </PriceSummary>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <Label htmlFor="user-name">Usuario</Label>
                                <Input
                                    id="user-name"
                                    placeholder="ex: admin"
                                    value={userData.username}
                                    onChange={(e) => {
                                        const value = e.target.value
                                        .toLowerCase()
                                        .replace(/[^a-z0-9]/g, '');

                                        setUserData(prev => ({ ...prev, username: value }));
                                    }}
                                    onKeyDown={(e) => {
                                        if (
                                        e.key.length === 1 &&
                                        !/[a-z0-9]/i.test(e.key)
                                        ) {
                                        e.preventDefault();
                                        }
                                    }}
                                />

                                <Label htmlFor="user-password">Senha</Label>
                                <Input
                                    id="user-password"
                                    type="password"
                                    placeholder="Digite uma senha segura"
                                    value={userData.password.stepOne}
                                    onChange={(e) =>
                                        setUserData(prev => ({
                                            ...prev,
                                            password: { ...prev.password, stepOne: e.target.value }
                                        }))
                                    }
                                />

                                <Label htmlFor="user-password-confirm">Confirmar senha</Label>
                                <Input
                                    id="user-password-confirm"
                                    type="password"
                                    placeholder="Repita sua senha"
                                    value={userData.password.stepTwo}
                                    onChange={(e) =>
                                        setUserData(prev => ({
                                            ...prev,
                                            password: { ...prev.password, stepTwo: e.target.value }
                                        }))
                                    }
                                />
                            </>
                        )}

                        <Divider />

                        <Actions $step={step}>
                            {!loading && (
                                <GhostButton type="button" onClick={handleBack}>
                                    Voltar
                                </GhostButton>
                            )}

                            <SubmitButton type="button" onClick={handleNext}>
                                {loading ? 'Processando...' : step < 2 ? 'Avançar' : 'Cadastrar'}
                            </SubmitButton>
                        </Actions>

                        <FooterText>
                            Ja possui conta?{' '}
                            <FooterLink type="button" onClick={() => navigate('/login')}>
                                Fazer login
                            </FooterLink>
                        </FooterText>
                    </Form>
                </FormPanel>
            </Shell>

            <ToastContainer
                position={isMobileViewport ? 'bottom-center' : 'top-right'}
                autoClose={3000}
                style={isMobileViewport ? { margin: '0 5% 1rem 5%', width: '90%' } : undefined}
            />
        </Page>
    );
}

export default Register;
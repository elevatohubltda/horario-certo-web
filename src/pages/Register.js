import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import "react-toastify/dist/ReactToastify.css";
import { login } from '../services/endpoints/auth';
import { registerUser } from '../services/endpoints/user';
import { createCompany } from '../services/endpoints/company';
import { formataNumeroTelefone } from '../util/format';
import { expiresAt } from '../util/date';
import styled from 'styled-components';

const Page = styled.main`
    min-height: 100vh;
    width: 100%;
    box-sizing: border-box;
    padding: 2rem 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 15% 20%, #26292e 0%, #1a1d22 40%, #17191d 100%);
`;

const Shell = styled.section`
    width: min(1080px, 100%);
    min-height: 640px;
    background: #08090b;
    border: 1px solid #23272d;
    border-radius: 0.95rem;
    box-shadow: 0 28px 50px rgba(0, 0, 0, 0.35);
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
    background: radial-gradient(circle at 70% 80%, rgba(62, 170, 143, 0.65) 0%, rgba(5, 64, 58, 0.3) 30%, rgba(4, 36, 33, 0.95) 70%),
        linear-gradient(145deg, #0f8066 0%, #06584d 45%, #042d2a 100%);
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
    color: rgba(234, 243, 240, 0.86);
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
    border: 1px solid ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.4)' : 'rgba(209, 236, 231, 0.16)')};
    background: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.92)' : 'rgba(245, 255, 252, 0.12)')};
    color: ${({ $active }) => ($active ? '#131a19' : 'rgba(239, 249, 246, 0.92)')};
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
    background: ${({ $active }) => ($active ? '#131a19' : 'rgba(255, 255, 255, 0.2)')};
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
    background: #07090b;
    display: flex;
    flex-direction: column;
    justify-content: center;

    @media (max-width: 980px) {
        padding: 2.2rem 1.3rem;
    }
`;

const FormTitle = styled.h1`
    margin: 0;
    color: #f2f4f7;
    font-size: 1.9rem;
`;

const FormSubtitle = styled.p`
    margin: 0.6rem 0 1.5rem;
    color: #98a1ac;
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
    color: #c8ced8;
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
    border: 1px solid #252b34;
    background: #12161c;
    color: #f4f7fb;
    font-size: 0.9rem;

    &::placeholder {
        color: #7f8792;
    }

    &:focus {
        outline: none;
        border-color: #3fa487;
        box-shadow: 0 0 0 3px rgba(63, 164, 135, 0.18);
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
    color: #7ea594;
    margin-top: -0.45rem;
    margin-bottom: 0.9rem;
    display: block;
`;

const Divider = styled.div`
    margin: 1.15rem 0;
    border-top: 1px solid #20242b;
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
    color: #b8c0cb;
    cursor: pointer;
    font-size: 0.88rem;

    &:hover {
        color: #ffffff;
    }
`;

const SubmitButton = styled.button`
    border: none;
    min-width: 130px;
    height: 2.9rem;
    border-radius: 0.6rem;
    background: #f7f9fc;
    color: #0e1317;
    font-weight: 700;
    cursor: pointer;

    &:hover {
        background: #ffffff;
    }
`;

const FooterText = styled.p`
    margin: 1.2rem 0 0;
    color: #8c95a1;
    font-size: 0.82rem;
    text-align: center;
`;

const FooterLink = styled.button`
    border: none;
    background: transparent;
    color: #dde4f0;
    padding: 0;
    cursor: pointer;

    &:hover {
        text-decoration: underline;
    }
`;

function Register() {
    const navigate = useNavigate();
        const [isMobileViewport, setIsMobileViewport] = useState(window.innerWidth <= 768);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);

    const [userData, setUserData] = useState({
        username: '',
        password: { stepOne: '', stepTwo: '' }
    });

    const [companyData, setCompanyData] = useState({
        name: '',
        url: '',
        whatsapp: '',
        instagram: ''
    });

    const handleError = (error) => toast.error(error);

    const handleNext = () => {
        if (step === 0) {
            if (!companyData.name || !companyData.url) {
                handleError("Preencha os dados da empresa!");
                return;
            }
            setStep(1);
        } else {
            handleRegister();
        }
    };

    const handleBack = () => { 
        if(step > 0){
            setStep(step - 1);
        } else {
            navigate('/');
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
                const loginRes = await login({
                    username: userData.username,
                    password: userData.password.stepOne
                });

                Cookies.set("token", loginRes.data.token, {
                    expires: expiresAt,
                    secure: true,
                    sameSite: "Strict"
                });

                await createCompany({
                    ...companyData,
                    user: userData.username,
                    whatsapp: companyData.whatsapp.replace(/\D/g, '')
                });

                toast.success("Empresa criada com sucesso!");
                navigate('/');
            }
        } catch (err) {
            handleError(err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobileViewport(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
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
                            <StepText>Defina seu acesso inicial</StepText>
                        </StepCard>
                        <StepCard $active={false}>
                            <StepBadge $active={false}>3</StepBadge>
                            <StepText>Conclua e acesse o sistema</StepText>
                        </StepCard>
                    </StepList>
                </StoryPanel>

                <FormPanel>
                    <FormTitle>Criar conta</FormTitle>
                    <FormSubtitle>
                        Preencha os campos para registrar sua conta de administracao.
                    </FormSubtitle>

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
                            </>
                        )}

                        {step === 1 && (
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
                                {loading ? 'Processando...' : step === 0 ? 'Avancar' : 'Cadastrar'}
                            </SubmitButton>
                        </Actions>

                        <FooterText>
                            Ja possui conta?{' '}
                            <FooterLink type="button" onClick={() => navigate('/')}>
                                Fazer login
                            </FooterLink>
                        </FooterText>
                    </Form>
                </FormPanel>
            </Shell>

            <ToastContainer
                position={isMobileViewport ? 'bottom-center' : 'top-right'}
                autoClose={3000}
                style={isMobileViewport ? { marginBottom: '1rem' } : undefined}
            />
        </Page>
    );
}

export default Register;
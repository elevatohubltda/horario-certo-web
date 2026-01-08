import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import "react-toastify/dist/ReactToastify.css";
import { login } from '../services/endpoints/auth';
import { registerUser } from '../services/endpoints/user';
import { createCompany } from '../services/endpoints/company';
import Stepper from '../components/stepper';
import { Button } from '../components/button';
import { Separator } from '../components/separator/style';
import { Container } from '../components/container/style';
import { isMobile } from '../util/util';
import { formataNumeroTelefone } from '../util/format';
import { expiresAt } from '../util/date';
import { ReactComponent as Logo } from '../assets/horario-certo-logo.svg';
import styled from 'styled-components';

const Form = styled.form`
    width: ${({ $width }) => $width};
    margin: 1rem auto;
    background: #fff;
    padding: 1.5rem;
    border-radius: 1rem;
    box-shadow: 0 2px 8px rgba(142, 152, 142, 0.1);
`;

const Label = styled.label`
  font-size: 0.8rem;
  color: var(--color-earth);
  margin-top: 1rem;
  display: block;
`;

const Input = styled.input`
  margin-top: 0.5rem;
  padding: 0.6rem;
  border-radius: 6px;
  border: 1px solid #f3f3f3;
  border-top: 1px solid var(--color-sage);
  font-size: 0.9rem;
  color: var(--color-dark);
  background: #fff;

  &:focus {
    outline: none;
    border-color: var(--color-sage);
    box-shadow: 0 0 0 2px rgba(142, 152, 142, 0.2);
  }
`;

const Hint = styled.span`
  font-size: 12px;
  color: var(--color-olive);
  margin-top: 0.25rem;
  display: block;
`;

const Actions = styled.div`
  display: flex;
  justify-content: ${({ $step }) => ($step > 0 ? "space-between" : "flex-end")};
`;

function Register() {
    const navigate = useNavigate();
    const steps = ['Empresa', 'Acesso'];
    const [mobile, setMobile] = useState();
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
        setMobile(isMobile());
    }, []);

    return (
        <Container
            $backgroundcolor="var(--color-background)"
            $margin="0"
            $display="flex"
            $justifycontent="center"
            $alignitems="center"
            $width="100%"
            $height={mobile ? 'fit-content' : '100dvh'}
        >
            <Form $width={mobile ? '' : '500px'}>
                <Logo />

                <Separator $width="100%" $bordercolor="var(--color-dark)" $margin="1rem 0" />

                <Stepper steps={steps} currentStep={step} />

                {step === 0 && (
                    <>
                        <Label>Nome da empresa</Label>
                        <Input
                            value={companyData.name}
                            onChange={(e) =>
                                setCompanyData(prev => ({ ...prev, name: e.target.value }))
                            }
                        />

                        <Label>Whatsapp</Label>
                        <Input
                            value={formataNumeroTelefone(companyData.whatsapp)}
                            onChange={(e) =>
                                setCompanyData(prev => ({ ...prev, whatsapp: e.target.value }))
                            }
                        />

                        <Label>Instagram</Label>
                        <Input
                            value={companyData.instagram}
                            onChange={(e) =>
                                setCompanyData(prev => ({ ...prev, instagram: e.target.value }))
                            }
                        />

                        <Label>Link da empresa</Label>
                        <Input
                            value={companyData.url}
                            onChange={(e) =>
                                setCompanyData(prev => ({ ...prev, url: e.target.value }))
                            }
                        />

                        <Hint>
                            horariocerto.elevatohub.com.br/{companyData.url}
                        </Hint>
                    </>
                )}

                {step === 1 && (
                    <>
                        <Label>Usuário</Label>
                        <Input
                            value={userData.username}
                            onChange={(e) =>
                                setUserData(prev => ({ ...prev, username: e.target.value }))
                            }
                        />

                        <Label>Senha</Label>
                        <Input
                            type="password"
                            value={userData.password.stepOne}
                            onChange={(e) =>
                                setUserData(prev => ({
                                    ...prev,
                                    password: { ...prev.password, stepOne: e.target.value }
                                }))
                            }
                        />

                        <Label>Confirmar senha</Label>
                        <Input
                            type="password"
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

                <Separator $width="100%" $bordercolor="var(--color-dark)" $margin="1rem 0" />

                <Actions $step={step}>
                    {!loading && (
                        <Button type="button" variant="link" onClick={handleBack}>
                            Voltar
                        </Button>
                    )}

                    <Button type="button" variant="confirm" onClick={handleNext}>
                        {loading ? "Processando..." : step === 0 ? "Avançar" : "Cadastrar"}
                    </Button>
                </Actions>
            </Form>

            <ToastContainer
                position={mobile ? "bottom-center" : "top-right"}
                autoClose={3000}
            />
        </Container>
    );
}

export default Register;

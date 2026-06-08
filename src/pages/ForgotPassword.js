import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';
import { forgotPassword, resetPassword } from '../services/endpoints/user';

const Page = styled.main`
  min-height: 100vh;
  width: 100%;
  padding: 2.5rem 1rem;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f4f5f2 0%, #ebece8 100%);
`;

const Shell = styled.section`
  width: min(1040px, 100%);
  min-height: 640px;
  border-radius: 1.75rem;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #ffffff;
  box-shadow: 0 24px 64px rgba(22, 29, 23, 0.12);

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    min-height: auto;
  }
`;

const FormPanel = styled.div`
  padding: 4rem 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 980px) {
    padding: 2.5rem 1.5rem;
  }
`;

const Brand = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #7a8773;
  text-transform: uppercase;
`;

const Heading = styled.h1`
  font-size: clamp(2rem, 4.5vw, 2.8rem);
  line-height: 1.05;
  margin: 0.75rem 0;
  color: #131313;
`;

const Subheading = styled.p`
  margin: 0 0 2rem;
  font-size: 0.98rem;
  line-height: 1.6;
  color: #5f665d;
  max-width: 380px;
`;

const Form = styled.form`
  margin: 0;
  padding: 0;
  box-shadow: none;
  border-radius: 0;
  background: transparent;
  width: 100%;
  max-width: 390px;
`;

const Label = styled.label`
  font-size: 0.83rem;
  font-weight: 600;
  color: #546151;
  margin-bottom: 0.45rem;
`;

const Input = styled.input`
  height: 3rem;
  width: 100%;
  box-sizing: border-box;
  margin: 0 0 1rem;
  padding: 0 1rem;
  border-radius: 999px;
  border: 1px solid #d7dbd4;
  background: #ffffff;
  color: #1f271d;
  font-size: 0.95rem;

  &::placeholder {
    color: #a0a89d;
  }

  &:focus {
    outline: none;
    border-color: #8ca085;
    box-shadow: 0 0 0 3px rgba(140, 160, 133, 0.18);
  }
`;

const HelperText = styled.p`
  margin: 0.3rem 0 1.25rem;
  font-size: 0.8rem;
  color: #73816d;
`;

const PrimaryButton = styled.button`
  width: 100%;
  border: none;
  border-radius: 999px;
  height: 3rem;
  background: #111111;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 18px rgba(0, 0, 0, 0.16);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  width: 100%;
  margin-top: 0.75rem;
  border-radius: 999px;
  height: 3rem;
  background: transparent;
  border: 1px solid #c8cec4;
  color: #3f4b3b;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
`;

const Divider = styled.div`
  margin: 1.6rem 0 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  color: #8d9488;
  font-size: 0.78rem;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #d8dcd6;
  }
`;

const InfoText = styled.p`
  margin: 0;
  font-size: 0.84rem;
  color: #6f756d;
  text-align: center;
`;

const LinkButton = styled.button`
  border: none;
  background: transparent;
  color: #59774a;
  font-weight: 700;
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const StepBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background: #edf2eb;
  color: #456140;
  font-size: 0.78rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const IllustrationPanel = styled.div`
  background: linear-gradient(180deg, #e8eee4 0%, #dfe8da 100%);
  padding: 2.2rem;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 980px) {
    display: none;
  }
`;

const IllustrationCard = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(103, 123, 93, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const Orbit = styled.div`
  width: 360px;
  height: 230px;
  border: 3px solid #8fb086;
  border-radius: 50%;
  border-bottom-color: transparent;
  border-left-color: transparent;
  transform: rotate(-8deg);
  opacity: 0.75;
`;

const Avatar = styled.div`
  position: absolute;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  width: ${({ $size }) => $size};
  height: ${({ $size }) => $size};
  border-radius: 50%;
  background: #f6faf3;
  border: 2px solid #94b08d;
`;

const Character = styled.div`
  position: relative;
  margin-top: -70px;
  width: 205px;
  height: 205px;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 20%, #b8d7ad 0%, #8fbc81 65%, #80aa74 100%);
  box-shadow: inset 0 -8px 24px rgba(30, 56, 26, 0.18);
`;

const IllustrationText = styled.p`
  margin: 2.2rem 0 0;
  text-align: center;
  color: #2c332c;
  font-size: 1.5rem;
  line-height: 1.2;
  font-weight: 500;

  strong {
    font-weight: 800;
  }
`;

function ForgotPassword() {
  const navigate = useNavigate();
  const [isMobileViewport, setIsMobileViewport] = useState(window.innerWidth <= 768);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const handleResize = () => setIsMobileViewport(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleStep1 = async (e) => {
    e.preventDefault();
    if (!username.trim() || !whatsapp.trim()) {
      toast.error('Preencha o usuário e o WhatsApp para continuar.');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(username.trim(), whatsapp.trim());
      toast.success('Código enviado! Verifique o WhatsApp da sua empresa.');
      setStep(2);
    } catch {
      toast.error('Usuário ou WhatsApp não encontrados.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    if (!code.trim() || !newPassword || !confirmPassword) {
      toast.error('Preencha todos os campos.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(username.trim(), code.trim(), newPassword);
      toast.success('Senha redefinida com sucesso!');
      setTimeout(() => navigate('/login'), 1500);
    } catch {
      toast.error('Código inválido ou expirado. Solicite um novo código.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Shell>
        <FormPanel>
          <Brand>Horário Certo</Brand>

          {step === 1 ? (
            <>
              <Heading>Esqueceu sua senha?</Heading>
              <Subheading>
                Informe seu usuário e o WhatsApp cadastrado na sua empresa. Enviaremos um código de verificação.
              </Subheading>
              <Form onSubmit={handleStep1}>
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  placeholder="Digite seu usuário"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

                <Label htmlFor="whatsapp">WhatsApp da empresa</Label>
                <Input
                  id="whatsapp"
                  placeholder="(00) 00000-0000"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />

                <HelperText>
                  Use o número cadastrado nas configurações da sua empresa.
                </HelperText>

                <PrimaryButton type="submit" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar código'}
                </PrimaryButton>
                <SecondaryButton type="button" onClick={() => navigate('/login')}>
                  Voltar para login
                </SecondaryButton>

                <Divider>Precisa criar uma conta nova?</Divider>

                <InfoText>
                  Ainda não tem cadastro?{' '}
                  <LinkButton type="button" onClick={() => navigate('/registro')}>
                    Registre-se agora
                  </LinkButton>
                </InfoText>
              </Form>
            </>
          ) : (
            <>
              <StepBadge>Código enviado via WhatsApp</StepBadge>
              <Heading>Crie uma nova senha</Heading>
              <Subheading>
                Digite o código de 6 dígitos que enviamos para o WhatsApp da empresa e escolha sua nova senha.
              </Subheading>
              <Form onSubmit={handleStep2}>
                <Label htmlFor="code">Código de verificação</Label>
                <Input
                  id="code"
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                />

                <Label htmlFor="newPassword">Nova senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <PrimaryButton type="submit" disabled={loading}>
                  {loading ? 'Redefinindo...' : 'Redefinir senha'}
                </PrimaryButton>
                <SecondaryButton type="button" onClick={() => setStep(1)}>
                  Não recebi o código
                </SecondaryButton>
              </Form>
            </>
          )}
        </FormPanel>

        <IllustrationPanel>
          <IllustrationCard>
            <Avatar $top="3.2rem" $left="2.5rem" $size="56px" />
            <Avatar $top="16rem" $left="22.5rem" $size="64px" />
            <Orbit />
            <Character />
            <IllustrationText>
              Recupere seu acesso e volte a organizar com o <strong>Horário Certo</strong>
            </IllustrationText>
          </IllustrationCard>
        </IllustrationPanel>
      </Shell>

      <ToastContainer
        position={isMobileViewport ? 'bottom-center' : 'top-right'}
        autoClose={3000}
        style={isMobileViewport ? { margin: '0 5% 1rem 5%', width: '90%' } : undefined}
      />
    </Page>
  );
}

export default ForgotPassword;

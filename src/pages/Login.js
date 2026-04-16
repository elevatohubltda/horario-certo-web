import React, { useEffect, useState } from 'react'
import { login } from '../services/endpoints/auth';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { isAvailableLogin } from '../util/auth';
import { expiresAt } from '../util/date';
import styled from 'styled-components';
import { format, parse } from 'date-fns';

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

const LoginShell = styled.section`
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
  font-size: clamp(2.2rem, 5vw, 3rem);
  line-height: 1.05;
  margin: 0.75rem 0;
  color: #131313;
`;

const Subheading = styled.p`
  margin: 0 0 2rem;
  font-size: 0.98rem;
  line-height: 1.6;
  color: #5f665d;
  max-width: 360px;
`;

const LoginForm = styled.form`
  margin: 0;
  padding: 0;
  box-shadow: none;
  border-radius: 0;
  background: transparent;
  width: 100%;
  max-width: 380px;
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

const FormFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 0.2rem 0 1.2rem;
`;

const ForgotButton = styled.button`
  border: none;
  background: transparent;
  color: #61695f;
  font-size: 0.82rem;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: #1f271d;
  }
`;

const SubmitButton = styled.button`
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

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 18px rgba(0, 0, 0, 0.16);
  }
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

const RegisterLink = styled.button`
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

function Login() {
  const navigate = useNavigate();
  const [isMobileViewport, setIsMobileViewport] = useState(window.innerWidth <= 768);
  const [userData, setUserData] = useState({
    username: '',
    password: ''
  });
  const handleError = (error) => {
    toast.error(error);
  };
  const handleUserData = (parameter, value) => {
    setUserData((prev) => ({
      ...prev,
      [parameter]: value
    }))
  }
  const handleLogin = async (event) => {
    event.preventDefault();

    if (!userData.username || !userData.password) {
      handleError("Preencha todos os campos!");
      return;
    }
    login(userData)
      .then(res => {
        const token = res.data.token;
        const expirationDate = parse(res.data.expirationDate, 'HH:mm:ss dd/MM/yyyy', new Date());
        const companyUrl = res.data.companyUrl;

        if (res.status === 200) {
          Cookies.set("token", token, {
            expires: expiresAt,
            secure: true,
            sameSite: "Strict",
          });
          Cookies.set("expirationDate", format(expirationDate, "yyyy-MM-dd'T'HH:mm:ss"), {
            expires: expiresAt,
            secure: true,
            sameSite: "Strict",
          });
          Cookies.set("companyUrl", companyUrl, {
            expires: expiresAt,
            secure: true,
            sameSite: "Strict",
          });
          navigate('/dashboard');
        }
      })
      .catch(err => {
        handleError(err?.response?.data?.message || 'Nao foi possivel realizar o login.');
      });
  }

  useEffect(() => {
    if(isAvailableLogin()) {
      navigate('/dashboard');
    }
  }, [navigate]);

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
      <LoginShell>
        <FormPanel>
          <Brand>Horario Certo</Brand>
          <Heading>Bem-vindo de volta!</Heading>
          <Subheading>
            Organize sua rotina e acesse sua agenda em poucos segundos com sua conta.
          </Subheading>

          <LoginForm onSubmit={handleLogin}>
            <Label htmlFor="username">Usuario</Label>
            <Input
              id="username"
              autoComplete="username"
              placeholder="Digite seu usuario"
              value={userData.username}
              onChange={(e) => handleUserData('username', e.target.value)}
            />

            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Digite sua senha"
              value={userData.password}
              onChange={(e) => handleUserData('password', e.target.value)}
            />

            {/* <FormFooter>
              <ForgotButton type="button" onClick={() => navigate('/esqueci-senha')}>
                Esqueceu sua senha?
              </ForgotButton>
            </FormFooter> */}

            <SubmitButton type="submit">Entrar</SubmitButton>

            <Divider>Acesso somente por usuario e senha</Divider>

            <InfoText>
              Nao possui cadastro?{' '}
              <RegisterLink type="button" onClick={() => navigate('/registro')}>
                Registre-se agora
              </RegisterLink>
            </InfoText>
          </LoginForm>
        </FormPanel>

        <IllustrationPanel>
          <IllustrationCard>
            <Avatar $top="3.2rem" $left="2.5rem" $size="56px" />
            <Avatar $top="16rem" $left="22.5rem" $size="64px" />
            <Orbit />
            <Character />
            <IllustrationText>
              Deixe seu trabalho mais simples com o <strong>Horario Certo</strong>
            </IllustrationText>
          </IllustrationCard>
        </IllustrationPanel>
      </LoginShell>
      <ToastContainer
        position={isMobileViewport ? 'bottom-center' : 'top-right'}
        autoClose={3000}
        style={isMobileViewport ? { margin: '0 5% 1rem 5%', width: '90%' } : undefined}
      />
    </Page>
  );
}

export default Login;
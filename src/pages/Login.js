import React, { useEffect, useState } from 'react'
import { Separator } from '../components/separator/style';
import { Title } from '../components/title';
import { login } from '../services/endpoints/auth';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { isAvailableLogin } from '../util/auth';
import { Container } from '../components/container/style';
import { expiresAt } from '../util/date';
import { ReactComponent as Logo } from '../assets/horario-certo-logo.svg';
import { Button } from '../components/button';
import styled from 'styled-components';
import { isMobile } from '../util/util';

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

const Form = styled.form`
    width: ${({ $width }) => $width};
    margin: 1rem auto;
    background: #fff;
    padding: 1.5rem;
    border-radius: 1rem;
    box-shadow: 0 2px 8px rgba(142, 152, 142, 0.1);
`;

function Login() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState();
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
  const handleLogin = async () => {
    if (!userData.username || !userData.password) {
      handleError("Preencha todos os campos!");
      return;
    }
    login(userData)
      .then(res => {
        var token = res.data.token;
        var expirationDate = res.data.expirationDate;
        var companyUrl = res.data.companyUrl;

        if (res.status === 200) {
          Cookies.set("token", token, {
            expires: expiresAt,
            secure: true,
            sameSite: "Strict",
          });
          Cookies.set("expirationDate", expirationDate, {
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
        handleError(err.response.data);
      });
  }
  useEffect(() => {
    setMobile(isMobile()); 
    if(isAvailableLogin()) {
      navigate('/');
    }
  }, [navigate, mobile]);

  return (
    <Container 
      $height="100vh" 
      $margin="0" 
      $display="flex" 
      $justifycontent="center" 
      $alignitems="center" 
      $width="100%" 
      $backgroundcolor="var(--color-background)"
    >
        <Form $width={mobile ? "80%" : "400px"}>
          <Logo />
          <Label>USUÁRIO</Label>
          <Input 
            placeholder='Digite seu usuário'
            value={userData.username}
            onChange={(e) => handleUserData('username', e.target.value)} 
          />
          <Label>SENHA</Label>
          <Input 
            type="password" 
            placeholder='Digite sua senha' 
            value={userData.password}
            onChange={(e) => handleUserData('password', e.target.value)}
          />
          <Button type='button' variant="confirm" onClick={handleLogin}>ACESSAR</Button>
          <Separator $width="50%" $bordercolor="#ccc" $margin="2rem 25% 0 25%" />
          <Title
            $fontweight="300"
            $fontsize="14px"
            $color="#000"
            $align="center"
            $margin="1rem auto 0.5rem auto"
          >
            <span>Não tem uma conta ainda? </span>
          </Title>
          <Button type="button" variant="link" onClick={() => navigate('/registro')}>cadastre aqui</Button>
        </Form>
      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
}

export default Login;
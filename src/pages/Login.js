import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap';
import logo from '../assets/logo.png';
import { Separator } from '../components/separator/style';
import { Title } from '../components/title';
import { login } from '../services/endpoints/auth';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { isAvailableLogin } from '../util/auth';
import { Container } from '../components/container/style';

function Login() {
  const navigate = useNavigate();
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
        if (res.status === 200) {
          Cookies.set("token", res.data.token, {
            expires: 1,
            secure: true,
            sameSite: "Strict",
          });
          Cookies.set("expirationDate", res.data.expirationDate, {
            expires: 1,
            secure: true,
            sameSite: "Strict",
          });
          Cookies.set("companyUrl", res.data.companyUrl, {
            expires: 1,
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
    if(isAvailableLogin()) {
      navigate('/');
    }
  });

  return (
    <Container 
      $height="100vh" 
      $margin="0" 
      $display="flex" 
      $justifycontent="center" 
      $alignitems="center" 
      $width="100%" 
      $backgroundcolor="#f0f0f0"
    >
        <form style={{ width: '300px'}}>
          <img src={logo} alt="Logo" />
          <label>USUÁRIO</label>
          <input 
            type="text" 
            placeholder='Digite seu usuário'
            value={userData.username}
            onChange={(e) => handleUserData('username', e.target.value)} 
          />
          <label>SENHA</label>
          <input 
            type="password" 
            placeholder='Digite sua senha' 
            value={userData.password}
            onChange={(e) => handleUserData('password', e.target.value)}
          />
          <Button onClick={handleLogin}>ACESSAR</Button>
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
          <Button variant="link" onClick={() => navigate('/registro')}>cadastre aqui</Button>
        </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
}

export default Login;
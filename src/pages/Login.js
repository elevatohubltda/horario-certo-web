import React, { useEffect, useState } from 'react'
import { Button, Container } from 'react-bootstrap';
import logo from '../assets/logo.png';
import '../styles/login.css';
import { Separator } from '../components/separator/style';
import { login } from '../services/endpoints/auth';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";

function Login() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: '',
    password: ''
  });
  const [token, setToken] = useState();
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
          console.log(res.data);
          Cookies.set("token", res.data.token, {
            expires: 7,
            secure: true,
            sameSite: "Strict",
          });
          navigate('/dashboard');
        }
      })
      .catch(err => {
        console.log("CATCH");
        handleError(err.response.data);
      });
  }

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      setToken(token);
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <>
      {!token && (
        <Container>
          <div className='login-box'>
            <form>
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
              <Separator width="100%" bordercolor="#ccc" />
              <Button onClick={handleLogin}>ACESSAR</Button>
            </form>
          </div>
          <ToastContainer position="top-right" autoClose={3000} />
        </Container>
      )}
    </>
  );
}

export default Login;
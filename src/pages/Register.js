import React, { useState } from 'react'
import { Button } from 'react-bootstrap';
import logo from '../assets/logo.png';
import { Separator } from '../components/separator/style';
import { Title } from '../components/title';
import { login } from '../services/endpoints/auth';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Container } from '../components/container/style';
import { registerUser } from '../services/endpoints/user';
import { createCompany } from '../services/endpoints/company';
import Cookies from 'js-cookie';

function Register() {
    const navigate = useNavigate();
    const [token, setToken] = useState();
    const [userData, setUserData] = useState({
        username: '',
        password: {
            stepOne: '',
            stepTwo: ''
        }
    });
    const [companyData, setCompanyData] = useState({
        name: '',
        url: '',
        imagem: '',
        whatsapp: '',
        telephone: '',
        instagram: '',
        user: ''
    });
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const handleError = (error) => {
        toast.error(error);
    };
    const handleUserData = (parameter, value) => {
        setUserData((prev) => ({
            ...prev,
            [parameter]: value
        }));
    };
    const handleCompanyData = (parameter, value) => {
        setCompanyData((prev) => ({
            ...prev,
            [parameter]: value
        }));
    };
    const handleRegister = async () => {
        if (
            userData.username === "" || userData.password.stepOne === "" || userData.password.stepTwo === "" ||
            (userData.password.stepOne !== userData.password.stepTwo)) {
            handleError("Preencha os campos usuário/senha corretamente!");
            return;
        }
        if(
            companyData.name === "" || companyData.url === ""
        ) {
            handleError("Preencha os campos nome/link da empresa!");
            return;
        }
        setCompanyData((prev) => ({
            ...prev,
            user: userData.username,
        }));
        if(token === undefined) {
            registerUser(userData)
                .then(res => {
                    if (res.status === 200) {
                        login(userData)
                            .then(res => {
                                if (res.status === 200) {
                                    Cookies.set("token", res.data.token, {
                                        expires: 1,
                                        secure: true,
                                        sameSite: "Strict",
                                    });
                                    setToken(res.data.token);
                                    createCompany(companyData).then(res => {
                                        if (res.status === 200) {
                                            toast.success("Empresa criada com sucesso!");
                                            sleep(2000);
                                            navigate('/login');
                                        } else {
                                            handleError(res.data);
                                        }
                                    })
                                } else {
                                    handleError(res.data);
                                }
                            })
                    } else {
                        handleError(res.data);
                    }
                })
                .catch(err => {
                    handleError(err.response.data);
                });
        } else {
            //Second atempt
            createCompany(companyData).then(res => {
                if (res.status === 200) {
                    toast.success("Empresa criada com sucesso!");
                }
                
            handleError(res.data);
            })
        }
    }

    return (
        <Container
            $margin="0"
            $display="flex"
            $justifycontent="center"
            $alignitems="center"
            $width="100%"
            $backgroundcolor="#f0f0f0"
        >
            <form style={{width: '600px'}}>
                <img src={logo} alt="Logo" style={{ margin: '1rem 5rem' }} />
                <Title $color="#312a5f" $fontsize="1.2rem" $margin="2rem 0 0 0" $fontweight="500">
                    Experimente grátis por 30 dias e descubra como o Horário Certo pode transformar o seu negócio!
                </Title>
                <Separator $width="100%" $bordercolor="#ccc" $margin="2rem 0 3rem 0" />
                <label>*Nome da empresa:</label>
                <input
                    type="text"
                    placeholder='Digite o nome da empresa'
                    value={companyData.name}
                    onChange={(e) => handleCompanyData('name', e.target.value)}
                />
                <label>*Whatsapp da empresa:</label>
                <input
                    type="text"
                    placeholder='Digite o whatsapp da empresa'
                    value={companyData.whatsapp}
                    onChange={(e) => handleCompanyData('whatsapp', e.target.value)}
                />
                <label>Instagram da empresa:</label>
                <input
                    type="text"
                    placeholder='Digite o instagram da empresa'
                    value={companyData.instagram}
                    onChange={(e) => handleCompanyData('instagram', e.target.value)}
                />
                <label>*Link para os clientes acessarem a empresa:</label>
                <input
                    type="text"
                    placeholder='Digite o link de acesso a empresa'
                    value={companyData.url}
                    onChange={(e) => handleCompanyData('url', e.target.value)}
                />
                <p style={{ margin: '0 0 1rem 0' }}>Seus clientes acessarão com o seguinte link: https://horariocerto.elevatohub.com.br/{companyData.url}</p>
                <label>*Digite seu usuário para acesso:</label>
                <input
                    type="text"
                    placeholder='Digite seu usuário'
                    value={userData.username}
                    onChange={(e) => handleUserData('username', e.target.value)}
                />
                <label>*Digite sua senha de acesso:</label>
                <input
                    type="password"
                    placeholder='Digite sua senha'
                    value={userData.password.stepOne}
                    onChange={(e) => handleUserData('password', e.target.value)}
                />
                <label>*Digite novamente sua senha de acesso:</label>
                <input
                    type="password"
                    placeholder='Digite sua senha'
                    value={userData.password.stepTwo}
                    onChange={(e) => handleUserData('password', e.target.value)}
                />
                <Separator $width="100%" $bordercolor="#ccc" $margin="2rem 0" />
                <Button onClick={handleRegister}>CADASTRAR</Button>
            </form>
            <ToastContainer position="top-right" autoClose={3000} />
        </Container>
    );
}

export default Register;
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
import logo from '../assets/logo.png';
import { isMobile } from '../util/util';
import { formataNumeroTelefone } from '../util/format';

function Register() {
    const navigate = useNavigate();
    const steps = ['Empresa', 'Acesso'];
    const [mobile, setMobile] = React.useState()
    const [loading, setLoading] = React.useState(false);
    const [step, setStep] = useState(0);
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
    const handleError = (error) => toast.error(error);
    const handleUserData = (parameter, value) => {
        setUserData(prev => ({ ...prev, [parameter]: value }));
    };
    const handleCompanyData = (parameter, value) => {
        setCompanyData(prev => ({ ...prev, [parameter]: value }));
    };
    const handleNext = () => {
        if (step === 0) {
            if (companyData.name === "" || companyData.url === "") {
                handleError("Preencha os dados da empresa!");
                return;
            }
            setStep(step + 1);
        } else {
            handleRegister();
        }
    };
    const handleBack = () => setStep(step - 1);

    const handleRegister = async () => {
        setLoading(true);
        if (
            userData.username === "" ||
            userData.password.stepOne === "" ||
            userData.password.stepTwo === "" ||
            userData.password.stepOne !== userData.password.stepTwo
        ) {
            handleError("Preencha os campos usuário/senha corretamente!");
            return;
        }

        setCompanyData(prev => ({ ...prev, user: userData.username }));
        handleCompanyData('whatsapp', companyData.whatsapp.replace(/\D/g, ''))

        if (token === undefined) {
            try {
                const res = await registerUser({username: userData.username, password: userData.password.stepOne});
                if (res.status === 200) {
                    const loginRes = await login({username: userData.username, password: userData.password.stepOne});
                    if (loginRes.status === 200) {
                        Cookies.set("token", loginRes.data.token, {
                            expires: 1, secure: true, sameSite: "Strict"
                        });
                        setToken(loginRes.data.token);
                        const companyRes = await createCompany(companyData);
                        if (companyRes.status === 200) {
                            toast.success("Empresa criada com sucesso!");
                            setLoading(false);
                            await sleep(2000);
                            navigate('/login');
                        } else {
                            setLoading(false);
                            handleError(companyRes.data);
                        }
                    } else {
                        setLoading(false);
                        handleError(loginRes.data);
                    }
                } else {
                    setLoading(false);
                    handleError(res.data);
                }
            } catch (err) {
                setLoading(false);
                handleError(err.response?.data || err.message);
            }
        } else {
            const companyRes = await createCompany(companyData);
            if (companyRes.status === 200) {
                setLoading(false);
                toast.success("Empresa criada com sucesso!");
            } else {
                setLoading(false);
                handleError(companyRes.data);
            }
        }
    };

    useEffect(() => {
        setMobile(isMobile());
    })

    return (
        <Container
            $margin={mobile ? ".25rem 0 1rem 0" :".25rem auto 1rem auto"}
            $display="flex"
            $justifycontent="center"
            $alignitems="center"
            $width={mobile ? "100%" : "40%"}
            $height="100%"
        >
            <form style={{ 
                width: '80%',
                margin: '1rem auto' }}>
                <img src={logo} alt="Logo" style={{ margin: '1rem 10%', minWidth: '200px' }} />
                <Separator $width="100%" $bordercolor="#ccc" $margin="1rem 0 0 0" />
                <Stepper steps={steps} currentStep={step} />
                {step === 0 && (
                    <>
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
                            value={formataNumeroTelefone(companyData.whatsapp)}
                            onChange={(e) => handleCompanyData('whatsapp', formataNumeroTelefone(e.target.value))}
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
                        <p style={{ margin: '0 0 1rem 0'}}>
                            Seus clientes acessarão com o link: 
                        </p>
                        
                        <span style={{fontSize: '12px', color: "#757575", overflow: 'auto'}}>horariocerto.elevatohub.com.br/{companyData.url}</span>
                    </>
                )}

                {step === 1 && (
                    <>
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
                            onChange={(e) => handleUserData('password', { ...userData.password, stepOne: e.target.value })}
                        />
                        <label>*Digite novamente sua senha de acesso:</label>
                        <input
                            type="password"
                            placeholder='Confirme sua senha'
                            value={userData.password.stepTwo}
                            onChange={(e) => handleUserData('password', { ...userData.password, stepTwo: e.target.value })}
                        />
                    </>
                )}

                <Separator $width="100%" $bordercolor="#ccc" $margin="2rem 0" />

                <div style={{ display: 'flex', justifyContent: loading? 'flex-end' : step > 0 ? "space-between": "flex-end" }}>
                    {!loading && step > 0 && (
                        <Button type="button" variant="link" onClick={handleBack}>Voltar</Button>
                    )}
                    <Button type="button" variant="confirm" onClick={handleNext}>
                        {loading ? '' : step === 0 ? 'Avançar' : 'Cadastrar'}
                        {loading && 
                            <span className="loader" style={{width: '1.5rem', height: '1.5rem',  borderWidth: "3px"}}></span>
                        }
                    </Button>
                </div>

            </form>
            {mobile != undefined &&
                <ToastContainer position={mobile ? "bottom-center" : "top-right"} autoClose={3000} style={{margin: 'auto 5% 1rem 5%', width: '90%'}} />
            }
        </Container>
    );
}

export default Register;

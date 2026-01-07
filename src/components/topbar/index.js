import React, { useEffect, useRef, useState } from 'react';
import { ReactComponent as UserLogo } from '../../assets/icons/user.svg';
import { ReactComponent as MenuLogo } from '../../assets/icons/menu.svg';
import { ReactComponent as Logo } from '../../assets/horario-certo-logo-horizontal.svg';
import { TopbarStyle } from './style';
import { Instagram, WhatsApp } from '@mui/icons-material';
import businessLogo from '../../assets/images/corporate-building.png';
import { isAvailableLogin, logout } from '../../util/auth';
import {Separator} from '../separator/style';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { isMobile, openInstagram, openWhatsApp } from '../../util/util';
import Cookies from "js-cookie";

export default function Topbar({imagem, whatsapp, instagram, name}) {
  const [isAuth, setIsAuth] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [mobile, setMobile] = useState();
  const companyUrl = Cookies.get("companyUrl");

  useEffect(() => {
    if(isAvailableLogin()) {
      setIsAuth(true);
    }
    setMobile(isMobile());  
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (path) => {
    setOpen(false);
    navigate(path);
  }

  const handleLogout = () => {
    logout();
    setOpen(false);
    toast.success("Desconectado com sucesso!");
    setIsAuth(false);
    navigate('/'+companyUrl);
  }

  const showEstablishment = (mobile && !isAuth) || (!mobile && !isAuth);

  const renderEstablishment = () => (
    <div className={!isMobile ? 'establishmentBox' : 'establishmentBoxMobile'}>
      <img
        src={ mobile ? imagem : imagem === "" ? businessLogo : imagem
        }
        alt="Barbearia Seu Zé"
      />
      <div className="content">
        <span>{name}</span>
        <div className="social-media">
          <WhatsApp className="whatsapp" onClick={() => openWhatsApp(whatsapp)} />
          <Instagram className="instagram" onClick={() => openInstagram(instagram)} />
        </div>
      </div>
    </div>
  );

  const renderMenuNotAuth = () => (
    <>
      <div className="menu" ref={menuRef}>
        <button className="menu-button" onClick={() => setOpen(!open)}>
          <MenuLogo />
        </button>
        {open && (
          <div className="user-dropdown">
            <div className="dropdown-item">
              <button onClick={() => handleNavigate('/login')}>Acessar</button>
            </div>
            {/* <div className="dropdown-item">
              <button>Seja Parceiro</button>
            </div> */}
          </div>
        )}
      </div>
    </>
  );

  const renderMenuAuth = () => (
    <div className="menu" ref={menuRef}>
      <button
        className={mobile ? 'menu-button' : 'user-button'}
        onClick={() => setOpen(!open)}
      >
        {mobile ? <MenuLogo /> : <UserLogo />}
      </button>
      {open && (
        <div className="user-dropdown">
          <div className="dropdown-item" onClick={() => handleNavigate('/dashboard')}>
            <button>Meu painel</button>
          </div>
          <div className="dropdown-item" onClick={() => handleNavigate('/'+companyUrl)}>
            <button>Minha agenda</button>
          </div>
          {mobile ? 
            <>
              <div className="dropdown-item" onClick={() => handleNavigate('/criar-agendamentos')}>
                <button>Criar agenda</button>
              </div>
              {/* <div className="dropdown-item" onClick={() => handleNavigate('/plano')}>
                <button>Meu plano</button>
              </div> */}
              <div className="dropdown-item" onClick={() => handleNavigate('/alterar-senha')}>
                <button>Alterar senha</button>
              </div>
              <div className="dropdown-item" onClick={() => handleNavigate('/configuracoes')}>
                <button>Configurações</button>
              </div>
            </>
          : <></>
          }
          <Separator $width="100%" $bordercolor="#ccc" $margin="0" />
          <div className="dropdown-item">
            <button onClick={handleLogout}>Sair</button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <TopbarStyle>
        <>
          {showEstablishment && renderEstablishment()}

          {isAuth && <Logo className='logo' />}

          {!mobile && !isAuth && (
            <div className="menu">
              {/* <button className="be-a-partner">Seja Parceiro</button> */}
              <button className="my-area" onClick={() => handleNavigate('/login')}>
                Entrar
              </button>
            </div>
          )}

          {mobile && !isAuth && renderMenuNotAuth()}
          {isAuth && renderMenuAuth()}
        </>
      <ToastContainer position={isMobile ? 'bottom-right' : 'top-right'} className={isMobile ? 'mobile' : 'desktop'} autoClose={3000} />
    </TopbarStyle>
  );
}

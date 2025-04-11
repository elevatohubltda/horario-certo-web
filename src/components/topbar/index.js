import React, { useEffect, useRef, useState } from 'react';
import { ReactComponent as UserLogo } from '../../assets/icons/user.svg';
import { ReactComponent as MenuLogo } from '../../assets/icons/menu.svg';
import { TopbarStyle } from './style';
import logo from '../../assets/logo.png'
import { Instagram, WhatsApp } from '@mui/icons-material';
import businessLogo from '../../assets/images/barbearia-retro.jpg';
import { isAvailableLogin, logout } from '../../util/auth';
import {Separator} from '../separator/style';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { isMobile } from '../../util/util';

export default function Topbar() {
  const [isAuth, setIsAuth] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobile, setMobile] = useState();
  console.log(mobile);

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
    navigate(location.pathname);
  }

  const openWhatsApp = () => {
    const url = "https://wa.me/5535999272687";
    window.open(url, "_blank"); // Abre o link em uma nova aba
  };

  return (
    <TopbarStyle>
        {!mobile && 
          <img src={logo} alt="Logo" />
        }
        <>
          {mobile && isAuth &&
            <div className={!isMobile ? 'establishmentBox' : 'establishmentBoxMobile'}>
              <img src={businessLogo} alt="Barbearia Seu Zé" />
              <div className='content'>
                <span>Barbearia Seu Zé</span>
                <div className='social-media'>
                  <WhatsApp className='whatsapp' onClick={openWhatsApp}/>
                  <Instagram className='instagram' />
                </div>
              </div>
            </div>
          }
          {!mobile && !isAuth &&
            <div className='menu'>
              <button className='be-a-partner'>Seja Parceiro</button>
              <button 
                className='my-area' 
                onClick={() => handleNavigate('/login')}
              >
                Minha Área
              </button>
            </div>
          }
          {mobile && !isAuth &&
            <>
              <div className={!isMobile ? 'establishmentBox' : 'establishmentBoxMobile'}>
                <img src={businessLogo} alt="Barbearia Seu Zé" />
                <div className='content'>
                  <span>Barbearia Seu Zé</span>
                  <div className='social-media'>
                    <WhatsApp className='whatsapp' />
                    <Instagram className='instagram' />
                  </div>
                </div>
              </div>
              <div className="menu" ref={menuRef}>
                <button 
                  className="menu-button" 
                  onClick={() => setOpen(!open)}
                >
                  <MenuLogo />
                </button>
    
                {open && (
                  <div className="user-dropdown">
                    <div className="dropdown-item">
                      <button onClick={() => handleNavigate('/login')}>
                        Minha Área
                      </button>
                    </div>
                    <div className="dropdown-item">
                      <button>
                        Seja Parceiro
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          }
        </>
        {isAuth && (
          !mobile ?
          <div className="menu" ref={menuRef}>
            <button 
              className="user-button" 
              onClick={() => setOpen(!open)}
            >
              <UserLogo />
            </button>

            {open && (
              <div className="user-dropdown">
                <div className="dropdown-item">
                  <button>
                    Painel
                  </button>
                </div>
                <div className="dropdown-item">
                  <button>
                    Minha conta
                  </button>
                </div>
                <div className="dropdown-item">
                  <button>
                    Configurações
                  </button>
                </div>
                <Separator 
                  width="100%" 
                  bordercolor="#ccc" 
                  margin="0" 
                />
                <div className="dropdown-item">
                  <button
                    onClick={() => handleLogout()}>
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
          :
          <div className="menu" ref={menuRef}>
            <button 
              className="menu-button" 
              onClick={() => setOpen(!open)}
            >
              <MenuLogo />
            </button>

            {open && (
              <div className="user-dropdown">
                <div className="dropdown-item">
                  <button>
                    Painel
                  </button>
                </div>
                <div className="dropdown-item">
                  <button>
                    Minha conta
                  </button>
                </div>
                <div className="dropdown-item">
                  <button>
                    Configurações
                  </button>
                </div>
                <Separator 
                  width="100%" 
                  bordercolor="#ccc" 
                  margin="0" 
                />
                <div className="dropdown-item">
                  <button
                    onClick={() => handleLogout()}>
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      <ToastContainer position={isMobile ? 'bottom-right' : 'top-right'} className={isMobile ? 'mobile' : 'desktop'} autoClose={3000} />
    </TopbarStyle>
  );
}

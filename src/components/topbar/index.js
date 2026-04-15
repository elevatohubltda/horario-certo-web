import React, { useEffect, useRef, useState } from 'react';
import { ReactComponent as UserLogo } from '../../assets/icons/user.svg?component';
import { ReactComponent as MenuLogo } from '../../assets/icons/menu.svg?component';
import { ReactComponent as Logo } from '../../assets/horario-certo-logo-horizontal.svg?component';
import { TopbarStyle } from './style';
import { Instagram, WhatsApp } from '@mui/icons-material';
import businessLogo from '../../assets/images/corporate-building.png';
import { isAvailableLogin, logout } from '../../util/auth';
import {Separator} from '../separator/style';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { isMobile, openInstagram, openWhatsApp } from '../../util/util';
import Cookies from "js-cookie";
import Dialog from '../dialog';
import styled from 'styled-components';

const DialogTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.15rem;
  color: var(--color-dark);
`;

const DialogText = styled.span`
  margin: 0 1rem 1.5rem 0;
  color: rgba(30, 44, 40, 0.8);
  line-height: 1.5;
`;

const DialogInput = styled.input`
  width: -webkit-fill-available;
  padding: 0.85rem 1rem;
  border: 1px solid rgba(30, 44, 40, 0.12);
  border-radius: 12px;
  margin-top: 1rem;
  font-size: 0.95rem;
  color: var(--color-dark);
  background: #f5f5f7;
`;

const DialogActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
  display: flex;
  justify-content: center;
`;

const DialogButton = styled.button`
  cursor: pointer;
  border: none;
  border-radius: 999px;
  padding: 0.85rem 1rem;
  font-weight: 600;
  font-size: 0.95rem;
  min-width: 120px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

const CopyButton = styled(DialogButton)`
  background: var(--color-dark);
  color: #fff;
  align-items: center;
  justify-content: center;
`;

const WhatsAppButton = styled(DialogButton)`
  background: #25d366;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default function Topbar({imagem, whatsapp, instagram, name}) {
  const [isAuth, setIsAuth] = useState(false);
  const [open, setOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
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

  const shareUrl = `${window.location.origin}/${companyUrl}`;
  const safeImage = typeof imagem === 'string' ? imagem.trim() : '';
  const imageSrc = safeImage ? safeImage : businessLogo;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copiado para a área de transferência');
    } catch (error) {
      toast.error('Não foi possível copiar o link');
    }
  };

  const handleShareWhatsApp = () => {
    const message = `Olá! Venha conhecer os serviços de qualidade da ${name}!\n\n- Fácil de agendar\n- Rápido e seguro\n- Melhor atendimento\n\nClique aqui e agende seu horário agora: ${shareUrl}\n\nAté logo!`;
    const text = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const showEstablishment = (mobile && !isAuth) || (!mobile && !isAuth);

  const renderEstablishment = () => (
    <div className={mobile ? 'establishmentBoxMobile' : 'establishmentBox'}>
      <img
        src={imageSrc}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = businessLogo;
        }}
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
              <button onClick={() => handleNavigate('/')}>Acessar</button>
            </div>
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

          {!mobile && (
            <div className="dropdown-item" onClick={() => { setShareDialogOpen(true); setOpen(false); }}>
              <button>Link compartilhável</button>
            </div>
          )}

          {mobile ? 
            <>
              <div className="dropdown-item" onClick={() => handleNavigate('/agendamentos')}>
                <button>Agendamentos</button>
              </div>
              <div className="dropdown-item" onClick={() => handleNavigate('/servicos')}>
                <button>Serviços</button>
              </div>
              <div className="dropdown-item" onClick={() => handleNavigate('/assinatura')}>
                <button>Assinatura</button>
              </div>
              <div className="dropdown-item" onClick={() => handleNavigate('/alterar-senha')}>
                <button>Alterar senha</button>
              </div>
              <div className="dropdown-item" onClick={() => handleNavigate('/configuracoes')}>
                <button>Configurações</button>
              </div>
              <div className="dropdown-item" onClick={() => { setShareDialogOpen(true); setOpen(false); }}>
                <button>Link compartilhável</button>
              </div>
            </>
          : <></>
          }
          <Separator $width="100%" $bordercolor="#ccc" $margin="0" $style="dotted" />
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
              <button className="my-area" onClick={() => handleNavigate('/')}>
                Entrar
              </button>
            </div>
          )}

          {mobile && !isAuth && renderMenuNotAuth()}
          {isAuth && renderMenuAuth()}

          <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} mobile={mobile}>
            <DialogTitle>Compartilhe sua agenda</DialogTitle>
            <DialogText>Copie o link da sua agenda ou compartilhe pelo WhatsApp com uma mensagem pronta.</DialogText>
            <DialogInput readOnly value={shareUrl} />
            <DialogActions>
              <CopyButton onClick={handleCopyLink}>Copiar link</CopyButton>
              <WhatsAppButton onClick={handleShareWhatsApp}>
                <WhatsApp style={{ marginRight: '0.5rem' }} />
                Compartilhar
              </WhatsAppButton>
            </DialogActions>
          </Dialog>
        </>
      <ToastContainer position={mobile ? 'bottom-right' : 'top-right'} className={mobile ? 'mobile' : 'desktop'} autoClose={3000} />
    </TopbarStyle>
  );
}

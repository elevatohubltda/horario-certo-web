import React from 'react';
import { TopbarStyle } from './style';
import logo from '../../assets/logo.png'
import { Instagram, WhatsApp } from '@mui/icons-material';
import businessLogo from '../../assets/images/barbearia-retro.jpg';

export default function Topbar() {
  return (
    <TopbarStyle>
        <img src={logo} alt="Logo" />
        <div className='establishmentBox'>
          <img src={businessLogo} alt="Barbearia Seu Zé" />
          <div className='content'>
            <span>Barbearia Seu Zé</span>
            <div className='social-media'>
              <WhatsApp className='whatsapp' />
              <Instagram className='instagram' />
            </div>
          </div>
        </div>
        <div className='menu'>
          <button className='be-a-partner'>Seja Parceiro</button>
          <button className='my-area'>
            <a href="/login">Minha Área
            </a>
          </button>
        </div>
    </TopbarStyle>
  );
}

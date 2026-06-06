import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { isMobileApp } from '../../services/api';

const CONSENT_KEY = 'hc_cookie_consent';

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(24px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
`;

/* ── Overlay ───────────────────────────────────────────── */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(10, 14, 10, 0.72);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: ${fadeIn} 0.25s ease;
`;

/* ── Modal ─────────────────────────────────────────────── */
const Modal = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.22);
  width: 100%;
  max-width: 580px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: ${slideUp} 0.3s ease;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 1.4rem 1.6rem 0;
  flex-shrink: 0;
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.3rem;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.1rem;
  color: #1a2118;
`;

const ModalSubtitle = styled.p`
  margin: 0 0 1rem;
  font-size: 0.8rem;
  color: #7a8177;
  line-height: 1.5;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #eaeee7;
  margin: 0;
`;

/* ── Corpo rolável ─────────────────────────────────────── */
const ScrollBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.2rem 1.6rem;
  font-size: 0.82rem;
  color: #4a5148;
  line-height: 1.7;

  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-track { background: #f0f2ee; border-radius: 4px; }
  &::-webkit-scrollbar-thumb { background: #b8c4b5; border-radius: 4px; }

  h3 {
    font-size: 0.83rem;
    color: #1a2118;
    margin: 1rem 0 0.3rem;
  }

  ul {
    margin: 0 0 0.5rem;
    padding-left: 1.2rem;

    li { margin-bottom: 0.2rem; }
  }

  p { margin: 0 0 0.5rem; }

  a {
    color: var(--color-sage, #6a9c6a);
    text-decoration: underline;
  }
`;

/* ── Rodapé ────────────────────────────────────────────── */
const ModalFooter = styled.div`
  flex-shrink: 0;
  padding: 1rem 1.6rem 1.4rem;
  border-top: 1px solid #eaeee7;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const CheckRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  cursor: pointer;
  font-size: 0.82rem;
  color: #3a4038;
  line-height: 1.5;
  user-select: none;

  input[type="checkbox"] {
    appearance: none;
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    min-width: 18px;
    border-radius: 5px;
    border: 1.5px solid ${({ $checked }) => ($checked ? 'var(--color-sage, #6a9c6a)' : '#b0b8ad')};
    background: ${({ $checked }) => ($checked ? 'var(--color-sage, #6a9c6a)' : '#fff')};
    cursor: pointer;
    margin-top: 1px;
    transition: background 0.15s, border-color 0.15s;
    position: relative;

    &::after {
      content: '';
      display: ${({ $checked }) => ($checked ? 'block' : 'none')};
      position: absolute;
      left: 4px;
      top: 1px;
      width: 5px;
      height: 9px;
      border: 2px solid #fff;
      border-top: none;
      border-left: none;
      transform: rotate(45deg);
    }
  }
`;

const AcceptBtn = styled.button`
  width: 100%;
  padding: 0.7rem;
  border-radius: 10px;
  border: none;
  background: ${({ disabled }) => disabled ? '#c8d4c6' : 'var(--color-sage, #6a9c6a)'};
  color: ${({ disabled }) => disabled ? '#8fa48c' : '#fff'};
  font-size: 0.88rem;
  font-weight: 700;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  transition: background 0.2s, color 0.2s, opacity 0.2s;

  &:hover:not(:disabled) { opacity: 0.88; }
`;

/* ── Export helper ─────────────────────────────────────── */
export function getCookieConsent() {
  return localStorage.getItem(CONSENT_KEY);
}

export function hasConsented() {
  return localStorage.getItem(CONSENT_KEY) === 'accepted';
}

/* ── Componente principal ──────────────────────────────── */
export default function CookieConsent({ onAccept }) {
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) {
      setVisible(true);
    }
  }, []);

  /* bloqueia scroll da página enquanto o modal estiver aberto */
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [visible]);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);

    if (isMobileApp() && window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'TERMS_ACCEPTED' }));
    }

    if (onAccept) onAccept();
  };

  if (!visible) return null;

  return (
    <Overlay>
      <Modal role="dialog" aria-modal="true" aria-labelledby="consent-title">
        <ModalHeader>
          <HeaderTop>
            <span aria-hidden="true" style={{ fontSize: '1.3rem' }}>🔒</span>
            <ModalTitle id="consent-title">Termos de Uso e Privacidade</ModalTitle>
          </HeaderTop>
          <ModalSubtitle>
            Leia os termos abaixo. É necessário aceitá-los para utilizar a plataforma.
          </ModalSubtitle>
        </ModalHeader>

        <Divider />

        <ScrollBody ref={scrollRef}>
          <h3>1. Sobre a plataforma</h3>
          <p>
            O <strong>Horário Certo</strong> é uma plataforma SaaS de agendamentos online
            operada pela <strong>Elevatohub</strong>. Ao utilizar nossos serviços, você concorda
            com estes termos, em conformidade com a{' '}
            <a href="/termos-de-uso" target="_blank" rel="noopener noreferrer">
              Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)
            </a>.
          </p>

          <h3>2. Dados coletados</h3>
          <ul>
            <li><strong>Cadastrais:</strong> nome da empresa, URL, WhatsApp, Instagram.</li>
            <li><strong>Acesso:</strong> usuário e senha (armazenada em hash irreversível).</li>
            <li><strong>Cobrança:</strong> e-mail e CPF/CNPJ, usados exclusivamente para emissão de cobranças via Mercado Pago.</li>
            <li><strong>Clientes finais:</strong> nome e telefone inseridos pelo estabelecimento para gestão de agendamentos.</li>
          </ul>

          <h3>3. Cookies utilizados</h3>
          <p>
            Utilizamos apenas <strong>cookies funcionais e de sessão</strong>, estritamente
            necessários para autenticação e funcionamento da plataforma. Nenhum cookie de
            rastreamento ou publicidade é utilizado.
          </p>
          <ul>
            <li><strong>token</strong> — autenticação JWT da sessão.</li>
            <li><strong>companyUrl / companyInfo / companyFeatures</strong> — dados operacionais da sessão.</li>
          </ul>

          <h3>4. Finalidade do tratamento</h3>
          <ul>
            <li>Prestação do serviço de agendamentos contratado.</li>
            <li>Processamento de pagamentos mensais via PIX (Mercado Pago).</li>
            <li>Envio de notificações via WhatsApp, quando habilitado pelo estabelecimento.</li>
          </ul>

          <h3>5. Compartilhamento</h3>
          <p>
            Seus dados são compartilhados somente com: <strong>Mercado Pago</strong> (cobrança),
            <strong> Z-API</strong> (WhatsApp), <strong>Railway</strong> (hospedagem) e{' '}
            <strong>Google Cloud Storage</strong> (imagens). Não vendemos dados a terceiros.
          </p>

          <h3>6. Seus direitos (LGPD)</h3>
          <p>
            Você pode a qualquer momento solicitar acesso, correção, portabilidade ou exclusão
            dos seus dados pelo e-mail <strong>privacidade@elevatohub.com.br</strong>.
          </p>
          <p>
            Consulte a{' '}
            <a href="/termos-de-uso" target="_blank" rel="noopener noreferrer">
              Política de Privacidade completa
            </a>{' '}
            para mais detalhes.
          </p>
        </ScrollBody>

        <ModalFooter>
          <CheckRow $checked={checked}>
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            Li e aceito os <strong style={{ margin: '0 0.2rem' }}>Termos de Uso</strong> e a{' '}
            <strong style={{ marginLeft: '0.2rem' }}>Política de Privacidade</strong> da plataforma.
          </CheckRow>

          <AcceptBtn disabled={!checked} onClick={accept}>
            {checked ? 'Aceitar e continuar' : 'Leia e marque o campo acima para continuar'}
          </AcceptBtn>
        </ModalFooter>
      </Modal>
    </Overlay>
  );
}

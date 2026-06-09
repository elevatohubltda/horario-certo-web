import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/topbar';
import Sidebar from '../components/sidebar';
import { Container } from '../components/container/style';
import { Title } from '../components/title';
import { Separator } from '../components/separator/style';
import { isAvailableLogin } from '../util/auth';
import { getCompany } from '../services/endpoints/company';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';

/* ─── Carrossel ──────────────────────────────────────────────────────── */
const CARD_W = 260;
const CARD_H = Math.round(CARD_W * (1123 / 794));
const CARD_SCALE = CARD_W / 794;

const CarouselWrapper = styled.div`
  width: calc(100% - 2rem);
  margin: 0 1rem 3rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.25rem;
`;

const CarouselTrack = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 1.5rem;
  overflow: hidden;
  width: 100%;
`;

const SlideCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.75rem;
  flex-shrink: 0;
  width: ${CARD_W}px;
  transition: opacity 0.2s;
  opacity: ${p => p.$active ? 1 : 0.45};
`;

const CardLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7a6a;
`;

const PreviewBox = styled.div`
  width: ${CARD_W}px;
  height: ${CARD_H}px;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(22, 29, 23, 0.14);
  flex-shrink: 0;
`;

const PreviewInner = styled.div`
  transform: scale(${CARD_SCALE});
  transform-origin: top left;
  width: 794px;
  height: 1123px;
  pointer-events: none;
`;

const DownloadBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 2.4rem;
  border-radius: 999px;
  border: none;
  background: var(--color-dark);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(22, 29, 23, 0.22);
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const NavRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
`;

const ArrowBtn = styled.button`
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  border: 1px solid #d4d9d1;
  background: #fff;
  color: var(--color-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s, box-shadow 0.15s;

  &:hover:not(:disabled) {
    background: #f0f4ee;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }
  &:disabled { opacity: 0.3; cursor: default; }
`;

const Counter = styled.span`
  font-size: 0.82rem;
  color: #6b7a6a;
  font-weight: 500;
  min-width: 4rem;
`;

const Dots = styled.div`display: flex; gap: 0.4rem; align-items: center;`;
const Dot = styled.button`
  width: ${p => p.$active ? '20px' : '7px'};
  height: 7px;
  border-radius: 999px;
  border: none;
  padding: 0;
  background: ${p => p.$active ? 'var(--color-sage)' : '#c8cec4'};
  cursor: pointer;
  transition: width 0.2s, background 0.2s;
`;


/* ─── Hidden full-size render area ──────────────────────────────────── */
const HiddenArea = styled.div`
  position: fixed;
  top: -9999px;
  left: -9999px;
  z-index: -1;
`;

/* ═══════════════════════════════════════════════════════════════════════
   LAYOUT 1 — Minimalista Branco
   ═════════════════════════════════════════════════════════════════════ */
const L1Wrap = styled.div`
  width: 794px;
  height: 1123px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Montserrat', 'Helvetica Neue', sans-serif;
  position: relative;
  overflow: hidden;
`;
const L1TopBar = styled.div`
  width: 100%;
  height: 10px;
  background: linear-gradient(90deg, #4a6741 0%, #7eab73 100%);
`;
const L1Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 60px;
  gap: 36px;
`;
const L1Label = styled.span`
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: #7eab73;
  text-transform: uppercase;
`;
const L1Name = styled.h1`
  font-size: 52px;
  font-weight: 800;
  color: #131a13;
  text-align: center;
  line-height: 1.05;
  margin: 0;
`;
const L1QRCard = styled.div`
  background: #f5f8f4;
  border-radius: 20px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  border: 1.5px solid #dde5da;
`;
const L1QRLabel = styled.p`
  font-size: 15px;
  color: #556652;
  font-weight: 500;
  margin: 0;
  text-align: center;
`;
const L1Divider = styled.div`
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #4a6741, #7eab73);
  border-radius: 2px;
`;
const L1Tagline = styled.p`
  font-size: 22px;
  color: #2a352a;
  font-weight: 600;
  text-align: center;
  margin: 0;
  max-width: 500px;
`;
const L1Url = styled.p`
  font-size: 14px;
  color: #8a9a88;
  margin: 0;
  letter-spacing: 0.02em;
`;
const L1Footer = styled.div`
  width: 100%;
  padding: 20px 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #e8ede6;
`;
const L1FooterBrand = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #4a6741;
  letter-spacing: 0.06em;
`;
const L1FooterNote = styled.span`
  font-size: 12px;
  color: #aab5a8;
`;

function Layout1({ name, qrValue, url }) {
  return (
    <L1Wrap>
      <L1TopBar />
      <L1Body>
        <L1Label>Agendamento online</L1Label>
        <L1Name>{name}</L1Name>
        <L1Divider />
        <L1QRCard>
          <L1QRLabel>Escaneie o código para agendar</L1QRLabel>
          <QRCodeSVG value={qrValue} size={220} />
          <L1QRLabel style={{ fontSize: 13, color: '#8a9a88' }}>{url}</L1QRLabel>
        </L1QRCard>
        <L1Tagline>Agende seu horário de onde estiver, quando quiser.</L1Tagline>
      </L1Body>
      <L1Footer>
        <L1FooterBrand>HORÁRIO CERTO</L1FooterBrand>
        <L1FooterNote>Agendamento inteligente para barbearias</L1FooterNote>
      </L1Footer>
    </L1Wrap>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LAYOUT 2 — Noturno Verde
   ═════════════════════════════════════════════════════════════════════ */
const L2Wrap = styled.div`
  width: 794px;
  height: 1123px;
  background: #141e14;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Montserrat', 'Helvetica Neue', sans-serif;
  position: relative;
  overflow: hidden;
`;
const L2Circle1 = styled.div`
  position: absolute;
  width: 520px;
  height: 520px;
  border-radius: 50%;
  border: 1.5px solid rgba(126,171,115,0.15);
  top: -120px;
  right: -140px;
`;
const L2Circle2 = styled.div`
  position: absolute;
  width: 350px;
  height: 350px;
  border-radius: 50%;
  border: 1.5px solid rgba(126,171,115,0.1);
  bottom: -80px;
  left: -90px;
`;
const L2Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  gap: 40px;
  position: relative;
  z-index: 1;
`;
const L2Headline = styled.h1`
  font-size: 48px;
  font-weight: 800;
  color: #ffffff;
  text-align: center;
  line-height: 1.1;
  margin: 0;
`;
const L2Name = styled.span`
  color: #7eab73;
`;
const L2QRCard = styled.div`
  background: #ffffff;
  border-radius: 24px;
  padding: 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
`;
const L2CardLabel = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: #4a6741;
  margin: 0;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;
const L2Sub = styled.p`
  font-size: 17px;
  color: rgba(255,255,255,0.65);
  margin: 0;
  text-align: center;
  max-width: 460px;
  line-height: 1.5;
`;
const L2Url = styled.p`
  font-size: 14px;
  color: rgba(126,171,115,0.8);
  margin: 0;
  letter-spacing: 0.03em;
`;
const L2Footer = styled.div`
  width: 100%;
  padding: 24px 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  z-index: 1;
  border-top: 1px solid rgba(255,255,255,0.07);
`;
const L2FooterBrand = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.08em;
`;

function Layout2({ name, qrValue, url }) {
  return (
    <L2Wrap>
      <L2Circle1 />
      <L2Circle2 />
      <L2Body>
        <L2Headline>
          Agende em<br /><L2Name>{name}</L2Name>
        </L2Headline>
        <L2QRCard>
          <L2CardLabel>Escaneie para agendar</L2CardLabel>
          <QRCodeSVG value={qrValue} size={220} />
          <L2Url>{url}</L2Url>
        </L2QRCard>
        <L2Sub>Aponte a câmera do seu celular para o QR Code e agende em segundos.</L2Sub>
      </L2Body>
      <L2Footer>
        <L2FooterBrand>HORÁRIO CERTO</L2FooterBrand>
      </L2Footer>
    </L2Wrap>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LAYOUT 3 — Moderno com Checklist
   ═════════════════════════════════════════════════════════════════════ */
const L3Wrap = styled.div`
  width: 794px;
  height: 1123px;
  background: #f7f5f0;
  display: flex;
  flex-direction: column;
  font-family: 'Montserrat', 'Helvetica Neue', sans-serif;
  overflow: hidden;
`;
const L3Header = styled.div`
  background: #4a6741;
  padding: 48px 60px 40px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
const L3HeaderLabel = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: rgba(255,255,255,0.6);
  letter-spacing: 0.16em;
  text-transform: uppercase;
`;
const L3HeaderName = styled.h1`
  font-size: 50px;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  line-height: 1.05;
`;
const L3Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 52px 60px;
  gap: 40px;
`;
const L3Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  flex: 1;
`;
const L3Headline = styled.h2`
  font-size: 36px;
  font-weight: 800;
  color: #1a231a;
  margin: 0;
  line-height: 1.2;
`;
const L3CheckList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
const L3CheckItem = styled.li`
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 16px;
  color: #2e3c2e;
  font-weight: 500;
`;
const L3Check = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #4a6741;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
`;
const L3Url = styled.p`
  font-size: 13px;
  color: #7a8a78;
  margin: 0;
  letter-spacing: 0.02em;
`;
const L3Right = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
`;
const L3QRFrame = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 8px 32px rgba(74,103,65,0.14);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  border: 2px solid #d4e0d0;
`;
const L3QRLabel = styled.p`
  font-size: 13px;
  font-weight: 700;
  color: #4a6741;
  margin: 0;
  text-align: center;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;
const L3Footer = styled.div`
  padding: 20px 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #edeae3;
`;
const L3FooterBrand = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #4a6741;
  letter-spacing: 0.07em;
`;
const L3FooterNote = styled.span`
  font-size: 12px;
  color: #9a9590;
`;

function Layout3({ name, qrValue, url }) {
  return (
    <L3Wrap>
      <L3Header>
        <L3HeaderLabel>Agendamento online</L3HeaderLabel>
        <L3HeaderName>{name}</L3HeaderName>
      </L3Header>
      <L3Body>
        <L3Left>
          <L3Headline>Agende seu horário agora mesmo</L3Headline>
          <L3CheckList>
            <L3CheckItem><L3Check>✓</L3Check>Sem precisar ligar ou mandar mensagem</L3CheckItem>
            <L3CheckItem><L3Check>✓</L3Check>Escolha o dia e horário que preferir</L3CheckItem>
            <L3CheckItem><L3Check>✓</L3Check>Confirmação imediata do agendamento</L3CheckItem>
            <L3CheckItem><L3Check>✓</L3Check>Disponível 24h por dia, 7 dias por semana</L3CheckItem>
          </L3CheckList>
          <L3Url>{url}</L3Url>
        </L3Left>
        <L3Right>
          <L3QRFrame>
            <L3QRLabel>Escaneie e agende</L3QRLabel>
            <QRCodeSVG value={qrValue} size={190} />
          </L3QRFrame>
        </L3Right>
      </L3Body>
      <L3Footer>
        <L3FooterBrand>HORÁRIO CERTO</L3FooterBrand>
        <L3FooterNote>Plataforma de agendamento online</L3FooterNote>
      </L3Footer>
    </L3Wrap>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LAYOUT 4 — Gradiente
   ═════════════════════════════════════════════════════════════════════ */
const L4Wrap = styled.div`
  width: 794px; height: 1123px;
  background: linear-gradient(160deg, #c8dfc2 0%, #3d5c36 55%, #1e2e1a 100%);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  font-family: 'Montserrat','Helvetica Neue',sans-serif;
  gap: 36px; padding: 60px; box-sizing: border-box; position: relative; overflow: hidden;
`;
const L4Ring = styled.div`
  position: absolute; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.12);
  ${p => `width:${p.$s}px;height:${p.$s}px;top:${p.$t};left:${p.$l};`}
`;
const L4Name = styled.h1`
  font-size: 54px; font-weight: 800; color: #fff; text-align: center;
  line-height: 1.08; margin: 0; text-shadow: 0 2px 20px rgba(0,0,0,0.3);
`;
const L4Sub = styled.p`
  font-size: 16px; color: rgba(255,255,255,0.75); margin: 0; text-align: center; font-weight: 500;
`;
const L4Card = styled.div`
  background: rgba(255,255,255,0.95); border-radius: 20px; padding: 28px 32px;
  display: flex; flex-direction: column; align-items: center; gap: 14px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.25);
`;
const L4CardLabel = styled.p`
  font-size: 12px; font-weight: 700; color: #4a6741; letter-spacing: 0.12em;
  text-transform: uppercase; margin: 0;
`;
const L4Url = styled.p`
  font-size: 13px; color: rgba(255,255,255,0.6); margin: 0; letter-spacing: 0.02em;
`;
const L4Brand = styled.span`
  position: absolute; bottom: 28px; left: 0; right: 0;
  text-align: center; font-size: 12px; font-weight: 700;
  color: rgba(255,255,255,0.35); letter-spacing: 0.1em;
`;
function Layout4({ name, qrValue, url }) {
  return (
    <L4Wrap>
      <L4Ring $s={600} $t="-200px" $l="-200px" />
      <L4Ring $s={400} $t="650px" $l="450px" />
      <L4Name>{name}</L4Name>
      <L4Sub>Agende seu horário pelo celular, sem complicação</L4Sub>
      <L4Card>
        <L4CardLabel>Escaneie e agende agora</L4CardLabel>
        <QRCodeSVG value={qrValue} size={210} />
        <L4Url style={{ color: '#8a9a88' }}>{url}</L4Url>
      </L4Card>
      <L4Url>{url}</L4Url>
      <L4Brand>HORÁRIO CERTO</L4Brand>
    </L4Wrap>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LAYOUT 5 — Vintage
   ═════════════════════════════════════════════════════════════════════ */
const L5Wrap = styled.div`
  width: 794px; height: 1123px;
  background: #fdf6e3;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  font-family: 'Georgia','Times New Roman',serif;
  padding: 56px; box-sizing: border-box; position: relative; gap: 24px;
`;
const L5Border = styled.div`
  position: absolute; inset: 24px;
  border: 2.5px solid #8b6914;
  border-radius: 4px;
`;
const L5Border2 = styled.div`
  position: absolute; inset: 32px;
  border: 1px solid #8b6914;
  border-radius: 2px;
`;
const L5Ornament = styled.div`
  display: flex; align-items: center; gap: 16px; color: #8b6914; font-size: 18px;
  &::before, &::after { content: ''; flex: 1; height: 1px; background: #8b6914; }
  width: 360px;
`;
const L5Title = styled.p`
  font-size: 13px; font-weight: 400; color: #8b6914; letter-spacing: 0.2em;
  text-transform: uppercase; margin: 0;
`;
const L5Name = styled.h1`
  font-size: 52px; font-weight: 700; color: #3d2b1a; text-align: center;
  line-height: 1.1; margin: 0; font-style: italic;
`;
const L5Card = styled.div`
  background: #fff8e7; border: 1.5px solid #c9a462; border-radius: 8px;
  padding: 24px 28px; display: flex; flex-direction: column; align-items: center; gap: 14px;
`;
const L5CardLabel = styled.p`
  font-size: 12px; color: #8b6914; letter-spacing: 0.14em; text-transform: uppercase; margin: 0;
`;
const L5Tagline = styled.p`
  font-size: 18px; color: #5c3d1e; text-align: center; margin: 0; font-style: italic; line-height: 1.5;
`;
const L5Url = styled.p`
  font-size: 13px; color: #a08040; margin: 0; letter-spacing: 0.03em;
`;
const L5Brand = styled.span`
  font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #a08040;
`;
function Layout5({ name, qrValue, url }) {
  return (
    <L5Wrap>
      <L5Border /><L5Border2 />
      <L5Title>Estabelecimento</L5Title>
      <L5Name>{name}</L5Name>
      <L5Ornament>✦</L5Ornament>
      <L5Tagline>Agende seu horário com a praticidade que você merece</L5Tagline>
      <L5Card>
        <L5CardLabel>Escaneie para agendar</L5CardLabel>
        <QRCodeSVG value={qrValue} size={190} fgColor="#3d2b1a" />
        <L5Url>{url}</L5Url>
      </L5Card>
      <L5Ornament>✦</L5Ornament>
      <L5Brand>Horário Certo — Agendamento Online</L5Brand>
    </L5Wrap>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LAYOUT 6 — Tipográfico
   ═════════════════════════════════════════════════════════════════════ */
const L6Wrap = styled.div`
  width: 794px; height: 1123px; background: #f5f5f0;
  font-family: 'Montserrat','Helvetica Neue',sans-serif;
  display: flex; flex-direction: column; overflow: hidden;
`;
const L6Top = styled.div`
  flex: 1; padding: 56px 56px 32px; display: flex; flex-direction: column; justify-content: flex-end; gap: 12px;
`;
const L6Small = styled.span`
  font-size: 12px; font-weight: 700; letter-spacing: 0.16em; color: #4a6741; text-transform: uppercase;
`;
const L6Big = styled.h1`
  font-size: 84px; font-weight: 900; color: #0f1a0f; line-height: 0.95; margin: 0;
  word-break: break-word;
`;
const L6Bottom = styled.div`
  background: #1a2a1a; padding: 48px 56px;
  display: flex; align-items: center; justify-content: space-between; gap: 32px;
`;
const L6BottomLeft = styled.div`
  display: flex; flex-direction: column; gap: 16px;
`;
const L6Cta = styled.p`
  font-size: 22px; font-weight: 700; color: #fff; margin: 0; line-height: 1.3; max-width: 280px;
`;
const L6Url = styled.p`
  font-size: 13px; color: rgba(255,255,255,0.5); margin: 0;
`;
const L6QRBox = styled.div`
  background: #fff; border-radius: 12px; padding: 16px;
  display: flex; flex-direction: column; align-items: center; gap: 8px; flex-shrink: 0;
`;
const L6QRLabel = styled.span`
  font-size: 10px; font-weight: 700; color: #4a6741; letter-spacing: 0.1em; text-transform: uppercase;
`;
const L6Brand = styled.span`
  font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.25); letter-spacing: 0.1em;
`;
function Layout6({ name, qrValue, url }) {
  return (
    <L6Wrap>
      <L6Top>
        <L6Small>Agendamento online</L6Small>
        <L6Big>{name}</L6Big>
      </L6Top>
      <L6Bottom>
        <L6BottomLeft>
          <L6Cta>Agende seu horário direto pelo celular</L6Cta>
          <L6Url>{url}</L6Url>
          <L6Brand>HORÁRIO CERTO</L6Brand>
        </L6BottomLeft>
        <L6QRBox>
          <L6QRLabel>Escaneie</L6QRLabel>
          <QRCodeSVG value={qrValue} size={160} />
        </L6QRBox>
      </L6Bottom>
    </L6Wrap>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LAYOUT 7 — Elegante / Premium
   ═════════════════════════════════════════════════════════════════════ */
const L7Wrap = styled.div`
  width: 794px; height: 1123px; background: #0c0c0c;
  font-family: 'Montserrat','Helvetica Neue',sans-serif;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 64px; box-sizing: border-box; gap: 40px; position: relative; overflow: hidden;
`;
const L7Glow = styled.div`
  position: absolute; width: 500px; height: 500px; border-radius: 50%;
  background: radial-gradient(circle, rgba(196,163,72,0.08) 0%, transparent 70%);
  top: 50%; left: 50%; transform: translate(-50%,-50%);
`;
const L7TopLine = styled.div`width: 60px; height: 1px; background: #c4a348;`;
const L7Label = styled.span`
  font-size: 11px; font-weight: 600; letter-spacing: 0.22em; color: #c4a348; text-transform: uppercase;
`;
const L7Name = styled.h1`
  font-size: 50px; font-weight: 800; color: #fff; text-align: center; line-height: 1.1; margin: 0;
`;
const L7Card = styled.div`
  border: 1px solid rgba(196,163,72,0.3); border-radius: 16px; padding: 30px 36px;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  background: rgba(255,255,255,0.03);
`;
const L7CardLabel = styled.p`
  font-size: 11px; font-weight: 600; letter-spacing: 0.16em; color: #c4a348; text-transform: uppercase; margin: 0;
`;
const L7Tagline = styled.p`
  font-size: 16px; color: rgba(255,255,255,0.55); text-align: center; margin: 0; max-width: 420px; line-height: 1.6;
`;
const L7Url = styled.p`font-size: 13px; color: rgba(196,163,72,0.6); margin: 0; letter-spacing: 0.02em;`;
const L7Brand = styled.span`
  position: absolute; bottom: 32px;
  font-size: 11px; font-weight: 700; color: rgba(196,163,72,0.3); letter-spacing: 0.12em;
`;
function Layout7({ name, qrValue, url }) {
  return (
    <L7Wrap>
      <L7Glow />
      <L7TopLine />
      <L7Label>Agendamento exclusivo</L7Label>
      <L7Name>{name}</L7Name>
      <L7Card>
        <L7CardLabel>Escaneie para agendar</L7CardLabel>
        <QRCodeSVG value={qrValue} size={200} fgColor="#ffffff" bgColor="#0c0c0c" />
        <L7Url>{url}</L7Url>
      </L7Card>
      <L7Tagline>Reserve seu horário com comodidade e sem espera.</L7Tagline>
      <L7Brand>HORÁRIO CERTO</L7Brand>
    </L7Wrap>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LAYOUT 8 — Split / Dividido
   ═════════════════════════════════════════════════════════════════════ */
const L8Wrap = styled.div`
  width: 794px; height: 1123px;
  font-family: 'Montserrat','Helvetica Neue',sans-serif;
  display: flex; flex-direction: row; overflow: hidden;
`;
const L8Left = styled.div`
  width: 380px; background: #2d4a28; flex-shrink: 0;
  display: flex; flex-direction: column; justify-content: center; padding: 52px 44px; gap: 28px;
`;
const L8LeftLabel = styled.span`
  font-size: 11px; font-weight: 700; letter-spacing: 0.18em; color: rgba(255,255,255,0.5); text-transform: uppercase;
`;
const L8LeftName = styled.h1`
  font-size: 46px; font-weight: 900; color: #fff; line-height: 1.05; margin: 0;
`;
const L8LeftDivider = styled.div`width: 48px; height: 3px; background: #7eab73; border-radius: 2px;`;
const L8LeftTagline = styled.p`
  font-size: 16px; color: rgba(255,255,255,0.7); line-height: 1.6; margin: 0; max-width: 260px;
`;
const L8LeftUrl = styled.p`font-size: 12px; color: rgba(255,255,255,0.4); margin: 0;`;
const L8LeftBrand = styled.span`font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.25); letter-spacing: 0.1em;`;
const L8Right = styled.div`
  flex: 1; background: #f7f9f5;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; padding: 40px;
`;
const L8RightLabel = styled.p`
  font-size: 13px; font-weight: 700; color: #2d4a28; letter-spacing: 0.1em; text-transform: uppercase; margin: 0; text-align: center;
`;
const L8QRBox = styled.div`
  background: #fff; border-radius: 16px; padding: 24px;
  box-shadow: 0 8px 32px rgba(45,74,40,0.12); display: flex; flex-direction: column; align-items: center; gap: 12px;
`;
const L8Arrow = styled.div`
  display: flex; align-items: center; gap: 8px; font-size: 13px; color: #2d4a28; font-weight: 600;
`;
function Layout8({ name, qrValue, url }) {
  return (
    <L8Wrap>
      <L8Left>
        <L8LeftLabel>Agende agora</L8LeftLabel>
        <L8LeftName>{name}</L8LeftName>
        <L8LeftDivider />
        <L8LeftTagline>Marque seu horário de onde estiver, quando quiser, sem precisar ligar.</L8LeftTagline>
        <L8LeftUrl>{url}</L8LeftUrl>
        <L8LeftBrand>HORÁRIO CERTO</L8LeftBrand>
      </L8Left>
      <L8Right>
        <L8RightLabel>Escaneie o QR Code</L8RightLabel>
        <L8QRBox>
          <QRCodeSVG value={qrValue} size={200} />
        </L8QRBox>
        <L8Arrow>📱 Aponte a câmera e agende</L8Arrow>
      </L8Right>
    </L8Wrap>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LAYOUT 9 — Geométrico
   ═════════════════════════════════════════════════════════════════════ */
const L9Wrap = styled.div`
  width: 794px; height: 1123px; background: #fff;
  font-family: 'Montserrat','Helvetica Neue',sans-serif;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 60px; box-sizing: border-box; gap: 32px; position: relative; overflow: hidden;
`;
const L9TriBR = styled.div`
  position: absolute; bottom: 0; right: 0;
  width: 0; height: 0;
  border-style: solid;
  border-width: 0 0 320px 320px;
  border-color: transparent transparent #e8f0e4 transparent;
`;
const L9TriTL = styled.div`
  position: absolute; top: 0; left: 0;
  width: 0; height: 0;
  border-style: solid;
  border-width: 200px 200px 0 0;
  border-color: #4a6741 transparent transparent transparent;
`;
const L9Label = styled.span`
  font-size: 12px; font-weight: 700; letter-spacing: 0.16em; color: #4a6741; text-transform: uppercase; position: relative;
`;
const L9Name = styled.h1`
  font-size: 56px; font-weight: 900; color: #0f1a0f; text-align: center; line-height: 1.05; margin: 0; position: relative;
`;
const L9Card = styled.div`
  background: #f5f9f3; border: 2px solid #4a6741; border-radius: 16px;
  padding: 28px 32px; display: flex; flex-direction: column; align-items: center; gap: 14px; position: relative;
`;
const L9CardLabel = styled.p`
  font-size: 12px; font-weight: 700; color: #4a6741; letter-spacing: 0.1em; text-transform: uppercase; margin: 0;
`;
const L9Tagline = styled.p`
  font-size: 18px; color: #2e3c2e; text-align: center; margin: 0; font-weight: 600; position: relative;
`;
const L9Url = styled.p`font-size: 13px; color: #8a9a88; margin: 0; position: relative;`;
const L9Brand = styled.span`
  font-size: 12px; font-weight: 700; color: #4a6741; letter-spacing: 0.1em; position: relative;
`;
function Layout9({ name, qrValue, url }) {
  return (
    <L9Wrap>
      <L9TriTL /><L9TriBR />
      <L9Label>Agendamento online</L9Label>
      <L9Name>{name}</L9Name>
      <L9Card>
        <L9CardLabel>Escaneie para agendar</L9CardLabel>
        <QRCodeSVG value={qrValue} size={210} />
        <L9Url>{url}</L9Url>
      </L9Card>
      <L9Tagline>Rápido, fácil e sem precisar ligar</L9Tagline>
      <L9Brand>HORÁRIO CERTO</L9Brand>
    </L9Wrap>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LAYOUT 10 — Neon
   ═════════════════════════════════════════════════════════════════════ */
const L10Wrap = styled.div`
  width: 794px; height: 1123px; background: #080f08;
  font-family: 'Montserrat','Helvetica Neue',sans-serif;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 60px; box-sizing: border-box; gap: 36px; position: relative; overflow: hidden;
`;
const L10Scanline = styled.div`
  position: absolute; inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,80,0.015) 3px, rgba(0,255,80,0.015) 4px);
`;
const L10Label = styled.span`
  font-size: 12px; font-weight: 700; letter-spacing: 0.2em; color: #4dff6e; text-transform: uppercase; position: relative;
`;
const L10Name = styled.h1`
  font-size: 52px; font-weight: 900; color: #fff; text-align: center; line-height: 1.08; margin: 0; position: relative;
  text-shadow: 0 0 30px rgba(77,255,110,0.3);
`;
const L10Card = styled.div`
  background: #fff; border-radius: 16px; padding: 28px 32px;
  display: flex; flex-direction: column; align-items: center; gap: 14px; position: relative;
  box-shadow: 0 0 40px rgba(77,255,110,0.2);
`;
const L10CardLabel = styled.p`
  font-size: 12px; font-weight: 700; color: #1a5c28; letter-spacing: 0.1em; text-transform: uppercase; margin: 0;
`;
const L10Tagline = styled.p`
  font-size: 18px; color: rgba(255,255,255,0.7); text-align: center; margin: 0; position: relative; line-height: 1.5;
`;
const L10Url = styled.p`font-size: 13px; color: #4dff6e; margin: 0; opacity: 0.7; position: relative;`;
const L10Brand = styled.span`
  font-size: 11px; font-weight: 700; color: rgba(77,255,110,0.3); letter-spacing: 0.12em; position: relative;
`;
function Layout10({ name, qrValue, url }) {
  return (
    <L10Wrap>
      <L10Scanline />
      <L10Label>▶ Agendamento online</L10Label>
      <L10Name>{name}</L10Name>
      <L10Card>
        <L10CardLabel>Escaneie e agende</L10CardLabel>
        <QRCodeSVG value={qrValue} size={210} />
        <L10Url>{url}</L10Url>
      </L10Card>
      <L10Tagline>Agende seu horário agora, direto pelo celular.</L10Tagline>
      <L10Brand>HORÁRIO CERTO</L10Brand>
    </L10Wrap>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
   ═════════════════════════════════════════════════════════════════════ */
const layouts = [
  { label: 'Minimalista', component: Layout1 },
  { label: 'Noturno',     component: Layout2 },
  { label: 'Moderno',     component: Layout3 },
  { label: 'Gradiente',   component: Layout4 },
  { label: 'Vintage',     component: Layout5 },
  { label: 'Tipográfico', component: Layout6 },
  { label: 'Elegante',    component: Layout7 },
  { label: 'Split',       component: Layout8 },
  { label: 'Geométrico',  component: Layout9 },
  { label: 'Neon',        component: Layout10 },
];

export default function Divulgacao() {
  const navigate = useNavigate();
  const companyUrl = Cookies.get('companyUrl');
  const qrValue = `https://horariocerto.elevatohub.com.br/${companyUrl}`;
  const displayUrl = `horariocerto.elevatohub.com.br/${companyUrl}`;

  const [companyName, setCompanyName] = useState('');
  const [companyInfo, setCompanyInfo] = useState({});
  const [downloading, setDownloading] = useState(null);
  const [offset, setOffset] = useState(0);
  const [visibleCount, setVisibleCount] = useState(window.innerWidth < 768 ? 1 : 3);
  const wrapperRef = useRef(null);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const refs = layouts.map(() => useRef(null));

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const GAP = 24;
    const calc = (w) =>
      window.innerWidth < 768 ? 1 : Math.max(1, Math.floor((w + GAP) / (CARD_W + GAP)));
    const observer = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setVisibleCount(prev => {
        const next = calc(w);
        if (prev !== next) setOffset(0);
        return next;
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isAvailableLogin()) { navigate('/login'); return; }
    getCompany(companyUrl)
      .then(res => {
        setCompanyName(res.data.name || companyUrl);
        setCompanyInfo(res.data);
      })
      .catch(() => setCompanyName(companyUrl));
  }, [companyUrl, navigate]);

  const handleDownload = async (index) => {
    setDownloading(index);
    try {
      const el = refs[index].current;
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      pdf.save(`divulgacao-${companyUrl}-layout${index + 1}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(null);
    }
  };

  const maxOffset = Math.max(0, layouts.length - visibleCount);
  const prev = () => setOffset(o => Math.max(0, o - 1));
  const next = () => setOffset(o => Math.min(maxOffset, o + 1));
  const props = { name: companyName, qrValue, url: displayUrl };

  return (
    <>
      <Topbar
        name={companyInfo.name}
        imagem={companyInfo.imagem}
        whatsapp={companyInfo.whatsapp}
        instagram={companyInfo.instagram}
      />
      <Container
        $width="100%"
        $display="flex"
        $flexdirection="column"
        $backgroundcolor="#fff"
        $boxshadow="none"
        $margin="0"
      >
        <Sidebar>
          <Title
            $padding="1rem"
            $margin="1rem 0 0 0"
            $fontweight="600"
            $fontsize="2rem"
            $color="var(--color-dark)"
            $width="max-content"
          >
            Divulgação
          </Title>

          <Separator
            $width="calc(100% - 2rem)"
            $bordercolor="var(--color-olive)"
            $margin="0 1rem 1.5rem 1rem"
            $style="dotted"
          />

          <CarouselWrapper ref={wrapperRef}>
            {/* Controles */}
            <NavRow>
              <ArrowBtn onClick={prev} disabled={offset === 0}>
                <ChevronLeft size={16} />
              </ArrowBtn>
              <ArrowBtn onClick={next} disabled={offset >= maxOffset}>
                <ChevronRight size={16} />
              </ArrowBtn>
              <Counter>{offset + 1}-{Math.min(offset + visibleCount, layouts.length)} de {layouts.length}</Counter>
              <Dots>
                {layouts.map((_, i) => (
                  <Dot
                    key={i}
                    $active={i >= offset && i < offset + visibleCount}
                    onClick={() => setOffset(Math.min(Math.max(0, i), maxOffset))}
                  />
                ))}
              </Dots>
            </NavRow>

            {/* Cards */}
            <CarouselTrack>
              {layouts.slice(offset, offset + visibleCount).map((l, relIdx) => {
                const i = offset + relIdx;
                const Comp = l.component;
                return (
                  <SlideCard key={i} $active>
                    <CardLabel>{l.label}</CardLabel>
                    <PreviewBox>
                      <PreviewInner>
                        <Comp {...props} />
                      </PreviewInner>
                    </PreviewBox>
                    <DownloadBtn
                      onClick={() => handleDownload(i)}
                      disabled={downloading === i || !companyName}
                    >
                      <Download size={14} />
                      {downloading === i ? 'Gerando...' : 'Baixar PDF'}
                    </DownloadBtn>
                  </SlideCard>
                );
              })}
            </CarouselTrack>
          </CarouselWrapper>
        </Sidebar>
      </Container>

      {/* Layouts em tamanho real para captura — fora da tela */}
      <HiddenArea>
        {layouts.map((l, i) => {
          const Comp = l.component;
          return (
            <div key={i} ref={refs[i]}>
              <Comp {...props} />
            </div>
          );
        })}
      </HiddenArea>
    </>
  );
}

import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { ReactComponent as Logo } from '../assets/horario-certo-logo-horizontal.svg?component';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, BarChart3, Bell, CalendarClock, Check, ChevronDown, Clock, FileText, Home,
  Briefcase, LifeBuoy, Link2, MessageCircle, Percent, Settings, ShieldCheck, Smartphone,
  Store, Users, Wallet, X,
} from 'lucide-react';
import { getPublicSubscriptionPlans } from '../services/endpoints/payment';

/* ── animações ───────────────────────────────────────────────────────── */

const revealUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const successPop = keyframes`
  0%   { transform: scale(0.6); opacity: 0; }
  70%  { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); }
`;

/* ── estrutura ───────────────────────────────────────────────────────── */

const Page = styled.main`
  min-height: 100vh;
  background: var(--ui-page-bg);
  color: var(--ui-text);
  overflow-x: hidden;
`;

const Container = styled.div`
  width: min(1160px, 100%);
  margin: 0 auto;
  padding: 0 1rem;
  box-sizing: border-box;
`;

const Section = styled.section`
  padding: 4.5rem 0;
  scroll-margin-top: 64px;

  @media (max-width: 768px) {
    padding: 3rem 0;
  }
`;

const SectionHead = styled.div`
  max-width: 680px;
  margin: 0 auto 2.5rem;
  text-align: center;
`;

const Eyebrow = styled.span`
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-muted);
`;

const H2 = styled.h2`
  margin: 0.5rem 0 0;
  font-size: clamp(1.6rem, 3.2vw, 2.25rem);
  line-height: 1.2;
  font-weight: 800;
  color: var(--ui-text);
`;

const Lead = styled.p`
  margin: 0.85rem 0 0;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--ui-muted);
`;

/* ── botões ──────────────────────────────────────────────────────────── */

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  height: ${(p) => (p.$large ? '3rem' : '2.5rem')};
  padding: 0 ${(p) => (p.$large ? '1.5rem' : '1.1rem')};
  border-radius: 999px;
  border: 1px solid ${(p) => (p.$outline ? 'var(--ui-input-border)' : p.$light ? '#fff' : 'var(--ui-primary)')};
  background: ${(p) => (p.$outline ? '#fff' : p.$light ? '#fff' : 'var(--ui-primary)')};
  color: ${(p) => (p.$outline || p.$light ? 'var(--ui-text)' : '#fff')};
  font-family: inherit;
  font-size: ${(p) => (p.$large ? '0.95rem' : '0.875rem')};
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: ${(p) => (p.$outline ? '#f3f4f6' : p.$light ? '#f3f4f6' : 'var(--ui-primary-hover)')};
  }
`;

/* ── topo ────────────────────────────────────────────────────────────── */

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--ui-border);
`;

const HeaderInner = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  height: 64px;
`;

const Brand = styled.button`
  display: flex;
  align-items: center;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;

  svg {
    height: 34px;
    width: auto;
  }
`;

const NavLinks = styled.nav`
  display: flex;
  gap: 1.5rem;

  a {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--ui-text-secondary);
    text-decoration: none;

    &:hover {
      color: var(--ui-text);
    }
  }

  @media (max-width: 900px) {
    display: none;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;

  @media (max-width: 480px) {
    .hide-xs {
      display: none;
    }
  }
`;

/* ── hero ────────────────────────────────────────────────────────────── */

const Hero = styled.section`
  padding: 4.5rem 0 3rem;
  text-align: center;
  background:
    radial-gradient(60% 50% at 50% 0%, #ffffff 0%, rgba(255, 255, 255, 0) 100%),
    var(--ui-page-bg);

  @media (max-width: 768px) {
    padding: 3rem 0 2rem;
  }
`;

const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  border: 1px solid var(--ui-border);
  background: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ui-text-secondary);
  animation: ${revealUp} 0.5s ease both;
`;

const HeroTitle = styled.h1`
  max-width: 820px;
  margin: 1.25rem auto 0;
  font-size: clamp(2.1rem, 5.4vw, 3.6rem);
  line-height: 1.08;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ui-text);
  animation: ${revealUp} 0.5s ease 0.05s both;
`;

const HeroSub = styled.p`
  max-width: 620px;
  margin: 1.1rem auto 0;
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--ui-muted);
  animation: ${revealUp} 0.5s ease 0.1s both;
`;

// Barra no estilo "busca" da Booksy, aqui para o prestador de serviços criar o próprio link
const LinkBar = styled.form`
  && {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    max-width: 620px;
    margin: 2rem auto 0;
    padding: 0.4rem 0.4rem 0.4rem 1.1rem;
    border-radius: 999px;
    border: 1px solid var(--ui-border);
    background: #fff;
    box-shadow: 0 12px 32px rgba(17, 24, 39, 0.08);
    animation: ${revealUp} 0.5s ease 0.15s both;
  }

  svg {
    flex-shrink: 0;
    color: var(--ui-muted);
  }

  .prefix {
    font-size: 0.9rem;
    color: var(--ui-muted);
    white-space: nowrap;
  }

  && input {
    flex: 1;
    min-width: 0;
    height: 2.75rem;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--ui-text);
    box-shadow: none;
  }

  && input:focus {
    outline: none;
  }

  @media (max-width: 600px) {
    && {
      flex-wrap: wrap;
      border-radius: var(--ui-radius);
      padding: 0.75rem;
    }

    .prefix {
      font-size: 0.8rem;
    }

    button {
      width: 100%;
    }
  }
`;

const HeroNote = styled.p`
  margin: 0.85rem 0 0;
  font-size: 0.8rem;
  color: var(--ui-muted);
`;

// Chips de recursos, no lugar das categorias da Booksy
const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin: 1.75rem auto 0;
  max-width: 820px;
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  border: 1px solid var(--ui-border);
  background: #fff;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--ui-text-secondary);

  svg {
    color: var(--ui-text);
  }
`;

/* ── prévia do painel (igual ao sistema) ─────────────────────────────── */

const AppFrame = styled.div`
  margin: 3rem auto 0;
  max-width: 1040px;
  border-radius: 1rem;
  border: 1px solid var(--ui-border);
  background: #fff;
  box-shadow: 0 30px 60px rgba(17, 24, 39, 0.12);
  overflow: hidden;
  text-align: left;
  animation: ${revealUp} 0.6s ease 0.2s both;
`;

const AppTopbar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  height: 40px;
  padding: 0 1rem;
  border-bottom: 1px solid var(--ui-border);
  background: #fff;

  i {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #e5e7eb;
  }

  span {
    margin-left: 0.75rem;
    font-size: 0.75rem;
    color: var(--ui-muted);
  }
`;

const AppBody = styled.div`
  display: grid;
  grid-template-columns: 56px 1fr;
  background: var(--ui-page-bg);

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const AppSidebar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 0;
  background: #fff;
  border-right: 1px solid var(--ui-border);

  span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 8px;
    color: var(--ui-text-secondary);
  }

  span.active {
    background: var(--ui-primary);
    color: #fff;
  }

  @media (max-width: 640px) {
    display: none;
  }
`;

const AppMain = styled.div`
  padding: 1.25rem;

  h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
  }

  p {
    margin: 0.15rem 0 1rem;
    font-size: 0.78rem;
    color: var(--ui-muted);
  }
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$cols || 3}, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Stat = styled.div`
  padding: 0.9rem 1rem;
  border-radius: var(--ui-radius);
  background: #fff;
  box-shadow: var(--ui-card-shadow);

  small {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--ui-muted);
  }

  strong {
    display: block;
    margin-top: 0.35rem;
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--ui-text);
  }
`;

const MiniList = styled.div`
  margin-top: 0.75rem;
  border-radius: var(--ui-radius);
  background: #fff;
  box-shadow: var(--ui-card-shadow);
  overflow: hidden;
`;

const MiniRow = styled.div`
  display: grid;
  grid-template-columns: 56px 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  border-top: 1px solid var(--ui-border);
  font-size: 0.8rem;

  &:first-child {
    border-top: none;
  }

  b {
    font-weight: 700;
  }

  span {
    color: var(--ui-muted);
  }
`;

const Pill = styled.span`
  && {
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 600;
    background: ${(p) => (p.$tone === 'green' ? '#ecfdf5' : '#f3f4f6')};
    color: ${(p) => (p.$tone === 'green' ? '#047857' : 'var(--ui-text-secondary)')};
  }
`;

/* ── diferenciais ────────────────────────────────────────────────────── */

const DiffGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article`
  padding: 1.4rem;
  border-radius: var(--ui-radius);
  background: #fff;
  border: 1px solid var(--ui-border);
  box-shadow: var(--ui-card-shadow);

  h3 {
    margin: 0.9rem 0 0.4rem;
    font-size: 1rem;
    font-weight: 700;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.55;
    color: var(--ui-muted);
  }
`;

const IconBox = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${(p) => (p.$dark ? 'var(--ui-primary)' : '#f3f4f6')};
  color: ${(p) => (p.$dark ? '#fff' : 'var(--ui-text)')};
`;

const CompareCard = styled.div`
  margin-top: 2rem;
  border-radius: var(--ui-radius);
  background: #fff;
  border: 1px solid var(--ui-border);
  box-shadow: var(--ui-card-shadow);
  overflow-x: auto;
`;

const CompareTable = styled.table`
  width: 100%;
  min-width: 620px;
  border-collapse: collapse;
  font-size: 0.875rem;

  th, td {
    padding: 0.9rem 1.1rem;
    text-align: left;
    vertical-align: top;
    border-top: 1px solid var(--ui-border);
  }

  thead th {
    border-top: none;
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--ui-muted);
    background: #f9fafb;
  }

  thead th.ours {
    color: #fff;
    background: var(--ui-primary);
  }

  td:first-child {
    font-weight: 600;
    color: var(--ui-text);
    width: 30%;
  }

  td.ours {
    background: #f9fafb;
    color: var(--ui-text);
    font-weight: 600;
  }

  td.theirs {
    color: var(--ui-muted);
  }

  .cell {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .cell svg {
    flex-shrink: 0;
    margin-top: 0.1rem;
  }
`;

const CompareNote = styled.p`
  margin: 0.75rem 0 0;
  font-size: 0.75rem;
  color: var(--ui-muted);
  text-align: center;
`;

/* ── blocos alternados (texto + tela) ────────────────────────────────── */

const Row = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: 3rem;

  & + & {
    margin-top: 4.5rem;
  }

  ${(p) => p.$reverse && `
    > :first-child { order: 2; }
  `}

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 2rem;

    > :first-child { order: 0; }

    & + & {
      margin-top: 3rem;
    }
  }
`;

const RowText = styled.div`
  h3 {
    margin: 0.5rem 0 0;
    font-size: clamp(1.4rem, 2.6vw, 1.85rem);
    line-height: 1.2;
    font-weight: 800;
  }

  > p {
    margin: 0.85rem 0 0;
    font-size: 0.975rem;
    line-height: 1.6;
    color: var(--ui-muted);
  }
`;

const CheckList = styled.ul`
  list-style: none;
  margin: 1.25rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;

  li {
    display: flex;
    gap: 0.6rem;
    align-items: flex-start;
    font-size: 0.9rem;
    color: var(--ui-text-secondary);
  }

  svg {
    flex-shrink: 0;
    margin-top: 0.15rem;
    padding: 2px;
    border-radius: 50%;
    background: var(--ui-primary);
    color: #fff;
  }
`;

const Visual = styled.div`
  padding: 1.5rem;
  border-radius: 1rem;
  background: #fff;
  border: 1px solid var(--ui-border);
  box-shadow: 0 20px 40px rgba(17, 24, 39, 0.08);
`;

const VisualTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  font-weight: 700;

  span {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--ui-muted);
  }
`;

const ProRow = styled.div`
  display: grid;
  grid-template-columns: 36px 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-top: 1px solid var(--ui-border);
  font-size: 0.85rem;

  &:first-of-type {
    border-top: none;
  }

  .avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #f3f4f6;
    font-size: 0.75rem;
    font-weight: 700;
  }

  small {
    display: block;
    color: var(--ui-muted);
    font-size: 0.75rem;
  }

  b {
    font-weight: 700;
    text-align: right;
  }
`;

const WhatsBubble = styled.div`
  max-width: 300px;
  padding: 0.85rem 1rem;
  border-radius: 14px 14px 14px 4px;
  background: #f3f4f6;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--ui-text);

  & + & {
    margin-top: 0.6rem;
  }

  small {
    display: block;
    margin-top: 0.35rem;
    font-size: 0.7rem;
    color: var(--ui-muted);
    text-align: right;
  }
`;

/* ── demonstração no celular ─────────────────────────────────────────── */

const DemoSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const DemoStep = styled.button`
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
  padding: 1rem;
  border-radius: var(--ui-radius);
  border: 1px solid ${(p) => (p.$active ? 'var(--ui-primary)' : 'var(--ui-border)')};
  background: #fff;
  box-shadow: ${(p) => (p.$active ? 'var(--ui-card-shadow)' : 'none')};
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  .num {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: ${(p) => (p.$active ? 'var(--ui-primary)' : '#f3f4f6')};
    color: ${(p) => (p.$active ? '#fff' : 'var(--ui-text)')};
    font-size: 0.8rem;
    font-weight: 700;
  }

  h4 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--ui-text);
  }

  p {
    margin: 0.25rem 0 0;
    font-size: 0.85rem;
    line-height: 1.5;
    color: var(--ui-muted);
  }
`;

const Phone = styled.div`
  position: relative;
  width: 280px;
  height: 560px;
  margin: 0 auto;
  border-radius: 40px;
  border: 10px solid var(--ui-primary);
  background: #f9fafb;
  box-shadow: 0 30px 60px rgba(17, 24, 39, 0.2);
  overflow: hidden;
`;

const PhoneScreen = styled.div`
  position: absolute;
  inset: 0;
  padding-top: 28px;
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  transition: opacity 0.35s ease;
  pointer-events: none;
`;

const PhoneHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.9rem;
  background: #fff;
  border-bottom: 1px solid var(--ui-border);

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--ui-primary);
    color: #fff;
    font-size: 0.65rem;
    font-weight: 700;
  }

  b {
    display: block;
    font-size: 0.78rem;
  }

  small {
    font-size: 0.62rem;
    color: var(--ui-muted);
  }
`;

const PhoneLabel = styled.div`
  padding: 0.8rem 0.9rem 0.45rem;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ui-muted);
`;

const PhoneOption = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0.9rem 0.45rem;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  border: 1px solid ${(p) => (p.$selected ? 'var(--ui-primary)' : 'var(--ui-border)')};
  background: ${(p) => (p.$selected ? '#f3f4f6' : '#fff')};
  font-size: 0.72rem;
  font-weight: 600;

  span {
    font-weight: 500;
    color: var(--ui-muted);
  }
`;

const PhoneSlots = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem;
  padding: 0 0.9rem;
`;

const PhoneSlot = styled.div`
  padding: 0.45rem 0;
  border-radius: 999px;
  border: 1px solid ${(p) => (p.$selected ? 'var(--ui-accent)' : p.$off ? 'var(--ui-border)' : 'var(--ui-input-border)')};
  background: ${(p) => (p.$selected ? 'var(--ui-accent-soft)' : '#fff')};
  color: ${(p) => (p.$selected ? 'var(--ui-accent-ink)' : p.$off ? '#9ca3af' : 'var(--ui-text)')};
  text-decoration: ${(p) => (p.$off ? 'line-through' : 'none')};
  font-size: 0.7rem;
  font-weight: 600;
  text-align: center;
`;

const PhoneCta = styled.div`
  margin: 1rem 0.9rem 0;
  padding: 0.65rem;
  border-radius: 999px;
  background: var(--ui-primary);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  text-align: center;
`;

const SuccessIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin: 2rem auto 0.9rem;
  border-radius: 50%;
  background: var(--ui-primary);
  color: #fff;
  animation: ${(p) => (p.$play ? successPop : 'none')} 0.5s ease both;
`;

const PhoneDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  margin-top: 1rem;

  button {
    width: 8px;
    height: 8px;
    padding: 0;
    border: none;
    border-radius: 999px;
    background: #d1d5db;
    cursor: pointer;
    transition: width 0.2s ease, background 0.2s ease;
  }

  button.active {
    width: 22px;
    background: var(--ui-primary);
  }
`;

/* ── como funciona ───────────────────────────────────────────────────── */

const Steps = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const StepNumber = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--ui-primary);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
`;

/* ── planos ──────────────────────────────────────────────────────────── */

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
  align-items: stretch;
`;

const PlanCard = styled.article`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border-radius: var(--ui-radius);
  background: #fff;
  border: ${(p) => (p.$featured ? '2px solid var(--ui-primary)' : '1px solid var(--ui-border)')};
  box-shadow: var(--ui-card-shadow);
`;

const PlanBadge = styled.span`
  position: absolute;
  top: -12px;
  left: 1.5rem;
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  background: var(--ui-primary);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
`;

const PlanName = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
`;

const PlanDescription = styled.p`
  margin: 0.35rem 0 0;
  min-height: 2.6em;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--ui-muted);
`;

const PlanPrice = styled.div`
  margin: 1.1rem 0;

  strong {
    font-size: 2rem;
    font-weight: 800;
  }

  span {
    font-size: 0.85rem;
    color: var(--ui-muted);
  }
`;

const PlanFeatures = styled(CheckList)`
  margin: 1.25rem 0 0;
  padding-top: 1.25rem;
  border-top: 1px solid var(--ui-border);

  li {
    font-size: 0.85rem;
  }
`;

const Muted = styled.p`
  margin: 0;
  text-align: center;
  font-size: 0.9rem;
  color: var(--ui-muted);
`;

/* ── dúvidas ─────────────────────────────────────────────────────────── */

const FaqList = styled.div`
  max-width: 760px;
  margin: 0 auto;
  border-radius: var(--ui-radius);
  background: #fff;
  border: 1px solid var(--ui-border);
  box-shadow: var(--ui-card-shadow);
  overflow: hidden;
`;

const FaqItem = styled.div`
  border-top: 1px solid var(--ui-border);

  &:first-child {
    border-top: none;
  }
`;

const FaqQuestion = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  padding: 1.1rem 1.25rem;
  border: none;
  background: #fff;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ui-text);
  text-align: left;
  cursor: pointer;

  svg {
    flex-shrink: 0;
    transition: transform 0.2s ease;
    transform: rotate(${(p) => (p.$open ? '180deg' : '0deg')});
  }
`;

const FaqAnswer = styled.div`
  display: ${(p) => (p.$open ? 'block' : 'none')};
  padding: 0 1.25rem 1.1rem;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--ui-muted);
`;

/* ── chamada final e rodapé ──────────────────────────────────────────── */

const CtaBand = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) auto;
  align-items: center;
  gap: 2rem;
  padding: 3rem;
  border-radius: 1.25rem;
  background: var(--ui-primary);
  color: #fff;

  h3 {
    margin: 0;
    font-size: clamp(1.5rem, 3vw, 2.1rem);
    line-height: 1.2;
    font-weight: 800;
  }

  p {
    margin: 0.75rem 0 0;
    font-size: 0.975rem;
    line-height: 1.6;
    color: #d1d5db;
  }

  small {
    display: block;
    margin-top: 0.6rem;
    font-size: 0.75rem;
    color: #9ca3af;
    text-align: center;
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    padding: 2rem 1.5rem;
  }
`;

const Footer = styled.footer`
  margin-top: 3rem;
  padding: 2rem 0;
  border-top: 1px solid var(--ui-border);
  background: #fff;
`;

const FooterInner = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--ui-muted);

  svg {
    height: 28px;
    width: auto;
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
  }

  a {
    color: var(--ui-text-secondary);
    text-decoration: none;

    &:hover {
      color: var(--ui-text);
    }
  }
`;

/* ── conteúdo ────────────────────────────────────────────────────────── */

const BOOKING_HOST = 'horariocerto.elevatohub.com.br/';

const heroChips = [
  { icon: CalendarClock, label: 'Agenda online 24h' },
  { icon: MessageCircle, label: 'Lembrete no WhatsApp' },
  { icon: Smartphone, label: 'Cliente agenda sem baixar app' },
  { icon: Users, label: 'Equipe e comissões' },
  { icon: BarChart3, label: 'Faturamento e relatórios' },
];

// O que nos separa dos marketplaces de agendamento
const differentials = [
  {
    icon: Store,
    title: 'Sua clientela é só sua',
    text: 'Seu link mostra apenas o seu negócio. Nada de vitrine com a concorrência ao lado do seu perfil.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp, não mais um app',
    text: 'O cliente agenda pelo navegador e recebe confirmação e lembrete no WhatsApp, que ele já usa todo dia.',
  },
  {
    icon: LifeBuoy,
    title: 'A gente configura com você',
    text: 'Na implantação a nossa equipe cadastra serviços e horários junto com você. Você não começa sozinho.',
  },
  {
    icon: Wallet,
    title: 'Preço justo, sem pegadinha',
    text: 'Plano mensal sem fidelidade e sem taxa por agendamento. Cancele quando quiser, direto pelo painel.',
  },
];

const comparison = [
  ['Onde o cliente agenda', 'No seu link exclusivo, só com o seu negócio', 'Em uma vitrine com outros prestadores da região'],
  ['O cliente precisa baixar app?', 'Não. Abre direto no navegador do celular', 'Normalmente é levado a instalar o app'],
  ['Lembrete do horário', 'No WhatsApp do cliente', 'Notificação do app ou e-mail'],
  ['Implantação', 'Feita junto com a nossa equipe', 'Você configura sozinho'],
  ['Fidelidade e multa', 'Nenhuma. Cancele quando quiser', 'Varia conforme o contrato'],
];

const howSteps = [
  { title: 'Crie sua conta', text: 'Leva 2 minutos e não pede cartão. Você ganha 14 dias para testar tudo.' },
  { title: 'Configure com a gente', text: 'Cadastre serviços, preços e horários. Se preferir, fazemos isso junto com você.' },
  { title: 'Divulgue seu link', text: 'Coloque na bio do Instagram e no WhatsApp. Os clientes passam a marcar sozinhos.' },
];

const faqItems = [
  {
    question: 'Preciso de cartão de crédito para testar?',
    answer: 'Não. O teste de 14 dias é gratuito e não pede nenhum dado de pagamento. Você só escolhe a forma de pagamento se decidir assinar.',
  },
  {
    question: 'Meu cliente precisa baixar algum aplicativo?',
    answer: 'Não. Ele abre o seu link no navegador do celular, escolhe o serviço, o profissional e o horário. Sem cadastro e sem instalar nada.',
  },
  {
    question: 'Qual a diferença para um marketplace de agendamento?',
    answer: 'Num marketplace o seu perfil fica numa vitrine junto com outros prestadores de serviço, e o cliente é incentivado a usar o app da plataforma. No Horário Certo o link é só seu: o cliente agenda direto com você e o relacionamento continua sendo seu.',
  },
  {
    question: 'Funciona para quem trabalha sozinho? E para equipe?',
    answer: 'Funciona para os dois. O profissional autônomo usa sozinho, sem complicação. Negócios com equipe cadastram os profissionais, cada um com sua agenda, seus serviços e seus preços, e acompanham a parte do estabelecimento em cada atendimento.',
  },
  {
    question: 'Como funcionam os lembretes no WhatsApp?',
    answer: 'Quando o cliente agenda, ele recebe a confirmação no WhatsApp e, perto do horário, um lembrete. Isso reduz as faltas sem você precisar mandar mensagem um por um. Confira na seção de planos o que está incluso em cada plano.',
  },
  {
    question: 'Como cancelo se não gostar?',
    answer: 'Direto pelo painel, a qualquer momento, sem multa e sem precisar falar com ninguém. Não existe fidelidade mínima.',
  },
];

const formatBRL = (value) =>
  Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });

// Mesma regra do link no cadastro: só letras minúsculas e números
const slugify = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 40);

/* ── componente ──────────────────────────────────────────────────────── */

function Landing() {
  const navigate = useNavigate();
  const [slug, setSlug] = useState('');
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [faqOpen, setFaqOpen] = useState(0);

  const DEMO_DELAY = 3500;
  const [demoStep, setDemoStep] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDemoStep((p) => (p >= 3 ? 1 : p + 1)), DEMO_DELAY);
    return () => clearTimeout(timer);
  }, [demoStep]);

  useEffect(() => {
    const normalizePlan = (plan, index) => {
      const features = Array.isArray(plan.features)
        ? plan.features.map((f) => (typeof f === 'string' ? f : f?.name)).filter(Boolean)
        : [];
      return {
        id: plan.id || plan._id || `${plan.name || 'plano'}-${index}`,
        name: plan.name || `Plano ${index + 1}`,
        monthly: Number(plan.price || plan.monthlyPrice || plan.amount || 0),
        description: plan.description || '',
        featured: Boolean(plan.recommended || plan.popular || plan.highlighted || plan.isMostPopular),
        features,
      };
    };

    const fetchPlans = async () => {
      setPlansLoading(true);
      try {
        const response = await getPublicSubscriptionPlans();
        const payload = response?.data;
        const source = Array.isArray(payload?.plans) ? payload.plans : Array.isArray(payload) ? payload : [];
        const mapped = source.map(normalizePlan).sort((a, b) => a.monthly - b.monthly);
        if (mapped.length > 1 && !mapped.some((p) => p.featured)) {
          const mid = Math.floor(mapped.length / 2);
          mapped[mid] = { ...mapped[mid], featured: true };
        }
        setPlans(mapped);
      } catch {
        setPlans([]);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const startTrial = (event) => {
    event?.preventDefault();
    navigate('/registro', slug ? { state: { url: slug } } : undefined);
  };

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const lowestPrice = plans.length > 0 ? plans[0].monthly : null;

  return (
    <Page>
      <Header>
        <HeaderInner>
          <Brand type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Horário Certo">
            <Logo />
          </Brand>
          <NavLinks>
            <a href="#diferenciais">Diferenciais</a>
            <a href="#recursos">Recursos</a>
            <a href="#planos">Planos</a>
            <a href="#duvidas">Dúvidas</a>
          </NavLinks>
          <HeaderActions>
            <Button $outline className="hide-xs" type="button" onClick={() => navigate('/login')}>
              Entrar
            </Button>
            <Button type="button" onClick={() => startTrial()}>
              Testar grátis
            </Button>
          </HeaderActions>
        </HeaderInner>
      </Header>

      {/* HERO */}
      <Hero>
        <Container>
          <HeroBadge>
            <Briefcase size={14} /> Feito para prestadores de serviço
          </HeroBadge>
          <HeroTitle>Seus clientes marcam sozinhos. Você só se preocupa com o atendimento.</HeroTitle>
          <HeroSub>
            Um link de agendamento só seu, lembrete no WhatsApp para o cliente não faltar e um painel
            simples com agenda, equipe e faturamento.
          </HeroSub>

          <LinkBar onSubmit={startTrial}>
            <Link2 size={18} />
            <span className="prefix">{BOOKING_HOST}</span>
            <input
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="seunegocio"
              aria-label="Endereço do seu negócio"
            />
            <Button type="submit">
              Criar meu link <ArrowRight size={16} />
            </Button>
          </LinkBar>
          <HeroNote>14 dias grátis • Sem cartão de crédito • Cancele quando quiser</HeroNote>

          <Chips>
            {heroChips.map(({ icon: Icon, label }) => (
              <Chip key={label}>
                <Icon size={15} /> {label}
              </Chip>
            ))}
          </Chips>

          {/* Prévia do painel com o mesmo visual do sistema */}
          <AppFrame aria-hidden="true">
            <AppTopbar>
              <i /><i /><i />
              <span>Painel Horário Certo</span>
            </AppTopbar>
            <AppBody>
              <AppSidebar>
                <span className="active"><Home size={16} /></span>
                <span><Clock size={16} /></span>
                <span><CalendarClock size={16} /></span>
                <span><BarChart3 size={16} /></span>
                <span><FileText size={16} /></span>
                <span><Briefcase size={16} /></span>
                <span><Users size={16} /></span>
                <span><Settings size={16} /></span>
              </AppSidebar>
              <AppMain>
                <h4>Dashboard</h4>
                <p>Resumo do seu negócio nesta semana</p>
                <StatGrid>
                  <Stat>
                    <small><CalendarClock size={13} /> Agendamentos</small>
                    <strong>42</strong>
                  </Stat>
                  <Stat>
                    <small><Wallet size={13} /> Faturamento</small>
                    <strong>R$ 2.180,00</strong>
                  </Stat>
                  <Stat>
                    <small><Bell size={13} /> Lembretes enviados</small>
                    <strong>84</strong>
                  </Stat>
                </StatGrid>
                <MiniList>
                  <MiniRow><b>09:00</b><span>Sessão completa · Lucas</span><Pill $tone="green">Confirmado</Pill></MiniRow>
                  <MiniRow><b>10:00</b><span>Consulta · Pedro</span><Pill $tone="green">Confirmado</Pill></MiniRow>
                  <MiniRow><b>11:30</b><span>Avaliação · Rafael</span><Pill>Lembrete enviado</Pill></MiniRow>
                </MiniList>
              </AppMain>
            </AppBody>
          </AppFrame>
        </Container>
      </Hero>

      {/* DIFERENCIAIS */}
      <Section id="diferenciais">
        <Container>
          <SectionHead>
            <Eyebrow>Nosso diferencial</Eyebrow>
            <H2>Agenda própria, não vitrine de marketplace</H2>
            <Lead>
              Nos marketplaces de agendamento, o seu perfil divide a tela com a concorrência e o cliente é empurrado
              para o app da plataforma. Aqui o cliente é seu do começo ao fim.
            </Lead>
          </SectionHead>

          <DiffGrid>
            {differentials.map(({ icon: Icon, title, text }, i) => (
              <Card key={title}>
                <IconBox $dark={i === 0}><Icon size={20} /></IconBox>
                <h3>{title}</h3>
                <p>{text}</p>
              </Card>
            ))}
          </DiffGrid>

          <CompareCard>
            <CompareTable>
              <thead>
                <tr>
                  <th />
                  <th className="ours">Horário Certo</th>
                  <th>Marketplaces de agendamento</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map(([label, ours, theirs]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td className="ours">
                      <div className="cell"><Check size={16} color="#16a34a" />{ours}</div>
                    </td>
                    <td className="theirs">
                      <div className="cell"><X size={16} color="#9ca3af" />{theirs}</div>
                    </td>
                  </tr>
                ))}
                {lowestPrice !== null && (
                  <tr>
                    <td>Investimento</td>
                    <td className="ours">
                      <div className="cell"><Check size={16} color="#16a34a" />A partir de {formatBRL(lowestPrice)}/mês</div>
                    </td>
                    <td className="theirs">
                      <div className="cell"><X size={16} color="#9ca3af" />Mensalidade mais cobrança por profissional</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </CompareTable>
          </CompareCard>
          <CompareNote>Comparação com o modelo geral dos marketplaces de agendamento.</CompareNote>
        </Container>
      </Section>

      {/* RECURSOS (blocos alternados) */}
      <Section id="recursos" style={{ background: '#fff', borderTop: '1px solid var(--ui-border)', borderBottom: '1px solid var(--ui-border)' }}>
        <Container>
          <Row>
            <RowText>
              <Eyebrow>Agendamento online</Eyebrow>
              <h3>Seu cliente agenda em menos de 1 minuto</h3>
              <p>
                Ele abre o seu link, escolhe o serviço, o profissional e o horário livre. Sem ligação, sem
                troca de mensagens e sem você parar o atendimento.
              </p>
              <DemoSteps>
                {[
                  ['Escolhe o serviço', 'Vê os serviços com preço e duração.'],
                  ['Escolhe profissional e horário', 'Só aparecem horários realmente livres.'],
                  ['Pronto, está agendado', 'Confirmação no WhatsApp e o horário já cai na sua agenda.'],
                ].map(([title, text], i) => (
                  <DemoStep key={title} type="button" $active={demoStep === i + 1} onClick={() => setDemoStep(i + 1)}>
                    <span className="num">{i + 1}</span>
                    <div>
                      <h4>{title}</h4>
                      <p>{text}</p>
                    </div>
                  </DemoStep>
                ))}
              </DemoSteps>
            </RowText>

            <div>
              <Phone aria-hidden="true">
                <PhoneScreen $visible={demoStep === 1}>
                  <PhoneHeader>
                    <span className="logo">EB</span>
                    <div><b>Studio Elevato</b><small>{BOOKING_HOST}elevato</small></div>
                  </PhoneHeader>
                  <PhoneLabel>Escolha o serviço</PhoneLabel>
                  <PhoneOption>Consulta <span>30 min · R$ 80</span></PhoneOption>
                  <PhoneOption $selected>Sessão completa <span>60 min · R$ 150</span></PhoneOption>
                  <PhoneOption>Avaliação <span>20 min · R$ 50</span></PhoneOption>
                  <PhoneOption>Retorno <span>15 min · R$ 40</span></PhoneOption>
                </PhoneScreen>

                <PhoneScreen $visible={demoStep === 2}>
                  <PhoneHeader>
                    <span className="logo">EB</span>
                    <div><b>Sessão completa</b><small>Escolha profissional e horário</small></div>
                  </PhoneHeader>
                  <PhoneLabel>Profissional</PhoneLabel>
                  <PhoneOption $selected>Lucas <span>R$ 150</span></PhoneOption>
                  <PhoneOption>Sem preferência <span>Primeiro livre</span></PhoneOption>
                  <PhoneLabel>Segunda, 16/06</PhoneLabel>
                  <PhoneSlots>
                    <PhoneSlot $off>09:00</PhoneSlot>
                    <PhoneSlot $selected>10:00</PhoneSlot>
                    <PhoneSlot $off>11:00</PhoneSlot>
                    <PhoneSlot>14:00</PhoneSlot>
                    <PhoneSlot>15:00</PhoneSlot>
                    <PhoneSlot>16:00</PhoneSlot>
                  </PhoneSlots>
                  <PhoneCta>Confirmar agendamento</PhoneCta>
                </PhoneScreen>

                <PhoneScreen $visible={demoStep === 3} style={{ textAlign: 'center' }}>
                  <PhoneHeader style={{ textAlign: 'left' }}>
                    <span className="logo">EB</span>
                    <div><b>Studio Elevato</b><small>Agendamento confirmado</small></div>
                  </PhoneHeader>
                  <SuccessIcon key={demoStep} $play={demoStep === 3}><Check size={28} /></SuccessIcon>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>Horário reservado!</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--ui-muted)', margin: '0.4rem 1.5rem 1rem' }}>
                    Você vai receber a confirmação e o lembrete no WhatsApp.
                  </div>
                  <PhoneOption>Serviço <span>Sessão completa</span></PhoneOption>
                  <PhoneOption>Profissional <span>Lucas</span></PhoneOption>
                  <PhoneOption>Data <span>Seg, 16/06 · 10:00</span></PhoneOption>
                </PhoneScreen>
              </Phone>
              <PhoneDots>
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={demoStep === n ? 'active' : undefined}
                    onClick={() => setDemoStep(n)}
                    aria-label={`Etapa ${n}`}
                  />
                ))}
              </PhoneDots>
            </div>
          </Row>

          <Row $reverse>
            <RowText>
              <Eyebrow>Menos faltas</Eyebrow>
              <h3>Lembrete no WhatsApp, sem você digitar nada</h3>
              <p>
                O cliente recebe a confirmação assim que agenda e um lembrete antes do horário. Menos
                cadeira vazia e menos tempo respondendo mensagem.
              </p>
              <CheckList>
                <li><Check size={16} />Confirmação automática a cada agendamento</li>
                <li><Check size={16} />Lembrete antes do horário marcado</li>
                <li><Check size={16} />Cancelamento pelo próprio cliente, com código</li>
                <li><Check size={16} />Lista de espera para os dias lotados</li>
              </CheckList>
            </RowText>
            <Visual aria-hidden="true">
              <VisualTitle>WhatsApp do cliente <span>agora</span></VisualTitle>
              <WhatsBubble>
                Olá, Carlos! Seu horário no <b>Studio Elevato</b> está confirmado: segunda, 16/06 às 10:00 (Sessão completa).
                <small>09:12</small>
              </WhatsBubble>
              <WhatsBubble>
                Lembrete: seu horário é hoje às 10:00. Até já! 👋
                <small>08:00</small>
              </WhatsBubble>
            </Visual>
          </Row>

          <Row>
            <RowText>
              <Eyebrow>Equipe e financeiro</Eyebrow>
              <h3>Equipe organizada e o faturamento na palma da mão</h3>
              <p>
                Cada profissional com a própria agenda, serviços e preços. Você define a parte do estabelecimento
                em cada serviço e acompanha tudo no Dashboard e nos relatórios.
              </p>
              <CheckList>
                <li><Check size={16} />Agenda e login para cada profissional</li>
                <li><Check size={16} />Preço do serviço diferente por profissional</li>
                <li><Check size={16} />Parte do estabelecimento calculada em cada atendimento</li>
                <li><Check size={16} />Relatórios com exportação em PDF</li>
              </CheckList>
            </RowText>
            <Visual aria-hidden="true">
              <VisualTitle>Equipe <span>esta semana</span></VisualTitle>
              <ProRow>
                <span className="avatar">LU</span>
                <div>Lucas<small>18 atendimentos</small></div>
                <b>R$ 980,00<small>Parte do estabelecimento: R$ 294,00</small></b>
              </ProRow>
              <ProRow>
                <span className="avatar">PE</span>
                <div>Pedro<small>14 atendimentos</small></div>
                <b>R$ 720,00<small>Parte do estabelecimento: R$ 216,00</small></b>
              </ProRow>
              <ProRow>
                <span className="avatar">RA</span>
                <div>Rafael<small>10 atendimentos</small></div>
                <b>R$ 480,00<small>Parte do estabelecimento: R$ 144,00</small></b>
              </ProRow>
              <StatGrid $cols={2} style={{ marginTop: '1rem' }}>
                <Stat><small><Wallet size={13} /> Faturamento</small><strong>R$ 2.180,00</strong></Stat>
                <Stat><small><Percent size={13} /> Parte do estabelecimento</small><strong>R$ 654,00</strong></Stat>
              </StatGrid>
            </Visual>
          </Row>
        </Container>
      </Section>

      {/* COMO FUNCIONA */}
      <Section id="como-funciona">
        <Container>
          <SectionHead>
            <Eyebrow>Como funciona</Eyebrow>
            <H2>Recebendo agendamentos ainda hoje</H2>
          </SectionHead>
          <Steps>
            {howSteps.map((step, i) => (
              <Card key={step.title}>
                <StepNumber>{i + 1}</StepNumber>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </Card>
            ))}
          </Steps>
        </Container>
      </Section>

      {/* PLANOS */}
      <Section id="planos" style={{ paddingTop: 0 }}>
        <Container>
          <SectionHead>
            <Eyebrow>Planos</Eyebrow>
            <H2>Preço simples, sem taxa por agendamento</H2>
            <Lead>Todos os planos começam com 14 dias grátis. Sem fidelidade.</Lead>
          </SectionHead>

          {plansLoading ? (
            <Muted>Carregando planos...</Muted>
          ) : plans.length === 0 ? (
            <Muted>Os planos estão indisponíveis no momento. Comece o teste grátis e escolha depois.</Muted>
          ) : (
            <PlansGrid>
              {plans.map((plan) => (
                <PlanCard key={plan.id} $featured={plan.featured}>
                  {plan.featured && <PlanBadge>Mais escolhido</PlanBadge>}
                  <PlanName>{plan.name}</PlanName>
                  {plan.description && <PlanDescription>{plan.description}</PlanDescription>}
                  <PlanPrice>
                    <strong>{formatBRL(plan.monthly)}</strong> <span>/ mês</span>
                  </PlanPrice>
                  <Button $outline={!plan.featured} type="button" onClick={() => startTrial()}>
                    Testar 14 dias grátis
                  </Button>
                  {plan.features.length > 0 && (
                    <PlanFeatures>
                      {plan.features.map((feature) => (
                        <li key={feature}><Check size={16} />{feature}</li>
                      ))}
                    </PlanFeatures>
                  )}
                </PlanCard>
              ))}
            </PlansGrid>
          )}
        </Container>
      </Section>

      {/* DÚVIDAS */}
      <Section id="duvidas" style={{ paddingTop: 0 }}>
        <Container>
          <SectionHead>
            <Eyebrow>Dúvidas frequentes</Eyebrow>
            <H2>Perguntas que todo prestador de serviço faz</H2>
          </SectionHead>
          <FaqList>
            {faqItems.map((item, i) => {
              const open = faqOpen === i;
              return (
                <FaqItem key={item.question}>
                  <FaqQuestion type="button" $open={open} aria-expanded={open} onClick={() => setFaqOpen(open ? null : i)}>
                    {item.question}
                    <ChevronDown size={18} />
                  </FaqQuestion>
                  <FaqAnswer $open={open}>{item.answer}</FaqAnswer>
                </FaqItem>
              );
            })}
          </FaqList>
        </Container>
      </Section>

      {/* CHAMADA FINAL */}
      <Container>
        <CtaBand>
          <div>
            <h3>Sua agenda, seus clientes, seu link.</h3>
            <p>
              Teste por 14 dias com a implantação feita junto com a nossa equipe. Se não fizer sentido para o seu
              negócio, é só não assinar.
            </p>
          </div>
          <div>
            <Button $light $large type="button" onClick={() => startTrial()}>
              Começar teste grátis <ArrowRight size={16} />
            </Button>
            <small><ShieldCheck size={12} style={{ verticalAlign: '-2px' }} /> Sem cartão • Sem fidelidade</small>
          </div>
        </CtaBand>
      </Container>

      <Footer>
        <FooterInner>
          <Logo />
          <nav>
            <a href="#diferenciais" onClick={(e) => { e.preventDefault(); scrollTo('diferenciais'); }}>Diferenciais</a>
            <a href="#planos" onClick={(e) => { e.preventDefault(); scrollTo('planos'); }}>Planos</a>
            <a href="/login">Entrar</a>
            <a href="/termos-de-uso">Termos de uso</a>
          </nav>
          <span>© {new Date().getFullYear()} ElevatoHub</span>
        </FooterInner>
      </Footer>
    </Page>
  );
}

export default Landing;

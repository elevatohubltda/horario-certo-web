import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes, css, ThemeProvider } from 'styled-components';
import { ReactComponent as Logo } from '../assets/horario-certo-logo-horizontal.svg?component';
import { useNavigate } from 'react-router-dom';
import { getPublicSubscriptionPlans } from '../services/endpoints/payment';

/* ── temas ──────────────────────────────────────────────────────────── */

const buildTheme = (dark) => ({
  dark,
  pageBg:        dark ? 'linear-gradient(135deg,#080808 0%,#0f0f0f 100%)' : 'linear-gradient(135deg,#f6f0e4 0%,#ede6d5 100%)',
  shellBg:       dark ? '#111111'  : '#fffef8',
  shellBorder:   dark ? '#232323'  : '#dfd5b8',
  navBorder:     dark ? '#1c1c1c'  : '#e8dfc8',
  surfaceBg:     dark ? '#1a1a1a'  : '#ffffff',
  surfaceBorder: dark ? '#252525'  : '#e5dac0',
  surface2Bg:    dark ? '#1c1c1c'  : '#faf6ec',
  insetBg:       dark ? '#141414'  : '#f5f0e5',
  stripBg:       dark ? '#0d0d0d'  : '#f0e8d4',
  stripBorder:   dark ? '#1c1c1c'  : '#e5d8b8',
  carouselBg:    dark ? 'linear-gradient(180deg,#161616 0%,#131313 100%)' : 'linear-gradient(180deg,#faf7ee 0%,#f5f0e5 100%)',
  carouselBorder:dark ? '#1e1e1e'  : '#e5dac0',
  hlCardBg:      'linear-gradient(160deg,#1c1500 0%,#231c00 100%)',
  floatBg:       dark ? 'rgba(22,18,12,.9)' : 'rgba(255,252,240,.95)',
  floatBorder:   dark ? 'rgba(201,168,76,.2)' : 'rgba(138,104,32,.2)',
  floatLabel:    dark ? '#8a8070' : '#7a6845',
  chevBg:        dark ? '#222'     : '#f0e8d4',
  chevBorder:    dark ? '#2e2e2e'  : '#e0d0a8',
  reviewDivider: dark ? '#222'     : '#e5dac0',
  planSecBtn:    dark ? '#252525'  : '#f0e5cc',
  planSecColor:  dark ? '#c8bfaa'  : '#6a5018',
  // text
  textP: dark ? '#f5f0e8' : '#1c1505',
  textS: dark ? '#8a8070' : '#7a6845',
  textM: dark ? '#6a6055' : '#9a8060',
  textD: dark ? '#504540' : '#c0a880',
  // accent
  accent:   dark ? '#c9a84c' : '#8a6820',
  accentL:  dark ? '#e2c06a' : '#c9a84c',
  accentA:  dark ? 'rgba(201,168,76,.28)' : 'rgba(138,104,32,.30)',
  accentAS: dark ? 'rgba(201,168,76,.50)' : 'rgba(138,104,32,.55)',
  accentBg: dark ? 'rgba(201,168,76,.07)' : 'rgba(138,104,32,.06)',
  accentCtaBg: dark
    ? 'linear-gradient(100deg,rgba(201,168,76,.13) 0%,rgba(201,168,76,.06) 55%,rgba(201,168,76,.10) 100%)'
    : 'linear-gradient(100deg,rgba(138,104,32,.12) 0%,rgba(138,104,32,.06) 55%,rgba(138,104,32,.09) 100%)',
  // buttons
  btnPBg:    dark ? 'linear-gradient(125deg,#c9a84c 0%,#e2c06a 100%)' : 'linear-gradient(125deg,#8a6820 0%,#c9a84c 100%)',
  btnPColor: dark ? '#0d0d0d' : '#ffffff',
  btnOColor: dark ? '#c8bfaa' : '#6a5018',
  btnOBorder:dark ? 'rgba(201,168,76,.28)' : 'rgba(138,104,32,.30)',
  // misc
  numBg:    dark ? 'linear-gradient(135deg,#c9a84c 0%,#a08035 100%)' : 'linear-gradient(135deg,#8a6820 0%,#c9a84c 100%)',
  numColor: dark ? '#0d0d0d' : '#ffffff',
  dotA: dark ? '#c9a84c' : '#8a6820',
  dotI: dark ? '#333'    : '#d5c898',
  logoFilter: dark ? 'brightness(0) invert(1)' : 'none',
  shadow:     dark ? 'rgba(0,0,0,.7)' : 'rgba(90,60,0,.15)',
});

const darkTheme  = buildTheme(true);
const lightTheme = buildTheme(false);

/* ── keyframes ──────────────────────────────────────────────────────── */

const revealUp = keyframes`
  from { opacity:0; transform:translateY(16px); }
  to   { opacity:1; transform:translateY(0);    }
`;

const drift = keyframes`
  0%,100% { transform:translateY(0px);  }
  50%      { transform:translateY(-6px); }
`;

const shimmerLine = keyframes`
  0%   { background-position:0%   50%; }
  100% { background-position:200% 50%; }
`;

const successPop = keyframes`
  from { transform:scale(0.5); opacity:0; }
  to   { transform:scale(1);   opacity:1; }
`;

/* ── layout ─────────────────────────────────────────────────────────── */

const Page = styled.main`
  min-height: 100dvh;
  width: 100%;
  box-sizing: border-box;
  padding: 0.85rem;
  background: ${({ theme }) => theme.pageBg};
  transition: background 0.35s ease;

  @media (min-width: 768px) { padding: 1.35rem; }
`;

const Shell = styled.div`
  width: min(1180px, 100%);
  margin: 0 auto;
  border-radius: 1.15rem;
  border: 1px solid ${({ theme }) => theme.shellBorder};
  background: ${({ theme }) => theme.shellBg};
  box-shadow: 0 24px 48px ${({ theme }) => theme.shadow};
  overflow: hidden;
  transition: background 0.35s ease, border-color 0.35s ease;
`;

/* ── nav ────────────────────────────────────────────────────────────── */

const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.navBorder};
  background: ${({ theme }) => theme.shellBg};
  transition: background 0.35s ease;

  @media (min-width: 768px) { padding: 1rem 1.4rem; }
`;

const Brand = styled.button`
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  color: ${({ theme }) => theme.textP};
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;

  svg {
    width: max-content;
    height: 44px;
    margin-left: 4px;
    filter: ${({ theme }) => theme.logoFilter};
    transition: filter 0.35s ease;

    @media (min-width: 768px) { height: 60px; margin-left: 8px; }
  }
`;

const NavActions = styled.div`
  display: none;
  align-items: center;
  gap: 0.5rem;

  @media (min-width: 768px) { display: flex; }
`;

const ThemeToggle = styled.button`
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.btnOBorder};
  background: transparent;
  color: ${({ theme }) => theme.accent};
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  flex-shrink: 0;

  &:hover {
    transform: rotate(20deg) scale(1.08);
    border-color: ${({ theme }) => theme.accentAS};
    box-shadow: 0 4px 12px ${({ theme }) => theme.accentA};
  }
`;

const MobileThemeToggle = styled(ThemeToggle)`
  display: flex;

  @media (min-width: 768px) { display: none; }
`;

const OutlineButton = styled.button`
  height: 2.2rem;
  padding: 0 0.95rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.btnOBorder};
  background: transparent;
  color: ${({ theme }) => theme.btnOColor};
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ theme }) => theme.accentAS};
    box-shadow: 0 8px 18px ${({ theme }) => theme.accentA};
  }
`;

const PrimaryButton = styled.button`
  height: 2.2rem;
  padding: 0 1.1rem;
  border-radius: 999px;
  border: none;
  background: ${({ theme }) => theme.btnPBg};
  color: ${({ theme }) => theme.btnPColor};
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px ${({ theme }) => theme.accentA};
    filter: brightness(1.08);
  }
`;

/* ── hero ───────────────────────────────────────────────────────────── */

const Hero = styled.section`
  padding: 1.75rem 1.1rem 1.25rem;
  text-align: center;

  @media (min-width: 768px) { padding: 3.5rem 2rem 2rem; }
`;

const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1rem;
  padding: 0.3rem 0.7rem;
  border-radius: 0.9rem;
  border: 2px solid ${({ theme }) => theme.accentA};
  background: ${({ theme }) => theme.accentBg};
  color: ${({ theme }) => theme.accentL};
  font-size: 0.74rem;
  font-weight: 700;

  &::before {
    content: '✓';
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    border-radius: 999px;
    background: ${({ theme }) => theme.accent};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.btnPColor};
    font-weight: 900;
    font-size: 0.7rem;
  }
`;

const HeroTitle = styled.h1`
  margin: 0 auto;
  max-width: 820px;
  color: ${({ theme }) => theme.textP};
  line-height: 1.1;
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(2rem, 8vw, 3.6rem);

  strong { color: ${({ theme }) => theme.accent}; }
`;

const HeroSub = styled.p`
  margin: 1rem auto 0;
  max-width: 580px;
  color: ${({ theme }) => theme.textS};
  line-height: 1.55;
  font-size: clamp(0.88rem, 3.8vw, 1.02rem);
`;

const HeroCtas = styled.div`
  margin-top: 1.4rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.55rem;

  @media (min-width: 420px) {
    flex-direction: row;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
  }
`;

const HeroCta = styled.button`
  height: 3rem;
  padding: 0 1.6rem;
  border-radius: 999px;
  border: none;
  background: ${({ theme }) => theme.btnPBg};
  color: ${({ theme }) => theme.btnPColor};
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px ${({ theme }) => theme.accentA};
    filter: brightness(1.07);
  }
`;

const HeroCtaOutline = styled.button`
  height: 3rem;
  padding: 0 1.4rem;
  border-radius: 999px;
  border: 1.5px solid ${({ theme }) => theme.btnOBorder};
  background: transparent;
  color: ${({ theme }) => theme.btnOColor};
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, color 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ theme }) => theme.accentAS};
    color: ${({ theme }) => theme.accentL};
  }
`;

const HeroRisk = styled.p`
  margin: 0.65rem 0 0;
  color: ${({ theme }) => theme.textD};
  font-size: 0.78rem;
`;

const FloatingGroup = styled.div`
  margin: 1.25rem auto 0;
  width: fit-content;
  max-width: calc(100% - 1rem);
  display: flex;
  align-items: center;
  padding: 0.2rem 0.7rem 0.2rem 0.6rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.floatBg};
  border: 1px solid ${({ theme }) => theme.floatBorder};
  box-shadow: 0 8px 20px ${({ theme }) => theme.shadow};

  .avatar {
    width: 2rem; height: 2rem;
    border-radius: 999px;
    border: 2px solid ${({ theme }) => theme.shellBg};
    margin-left: -0.3rem;
    display: inline-flex; align-items: center; justify-content: center;
    color: #0d0d0d; font-size: 0.65rem; font-weight: 700;
    background: ${({ theme }) => theme.accent};
    animation: ${drift} 4s ease-in-out infinite;

    &:nth-child(2) { background: ${({ theme }) => theme.dark ? '#b09040' : '#a07830'}; animation-delay:.15s; }
    &:nth-child(3) { background: ${({ theme }) => theme.dark ? '#907530' : '#806020'}; animation-delay:.3s;  }
    &:nth-child(4) { background: ${({ theme }) => theme.dark ? '#705820' : '#604810'}; animation-delay:.45s; }
  }

  .label {
    margin-left: 0.55rem;
    font-size: 0.78rem;
    color: ${({ theme }) => theme.floatLabel};
    font-weight: 600;
    white-space: nowrap;
  }
`;

/* ── trust strip ────────────────────────────────────────────────────── */

const TrustStrip = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 0.5rem;
  padding: 0.8rem 1.1rem;
  border-top: 1px solid ${({ theme }) => theme.stripBorder};
  border-bottom: 1px solid ${({ theme }) => theme.stripBorder};
  background: ${({ theme }) => theme.stripBg};
  transition: background 0.35s ease;

  @media (min-width: 580px) {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.3rem 1.4rem;
    padding: 0.75rem 1rem;
  }
`;

const TrustItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.76rem;
  color: ${({ theme }) => theme.textM};
  font-weight: 600;
  line-height: 1.3;

  .emoji { font-size: 0.85rem; flex-shrink: 0; }

  @media (min-width: 580px) {
    font-size: 0.8rem;
    .emoji { font-size: 0.9rem; }
  }
`;

/* ── shared section atoms ───────────────────────────────────────────── */

const SectionLabel = styled.span`
  display: inline-block;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.accentA};
  color: ${({ theme }) => theme.accent};
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.22rem 0.62rem;
  margin-bottom: 0.65rem;
`;

const SectionHeading = styled.h2`
  margin: 0 0 1rem;
  font-size: clamp(1.3rem, 4vw, 1.9rem);
  line-height: 1.18;
  color: ${({ theme }) => theme.textP};
  font-family: 'Montserrat', sans-serif;
`;

/* ── problem ────────────────────────────────────────────────────────── */

const ProblemSection = styled.section`
  padding: 1.5rem 1rem;

  @media (min-width: 768px) { padding: 1.8rem 2rem; }
`;

const ProblemGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.7rem;

  @media (min-width: 640px) { grid-template-columns: repeat(3,1fr); }
`;

const ProblemCard = styled.article`
  border-radius: 0.95rem;
  padding: 1rem;
  background: ${({ theme }) => theme.surfaceBg};
  border: 1px solid ${({ theme }) => theme.surfaceBorder};
  animation: ${revealUp} 0.5s ease both;
  animation-delay: ${({ $delay }) => $delay || '0s'};
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.35s ease;

  &:hover {
    border-color: ${({ theme }) => theme.accentA};
    box-shadow: 0 8px 20px ${({ theme }) => theme.shadow};
  }

  .icon { font-size:1.5rem; line-height:1; margin-bottom:0.6rem; display:block; }
  h3   { margin:0; font-size:0.95rem; color:${({ theme }) => theme.textP}; line-height:1.3; }
  p    { margin:0.4rem 0 0; color:${({ theme }) => theme.textM}; font-size:0.82rem; line-height:1.45; }
`;

/* ── features ───────────────────────────────────────────────────────── */

const Features = styled.section`
  padding: 0 1rem 1.5rem;

  @media (min-width: 768px) { padding: 0 2rem 2rem; }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;

  @media (min-width: 980px) { grid-template-columns: 1fr 1fr 1fr 1.4fr; }
`;

const FeatureCard = styled.article`
  border-radius: 0.95rem;
  padding: 1rem;
  background: ${({ theme }) => theme.surfaceBg};
  border: 1px solid ${({ theme }) => theme.surfaceBorder};
  animation: ${revealUp} 0.5s ease both;
  animation-delay: ${({ $delay }) => $delay || '0s'};
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.35s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.accentA};
    box-shadow: 0 14px 24px ${({ theme }) => theme.shadow};
  }

  h3 { margin:0.6rem 0 0; font-size:1.05rem; line-height:1.25; color:${({ theme }) => theme.textP}; }
  p  { margin:0.5rem 0 0; color:${({ theme }) => theme.textM}; font-size:0.85rem; line-height:1.45; }
`;

const Dot = styled.span`
  width: 2rem; height: 2rem;
  border-radius: 0.7rem;
  display: inline-flex; align-items: center; justify-content: center;
  color: #0d0d0d; font-size: 0.75rem; font-weight: 700;
  background: ${({ $tone }) => $tone};
`;

const HighlightCard = styled.article`
  border-radius: 0.95rem;
  padding: 1rem;
  background: ${({ theme }) => theme.hlCardBg};
  border: 1px solid rgba(201,168,76,.2);
  display: flex; flex-direction: column; justify-content: center;
  position: relative; overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 28px rgba(201,168,76,.12);
  }

  &::after {
    content: '';
    position: absolute;
    inset: auto -15% -45% -15%;
    height: 60%;
    background: radial-gradient(circle, rgba(201,168,76,.12) 0%, transparent 68%);
    pointer-events: none;
  }

  .tag {
    width: fit-content;
    border-radius: 999px;
    border: 1px solid rgba(201,168,76,.3);
    color: #c9a84c;
    font-size: 0.72rem; font-weight: 600;
    padding: 0.22rem 0.62rem;
  }

  h3 { margin:0.8rem 0 0; font-size:clamp(1.35rem,2.5vw,1.75rem); line-height:1.18; color:#f5f0e8; }
  p  { margin:0.6rem 0 0; color:#8a8070; line-height:1.5; font-size:0.88rem; }
`;

/* ── plans ──────────────────────────────────────────────────────────── */

const PlansSection = styled.section`
  padding: 1rem;
  position: relative;

  @media (min-width: 768px) { padding: 0 2rem 2rem; }
`;

const PlansHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  margin-bottom: 0.9rem;

  h2 { margin:0; color:${({ theme }) => theme.textP}; font-size:clamp(1.5rem,4vw,2.1rem); line-height:1.15; font-family:'Montserrat',sans-serif; }
`;

const PlansMeta = styled.div`
  display: flex; align-items: center; gap: 0.55rem;
`;

const ControlButton = styled.button`
  width: 2rem; height: 2rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.surfaceBorder};
  background: ${({ theme }) => theme.surfaceBg};
  color: ${({ theme }) => theme.btnOColor};
  font-weight: 700; cursor: pointer;
  transition: border-color 0.2s ease;

  &:hover { border-color: ${({ theme }) => theme.accentA}; }
  &:disabled { opacity:0.35; cursor:not-allowed; }
`;

const PlansCarousel = styled.div`
  border-radius: 1rem;
  border: 1px solid ${({ theme }) => theme.carouselBorder};
  background: ${({ theme }) => theme.carouselBg};
  box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
  padding: 0.8rem;
  transition: background 0.35s ease;

  @media (min-width: 768px) { padding: 1rem; }
`;

const PlansTrack = styled.div`
  display: flex;
  justify-content: ${({ $singleItem }) => ($singleItem ? 'center' : 'flex-start')};
  gap: 0.8rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;

  &::-webkit-scrollbar { display:none; }
`;

const PlanCard = styled.article`
  flex: 0 0 86%;
  min-height: 330px;
  border-radius: 0.9rem;
  border: 1px solid ${({ $recommended, theme }) => $recommended ? theme.accentAS : theme.surfaceBorder};
  background: ${({ theme }) => theme.surface2Bg};
  padding: 0.95rem;
  box-shadow: ${({ $recommended, theme }) => $recommended
    ? `0 16px 28px ${theme.accentA}`
    : `0 6px 14px ${theme.shadow}`};
  scroll-snap-align: start;
  animation: ${revealUp} 0.5s ease both;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.35s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ $recommended, theme }) => $recommended
      ? `0 20px 32px ${theme.accentA}`
      : `0 14px 24px ${theme.shadow}`};
  }

  @media (min-width: 768px)  { flex-basis: 44%; }
  @media (min-width: 1080px) { flex-basis: calc(33.333% - 0.54rem); }
`;

const PlanTag = styled.span`
  font-size: 0.75rem; color: ${({ theme }) => theme.accent}; font-weight: 700;
`;

const PlanText = styled.p`
  margin: 0.45rem 0 0.7rem; color: ${({ theme }) => theme.textM}; font-size: 0.83rem; line-height: 1.4;
`;

const PlanPriceBox = styled.div`
  border-radius: 0.75rem;
  border: 1px solid ${({ theme }) => theme.surfaceBorder};
  background: ${({ theme }) => theme.insetBg};
  padding: 0.7rem; margin-bottom: 0.75rem;
  display: flex; align-items: end; gap: 0.45rem;
  transition: background 0.35s ease;

  strong { color:${({ theme }) => theme.textP}; font-size:1.85rem; line-height:1; }
  span   { color:${({ theme }) => theme.textD}; font-size:0.78rem; margin-bottom:0.2rem; }
`;

const PlanAction = styled.button`
  width: 100%; height: 2.25rem;
  border-radius: 999px; border: none;
  background: ${({ $recommended, theme }) => $recommended ? theme.btnPBg : theme.planSecBtn};
  color: ${({ $recommended, theme }) => $recommended ? theme.btnPColor : theme.planSecColor};
  font-size: 0.82rem; font-weight: 700; cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(${({ $recommended }) => $recommended ? '1.06' : '1.1'});
    box-shadow: ${({ $recommended, theme }) => $recommended ? `0 8px 16px ${theme.accentA}` : 'none'};
  }
`;

const PlanFeatureList = styled.ul`
  margin: 0.8rem 0 0; padding: 0; list-style: none; display: grid; gap: 0.45rem;

  li {
    color: ${({ theme }) => theme.textM};
    font-size: 0.79rem; line-height: 1.35;
    display: flex; align-items: flex-start; gap: 0.4rem;

    &::before {
      content:''; margin-top:0.35rem;
      width:0.38rem; height:0.38rem; border-radius:999px;
      background: ${({ theme }) => theme.accentA};
      flex-shrink: 0;
    }

    &.addon { color:${({ theme }) => theme.textS}; &::before { opacity:.6; } }
  }
`;

const AddonBadge = styled.span`
  display: inline-block; margin-left: 0.3rem;
  padding: 0.1rem 0.38rem; border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.accentA};
  background: ${({ theme }) => theme.accentBg};
  color: ${({ theme }) => theme.accent};
  font-size: 0.68rem; font-weight: 600; white-space: nowrap;
  flex-shrink: 0; align-self: center;
`;

const PlansDots = styled.div`
  margin-top: 0.8rem;
  display: flex; align-items: center; justify-content: center; gap: 0.45rem;
`;

const DotButton = styled.button`
  width: ${({ $active }) => ($active ? '1.35rem' : '0.45rem')};
  height: 0.45rem; border-radius: 999px; border: none;
  background: ${({ $active, theme }) => $active ? theme.dotA : theme.dotI};
  cursor: pointer; transition: all 0.18s ease;
`;

const PlansFallbackText = styled.p`
  margin: 0.35rem 0; padding: 1rem 0.5rem;
  text-align: center; color: ${({ theme }) => theme.textM}; font-size: 0.9rem;
`;

/* ── how it works ───────────────────────────────────────────────────── */

const HowSection = styled.section`
  padding: 0 1rem 1.5rem;

  @media (min-width: 768px) { padding: 0 2rem 2rem; }
`;

const HowGrid = styled.div`
  display: grid; grid-template-columns: 1fr; gap: 0.75rem;

  @media (min-width: 768px) { grid-template-columns: repeat(3,1fr); }
`;

const HowStep = styled.article`
  border-radius: 0.95rem; padding: 1.1rem;
  background: ${({ theme }) => theme.surfaceBg};
  border: 1px solid ${({ theme }) => theme.surfaceBorder};
  display: flex; flex-direction: column; gap: 0.6rem;
  animation: ${revealUp} 0.5s ease both;
  animation-delay: ${({ $delay }) => $delay || '0s'};
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.35s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: ${({ theme }) => theme.accentA};
    box-shadow: 0 12px 22px ${({ theme }) => theme.shadow};
  }

  h3 { margin:0; font-size:1rem; color:${({ theme }) => theme.textP}; line-height:1.3; }
  p  { margin:0; color:${({ theme }) => theme.textM}; font-size:0.85rem; line-height:1.5; }
`;

const HowNumber = styled.span`
  width: 2.2rem; height: 2.2rem; border-radius: 0.7rem;
  background: ${({ theme }) => theme.numBg};
  color: ${({ theme }) => theme.numColor};
  font-size: 0.8rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
`;

/* ── faq ────────────────────────────────────────────────────────────── */

const FaqSection = styled.section`
  padding: 0 1rem 1.5rem;

  @media (min-width: 768px) { padding: 0 2rem 2rem; }
`;

const FaqList = styled.div`
  display: grid; gap: 0.55rem;
`;

const FaqItem = styled.div`
  border-radius: 0.95rem;
  border: 1px solid ${({ $open, theme }) => $open ? theme.accentAS : theme.surfaceBorder};
  background: ${({ theme }) => theme.surfaceBg};
  overflow: hidden;
  transition: border-color 0.2s ease, background 0.35s ease;
`;

const FaqQuestion = styled.button`
  width: 100%;
  display: flex; align-items: center; justify-content: space-between; gap: 0.8rem;
  padding: 0.9rem 1rem;
  background: transparent; border: none; cursor: pointer;
  text-align: left; font-size: 0.9rem; font-weight: 600;
  color: ${({ theme }) => theme.textP}; line-height: 1.35;

  .chevron {
    flex-shrink: 0; width: 1.1rem; height: 1.1rem; border-radius: 999px;
    border: 1px solid ${({ theme }) => theme.chevBorder};
    background: ${({ theme }) => theme.chevBg};
    display: flex; align-items: center; justify-content: center;
    font-size: 0.65rem; color: ${({ theme }) => theme.accent};
    transition: transform 0.2s ease;
    transform: ${({ $open }) => ($open ? 'rotate(180deg)' : 'rotate(0deg)')};
  }
`;

const FaqAnswer = styled.div`
  max-height: ${({ $open }) => ($open ? '12rem' : '0')};
  overflow: hidden; transition: max-height 0.28s ease;

  p {
    margin: 0; padding: 0 1rem 0.9rem;
    color: ${({ theme }) => theme.textM}; font-size: 0.85rem; line-height: 1.6;
    border-top: 1px solid ${({ theme }) => theme.surfaceBorder}; padding-top: 0.75rem;
  }
`;

/* ── reviews ────────────────────────────────────────────────────────── */

const ReviewsSection = styled.section`
  padding: 0 1rem 1.5rem;

  @media (min-width: 768px) { padding: 0 2rem 2rem; }
`;

const ReviewsGrid = styled.div`
  display: grid; grid-template-columns: 1fr; gap: 0.75rem;

  @media (min-width: 640px)  { grid-template-columns: repeat(2,1fr); }
  @media (min-width: 1000px) { grid-template-columns: repeat(3,1fr); }
`;

const ReviewCard = styled.article`
  border-radius: 0.95rem; padding: 1rem;
  background: ${({ theme }) => theme.surfaceBg};
  border: 1px solid ${({ theme }) => theme.surfaceBorder};
  display: flex; flex-direction: column; gap: 0.75rem;
  animation: ${revealUp} 0.5s ease both;
  animation-delay: ${({ $delay }) => $delay || '0s'};
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.35s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: ${({ theme }) => theme.accentA};
    box-shadow: 0 12px 22px ${({ theme }) => theme.shadow};
  }
`;

const Stars = styled.div`
  display: flex; gap: 0.15rem; color: ${({ theme }) => theme.accent}; font-size: 0.82rem;
`;

const ReviewText = styled.p`
  margin: 0; color: ${({ theme }) => theme.textS}; font-size: 0.87rem; line-height: 1.55; flex: 1;
`;

const ReviewAuthor = styled.div`
  display: flex; align-items: center; gap: 0.6rem;
  padding-top: 0.6rem; border-top: 1px solid ${({ theme }) => theme.reviewDivider};
`;

const ReviewAvatar = styled.span`
  width: 2.1rem; height: 2.1rem; border-radius: 999px;
  background: ${({ $tone }) => $tone || '#c9a84c'};
  color: #0d0d0d; font-size: 0.7rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
`;

const ReviewMeta = styled.div`
  strong { display:block; font-size:0.83rem; color:${({ theme }) => theme.textP}; line-height:1.2; }
  span   { font-size:0.75rem; color:${({ theme }) => theme.textD}; }
`;

/* ── cta band ───────────────────────────────────────────────────────── */

const CtaBand = styled.section`
  margin: 0.3rem 1rem 1rem;
  border-radius: 0.95rem; padding: 1.5rem 1rem;
  border: 1px solid ${({ theme }) => theme.accentA};
  background: ${({ theme }) => theme.accentCtaBg};
  display: flex; flex-direction: column; gap: 1rem;
  position: relative; overflow: hidden; text-align: center;

  &::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(115deg,transparent 0%,rgba(255,255,255,.04) 42%,transparent 70%);
    background-size: 200% 100%;
    animation: ${shimmerLine} 8s linear infinite;
    pointer-events: none;
  }

  h3 { margin:0; color:${({ theme }) => theme.textP}; font-size:clamp(1.2rem,3.5vw,1.7rem); font-family:'Montserrat',sans-serif; line-height:1.25; }
  p  { margin:0.5rem 0 0; color:${({ theme }) => theme.textS}; line-height:1.5; font-size:0.93rem; }

  @media (min-width: 768px) {
    margin: 0 2rem 2rem; padding: 2rem 1.5rem;
    text-align: left; flex-direction: row; align-items: center; justify-content: space-between;
  }
`;

const CtaActions = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem; flex-shrink: 0;

  @media (min-width: 768px) { align-items: flex-end; }
`;

const CtaFinalButton = styled.button`
  height: 2.85rem; padding: 0 1.8rem; border-radius: 999px; border: none;
  background: ${({ theme }) => theme.btnPBg};
  color: ${({ theme }) => theme.btnPColor};
  font-weight: 700; font-size: 0.95rem; cursor: pointer; white-space: nowrap;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px ${({ theme }) => theme.accentA};
    filter: brightness(1.06);
  }
`;

const CtaNote = styled.span`
  font-size: 0.77rem; color: ${({ theme }) => theme.textD};
`;

/* ── demo section ───────────────────────────────────────────────────── */

const DemoSection = styled.section`
  padding: 0 1rem 1.5rem;

  @media (min-width: 768px) { padding: 0 2rem 2rem; }
`;

const DemoLayout = styled.div`
  display: flex; flex-direction: column; gap: 2rem; align-items: center;

  @media (min-width: 880px) { flex-direction: row; align-items: center; gap: 3.5rem; }
`;

const DemoStepsList = styled.div`
  display: flex; flex-direction: column; gap: 0.7rem; flex: 1; order: 2;

  @media (min-width: 880px) { order: 1; }
`;

const DemoStepItem = styled.div`
  display: flex; gap: 1rem; align-items: flex-start;
  border-radius: 0.95rem; padding: 0.9rem 1rem;
  background: ${({ $active, theme }) => $active ? theme.surfaceBg : 'transparent'};
  border: 1px solid ${({ $active, theme }) => $active ? theme.accentA : theme.surfaceBorder};
  opacity: ${({ $active }) => ($active ? 1 : 0.45)};
  transition: all 0.4s ease;

  h4 { margin:0 0 0.25rem; font-size:0.92rem; color:${({ theme }) => theme.textP}; font-weight:700; }
  p  { margin:0; font-size:0.82rem; color:${({ theme }) => theme.textM}; line-height:1.45; }
`;

const DemoStepNum = styled.span`
  flex-shrink: 0; width: 2rem; height: 2rem; border-radius: 0.65rem;
  background: ${({ $active, theme }) => $active ? theme.numBg : theme.chevBg};
  color: ${({ $active, theme }) => $active ? theme.numColor : theme.textD};
  font-size: 0.75rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.4s ease;
`;

const DemoPhoneWrapper = styled.div`
  flex-shrink: 0; order: 1;
  display: flex; flex-direction: column; align-items: center; gap: 1rem;

  @media (min-width: 880px) { order: 2; }
`;

const DemoPhone = styled.div`
  width: 245px; height: 490px; border-radius: 30px;
  background: #f8f9f6;
  box-shadow: 0 0 0 8px #1a1a1a, 0 0 0 10px #2a2a2a, 0 28px 56px rgba(0,0,0,.65);
  overflow: hidden; position: relative;
  font-family: 'Inter', -apple-system, sans-serif;

  &::before {
    content:''; position:absolute; top:0; left:50%; transform:translateX(-50%);
    width:85px; height:20px; background:#1a1a1a;
    border-radius:0 0 13px 13px; z-index:200;
  }
`;

const DemoScreenBase = styled.div`
  position: absolute; inset: 0; background: #f8f9f6;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.4s ease;
  pointer-events: ${({ $visible }) => ($visible ? 'all' : 'none')};
  overflow: hidden;
`;

const DemoSheetOverlay = styled.div`
  position: absolute; inset: 0; background: rgba(0,0,0,.4);
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.3s ease;
  pointer-events: ${({ $visible }) => ($visible ? 'all' : 'none')};
  display: flex; align-items: flex-end;
`;

const DemoSheet = styled.div`
  width: 100%; background: #fff;
  border-radius: 18px 18px 0 0; padding: 0 14px 20px;
  transform: ${({ $open }) => ($open ? 'translateY(0)' : 'translateY(100%)')};
  transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
`;

const DemoSuccessIcon = styled.div`
  width: 52px; height: 52px; border-radius: 50%;
  background: rgba(201,168,76,.1); border: 2.5px solid rgba(201,168,76,.5);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; margin-bottom: 14px; color: #c9a84c;
  ${({ $play }) => $play && css`animation: ${successPop} 0.5s cubic-bezier(0.34,1.56,0.64,1) both;`}
`;

const DemoProgressBar = styled.div`
  position: absolute; bottom: 0; left: 0; height: 2.5px;
  background: ${({ theme }) => theme.accent};
  width: ${({ $pct }) => $pct}%;
  transition: width ${({ $duration }) => $duration}ms linear;
`;

const DemoDotsRow = styled.div`
  display: flex; align-items: center; gap: 0.5rem;
`;

const DemoDot = styled.button`
  width: ${({ $active }) => ($active ? '1.3rem' : '0.4rem')};
  height: 0.4rem; border-radius: 999px; border: none;
  background: ${({ $active, theme }) => $active ? theme.dotA : theme.dotI};
  cursor: pointer; transition: all 0.2s ease; padding: 0;
`;

/* ── static data ────────────────────────────────────────────────────── */

const problemCards = [
  { icon:'📱', title:'WhatsApp virou agenda de papel digital', text:'Mensagem perdida, horário esquecido, cliente que some. Gerenciar agenda no WhatsApp cansa e cobra erro.' },
  { icon:'😤', title:'Furo na agenda nos horários de pico', text:'Aquele horário que ficou vazio por falta de confirmação. Vaga perdida, dinheiro que foi embora.' },
  { icon:'🤷', title:'Não sabe quanto faturou no mês', text:'No fim do mês você vai no instinto. Sem número claro de faturamento fica difícil crescer.' },
];

const howSteps = [
  { number:'01', title:'Crie sua conta em 2 minutos', text:'Sem cartão de crédito. Preencha nome, e-mail e senha — e sua conta já está pronta para configurar.' },
  { number:'02', title:'Configure seus serviços e horários', text:'Adicione os serviços que você oferece, defina seus horários disponíveis e pronto. Menos de 30 minutos.' },
  { number:'03', title:'Compartilhe o link com seus clientes', text:'Você recebe um link exclusivo da sua barbearia. Mande no WhatsApp, Instagram ou bio — clientes agendam sozinhos.' },
];

const faqItems = [
  { question:'Preciso de cartão de crédito para testar?', answer:'Não. O teste de 14 dias é completamente gratuito e não exige nenhum dado de pagamento. Você só informa o cartão se decidir assinar ao final do período.' },
  { question:'Funciona para barbearia com apenas 1 profissional?', answer:'Sim, e foi exatamente para isso que o Horário Certo foi criado. Barbearias pequenas, com 1 ou 2 profissionais, são o nosso foco. A plataforma é simples o suficiente para você usar sozinho, sem precisar de um gestor.' },
  { question:'Meu cliente precisa baixar algum aplicativo para agendar?', answer:'Não. Seu cliente acessa a página da sua barbearia pelo navegador do celular e agenda normalmente, sem precisar instalar nada. O aplicativo é só para você, dono da barbearia, gerenciar tudo.' },
  { question:'Como funciona o WhatsApp? Já está incluso no plano?', answer:'A integração com WhatsApp é um recurso adicional, disponível em duas versões: WhatsApp Básico (até 500 mensagens por mês) e WhatsApp Plus (mensagens ilimitadas). Você pode adicionar ao plano escolhido a qualquer momento.' },
  { question:'Quanto tempo leva para configurar?', answer:'A maioria dos clientes configura tudo em menos de 30 minutos. Você adiciona seus serviços, define os horários disponíveis e já pode começar a receber agendamentos no mesmo dia.' },
  { question:'Como cancelo se não gostar?', answer:'Sem burocracia. Você cancela direto pelo painel, a qualquer momento, sem multa e sem precisar falar com ninguém. Não há fidelidade mínima.' },
];

const reviewCards = [
  { text:'Antes eu perdia horário toda semana por causa de confusão no WhatsApp. Hoje a agenda tá sempre organizada e eu consigo ver tudo pelo celular mesmo durante o atendimento.', author:'Rafael M.', role:'Dono — Barbearia RM', initials:'RM', tone:'#c9a84c' },
  { text:'O aplicativo é muito simples. Em menos de um dia já tava funcionando. Meus clientes adoraram poder marcar a qualquer hora, sem precisar me chamar.', author:'Douglas S.', role:'Barbeiro — Studio DS', initials:'DS', tone:'#a08035' },
  { text:'Tentei outros sistemas antes e todos eram complicados demais pra uma barbearia pequena como a minha. O Horário Certo foi o único que realmente encaixou na minha rotina.', author:'Thiago A.', role:'Dono — Barbearia do Thiago', initials:'TA', tone:'#b09040' },
  { text:'A notificação no celular quando alguém agenda é demais. Não preciso mais ficar olhando pro WhatsApp o tempo todo esperando confirmação de cliente.', author:'Leandro P.', role:'Barbeiro — LP Barbearia', initials:'LP', tone:'#906828' },
  { text:'O controle financeiro me ajudou a entender quais serviços dão mais lucro. Antes eu não tinha ideia de quanto faturava em corte versus barba. Agora sei exatamente.', author:'Marcos V.', role:'Dono — Barbearia Vintage', initials:'MV', tone:'#c9a84c' },
  { text:'Custo-benefício excelente. Pago menos do que pagaria num concorrente e tenho tudo que preciso. Suporte responde rápido quando tenho dúvida.', author:'André C.', role:'Barbeiro — Corte & Estilo', initials:'AC', tone:'#a08035' },
];

const featureCards = [
  { title:'Agenda online 24h', text:'Cliente agenda enquanto você trabalha — ou dorme. A agenda funciona sozinha, sem você precisar responder.', tone:'#c9a84c' },
  { title:'Notificação no celular na hora', text:'Alguém agendou? Notificação push chega no seu celular em segundos. Você sabe em tempo real.', tone:'#a08035' },
  { title:'Faturamento no controle', text:'Veja quanto ganhou por serviço, por dia e por semana. Dados simples pra decidir sem achismo.', tone:'#7a6025' },
];

/* ── component ──────────────────────────────────────────────────────── */

function Landing() {
  const navigate = useNavigate();
  const plansTrackRef = useRef(null);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [activePlan, setActivePlan] = useState(0);
  const [faqOpen, setFaqOpen] = useState(null);

  const getInitialMode = () => {
    try {
      const saved = localStorage.getItem('hc-landing-theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  const [themeMode, setThemeMode] = useState(getInitialMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const toggleTheme = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    try { localStorage.setItem('hc-landing-theme', next); } catch {}
  };

  const DEMO_DELAY = 3500;
  const [demoStep, setDemoStep] = useState(1);
  const [demoPct, setDemoPct] = useState(0);

  useEffect(() => {
    setDemoPct(0);
    const pctTimer = setTimeout(() => setDemoPct(100), 50);
    const stepTimer = setTimeout(() => setDemoStep((p) => (p >= 3 ? 1 : p + 1)), DEMO_DELAY);
    return () => { clearTimeout(pctTimer); clearTimeout(stepTimer); };
  }, [demoStep]);

  useEffect(() => {
    const normalizePlan = (plan, index) => {
      const normalizedFeatures = Array.isArray(plan.features)
        ? plan.features.map((f) => (typeof f === 'string' ? f : f?.name || 'Recurso')).filter(Boolean)
        : [];
      return {
        id: plan.id || plan._id || `${plan.name || 'plano'}-${index}`,
        name: plan.name || `Plano ${index + 1}`,
        monthly: Number(plan.price || plan.monthlyPrice || plan.amount || 0),
        description: plan.description || `Plano com ${normalizedFeatures.length} recurso${normalizedFeatures.length === 1 ? '' : 's'} inclusos.`,
        button: 'Assinar',
        recommended: Boolean(plan.recommended || plan.popular || plan.highlighted || plan.isMostPopular),
        features: normalizedFeatures,
      };
    };

    const fetchPlans = async () => {
      setPlansLoading(true);
      try {
        const response = await getPublicSubscriptionPlans();
        const payload = response?.data;
        const sourcePlans = Array.isArray(payload?.plans) ? payload.plans : Array.isArray(payload) ? payload : [];
        const mapped = sourcePlans.map(normalizePlan).sort((a, b) => a.monthly - b.monthly);
        if (mapped.length > 0 && !mapped.some((p) => p.recommended)) {
          const mid = Math.floor(mapped.length / 2);
          mapped[mid] = { ...mapped[mid], recommended: true };
        }
        setPlans(mapped);
        setActivePlan(0);
      } catch { setPlans([]); }
      finally { setPlansLoading(false); }
    };

    fetchPlans();
  }, []);

  const getScrollStep = () => {
    const track = plansTrackRef.current;
    if (!track) return 0;
    const firstCard = track.querySelector('[data-plan-card="true"]');
    if (!firstCard) return track.clientWidth;
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap || '0') || 0;
    return firstCard.clientWidth + gap;
  };

  const handlePlanScroll = (e) => {
    const step = getScrollStep();
    if (!step) return;
    const index = Math.round(e.currentTarget.scrollLeft / step);
    setActivePlan(Math.max(0, Math.min(Math.max(plans.length - 1, 0), index)));
  };

  const scrollPlans = (dir) => {
    const track = plansTrackRef.current;
    const step = getScrollStep();
    if (!track || !step) return;
    track.scrollBy({ left: dir === 'next' ? step : -step, behavior: 'smooth' });
  };

  const scrollToPlan = (index) => {
    const track = plansTrackRef.current;
    const step = getScrollStep();
    if (!track || !step) return;
    track.scrollTo({ left: step * index, behavior: 'smooth' });
  };

  return (
    <ThemeProvider theme={theme}>
      <Page>
        <Shell>

          {/* Nav */}
          <Nav>
            <Brand type="button" onClick={() => navigate('/')}>
              <Logo className="logo" />
            </Brand>
            <MobileThemeToggle type="button" onClick={toggleTheme} aria-label="Alternar tema">
              {themeMode === 'dark' ? '☀' : '🌙'}
            </MobileThemeToggle>
            <NavActions>
              <ThemeToggle type="button" onClick={toggleTheme} aria-label="Alternar tema">
                {themeMode === 'dark' ? '☀' : '🌙'}
              </ThemeToggle>
              <OutlineButton type="button" onClick={() => navigate('/login')}>
                Já sou cliente
              </OutlineButton>
              <PrimaryButton type="button" onClick={() => navigate('/registro')}>
                Testar grátis
              </PrimaryButton>
            </NavActions>
          </Nav>

          {/* Hero */}
          <Hero>
            <HeroBadge>14 dias grátis • Sem cartão de crédito</HeroBadge>

            <HeroTitle>
              Sua barbearia no <strong>piloto automático</strong>
            </HeroTitle>

            <HeroSub>
              Clientes marcam online enquanto você trabalha. Você recebe notificação no celular na hora.
              App nativo para iOS e Android — sem complicação, sem curva de aprendizado.
            </HeroSub>

            <HeroCtas>
              <HeroCta type="button" onClick={() => navigate('/registro')}>
                Começar 14 dias grátis
              </HeroCta>
              <HeroCtaOutline
                type="button"
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                Ver ao vivo ↓
              </HeroCtaOutline>
            </HeroCtas>

            <HeroRisk>Sem cartão de crédito. Cancele quando quiser.</HeroRisk>

            <FloatingGroup aria-hidden="true">
              <span className="avatar">AN</span>
              <span className="avatar">BR</span>
              <span className="avatar">CL</span>
              <span className="avatar">EX</span>
              <span className="label">Barbearias usando agora</span>
            </FloatingGroup>
          </Hero>

          {/* Trust strip */}
          <TrustStrip>
            <TrustItem><span className="emoji">📱</span> App para iOS e Android</TrustItem>
            <TrustItem><span className="emoji">🔔</span> Notificações push em tempo real</TrustItem>
            <TrustItem><span className="emoji">💬</span> Integração com WhatsApp disponível</TrustItem>
            <TrustItem><span className="emoji">🔒</span> Cancele quando quiser</TrustItem>
          </TrustStrip>

          {/* Problem */}
          <ProblemSection>
            <SectionLabel>Reconhece isso?</SectionLabel>
            <SectionHeading>Dores que toda barbearia pequena conhece</SectionHeading>
            <ProblemGrid>
              {problemCards.map((card, i) => (
                <ProblemCard key={card.title} $delay={`${0.07 * i}s`}>
                  <span className="icon">{card.icon}</span>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </ProblemCard>
              ))}
            </ProblemGrid>
          </ProblemSection>

          {/* Demo */}
          <DemoSection id="demo">
            <SectionLabel>Veja ao vivo</SectionLabel>
            <SectionHeading>Seu cliente agenda em menos de 1 minuto</SectionHeading>

            <DemoLayout>
              <DemoStepsList>
                <DemoStepItem $active={demoStep >= 1}>
                  <DemoStepNum $active={demoStep >= 1}>01</DemoStepNum>
                  <div>
                    <h4>Acessa a sua página</h4>
                    <p>O cliente abre o link da sua barbearia pelo celular — sem app, sem cadastro, sem complicação.</p>
                  </div>
                </DemoStepItem>
                <DemoStepItem $active={demoStep >= 2}>
                  <DemoStepNum $active={demoStep >= 2}>02</DemoStepNum>
                  <div>
                    <h4>Escolhe e confirma o horário</h4>
                    <p>Toca no horário disponível, informa nome e serviço. Menos de 30 segundos.</p>
                  </div>
                </DemoStepItem>
                <DemoStepItem $active={demoStep >= 3}>
                  <DemoStepNum $active={demoStep >= 3}>03</DemoStepNum>
                  <div>
                    <h4>Você recebe a notificação na hora</h4>
                    <p>Push no seu celular em segundos. Agenda atualizada automaticamente, sem você fazer nada.</p>
                  </div>
                </DemoStepItem>
              </DemoStepsList>

              <DemoPhoneWrapper>
                <DemoPhone>
                  <DemoScreenBase $visible={demoStep <= 2}>
                    <div style={{ height:54, background:'#fff', borderBottom:'1px solid #e4e8e0', display:'flex', alignItems:'center', padding:'0 12px', gap:10, paddingTop:22 }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background:'#2d3b2a', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:9, fontWeight:700, flexShrink:0 }}>EL</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:'#1a2118', lineHeight:1.2 }}>Elevato Barbearia</div>
                        <div style={{ fontSize:8, color:'#8a9488', marginTop:1 }}>horariocerto.elevatohub.com.br/elevatohub</div>
                      </div>
                    </div>

                    <div style={{ padding:'8px 10px 4px', fontSize:8, fontWeight:700, color:'#8a9488', letterSpacing:1, textTransform:'uppercase' }}>Segunda — 16 Jun</div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:5, padding:'0 10px' }}>
                      {[
                        { time:'09:00', avail:false },
                        { time:'10:00', avail:true, sel:demoStep===2 },
                        { time:'11:00', avail:false },
                        { time:'14:00', avail:true },
                        { time:'15:00', avail:false },
                        { time:'16:00', avail:true },
                      ].map((s) => (
                        <div key={s.time} style={{ borderRadius:8, border:`1.5px solid ${s.sel?'#1a2118':s.avail?'#8ca085':'#d8ddd4'}`, background:s.sel?'#1a2118':s.avail?'#f0f5ee':'#fff', padding:'6px 4px', textAlign:'center', opacity:s.avail||s.sel?1:0.4 }}>
                          <div style={{ fontSize:11, fontWeight:700, color:s.sel?'#fff':s.avail?'#2d5a27':'#1a2118' }}>{s.time}</div>
                          <div style={{ fontSize:7, fontWeight:600, color:s.sel?'rgba(255,255,255,.7)':s.avail?'#5a9e52':'#8a9488', marginTop:2 }}>{s.sel?'Selecionado':s.avail?'Disponível':'Ocupado'}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ padding:'8px 10px 4px', fontSize:8, fontWeight:700, color:'#8a9488', letterSpacing:1, textTransform:'uppercase', marginTop:6 }}>Terça — 17 Jun</div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:5, padding:'0 10px' }}>
                      {[{ time:'09:00', avail:true },{ time:'10:00', avail:true },{ time:'11:00', avail:false }].map((s) => (
                        <div key={s.time} style={{ borderRadius:8, border:`1.5px solid ${s.avail?'#8ca085':'#d8ddd4'}`, background:s.avail?'#f0f5ee':'#fff', padding:'6px 4px', textAlign:'center', opacity:s.avail?1:0.4 }}>
                          <div style={{ fontSize:11, fontWeight:700, color:s.avail?'#2d5a27':'#1a2118' }}>{s.time}</div>
                          <div style={{ fontSize:7, fontWeight:600, color:s.avail?'#5a9e52':'#8a9488', marginTop:2 }}>{s.avail?'Disponível':'Ocupado'}</div>
                        </div>
                      ))}
                    </div>

                    <DemoSheetOverlay $visible={demoStep===2}>
                      <DemoSheet $open={demoStep===2}>
                        <div style={{ width:30, height:3, borderRadius:999, background:'#d4d9d0', margin:'8px auto 12px' }} />
                        <div style={{ fontSize:13, fontWeight:800, color:'#1a2118', marginBottom:3 }}>Confirmar agendamento</div>
                        <div style={{ fontSize:9, color:'#8a9488', marginBottom:12 }}>Preencha seus dados para reservar</div>
                        <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#eef4eb', border:'1px solid #c8d9c4', borderRadius:999, padding:'4px 10px', fontSize:9, fontWeight:700, color:'#2d5a27', marginBottom:12 }}>📅 Segunda, 16 Jun às 10:00</div>
                        <div style={{ fontSize:8, fontWeight:700, color:'#4f604f', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>Nome</div>
                        <div style={{ height:30, border:'1.5px solid #8ca085', borderRadius:8, padding:'0 10px', fontSize:11, color:'#1a2118', background:'#fafbf8', display:'flex', alignItems:'center', marginBottom:8 }}>Carlos Mendes</div>
                        <div style={{ fontSize:8, fontWeight:700, color:'#4f604f', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>Telefone</div>
                        <div style={{ height:30, border:'1.5px solid #8ca085', borderRadius:8, padding:'0 10px', fontSize:11, color:'#1a2118', background:'#fafbf8', display:'flex', alignItems:'center', marginBottom:8 }}>(31) 99847-2210</div>
                        <div style={{ fontSize:8, fontWeight:700, color:'#4f604f', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>Serviço</div>
                        <div style={{ height:32, border:'1.5px solid #8ca085', borderRadius:8, padding:'0 10px', fontSize:11, color:'#1a2118', background:'#fafbf8', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                          <span>✂️ Corte + Barba</span>
                          <span style={{ fontSize:10, fontWeight:700, color:'#2d5a27' }}>R$ 45</span>
                        </div>
                        <button style={{ width:'100%', height:36, background:'#1a2118', borderRadius:999, color:'#fff', fontSize:12, fontWeight:700, border:'none' }}>Confirmar agendamento</button>
                      </DemoSheet>
                    </DemoSheetOverlay>
                  </DemoScreenBase>

                  <DemoScreenBase $visible={demoStep===3}>
                    <div style={{ height:54, background:'#fff', borderBottom:'1px solid #e4e8e0', display:'flex', alignItems:'center', padding:'0 12px', gap:10, paddingTop:22 }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background:'#2d3b2a', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:9, fontWeight:700, flexShrink:0 }}>EL</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:'#1a2118', lineHeight:1.2 }}>Elevato Barbearia</div>
                        <div style={{ fontSize:8, color:'#8a9488', marginTop:1 }}>Agendamento confirmado</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'24px 16px 0', textAlign:'center' }}>
                      <DemoSuccessIcon key={demoStep===3?'play':'idle'} $play={demoStep===3}>✓</DemoSuccessIcon>
                      <div style={{ fontSize:15, fontWeight:800, color:'#1a2118', marginBottom:6 }}>Horário reservado!</div>
                      <div style={{ fontSize:10, color:'#6a7a69', lineHeight:1.5, marginBottom:16, maxWidth:200 }}>Agendamento confirmado. Você receberá uma notificação de lembrete.</div>
                      <div style={{ width:'100%', background:'#fff', border:'1.5px solid #d8ddd4', borderRadius:10, padding:12, textAlign:'left' }}>
                        {[['Cliente','Carlos Mendes',false],['Serviço','Corte + Barba',false],['Data','Seg, 16 Jun · 10:00',false],['Valor','R$ 45,00',true]].map(([label,value,green]) => (
                          <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 0', borderBottom:'1px solid #f0f3ee' }}>
                            <span style={{ fontSize:9, color:'#8a9488' }}>{label}</span>
                            <span style={{ fontSize:10, fontWeight:600, color:green?'#2d5a27':'#1a2118' }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DemoScreenBase>

                  <DemoProgressBar $pct={demoPct} $duration={DEMO_DELAY} />
                </DemoPhone>

                <DemoDotsRow>
                  {[1,2,3].map((n) => (
                    <DemoDot key={n} type="button" $active={demoStep===n} onClick={() => setDemoStep(n)} aria-label={`Etapa ${n}`} />
                  ))}
                </DemoDotsRow>
              </DemoPhoneWrapper>
            </DemoLayout>
          </DemoSection>

          {/* Como funciona */}
          <HowSection>
            <SectionLabel>Como funciona</SectionLabel>
            <SectionHeading>Pronto para receber agendamentos em 3 passos</SectionHeading>
            <HowGrid>
              {howSteps.map((step, i) => (
                <HowStep key={step.number} $delay={`${0.08*i}s`}>
                  <HowNumber>{step.number}</HowNumber>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </HowStep>
              ))}
            </HowGrid>
          </HowSection>

          {/* Features */}
          <Features>
            <SectionLabel>O que você ganha</SectionLabel>
            <SectionHeading>Tudo que sua barbearia precisa, sem complicar</SectionHeading>
            <FeatureGrid>
              {featureCards.map((card, i) => (
                <FeatureCard key={card.title} $delay={`${0.08*i}s`}>
                  <Dot $tone={card.tone}>{i+1}</Dot>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </FeatureCard>
              ))}
              <HighlightCard>
                <span className="tag">Diferencial</span>
                <h3>App nativo. Não é site disfarcado de app.</h3>
                <p>Disponível na App Store e Google Play. Notificações push reais, experiência fluida no celular — sem depender de navegador para gerenciar sua barbearia.</p>
              </HighlightCard>
            </FeatureGrid>
          </Features>

          {/* Plans */}
          <PlansSection>
            <PlansHeader>
              <div>
                <h2>Planos e preços</h2>
                <p style={{ margin:'0.35rem 0 0', color:theme.textM, fontSize:'0.9rem' }}>
                  Todos incluem <strong style={{ color:theme.accent }}>14 dias grátis</strong> para testar sem compromisso.
                </p>
              </div>
              <PlansMeta>
                {!plansLoading && plans.length > 1 && (
                  <>
                    <ControlButton type="button" onClick={() => scrollPlans('prev')} aria-label="Plano anterior" disabled={activePlan===0}>{'<'}</ControlButton>
                    <ControlButton type="button" onClick={() => scrollPlans('next')} aria-label="Próximo plano" disabled={activePlan>=plans.length-1}>{'>'}</ControlButton>
                  </>
                )}
              </PlansMeta>
            </PlansHeader>

            <PlansCarousel>
              {plansLoading ? (
                <PlansFallbackText>Carregando planos...</PlansFallbackText>
              ) : plans.length===0 ? (
                <PlansFallbackText>Nenhum plano disponível no momento.</PlansFallbackText>
              ) : (
                <>
                  <PlansTrack ref={plansTrackRef} onScroll={handlePlanScroll} $singleItem={plans.length===1}>
                    {plans.map((plan) => (
                      <PlanCard key={plan.id} data-plan-card="true" $recommended={plan.recommended}>
                        <PlanTag>{plan.name}</PlanTag>
                        <PlanText>{plan.description}</PlanText>
                        <PlanPriceBox>
                          <strong>{Number(plan.monthly||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:2})}</strong>
                          <span>/ mês</span>
                        </PlanPriceBox>
                        <PlanAction type="button" $recommended={plan.recommended} onClick={() => navigate('/registro')}>
                          {plan.button} — 14 dias grátis
                        </PlanAction>
                        <PlanFeatureList>
                          {plan.features.map((feature) => {
                            const isWa = feature.toLowerCase().includes('via whatsapp');
                            return (
                              <li key={feature} className={isWa?'addon':undefined}>
                                <span>{feature}</span>
                                {isWa && <AddonBadge>recurso adicional</AddonBadge>}
                              </li>
                            );
                          })}
                        </PlanFeatureList>
                      </PlanCard>
                    ))}
                  </PlansTrack>
                  <PlansDots>
                    {plans.map((plan, i) => (
                      <DotButton key={plan.id} type="button" $active={activePlan===i} onClick={() => scrollToPlan(i)} aria-label={`Ir para plano ${plan.name}`} />
                    ))}
                  </PlansDots>
                </>
              )}
            </PlansCarousel>
          </PlansSection>

          {/* Reviews */}
          <ReviewsSection>
            <SectionLabel>Avaliações</SectionLabel>
            <SectionHeading>O que dizem quem já usa</SectionHeading>
            <ReviewsGrid>
              {reviewCards.map((review, i) => (
                <ReviewCard key={review.author} $delay={`${0.07*i}s`}>
                  <Stars>★★★★★</Stars>
                  <ReviewText>"{review.text}"</ReviewText>
                  <ReviewAuthor>
                    <ReviewAvatar $tone={review.tone}>{review.initials}</ReviewAvatar>
                    <ReviewMeta>
                      <strong>{review.author}</strong>
                      <span>{review.role}</span>
                    </ReviewMeta>
                  </ReviewAuthor>
                </ReviewCard>
              ))}
            </ReviewsGrid>
          </ReviewsSection>

          {/* FAQ */}
          <FaqSection>
            <SectionLabel>Dúvidas frequentes</SectionLabel>
            <SectionHeading>Perguntas que todo mundo faz</SectionHeading>
            <FaqList>
              {faqItems.map((item, i) => {
                const isOpen = faqOpen===i;
                return (
                  <FaqItem key={i} $open={isOpen}>
                    <FaqQuestion type="button" $open={isOpen} onClick={() => setFaqOpen(isOpen?null:i)} aria-expanded={isOpen}>
                      {item.question}
                      <span className="chevron">▾</span>
                    </FaqQuestion>
                    <FaqAnswer $open={isOpen}>
                      <p>{item.answer}</p>
                    </FaqAnswer>
                  </FaqItem>
                );
              })}
            </FaqList>
          </FaqSection>

          {/* Final CTA */}
          <CtaBand>
            <div>
              <h3>Barbearia organizada começa hoje, não amanhã.</h3>
              <p>14 dias pra testar tudo, sem cartão e sem burocracia. Se não gostar, é só não assinar — sem multa, sem explicação.</p>
            </div>
            <CtaActions>
              <CtaFinalButton type="button" onClick={() => navigate('/registro')}>
                Começar teste gratuito
              </CtaFinalButton>
              <CtaNote>Grátis por 14 dias • Cancele quando quiser</CtaNote>
            </CtaActions>
          </CtaBand>

        </Shell>
      </Page>
    </ThemeProvider>
  );
}

export default Landing;

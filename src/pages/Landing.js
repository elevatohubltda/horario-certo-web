import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { ReactComponent as Logo } from '../assets/horario-certo-logo-horizontal.svg?component';
import { useNavigate } from 'react-router-dom';
import { getPublicSubscriptionPlans } from '../services/endpoints/payment';

const revealUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const drift = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0px); }
`;

const shimmerLine = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
`;

const Page = styled.main`
  min-height: 100dvh;
  width: 100%;
  box-sizing: border-box;
  padding: 0.85rem;
  background: linear-gradient(135deg, #f4f5f2 0%, #ebece8 100%);

  @media (min-width: 768px) {
    padding: 1.35rem;
  }
`;

const Shell = styled.div`
  width: min(1180px, 100%);
  margin: 0 auto;
  border-radius: 1.15rem;
  border: 1px solid #d9ddd4;
  background: #f8f9f6;
  box-shadow: 0 24px 48px rgba(22, 29, 23, 0.1);
  overflow: hidden;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 1rem;
  border-bottom: 1px solid #dde1d8;
  background: #f8f9f6;

  @media (min-width: 768px) {
    padding: 1rem 1.4rem;
  }
`;

const Brand = styled.button`
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  color: var(--color-dark);
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;

  svg {
    width: max-content;
    height: 64px;
    margin-left: 6px;

    @media (min-width: 768px) {
      height: 72px;
      margin-left: 10px;
    }
  }
`;

const NavActions = styled.div`
  display: none;
  align-items: center;
  gap: 0.5rem;

  @media (min-width: 768px) {
    display: flex;
  }
`;

const OutlineButton = styled.button`
  height: 2.2rem;
  padding: 0 0.95rem;
  border-radius: 999px;
  border: 1px solid rgba(30, 44, 40, 0.2);
  background: #ffffff;
  color: var(--color-dark);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(30, 44, 40, 0.35);
    box-shadow: 0 8px 18px rgba(30, 44, 40, 0.13);
  }
`;

const PrimaryButton = styled.button`
  height: 2.2rem;
  padding: 0 1.1rem;
  border-radius: 999px;
  border: none;
  background: #101010;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(20, 34, 30, 0.28);
    filter: saturate(1.07);
  }
`;

const Hero = styled.section`
  padding: 2.5rem 1rem 1.5rem;
  text-align: center;

  @media (min-width: 768px) {
    padding: 3.5rem 2rem 2rem;
  }
`;

const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1.2rem;
  padding: 0.35rem 0.78rem;
  border-radius: 0.9rem;
  border: 2px solid var(--color-sage);
  background: linear-gradient(135deg, rgba(142, 152, 142, 0.12) 0%, rgba(142, 152, 142, 0.08) 100%);
  color: #2d483a;
  font-size: 0.78rem;
  font-weight: 700;

  &::before {
    content: '✓';
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    border-radius: 999px;
    background: var(--color-sage);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-weight: 900;
    font-size: 0.7rem;
  }
`;

const HeroTitle = styled.h1`
  margin: 0 auto;
  max-width: 820px;
  color: #10140f;
  line-height: 1.1;
  font-family: 'Montserrat', sans-serif;
  font-size: clamp(2rem, 8vw, 3.6rem);

  strong {
    color: var(--color-brown);
  }
`;

const HeroSub = styled.p`
  margin: 1.4rem auto 0;
  max-width: 580px;
  color: #4e5a4d;
  line-height: 1.6;
  font-size: 1.02rem;
`;

const HeroCtas = styled.div`
  margin-top: 1.8rem;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

const HeroCta = styled.button`
  height: 2.85rem;
  padding: 0 1.6rem;
  border-radius: 999px;
  border: none;
  background: #101010;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(20, 34, 30, 0.3);
  }
`;

const HeroCtaOutline = styled.button`
  height: 2.85rem;
  padding: 0 1.4rem;
  border-radius: 999px;
  border: 1.5px solid rgba(30, 44, 40, 0.22);
  background: transparent;
  color: var(--color-dark);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(30, 44, 40, 0.4);
  }
`;

const HeroRisk = styled.p`
  margin: 0.8rem 0 0;
  color: #526051;
  font-size: 0.8rem;
`;

const FloatingGroup = styled.div`
  margin: 1.8rem auto 0;
  width: fit-content;
  display: flex;
  align-items: center;
  padding: 0.2rem 0.7rem 0.2rem 0.6rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(135, 139, 131, 0.2);
  box-shadow: 0 8px 20px rgba(30, 44, 40, 0.08);

  .avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 999px;
    border: 2px solid #ffffff;
    margin-left: -0.3rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-size: 0.65rem;
    font-weight: 700;
    background: var(--color-sage);
    animation: ${drift} 4s ease-in-out infinite;

    &:nth-child(2) { background: var(--color-olive); animation-delay: 0.15s; }
    &:nth-child(3) { background: var(--color-brown); animation-delay: 0.3s; }
    &:nth-child(4) { background: var(--color-dark); animation-delay: 0.45s; }
  }

  .label {
    margin-left: 0.55rem;
    font-size: 0.78rem;
    color: #3d4d3c;
    font-weight: 600;
    white-space: nowrap;
  }
`;

/* ── Trust strip ── */

const TrustStrip = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.3rem 1.4rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid #e4e8e1;
  border-bottom: 1px solid #e4e8e1;
  background: #f4f6f2;
`;

const TrustItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: #4e5c4d;
  font-weight: 600;

  .emoji { font-size: 0.9rem; }
`;

/* ── Problem section ── */

const ProblemSection = styled.section`
  padding: 1.5rem 1rem;

  @media (min-width: 768px) {
    padding: 1.8rem 2rem;
  }
`;

const SectionLabel = styled.span`
  display: inline-block;
  border-radius: 999px;
  border: 1px solid #d4d9d0;
  color: #4f604f;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.22rem 0.62rem;
  margin-bottom: 0.65rem;
`;

const SectionHeading = styled.h2`
  margin: 0 0 1rem;
  font-size: clamp(1.3rem, 4vw, 1.9rem);
  line-height: 1.18;
  color: #121912;
  font-family: 'Montserrat', sans-serif;
`;

const ProblemGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.7rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ProblemCard = styled.article`
  border-radius: 0.95rem;
  padding: 1rem;
  background: #ffffff;
  border: 1px solid #d9ddd4;
  animation: ${revealUp} 0.5s ease both;
  animation-delay: ${({ $delay }) => $delay || '0s'};

  .icon {
    font-size: 1.5rem;
    line-height: 1;
    margin-bottom: 0.6rem;
    display: block;
  }

  h3 {
    margin: 0;
    font-size: 0.95rem;
    color: #1a2118;
    line-height: 1.3;
  }

  p {
    margin: 0.4rem 0 0;
    color: #677066;
    font-size: 0.82rem;
    line-height: 1.45;
  }
`;

/* ── Features ── */

const Features = styled.section`
  padding: 0 1rem 1.5rem;

  @media (min-width: 768px) {
    padding: 0 2rem 2rem;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;

  @media (min-width: 980px) {
    grid-template-columns: 1fr 1fr 1fr 1.4fr;
  }
`;

const FeatureCard = styled.article`
  border-radius: 0.95rem;
  padding: 1rem;
  background: #ffffff;
  border: 1px solid #d9ddd4;
  animation: ${revealUp} 0.5s ease both;
  animation-delay: ${({ $delay }) => $delay || '0s'};
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(109, 92, 67, 0.35);
    box-shadow: 0 14px 24px rgba(30, 44, 40, 0.12);
  }

  h3 {
    margin: 0.6rem 0 0;
    font-size: 1.05rem;
    line-height: 1.25;
    color: #1a2118;
  }

  p {
    margin: 0.5rem 0 0;
    color: #627061;
    font-size: 0.85rem;
    line-height: 1.45;
  }
`;

const Dot = styled.span`
  width: 2rem;
  height: 2rem;
  border-radius: 0.7rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${({ $tone }) => $tone};
`;

const HighlightCard = styled.article`
  border-radius: 0.95rem;
  padding: 1rem;
  background: linear-gradient(160deg, #1f2521 0%, #2a3530 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 28px rgba(12, 18, 15, 0.35);
  }

  &::after {
    content: '';
    position: absolute;
    inset: auto -15% -45% -15%;
    height: 60%;
    background: radial-gradient(circle, rgba(142, 152, 142, 0.18) 0%, rgba(109, 92, 67, 0) 68%);
    pointer-events: none;
  }

  .tag {
    width: fit-content;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: rgba(238, 244, 239, 0.72);
    font-size: 0.72rem;
    font-weight: 600;
    padding: 0.22rem 0.62rem;
  }

  h3 {
    margin: 0.8rem 0 0;
    font-size: clamp(1.35rem, 2.5vw, 1.75rem);
    line-height: 1.18;
    color: #eef4ef;
  }

  p {
    margin: 0.6rem 0 0;
    color: rgba(238, 244, 239, 0.72);
    line-height: 1.5;
    font-size: 0.88rem;
  }
`;

/* ── Plans ── */

const PlansSection = styled.section`
  padding: 1rem;
  position: relative;

  @media (min-width: 768px) {
    padding: 0 2rem 2rem;
  }
`;

const PlansHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  margin-bottom: 0.9rem;

  h2 {
    margin: 0;
    color: #121912;
    font-size: clamp(1.5rem, 4vw, 2.1rem);
    line-height: 1.15;
    font-family: 'Montserrat', sans-serif;
  }
`;

const PlansMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.55rem;
`;

const ControlButton = styled.button`
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  border: 1px solid rgba(30, 44, 40, 0.2);
  background: #ffffff;
  color: #1e2c28;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const PlansCarousel = styled.div`
  border-radius: 1rem;
  border: 1px solid #d9ddd4;
  background: linear-gradient(180deg, #fafbf8 0%, #f6f8f4 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  padding: 0.8rem;

  @media (min-width: 768px) {
    padding: 1rem;
  }
`;

const PlansTrack = styled.div`
  display: flex;
  justify-content: ${({ $singleItem }) => ($singleItem ? 'center' : 'flex-start')};
  gap: 0.8rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;

  &::-webkit-scrollbar { display: none; }
`;

const PlanCard = styled.article`
  flex: 0 0 86%;
  min-height: 330px;
  border-radius: 0.9rem;
  border: 1px solid ${({ $recommended }) => ($recommended ? 'rgba(30, 44, 40, 0.35)' : '#d8ddd4')};
  background: #ffffff;
  padding: 0.95rem;
  box-shadow: ${({ $recommended }) => ($recommended ? '0 16px 28px rgba(30, 44, 40, 0.12)' : '0 6px 14px rgba(30, 44, 40, 0.06)')};
  scroll-snap-align: start;
  animation: ${revealUp} 0.5s ease both;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ $recommended }) => ($recommended ? '0 20px 32px rgba(30, 44, 40, 0.16)' : '0 14px 24px rgba(30, 44, 40, 0.12)')};
  }

  @media (min-width: 768px) { flex-basis: 44%; }
  @media (min-width: 1080px) { flex-basis: calc(33.333% - 0.54rem); }
`;

const PlanTag = styled.span`
  font-size: 0.75rem;
  color: #516051;
  font-weight: 700;
`;

const PlanText = styled.p`
  margin: 0.45rem 0 0.7rem;
  color: #657364;
  font-size: 0.83rem;
  line-height: 1.4;
`;

const PlanPriceBox = styled.div`
  border-radius: 0.75rem;
  border: 1px solid #d8ddd5;
  background: #fbfcfa;
  padding: 0.7rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: end;
  gap: 0.45rem;

  strong {
    color: #141c13;
    font-size: 1.85rem;
    line-height: 1;
  }

  span {
    color: #506050;
    font-size: 0.78rem;
    margin-bottom: 0.2rem;
  }
`;

const PlanAction = styled.button`
  width: 100%;
  height: 2.25rem;
  border-radius: 999px;
  border: 1px solid ${({ $recommended }) => ($recommended ? '#111111' : '#d2d8cf')};
  background: ${({ $recommended }) => ($recommended ? 'linear-gradient(125deg, #1d2b27 0%, #2f3f38 100%)' : '#ffffff')};
  color: ${({ $recommended }) => ($recommended ? '#ffffff' : '#1e2c28')};
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgba(25, 36, 32, 0.16);
  }
`;

const PlanFeatureList = styled.ul`
  margin: 0.8rem 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.45rem;

  li {
    color: #566357;
    font-size: 0.79rem;
    line-height: 1.35;
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;

    &::before {
      content: '';
      margin-top: 0.35rem;
      width: 0.38rem;
      height: 0.38rem;
      border-radius: 999px;
      background: #8e988e;
      flex-shrink: 0;
    }

    &.addon {
      color: #526051;

      &::before {
        background: #a0aea0;
      }
    }
  }
`;

const AddonBadge = styled.span`
  display: inline-block;
  margin-left: 0.3rem;
  padding: 0.1rem 0.38rem;
  border-radius: 999px;
  border: 1px solid #c8d4c7;
  background: #f2f5f1;
  color: #3f5240;
  font-size: 0.68rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  align-self: center;
`;

const PlansDots = styled.div`
  margin-top: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
`;

const DotButton = styled.button`
  width: ${({ $active }) => ($active ? '1.35rem' : '0.45rem')};
  height: 0.45rem;
  border-radius: 999px;
  border: none;
  background: ${({ $active }) => ($active ? '#1e2c28' : '#c9cec5')};
  cursor: pointer;
  transition: all 0.18s ease;
`;

const PlansFallbackText = styled.p`
  margin: 0.35rem 0;
  padding: 1rem 0.5rem;
  text-align: center;
  color: #5e695d;
  font-size: 0.9rem;
`;

/* ── Como funciona ── */

const HowSection = styled.section`
  padding: 0 1rem 1.5rem;

  @media (min-width: 768px) {
    padding: 0 2rem 2rem;
  }
`;

const HowGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  position: relative;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const HowStep = styled.article`
  border-radius: 0.95rem;
  padding: 1.1rem;
  background: #ffffff;
  border: 1px solid #d9ddd4;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  animation: ${revealUp} 0.5s ease both;
  animation-delay: ${({ $delay }) => $delay || '0s'};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 22px rgba(30, 44, 40, 0.1);
  }

  h3 {
    margin: 0;
    font-size: 1rem;
    color: #1a2118;
    line-height: 1.3;
  }

  p {
    margin: 0;
    color: #526051;
    font-size: 0.85rem;
    line-height: 1.5;
  }
`;

const HowNumber = styled.span`
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 0.7rem;
  background: linear-gradient(135deg, #1f2521 0%, #2f3f38 100%);
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

/* ── FAQ ── */

const FaqSection = styled.section`
  padding: 0 1rem 1.5rem;

  @media (min-width: 768px) {
    padding: 0 2rem 2rem;
  }
`;

const FaqList = styled.div`
  display: grid;
  gap: 0.55rem;
`;

const FaqItem = styled.div`
  border-radius: 0.95rem;
  border: 1px solid ${({ $open }) => ($open ? 'rgba(30,44,40,0.25)' : '#d9ddd4')};
  background: #ffffff;
  overflow: hidden;
  transition: border-color 0.2s ease;
`;

const FaqQuestion = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.9rem 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a2118;
  line-height: 1.35;

  .chevron {
    flex-shrink: 0;
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 999px;
    border: 1px solid #d2d8cf;
    background: #f4f6f2;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65rem;
    color: #526051;
    transition: transform 0.2s ease;
    transform: ${({ $open }) => ($open ? 'rotate(180deg)' : 'rotate(0deg)')};
  }
`;

const FaqAnswer = styled.div`
  max-height: ${({ $open }) => ($open ? '12rem' : '0')};
  overflow: hidden;
  transition: max-height 0.28s ease;

  p {
    margin: 0;
    padding: 0 1rem 0.9rem;
    color: #526051;
    font-size: 0.85rem;
    line-height: 1.6;
    border-top: 1px solid #eaede7;
    padding-top: 0.75rem;
  }
`;

/* ── Reviews ── */

const ReviewsSection = styled.section`
  padding: 0 1rem 1.5rem;

  @media (min-width: 768px) {
    padding: 0 2rem 2rem;
  }
`;

const ReviewsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1000px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ReviewCard = styled.article`
  border-radius: 0.95rem;
  padding: 1rem;
  background: #ffffff;
  border: 1px solid #d9ddd4;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  animation: ${revealUp} 0.5s ease both;
  animation-delay: ${({ $delay }) => $delay || '0s'};
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 22px rgba(30, 44, 40, 0.1);
  }
`;

const Stars = styled.div`
  display: flex;
  gap: 0.15rem;
  color: #c8953a;
  font-size: 0.82rem;
`;

const ReviewText = styled.p`
  margin: 0;
  color: #4e5a4d;
  font-size: 0.87rem;
  line-height: 1.55;
  flex: 1;
`;

const ReviewAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding-top: 0.6rem;
  border-top: 1px solid #eaede7;
`;

const ReviewAvatar = styled.span`
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 999px;
  background: ${({ $tone }) => $tone || 'var(--color-sage)'};
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ReviewMeta = styled.div`
  strong {
    display: block;
    font-size: 0.83rem;
    color: #1a2118;
    line-height: 1.2;
  }

  span {
    font-size: 0.75rem;
    color: #526051;
  }
`;

/* ── CTA band ── */

const CtaBand = styled.section`
  margin: 0.3rem 1rem 1rem;
  border-radius: 0.95rem;
  padding: 1.5rem 1rem;
  border: 1px solid rgba(109, 92, 67, 0.2);
  background: linear-gradient(100deg, rgba(109, 92, 67, 0.18) 0%, rgba(142, 152, 142, 0.24) 55%, rgba(135, 139, 131, 0.32) 100%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  text-align: center;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(115deg, transparent 0%, rgba(255, 255, 255, 0.38) 42%, transparent 70%);
    background-size: 200% 100%;
    animation: ${shimmerLine} 8s linear infinite;
    pointer-events: none;
  }

  h3 {
    margin: 0;
    color: #182218;
    font-size: clamp(1.2rem, 3.5vw, 1.7rem);
    font-family: 'Montserrat', sans-serif;
    line-height: 1.25;
  }

  p {
    margin: 0.5rem 0 0;
    color: #4f5d4d;
    line-height: 1.5;
    font-size: 0.93rem;
  }

  @media (min-width: 768px) {
    margin: 0 2rem 2rem;
    padding: 2rem 1.5rem;
    text-align: left;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const CtaActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;

  @media (min-width: 768px) {
    align-items: flex-end;
  }
`;

const CtaFinalButton = styled.button`
  height: 2.85rem;
  padding: 0 1.8rem;
  border-radius: 999px;
  border: none;
  background: #101010;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(20, 34, 30, 0.3);
  }
`;

const CtaNote = styled.span`
  font-size: 0.77rem;
  color: #3d4e3d;
`;

/* ── Static data ── */

const problemCards = [
  {
    icon: '📱',
    title: 'WhatsApp virou agenda de papel digital',
    text: 'Mensagem perdida, horário esquecido, cliente que some. Gerenciar agenda no WhatsApp cansa e cobra erro.'
  },
  {
    icon: '😤',
    title: 'Furo na agenda nos horários de pico',
    text: 'Aquele horário que ficou vazio por falta de confirmação. Vaga perdida, dinheiro que foi embora.'
  },
  {
    icon: '🤷',
    title: 'Não sabe quanto faturou no mês',
    text: 'No fim do mês você vai no instinto. Sem número claro de faturamento fica difícil crescer.'
  }
];

const howSteps = [
  {
    number: '01',
    title: 'Crie sua conta em 2 minutos',
    text: 'Sem cartão de crédito. Preencha nome, e-mail e senha — e sua conta já está pronta para configurar.'
  },
  {
    number: '02',
    title: 'Configure seus serviços e horários',
    text: 'Adicione os serviços que você oferece, defina seus horários disponíveis e pronto. Menos de 30 minutos.'
  },
  {
    number: '03',
    title: 'Compartilhe o link com seus clientes',
    text: 'Você recebe um link exclusivo da sua barbearia. Mande no WhatsApp, Instagram ou bio — clientes agendam sozinhos.'
  }
];

const faqItems = [
  {
    question: 'Preciso de cartão de crédito para testar?',
    answer: 'Não. O teste de 14 dias é completamente gratuito e não exige nenhum dado de pagamento. Você só informa o cartão se decidir assinar ao final do período.'
  },
  {
    question: 'Funciona para barbearia com apenas 1 profissional?',
    answer: 'Sim, e foi exatamente para isso que o Horário Certo foi criado. Barbearias pequenas, com 1 ou 2 profissionais, são o nosso foco. A plataforma é simples o suficiente para você usar sozinho, sem precisar de um gestor.'
  },
  {
    question: 'Meu cliente precisa baixar algum aplicativo para agendar?',
    answer: 'Não. Seu cliente acessa a página da sua barbearia pelo navegador do celular e agenda normalmente, sem precisar instalar nada. O aplicativo é só para você, dono da barbearia, gerenciar tudo.'
  },
  {
    question: 'Como funciona o WhatsApp? Já está incluso no plano?',
    answer: 'A integração com WhatsApp é um recurso adicional, disponível em duas versões: WhatsApp Básico (até 500 mensagens por mês) e WhatsApp Plus (mensagens ilimitadas). Você pode adicionar ao plano escolhido a qualquer momento.'
  },
  {
    question: 'Quanto tempo leva para configurar?',
    answer: 'A maioria dos clientes configura tudo em menos de 30 minutos. Você adiciona seus serviços, define os horários disponíveis e já pode começar a receber agendamentos no mesmo dia.'
  },
  {
    question: 'Como cancelo se não gostar?',
    answer: 'Sem burocracia. Você cancela direto pelo painel, a qualquer momento, sem multa e sem precisar falar com ninguém. Não há fidelidade mínima.'
  }
];

const reviewCards = [
  {
    text: 'Antes eu perdia horário toda semana por causa de confusão no WhatsApp. Hoje a agenda tá sempre organizada e eu consigo ver tudo pelo celular mesmo durante o atendimento.',
    author: 'Rafael M.',
    role: 'Dono — Barbearia RM',
    initials: 'RM',
    tone: '#8E988E'
  },
  {
    text: 'O aplicativo é muito simples. Em menos de um dia já tava funcionando. Meus clientes adoraram poder marcar a qualquer hora, sem precisar me chamar.',
    author: 'Douglas S.',
    role: 'Barbeiro — Studio DS',
    initials: 'DS',
    tone: '#6D5C43'
  },
  {
    text: 'Tentei outros sistemas antes e todos eram complicados demais pra uma barbearia pequena como a minha. O Horário Certo foi o único que realmente encaixou na minha rotina.',
    author: 'Thiago A.',
    role: 'Dono — Barbearia do Thiago',
    initials: 'TA',
    tone: '#878B83'
  },
  {
    text: 'A notificação no celular quando alguém agenda é demais. Não preciso mais ficar olhando pro WhatsApp o tempo todo esperando confirmação de cliente.',
    author: 'Leandro P.',
    role: 'Barbeiro — LP Barbearia',
    initials: 'LP',
    tone: '#5a7a5e'
  },
  {
    text: 'O controle financeiro me ajudou a entender quais serviços dão mais lucro. Antes eu não tinha ideia de quanto faturava em corte versus barba. Agora sei exatamente.',
    author: 'Marcos V.',
    role: 'Dono — Barbearia Vintage',
    initials: 'MV',
    tone: '#7a6050'
  },
  {
    text: 'Custo-benefício excelente. Pago menos do que pagaria num concorrente e tenho tudo que preciso. Suporte responde rápido quando tenho dúvida.',
    author: 'André C.',
    role: 'Barbeiro — Corte & Estilo',
    initials: 'AC',
    tone: '#4a6655'
  }
];

const featureCards = [
  {
    title: 'Agenda online 24h',
    text: 'Cliente agenda enquanto você trabalha — ou dorme. A agenda funciona sozinha, sem você precisar responder.',
    tone: '#8E988E',
    tag: '/01'
  },
  {
    title: 'Notificação no celular na hora',
    text: 'Alguém agendou? Notificação push chega no seu celular em segundos. Você sabe em tempo real.',
    tone: '#878B83',
    tag: '/02'
  },
  {
    title: 'Faturamento no controle',
    text: 'Veja quanto ganhou por serviço, por dia e por semana. Dados simples pra decidir sem achismo.',
    tone: '#6D5C43',
    tag: '/03'
  }
];

function Landing() {
  const navigate = useNavigate();
  const plansTrackRef = useRef(null);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [activePlan, setActivePlan] = useState(0);
  const [faqOpen, setFaqOpen] = useState(null);

  useEffect(() => {
    const normalizePlan = (plan, index) => {
      const normalizedFeatures = Array.isArray(plan.features)
        ? plan.features
            .map((feature) => (typeof feature === 'string' ? feature : feature?.name || 'Recurso'))
            .filter(Boolean)
        : [];

      return {
        id: plan.id || plan._id || `${plan.name || 'plano'}-${index}`,
        name: plan.name || `Plano ${index + 1}`,
        monthly: Number(plan.price || plan.monthlyPrice || plan.amount || 0),
        description:
          plan.description ||
          `Plano com ${normalizedFeatures.length || 0} recurso${normalizedFeatures.length === 1 ? '' : 's'} inclusos.`,
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
        const sourcePlans = Array.isArray(payload?.plans)
          ? payload.plans
          : Array.isArray(payload)
            ? payload
            : [];

        const mapped = sourcePlans
          .map(normalizePlan)
          .sort((a, b) => a.monthly - b.monthly);

        if (mapped.length > 0 && !mapped.some((plan) => plan.recommended)) {
          const middleIndex = Math.floor(mapped.length / 2);
          mapped[middleIndex] = { ...mapped[middleIndex], recommended: true };
        }

        setPlans(mapped);
        setActivePlan(0);
      } catch {
        setPlans([]);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getScrollStep = () => {
    const track = plansTrackRef.current;
    if (!track) return 0;
    const firstCard = track.querySelector('[data-plan-card="true"]');
    if (!firstCard) return track.clientWidth;
    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
    return firstCard.clientWidth + gap;
  };

  const handlePlanScroll = (event) => {
    const track = event.currentTarget;
    const step = getScrollStep();
    if (!step) return;
    const index = Math.round(track.scrollLeft / step);
    const safeIndex = Math.max(0, Math.min(Math.max(plans.length - 1, 0), index));
    setActivePlan(safeIndex);
  };

  const scrollPlans = (direction) => {
    const track = plansTrackRef.current;
    const step = getScrollStep();
    if (!track || !step) return;
    track.scrollBy({ left: direction === 'next' ? step : -step, behavior: 'smooth' });
  };

  const scrollToPlan = (index) => {
    const track = plansTrackRef.current;
    const step = getScrollStep();
    if (!track || !step) return;
    track.scrollTo({ left: step * index, behavior: 'smooth' });
  };

  return (
    <Page>
      <Shell>

        {/* Nav */}
        <Nav>
          <Brand type="button" onClick={() => navigate('/')}>
            <Logo className="logo" />
          </Brand>
          <NavActions>
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
            <HeroCtaOutline type="button" onClick={() => navigate('/login')}>
              Já tenho conta
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

        {/* Problem section */}
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

        {/* Como funciona */}
        <HowSection>
          <SectionLabel>Como funciona</SectionLabel>
          <SectionHeading>Pronto para receber agendamentos em 3 passos</SectionHeading>
          <HowGrid>
            {howSteps.map((step, i) => (
              <HowStep key={step.number} $delay={`${0.08 * i}s`}>
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
            {featureCards.map((card, index) => (
              <FeatureCard key={card.title} $delay={`${0.08 * index}s`}>
                <Dot $tone={card.tone}>{index + 1}</Dot>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </FeatureCard>
            ))}

            <HighlightCard>
              <span className="tag">Diferencial</span>
              <h3>App nativo. Não é site disfarcado de app.</h3>
              <p>
                Disponível na App Store e Google Play. Notificações push reais, experiência
                fluida no celular — sem depender de navegador para gerenciar sua barbearia.
              </p>
            </HighlightCard>
          </FeatureGrid>
        </Features>

        {/* Reviews */}
        <ReviewsSection>
          <SectionLabel>Avaliações</SectionLabel>
          <SectionHeading>O que dizem quem já usa</SectionHeading>
          <ReviewsGrid>
            {reviewCards.map((review, i) => (
              <ReviewCard key={review.author} $delay={`${0.07 * i}s`}>
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

        {/* Plans */}
        <PlansSection>
          <PlansHeader>
            <div>
              <h2>Planos e preços</h2>
              <p style={{ margin: '0.35rem 0 0', color: '#6b7c69', fontSize: '0.9rem' }}>
                Todos incluem <strong>14 dias grátis</strong> para testar sem compromisso.
              </p>
            </div>
            <PlansMeta>
              {!plansLoading && plans.length > 1 && (
                <>
                  <ControlButton
                    type="button"
                    onClick={() => scrollPlans('prev')}
                    aria-label="Plano anterior"
                    disabled={activePlan === 0}
                  >
                    {'<'}
                  </ControlButton>
                  <ControlButton
                    type="button"
                    onClick={() => scrollPlans('next')}
                    aria-label="Próximo plano"
                    disabled={activePlan >= plans.length - 1}
                  >
                    {'>'}
                  </ControlButton>
                </>
              )}
            </PlansMeta>
          </PlansHeader>

          <PlansCarousel>
            {plansLoading ? (
              <PlansFallbackText>Carregando planos...</PlansFallbackText>
            ) : plans.length === 0 ? (
              <PlansFallbackText>Nenhum plano disponível no momento.</PlansFallbackText>
            ) : (
              <>
                <PlansTrack
                  ref={plansTrackRef}
                  onScroll={handlePlanScroll}
                  $singleItem={plans.length === 1}
                >
                  {plans.map((plan) => (
                    <PlanCard key={plan.id} data-plan-card="true" $recommended={plan.recommended}>
                      <PlanTag>{plan.name}</PlanTag>
                      <PlanText>{plan.description}</PlanText>

                      <PlanPriceBox>
                        <strong>
                          {Number(plan.monthly || 0).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            minimumFractionDigits: 2,
                          })}
                        </strong>
                        <span>/ mês</span>
                      </PlanPriceBox>

                      <PlanAction
                        type="button"
                        $recommended={plan.recommended}
                        onClick={() => navigate('/registro')}
                      >
                        {plan.button} — 14 dias grátis
                      </PlanAction>

                      <PlanFeatureList>
                        {plan.features.map((feature) => {
                          const isWhatsapp = feature.toLowerCase().includes('via whatsapp');
                          return (
                            <li key={feature} className={isWhatsapp ? 'addon' : undefined}>
                              <span>{feature}</span>
                              {isWhatsapp && <AddonBadge>recurso adicional</AddonBadge>}
                            </li>
                          );
                        })}
                      </PlanFeatureList>
                    </PlanCard>
                  ))}
                </PlansTrack>

                <PlansDots>
                  {plans.map((plan, index) => (
                    <DotButton
                      key={plan.id}
                      type="button"
                      $active={activePlan === index}
                      onClick={() => scrollToPlan(index)}
                      aria-label={`Ir para plano ${plan.name}`}
                    />
                  ))}
                </PlansDots>
              </>
            )}
          </PlansCarousel>
        </PlansSection>

        {/* FAQ */}
        <FaqSection>
          <SectionLabel>Dúvidas frequentes</SectionLabel>
          <SectionHeading>Perguntas que todo mundo faz</SectionHeading>
          <FaqList>
            {faqItems.map((item, i) => {
              const isOpen = faqOpen === i;
              return (
                <FaqItem key={i} $open={isOpen}>
                  <FaqQuestion
                    type="button"
                    $open={isOpen}
                    onClick={() => setFaqOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
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
            <p>
              14 dias pra testar tudo, sem cartão e sem burocracia.
              Se não gostar, é só não assinar — sem multa, sem explicação.
            </p>
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
  );
}

export default Landing;

import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight, Copy, Download } from "lucide-react";
import { Button, Input, Muted } from "./index";
import logoWhiteUrl from "../../assets/horario-certo-logo-horizontal-branco.svg";

const NAVY = "#1E2240";
const AMBER = "#F0A030";
const AMBER_INK = "#93590A";
const INK = "#111827";
const MUTED = "#6b7280";
const FONT = "Sora, 'Helvetica Neue', Arial, sans-serif";
const QR_SIZE = 1024;

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

// Quebra o texto em linhas que caibam na largura
const wrapText = (ctx, text, maxWidth) => {
  const lines = [];
  let line = "";
  text.split(" ").forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
};

const newCanvas = (w, h, background) => {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, w, h);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  return { canvas, ctx };
};

/* ---------- Estilos ---------- */

// Preto e branco, só o QR e o cupom: imprime bem em qualquer lugar
const renderClassic = ({ qrDark }, info) => {
  const { canvas, ctx } = newCanvas(1000, 1120, "#FFFFFF");
  ctx.drawImage(qrDark, 70, 60, 860, 860);
  ctx.fillStyle = INK;
  ctx.font = `700 46px ${FONT}`;
  ctx.fillText(`Cupom ${info.code}`, 500, 1012);
  ctx.fillStyle = MUTED;
  ctx.font = `500 32px ${FONT}`;
  ctx.fillText(info.discountLabel, 500, 1066);
  return canvas;
};

// QR azul-noite com o ícone da marca no centro (nível H de correção aguenta o ícone)
const renderBrand = ({ qrBrand, icon }, info) => {
  const { canvas, ctx } = newCanvas(1000, 1200, "#FFFFFF");
  ctx.drawImage(qrBrand, 90, 70, 820, 820);
  if (icon) {
    ctx.fillStyle = "#FFFFFF";
    roundRect(ctx, 500 - 100, 480 - 100, 200, 200, 36);
    ctx.fill();
    ctx.drawImage(icon, 500 - 80, 480 - 80, 160, 160);
  }
  ctx.fillStyle = NAVY;
  ctx.font = `700 42px ${FONT}`;
  ctx.fillText("Cadastre-se no Horário Certo", 500, 990);
  ctx.fillStyle = AMBER_INK;
  ctx.font = `600 34px ${FONT}`;
  ctx.fillText(`Cupom ${info.code} · ${info.discountLabel}`, 500, 1052);
  if (info.partnerName) {
    ctx.fillStyle = MUTED;
    ctx.font = `500 28px ${FONT}`;
    ctx.fillText(`Parceria com ${info.partnerName}`, 500, 1108);
  }
  return canvas;
};

// Arte 4:5 (1080x1350) para Instagram/WhatsApp, com o desconto em destaque
const renderPoster = ({ qrPoster, logoWhite }, info) => {
  const W = 1080;
  const H = 1350;
  const { canvas, ctx } = newCanvas(W, H, NAVY);

  const glow = ctx.createRadialGradient(920, 180, 0, 920, 180, 640);
  glow.addColorStop(0, "rgba(240, 160, 48, 0.38)");
  glow.addColorStop(1, "rgba(240, 160, 48, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  if (logoWhite) {
    const h = 60;
    const w = (logoWhite.width / logoWhite.height) * h || 280;
    ctx.drawImage(logoWhite, 80, 80, w, h);
  }

  ctx.textAlign = "left";
  let y = 250;
  if (info.partnerName) {
    ctx.fillStyle = AMBER;
    ctx.font = `700 26px ${FONT}`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = "3px";
    ctx.fillText(`PARCERIA COM ${info.partnerName.toUpperCase()}`, 80, y);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    y += 78;
  } else {
    y += 30;
  }

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `800 62px ${FONT}`;
  wrapText(ctx, "Sua agenda online com desconto exclusivo", W - 160).forEach((line) => {
    ctx.fillText(line, 80, y);
    y += 74;
  });

  ctx.fillStyle = AMBER;
  ctx.font = `800 50px ${FONT}`;
  ctx.fillText(info.discountLabel, 80, y + 4);

  // QR num painel branco
  const panel = 500;
  const panelX = (W - panel) / 2;
  const panelY = y + 56;
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, panelX, panelY, panel, panel, 36);
  ctx.fill();
  ctx.drawImage(qrPoster, panelX + 40, panelY + 40, panel - 80, panel - 80);

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = `500 28px ${FONT}`;
  ctx.fillText("Aponte a câmera do celular para se cadastrar", W / 2, panelY + panel + 56);

  const chipText = `Cupom ${info.code}`;
  ctx.font = `700 32px ${FONT}`;
  const chipW = ctx.measureText(chipText).width + 64;
  const chipY = panelY + panel + 84;
  ctx.fillStyle = AMBER;
  roundRect(ctx, (W - chipW) / 2, chipY, chipW, 62, 31);
  ctx.fill();
  ctx.fillStyle = NAVY;
  ctx.fillText(chipText, W / 2, chipY + 42);

  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = `500 24px ${FONT}`;
  const footer = ["14 dias grátis", "sem fidelidade", info.deadlineLabel].filter(Boolean).join(" · ");
  ctx.fillText(footer, W / 2, H - 50);
  return canvas;
};

const STYLES = [
  { id: "classico", name: "Clássico", hint: "Preto e branco, para imprimir em qualquer material", render: renderClassic },
  { id: "marca", name: "Com a marca", hint: "QR azul-noite com o ícone do Horário Certo no centro", render: renderBrand },
  { id: "cartaz", name: "Cartaz para redes sociais", hint: "Arte pronta em 1080×1350 com o desconto em destaque", render: renderPoster },
];

/* ---------- Componente ---------- */

const Carousel = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
`;

const Slide = styled.div`
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--ui-radius-sm);
  background: #f3f4f6;
  padding: 0.75rem;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 0.4rem;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  }
`;

const NavButton = styled.button`
  width: 2.25rem;
  height: 2.25rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  border: 1px solid var(--ui-input-border);
  background: #fff;
  color: var(--ui-text);
  cursor: pointer;

  &:hover {
    background: #f3f4f6;
  }
`;

const Dots = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.4rem;
`;

const Dot = styled.button`
  width: ${(p) => (p.$active ? "1.4rem" : "0.55rem")};
  height: 0.55rem;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: ${(p) => (p.$active ? "var(--ui-primary)" : "#d1d5db")};
  cursor: pointer;
  transition: width 0.2s ease;
`;

const StyleName = styled.div`
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--ui-text);
`;

const Wrapper = styled.div`
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  text-align: center;
`;

const LinkRow = styled.div`
  display: flex;
  gap: 0.5rem;
  width: 100%;

  input {
    flex: 1;
    min-width: 0;
  }
`;

const Hidden = styled.div`
  display: none;
`;

// info: { code, partnerName, discountLabel, deadlineLabel }
export default function PartnerQrShare({ link, info }) {
  const darkRef = useRef(null);
  const brandRef = useRef(null);
  const posterRef = useRef(null);
  const [previews, setPreviews] = useState([]);
  const [index, setIndex] = useState(0);
  const infoKey = JSON.stringify(info);

  useEffect(() => {
    let cancelled = false;
    setPreviews([]);
    const build = async () => {
      // Sem a fonte carregada o canvas desenharia com a fonte padrão
      if (document.fonts?.load) {
        await Promise.all(
          ["500 28px Sora", "600 34px Sora", "700 42px Sora", "800 62px Sora"].map((f) => document.fonts.load(f).catch(() => null))
        );
      }
      const [icon, logoWhite] = await Promise.all([
        loadImage("/favicon.svg").catch(() => null),
        loadImage(logoWhiteUrl).catch(() => null),
      ]);
      if (cancelled || !darkRef.current || !brandRef.current || !posterRef.current) return;
      const assets = { qrDark: darkRef.current, qrBrand: brandRef.current, qrPoster: posterRef.current, icon, logoWhite };
      const data = JSON.parse(infoKey);
      setPreviews(STYLES.map((style) => style.render(assets, data).toDataURL("image/png")));
    };
    build();
    return () => {
      cancelled = true;
    };
  }, [link, infoKey]);

  const style = STYLES[index];
  const go = (step) => setIndex((current) => (current + step + STYLES.length) % STYLES.length);

  const handleDownload = () => {
    if (!previews[index]) return;
    const a = document.createElement("a");
    a.href = previews[index];
    a.download = `qrcode-${info.code.toLowerCase()}-${style.id}.png`;
    a.click();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copiado");
    } catch {
      toast.error("Não foi possível copiar. Selecione o link e copie manualmente.");
    }
  };

  return (
    <Wrapper>
      <Hidden aria-hidden="true">
        <QRCodeCanvas ref={darkRef} value={link} size={QR_SIZE} marginSize={0} level="M" fgColor={INK} bgColor="#FFFFFF" />
        <QRCodeCanvas ref={brandRef} value={link} size={QR_SIZE} marginSize={0} level="H" fgColor={NAVY} bgColor="#FFFFFF" />
        <QRCodeCanvas ref={posterRef} value={link} size={QR_SIZE} marginSize={0} level="M" fgColor={NAVY} bgColor="#FFFFFF" />
      </Hidden>

      <Carousel>
        <NavButton type="button" onClick={() => go(-1)} aria-label="Estilo anterior">
          <ChevronLeft size={18} />
        </NavButton>
        <Slide>
          {previews[index] ? <img src={previews[index]} alt={`QR Code no estilo ${style.name}`} /> : <Muted>Gerando...</Muted>}
        </Slide>
        <NavButton type="button" onClick={() => go(1)} aria-label="Próximo estilo">
          <ChevronRight size={18} />
        </NavButton>
      </Carousel>

      <div>
        <StyleName>{style.name}</StyleName>
        <Muted style={{ marginTop: "0.2rem" }}>{style.hint}</Muted>
      </div>

      <Dots>
        {STYLES.map((s, i) => (
          <Dot key={s.id} type="button" $active={i === index} onClick={() => setIndex(i)} aria-label={`Ver estilo ${s.name}`} />
        ))}
      </Dots>

      <Button type="button" onClick={handleDownload} disabled={!previews[index]}>
        <Download size={15} /> Baixar "{style.name}" (PNG)
      </Button>

      <LinkRow>
        <Input readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Link de parceria" />
        <Button type="button" $variant="outline" onClick={handleCopy}>
          <Copy size={15} /> Copiar
        </Button>
      </LinkRow>
    </Wrapper>
  );
}

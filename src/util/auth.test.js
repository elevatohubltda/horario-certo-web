import Cookies from "js-cookie";
import { format } from "date-fns";
import { isAvailableLogin, isPanelPath, safeReturnPath } from "./auth";

// jsdom roda em http: cookie "secure" não seria gravado, então o teste grava sem a flag
const setExpiration = (date) => Cookies.set("expirationDate", format(date, "yyyy-MM-dd'T'HH:mm:ss"));

describe("sessão do painel", () => {
  afterEach(() => Cookies.remove("expirationDate"));

  it("vale enquanto o token não venceu", () => {
    setExpiration(new Date(Date.now() + 30 * 60 * 1000));
    expect(isAvailableLogin()).toBe(true);
  });

  it("vence no mesmo dia, assim que passa o horário do token", () => {
    // Antes o formato sem aspas no T só dava a sessão como vencida no dia seguinte
    setExpiration(new Date(Date.now() - 60 * 1000));
    expect(isAvailableLogin()).toBe(false);
    expect(Cookies.get("expirationDate")).toBeUndefined();
  });

  it("sem login não há sessão", () => {
    expect(isAvailableLogin()).toBe(false);
  });
});

describe("telas do painel", () => {
  it("reconhece as telas que exigem login", () => {
    expect(isPanelPath("/dashboard")).toBe(true);
    expect(isPanelPath("/dashboard/")).toBe(true);
    expect(isPanelPath("/agenda-semanal")).toBe(true);
    expect(isPanelPath("/admin/clientes")).toBe(true);
  });

  it("deixa de fora as telas públicas", () => {
    expect(isPanelPath("/")).toBe(false);
    expect(isPanelPath("/login")).toBe(false);
    expect(isPanelPath("/registro")).toBe(false);
    expect(isPanelPath("/area-do-cliente")).toBe(false);
    expect(isPanelPath("/studio")).toBe(false); // página pública de agendamento
  });
});

describe("volta depois do login", () => {
  it("aceita só telas internas do painel", () => {
    expect(safeReturnPath("/agendamentos?dia=2026-11-06")).toBe("/agendamentos?dia=2026-11-06");
    expect(safeReturnPath("/admin/notas-fiscais")).toBe("/admin/notas-fiscais");
  });

  it("recusa endereços externos e telas públicas", () => {
    expect(safeReturnPath("//site-malicioso.com")).toBeNull();
    expect(safeReturnPath("/\\site-malicioso.com")).toBeNull();
    expect(safeReturnPath("https://site-malicioso.com")).toBeNull();
    expect(safeReturnPath("/studio")).toBeNull();
    expect(safeReturnPath(null)).toBeNull();
  });
});

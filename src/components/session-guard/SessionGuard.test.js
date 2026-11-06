import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { RouterProvider, createMemoryRouter, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { format } from "date-fns";
import SessionGuard from ".";

const LoginStub = () => {
  const location = useLocation();
  return <div>Login {location.search}</div>;
};

const openAt = (path) => {
  const router = createMemoryRouter(
    [
      {
        element: <SessionGuard />,
        children: [
          { path: "/login", element: <LoginStub /> },
          { path: "/dashboard", element: <button type="button">Painel</button> },
          { path: "/agendamentos", element: <div>Agendamentos</div> },
          { path: "/:companyUrl", element: <div>Agenda da empresa</div> },
        ],
      },
    ],
    { initialEntries: [path] }
  );
  render(<RouterProvider router={router} />);
  return router;
};

const setExpiration = (msFromNow) =>
  Cookies.set("expirationDate", format(new Date(Date.now() + msFromNow), "yyyy-MM-dd'T'HH:mm:ss"));

describe("sessão expirada no painel", () => {
  afterEach(() => {
    Cookies.remove("expirationDate");
    localStorage.clear();
  });

  it("ao abrir uma tela do painel com a sessão vencida, vai ao login com aviso e caminho de volta", async () => {
    localStorage.setItem("hcPanelSession", "1"); // já tinha entrado antes
    setExpiration(-60 * 1000);
    const router = openAt("/agendamentos?dia=2026-11-06");

    expect(await screen.findByText(/^Login/)).toBeInTheDocument();
    const params = new URLSearchParams(router.state.location.search);
    expect(params.get("sessao")).toBe("expirada");
    expect(params.get("voltar")).toBe("/agendamentos?dia=2026-11-06");
    expect(screen.queryByText("Agendamentos")).not.toBeInTheDocument();
  });

  it("quem nunca entrou vai ao login sem o aviso de sessão expirada (e não para /undefined)", async () => {
    const router = openAt("/dashboard");

    expect(await screen.findByText(/^Login/)).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/login");
    expect(new URLSearchParams(router.state.location.search).get("sessao")).toBeNull();
  });

  it("qualquer ação depois que o token vence leva ao login", async () => {
    localStorage.setItem("hcPanelSession", "1");
    setExpiration(30 * 60 * 1000);
    const router = openAt("/dashboard");
    expect(screen.getByText("Painel")).toBeInTheDocument();

    // O token vence com a tela aberta e o usuário clica em algo
    setExpiration(-1000);
    fireEvent.pointerDown(screen.getByText("Painel"));

    expect(await screen.findByText(/^Login/)).toBeInTheDocument();
    expect(new URLSearchParams(router.state.location.search).get("sessao")).toBe("expirada");
  });

  it("com a sessão válida, as ações seguem normalmente", () => {
    setExpiration(30 * 60 * 1000);
    const router = openAt("/dashboard");
    fireEvent.pointerDown(screen.getByText("Painel"));
    expect(router.state.location.pathname).toBe("/dashboard");
  });

  it("páginas públicas não exigem login", () => {
    openAt("/studio");
    expect(screen.getByText("Agenda da empresa")).toBeInTheDocument();
  });
});

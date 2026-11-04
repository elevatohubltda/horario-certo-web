import React from "react";
import { render, screen } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import NotFound from "./NotFound";

// Mesma ordem do router real: rotas nomeadas, /:companyUrl e, por último, o curinga
const renderAt = (path) => {
  const router = createMemoryRouter(
    [
      { path: "/", element: <div>Início</div> },
      { path: "/dashboard", element: <div>Painel</div> },
      { path: "/:companyUrl", element: <div>Agenda da empresa</div> },
      { path: "*", element: <NotFound /> },
    ],
    { initialEntries: [path] }
  );
  render(<RouterProvider router={router} />);
};

describe("página 404", () => {
  it("aparece para endereço que não existe", () => {
    renderAt("/admin/qualquer-coisa");
    expect(screen.getByText("Página não encontrada")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ir para o início" })).toBeInTheDocument();
  });

  it("não atrapalha as rotas existentes", () => {
    renderAt("/dashboard");
    expect(screen.getByText("Painel")).toBeInTheDocument();
    expect(screen.queryByText("Página não encontrada")).not.toBeInTheDocument();
  });

  it("tem texto próprio para link de agenda inexistente", () => {
    const router = createMemoryRouter([{ path: "/:companyUrl", element: <NotFound variant="company" /> }], {
      initialEntries: ["/linkerrado"],
    });
    render(<RouterProvider router={router} />);
    expect(screen.getByText("Agenda não encontrada")).toBeInTheDocument();
    expect(screen.getByText(/prestador de serviços/)).toBeInTheDocument();
  });
});

import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Register from "./Register";
import { getPublicSubscriptionPlans, validateDiscountCode } from "../services/endpoints/payment";

jest.mock("../services/endpoints/payment", () => ({
  validateDiscountCode: jest.fn(),
  getPublicSubscriptionPlans: jest.fn(),
  updateSubscription: jest.fn(),
}));
jest.mock("../services/endpoints/auth", () => ({ login: jest.fn() }));
jest.mock("../services/endpoints/user", () => ({ registerUser: jest.fn() }));
jest.mock("../services/endpoints/company", () => ({ createCompany: jest.fn() }));

const openRegister = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Register />
    </MemoryRouter>
  );

describe("cadastro pelo link de parceria", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getPublicSubscriptionPlans.mockResolvedValue({ data: { plans: [], extraFeatures: [] } });
  });

  it("aplica o cupom do link e mostra a indicação do parceiro", async () => {
    validateDiscountCode.mockResolvedValue({
      data: {
        name: "BELLA20",
        discountType: "PERCENTAGE",
        discountValue: 20,
        displayText: "BELLA20 (20% de desconto)",
        partnerName: "Escola Bella",
        registrationDeadline: "2026-12-31T23:59:59",
      },
    });

    openRegister("/registro?cupom=bella20");

    expect(await screen.findByText(/Indicação de Escola Bella/)).toBeInTheDocument();
    expect(screen.getByText(/20% de desconto na mensalidade/)).toBeInTheDocument();
    expect(screen.getByText(/Válido para cadastros até 31\/12\/2026/)).toBeInTheDocument();
    expect(validateDiscountCode).toHaveBeenCalledWith("BELLA20");
  });

  it("cupom de primeira mensalidade grátis aparece como tal", async () => {
    validateDiscountCode.mockResolvedValue({
      data: { name: "GRATIS", discountType: "FIRST_MONTH_FREE", discountValue: 0, displayText: "GRATIS (1ª mensalidade grátis)" },
    });

    openRegister("/registro?cupom=GRATIS");

    expect(await screen.findByText(/1ª mensalidade grátis/)).toBeInTheDocument();
  });

  it("sem cupom no link não valida nada nem mostra a faixa", () => {
    openRegister("/registro");
    expect(validateDiscountCode).not.toHaveBeenCalled();
    expect(screen.queryByText(/Indicação de/)).not.toBeInTheDocument();
  });
});

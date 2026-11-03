import { isValidCnpj, isValidCpf, isValidCpfOrCnpj, isValidEmail, tamanhoArquivoAceito, validarHoraCompleta } from "./validate";
import { chooseGuest, hasChosenGuest } from "./customerSession";

describe("CPF e CNPJ do cadastro", () => {
  it("aceita documentos válidos com ou sem máscara", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCnpj("46.647.130/0001-11")).toBe(true);
    expect(isValidCpfOrCnpj("52998224725")).toBe(true);
    expect(isValidCpfOrCnpj("46647130000111")).toBe(true);
  });

  it("recusa dígito verificador errado, sequência repetida e tamanho errado", () => {
    expect(isValidCpf("529.982.247-26")).toBe(false);
    expect(isValidCpf("000.000.000-00")).toBe(false);
    expect(isValidCnpj("46.647.130/0001-12")).toBe(false);
    expect(isValidCpfOrCnpj("1234567")).toBe(false);
  });
});

describe("outras validações", () => {
  it("e-mail", () => {
    expect(isValidEmail("contato@studio.com.br")).toBe(true);
    expect(isValidEmail("contato@studio")).toBe(false);
    expect(isValidEmail("contato studio@x.com")).toBe(false);
  });

  it("hora completa HH:mm:ss", () => {
    expect(validarHoraCompleta("09:30:00")).toBe(true);
    expect(validarHoraCompleta("24:00:00")).toBe(false);
    expect(validarHoraCompleta("09:30")).toBe(false);
  });

  it("logo de até 2 MB", () => {
    expect(tamanhoArquivoAceito({ size: 2 * 1024 * 1024 })).toBe(true);
    expect(tamanhoArquivoAceito({ size: 2 * 1024 * 1024 + 1 })).toBe(false);
  });
});

describe("escolha de agendar sem cadastro", () => {
  beforeEach(() => window.localStorage.clear());

  it("fica lembrada depois que o cliente escolhe", () => {
    expect(hasChosenGuest()).toBe(false);
    chooseGuest();
    expect(hasChosenGuest()).toBe(true);
  });
});

export function validarHoraCompleta(hora) {
  const regex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  return regex.test(hora);
}

export function tamanhoArquivoAceito(file){
  const fileSizeMB = file.size / (1024 * 1024); // converte para MB
  const maxSizeMB = 2;

  if (fileSizeMB > maxSizeMB) {
    return false;
  }
  return true;
}
// Validações do cadastro da empresa (e-mail de cobrança e CPF/CNPJ usado no Pix)
export const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

const calcCpfDigit = (digits, len) => {
  let sum = 0;
  for (let i = 0; i < len; i++) sum += parseInt(digits[i]) * (len + 1 - i);
  const rem = sum % 11;
  return rem < 2 ? 0 : 11 - rem;
};

export const isValidCpf = (value) => {
  const d = value.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  return calcCpfDigit(d, 9) === parseInt(d[9]) && calcCpfDigit(d, 10) === parseInt(d[10]);
};

export const isValidCnpj = (value) => {
  const d = value.replace(/\D/g, "");
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const calc = (digits, weights) => {
    const sum = weights.reduce((acc, w, i) => acc + parseInt(digits[i]) * w, 0);
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };
  const d1 = calc(d, w1);
  const d2 = calc(d.slice(0, 12) + d1, w2);
  return parseInt(d[12]) === d1 && parseInt(d[13]) === d2;
};

export const isValidCpfOrCnpj = (value) => {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11 ? isValidCpf(digits) : digits.length === 14 ? isValidCnpj(digits) : false;
};

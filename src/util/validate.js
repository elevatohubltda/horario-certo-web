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
//const dayOfWeek = getWeekDay("11/04/2025");
export const getWeekDay = (dateString) => {
  const [dia, mes, ano] = dateString.split('/');
  const data = new Date(ano, mes - 1, dia);
  const dias = [
    "domingo",
    "segunda-feira",
    "terça-feira",
    "quarta-feira",
    "quinta-feira",
    "sexta-feira",
    "sábado"
  ];
  
  return dias[data.getDay()];
};

export const getMonth = [ 
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
];

export function getNowInBrazilDate(){
  const nowInBrazilString = new Date().toLocaleString("sv-SE", {
    timeZone: "America/Sao_Paulo",
    hour12: false
  });

  // sv-SE → YYYY-MM-DD HH:mm:ss
  return new Date(nowInBrazilString.replace(" ", "T"));
}

//3 horas de expiração
export const expiresAt = new Date(
  getNowInBrazilDate().getTime() + 3 * 60 * 60 * 1000
);
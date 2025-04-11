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
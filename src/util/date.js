
//const dayOfWeek = daysOfWeek[now.getDay()];
export const daysOfWeek = [ 
    {abbreviation: 'D', name: 'Domingo'}, 
    {abbreviation: 'S', name: 'Segunda-feira'},
    {abbreviation: 'T', name: 'Terça-feira'},
    {abbreviation: 'Q', name: 'Quarta-feira'},
    {abbreviation: 'Q', name: 'Quinta-feira'},
    {abbreviation: 'S', name: 'Sexta-feira'},
    {abbreviation: 'S', name: 'Sábado'},
];

//const dayOfWeek = daysOfWeek[now.getMonth()];
export const monthsOfYear = [ 
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

export const myCustomLocale = {
    // months list by order
    months: [
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
    ],
  
    // week days by order
    weekDays: [
      {
        name: 'Domingo', // used for accessibility 
        short: 'D', // displayed at the top of days' rows
        isWeekend: true, // is it a formal weekend or not?
      },
      {
        name: 'Segunda-feira',
        short: 'S',
      },
      {
        name: 'Terça-feira',
        short: 'T',
      },
      {
        name: 'Quarta-feira',
        short: 'Q',
      },
      {
        name: 'Quinta-feira',
        short: 'Q',
      },
      {
        name: 'Sexta-feira',
        short: 'S',
      },
      {
        name: 'Sábado',
        short: 'S',
        isWeekend: true,
      },
    ],
  
    // just play around with this number between 0 and 6
    weekStartingIndex: 0,
  
    // return a { year: number, month: number, day: number } object
    getToday(gregorainTodayObject) {
      return gregorainTodayObject;
    },
  
    // return a native JavaScript date here
    toNativeDate(date) {
      return new Date(date.year, date.month - 1, date.day);
    },
  
    // return a number for date's month length
    getMonthLength(date) {
      return new Date(date.year, date.month, 0).getDate();
    },
  
    // return a transformed digit to your locale
    transformDigit(digit) {
      return digit;
    },
  
    // texts in the date picker
    nextMonth: 'Próximo Mês',
    previousMonth: 'Mês Anterior',
    openMonthSelector: 'Abrir Seletor de Mês',
    openYearSelector: 'Abrir Seletor de Ano',
    closeMonthSelector: 'Fechar Seletor de Mês',
    closeYearSelector: 'Fechar Seletor de Ano',
    defaultPlaceholder: 'Selecione...',
  
    // for input range value
    from: 'de',
    to: 'para',
  
  
    // used for input value when multi dates are selected
    digitSeparator: ',',
  
    // if your provide -2 for example, year will be 2 digited
    yearLetterSkip: 0,
  
    // is your language rtl or ltr?
    isRtl: false,
  }

export function getTodayToCalendar(){
    return {
        year: new Date().getFullYear(),
        month: Number(new Date().getMonth()+1),
        day: new Date().getDate()
      };
}
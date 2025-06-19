export function formatPhoneNumber(phoneNumberString) {
    return phoneNumberString.toString().replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, "($1) $2 $3-$4")
}

export function transformarHorariosPorData(array) {
    const agrupado = {};
  
    array.forEach(item => {
      const [date, time] = item.schedule.split("T");
      const [year, month, day] = date.split("-");
      const dataFormatada = `${day}/${month}/${year}`;
      const horaFormatada = time.slice(0, 5); // "HH:mm"
  
      if (!agrupado[dataFormatada]) {
        agrupado[dataFormatada] = [];
      }
  
      agrupado[dataFormatada].push(horaFormatada);
    });
  
    const resultado = Object.entries(agrupado)
      .map(([data, horarios]) => ({
        data,
        horarios: horarios.sort(), // opcional: ordena os horários
      }))
      .sort((a, b) => {
        // ordena as datas cronologicamente
        const [d1, m1, y1] = a.data.split("/").map(Number);
        const [d2, m2, y2] = b.data.split("/").map(Number);
        return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
      });
  
    return resultado;
}

export function paraHoraSemSegundos(hora) {
  // Exemplo: "14:30:00" → "14:30"
  return hora.slice(0, 5);
}

export function paraHoraCompleta(hora) {
  // Exemplo: "14:30" → "14:30:00"
  return hora.length === 5 ? `${hora}:00` : hora;
}
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

    agrupado[dataFormatada].push({
      horario: horaFormatada,
      available: item.available,
      name: item.name,
      service: item.service || item.servico || null,
    });
  });

  const resultado = Object.entries(agrupado)
    .map(([data, horarios]) => ({
      data,
      horarios: horarios.sort((a, b) => a.horario.localeCompare(b.horario)),
    }))
    .sort((a, b) => {
      const [d1, m1, y1] = a.data.split("/").map(Number);
      const [d2, m2, y2] = b.data.split("/").map(Number);
      return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
    });

  return resultado;
}

export function paraHoraSemSegundos(hora) {
  return hora.slice(0, 5);
}

export function paraHoraCompleta(hora) {
  return hora.length === 5 ? `${hora}:00` : hora;
}

export function formataNumeroTelefone(value) {
  const cleaned = value.replace(/\D/g, '');

  let formatted = '';

  if (cleaned.length <= 2) {
    formatted = `${cleaned}`;
  } else if (cleaned.length <= 3) {
    formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  } else if (cleaned.length <= 7) {
    formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 3)} ${cleaned.slice(3)}`;
  } else if (cleaned.length <= 11) {
    formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  } else {
    formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  }

  return formatted;
}

export function formatSchedulesToISO(scheduleData) {
  if (!scheduleData?.date || !scheduleData?.schedules?.length) return [];

  let year, month, day;

  if (scheduleData.date.includes("/")) {
    [day, month, year] = scheduleData.date.split("/").map(Number);
  } else if (scheduleData.date.includes("-")) {
    [year, month, day] = scheduleData.date.split("-").map(Number);
  } else {
    console.error("Formato de data não suportado:", scheduleData.date);
    return [];
  }

  return scheduleData.schedules.map(timeStr => {
    if (!timeStr) return null;

    const [hour, minute] = timeStr.split(":").map(Number);
    const date = new Date(year, month - 1, day, hour, minute);

    if (isNaN(date.getTime())) {
      console.error(`Data inválida: ${scheduleData.date} ${timeStr}`);
      return null;
    }

    // Formata como string local no padrão ISO
    const pad = n => String(n).padStart(2, "0");
    const localISOString = `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00.000`;

    return localISOString;
  }).filter(Boolean);
}

export const maskTime = (value) => {
  // Remove tudo que não for dígito
  let v = value.replace(/\D/g, '');

  if (v.length >= 3) {
    // Se tiver 3 ou mais dígitos, insere ':'
    v = v.slice(0, 2) + ':' + v.slice(2, 4);
  }

  // Limita a 5 caracteres: HH:MM
  if (v.length > 5) {
    v = v.slice(0, 5);
  }

  return v;
};
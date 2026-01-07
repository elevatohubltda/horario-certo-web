export function isMobile() {
    return window.innerWidth <= 768;
}

export const openWhatsApp = (whatsapp) => {
    const cleanWhatsapp = whatsapp.replace(/\D/g, '');
    const url = "https://wa.me/55"+ cleanWhatsapp;
    window.open(url, "_blank"); // Abre o link em uma nova aba
};

export const openInstagram = (instagram) => {
    const url = "https://instagram.com/"+ instagram;
    window.open(url, "_blank"); // Abre o link em uma nova aba
};

export function generateTimeSlots({ openTime, closeTime, durationTime, interval = [] }) {
  if (!openTime || !closeTime || !durationTime) return [];

  const slots = [];

  const toMinutes = timeStr => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const toTimeStr = mins => {
    const h = Math.floor(mins / 60).toString().padStart(2, "0");
    const m = (mins % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const startMins = toMinutes(openTime);
  const endMins = toMinutes(closeTime);
  const duration = parseInt(durationTime, 10);

  let current = startMins;

  while (current < endMins) {
    const slotStart = current;
    const slotEnd = current + duration;

    // Verifica se o slot colide com um intervalo
    const overlap = interval.find(({ start, end }) => {
      const intStart = toMinutes(start);
      const intEnd = toMinutes(end);
      return (
        (slotStart >= intStart && slotStart < intEnd) || // começa dentro
        (slotEnd > intStart && slotEnd <= intEnd) ||     // termina dentro
        (slotStart <= intStart && slotEnd >= intEnd)     // engloba tudo
      );
    });

    if (overlap) {
      // Se houver sobreposição, encaixa um slot parcial até o intervalo
      if (slotStart < toMinutes(overlap.start)) {
        slots.push(toTimeStr(slotStart));
      }
      current = toMinutes(overlap.end);
    } else if (slotEnd <= endMins) {
      // Slot cabe inteiro
      slots.push(toTimeStr(slotStart));
      current += duration;
    } else {
      // Slot não cabe inteiro, mas ainda tem tempo para encaixar um parcial até closeTime
      slots.push(toTimeStr(slotStart));
      break; // Fecha o loop, pois chegou no final
    }
  }

  return slots;
}
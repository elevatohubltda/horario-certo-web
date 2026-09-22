export function computeAvailableSlots({
  openTime,
  closeTime,
  intervals = [],
  bookedSlots = [],
  durationMinutes
}) {
  if (!openTime || !closeTime || !durationMinutes) return [];

  const toMinutes = (timeStr) => {
    const [h, m] = timeStr.slice(0, 5).split(":").map(Number);
    return h * 60 + m;
  };
  const toTimeStr = (mins) => {
    const h = Math.floor(mins / 60).toString().padStart(2, "0");
    const m = (mins % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  };
  const minutesFromDateTime = (isoDateTime) => {
    const time = isoDateTime.split("T")[1] || "00:00:00";
    return toMinutes(time);
  };

  const openMins = toMinutes(openTime);
  const closeMins = toMinutes(closeTime);
  const duration = parseInt(durationMinutes, 10);

  // Pausas (intervalos) sempre criam um vão na agenda, independente do serviço.
  const intervalRanges = intervals
    .map((interval) => ({
      start: toMinutes(interval.startTime),
      end: toMinutes(interval.endTime)
    }))
    .sort((a, b) => a.start - b.start);

  // Qualquer reserva ocupa o único profissional/recurso disponível, então
  // bloqueia a agenda independente do serviço reservado.
  const bookedRanges = bookedSlots
    .map((slot) => {
      const start = minutesFromDateTime(slot.start);
      return { start, end: start + (slot.durationMinutes || 30) };
    })
    .sort((a, b) => a.start - b.start);

  const blockingRanges = [...intervalRanges, ...bookedRanges].sort((a, b) => a.start - b.start);

  const findRangeContaining = (ranges, point) =>
    ranges.find((range) => point >= range.start && point < range.end);
  const findNextBoundaryAfter = (ranges, point, limit) =>
    ranges.find((range) => range.start > point && range.start < limit);

  const slots = [];
  let cursor = openMins;

  while (cursor < closeMins) {
    // Cursor caiu dentro de uma pausa: pula pro fim dela, sem gerar slot.
    const interval = findRangeContaining(intervalRanges, cursor);
    if (interval) {
      cursor = interval.end;
      continue;
    }

    // Cursor caiu dentro de uma reserva existente: mostra ela como um único
    // slot indisponível (no horário/duração reais dela) e retoma logo no fim
    // dela — sem fragmentar em vários slots da grade do serviço selecionado.
    const booking = findRangeContaining(bookedRanges, cursor);
    if (booking) {
      slots.push({ horario: toTimeStr(booking.start), available: false });
      cursor = booking.end;
      continue;
    }

    const slotEnd = cursor + duration;
    if (slotEnd > closeMins) break;

    // Um slot livre não pode invadir a próxima pausa/reserva — se invadir,
    // pula direto pro início dela (sem oferecer um horário parcial).
    const nextBoundary = findNextBoundaryAfter(blockingRanges, cursor, slotEnd);
    if (nextBoundary) {
      cursor = nextBoundary.start;
      continue;
    }

    slots.push({ horario: toTimeStr(cursor), available: true });
    cursor = slotEnd;
  }

  return slots;
}

export function computeAvailableSlots({ openTime, closeTime, intervals = [], bookedSlots = [], durationMinutes }) {
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

  const intervalRanges = intervals.map((interval) => ({
    start: toMinutes(interval.startTime),
    end: toMinutes(interval.endTime)
  }));

  const bookedRanges = bookedSlots.map((slot) => {
    const start = minutesFromDateTime(slot.start);
    return { start, end: start + (slot.durationMinutes || 30) };
  });

  const slots = [];
  let current = openMins;
  while (current + duration <= closeMins) {
    const slotStart = current;
    const slotEnd = current + duration;

    const overlapsInterval = intervalRanges.some(
      (range) => slotStart < range.end && range.start < slotEnd
    );

    if (overlapsInterval) {
      current += duration;
      continue;
    }

    const overlapsBooking = bookedRanges.some(
      (range) => slotStart < range.end && range.start < slotEnd
    );

    slots.push({ horario: toTimeStr(slotStart), available: !overlapsBooking });
    current += duration;
  }

  return slots;
}

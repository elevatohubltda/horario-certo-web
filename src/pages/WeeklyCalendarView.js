import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { Portuguese } from "flatpickr/dist/l10n/pt";
import "../styles/index.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays, isSameDay, differenceInCalendarDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  PhoneIcon,
  ClipboardPenLineIcon,
  CircleXIcon
} from "lucide-react";
import Topbar from "../components/topbar";
import { Container } from "../components/container/style";
import Cookies from "js-cookie";
import Sidebar from "../components/sidebar";
import { isAvailableLogin } from "../util/auth";
import { useNavigate } from "react-router-dom";
import { isMobile, openWhatsApp } from "../util/util";
import { formataNumeroTelefone, maskTime, paraHoraSemSegundos } from "../util/format";
import { ToastContainer, toast } from "react-toastify";
import { getSimpleAvailability } from "../services/endpoints/weeklyScheduleRule";
import { removeReservedScheduleByOwner, updateSchedule } from "../services/endpoints/reservedSchedule";
import Dialog from "../components/dialog";
import ConfirmDialog from "../components/confirmDialog";
import { Title } from "../components/title";
import { Separator } from "../components/separator/style";
import { Button } from "../components/button";
import { DialogInput, Label } from "../components/scheduleDialogs/style";

const locales = { "pt-BR": ptBR };

const messages = {
  date: "Data",
  time: "Hora",
  event: "Evento",
  allDay: "Dia inteiro",
  week: "Semana",
  work_week: "Semana de trabalho",
  day: "Dia",
  month: "Mês",
  previous: "Anterior",
  next: "Próximo",
  yesterday: "Ontem",
  tomorrow: "Amanhã",
  today: "Hoje",
  agenda: "Agenda",
  noEventsInRange: "Não há agendamentos nesse período.",
  showMore: (total) => `+ ${total} mais`
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }),
  getDay,
  locales
});

const parseLocalDateTime = (value) => {
  const [datePart, timePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
};

const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60000);

// Mesma regra de status usada na tela de Agendamentos (SortedTable): um
// agendamento só mostra ações (WhatsApp/Editar/Cancelar) enquanto ainda não
// passou ("Agendado"). Uma vez no passado ("Concluído"), nenhuma ação aparece.
const isEventScheduled = (event) => {
  if (!event?.isoStart) return false;
  const now = new Date()
    .toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo", hour12: false })
    .replace(" ", "T");
  return event.isoStart >= now;
};

/* =======================
   Styled Components — Google Calendar-like shell
======================= */

const PageWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: calc(100vh - 80px);
  background: #fff;
  margin-top: 1rem;
  min-height: 0;
`;

const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
`;

const MiniCalendarPanel = styled.div`
  width: max-content;
  flex-shrink: 0;
  padding: 0 1rem 0 1.5rem;
  border-right: 1px solid #e3e3e3;
`;

const MiniCalendarStyle = styled.div`
  /* Sobrescreve com !important porque o tema flatpickr/airbnb (usado em outra
     tela via components/datePicker) compartilha as mesmas classes .flatpickr-*
     com a mesma especificidade — sem isso, a ordem de bundling do webpack
     decide quem vence e pode aplicar o tema errado aqui. */

  /* O componente Flatpickr sempre renderiza um <input> de texto como raiz;
     em modo inline não precisamos dele, só da grade do calendário abaixo. */
  > input {
    display: none !important;
  }

  .flatpickr-calendar {
    background: #fff !important;
    box-shadow: none !important;
    width: 100% !important;
    max-width: 100% !important;
    border: none !important;
    border-radius: 0 !important;
    font-family: inherit !important;
  }

  .flatpickr-calendar.inline {
    display: block !important;
    position: relative !important;
    top: 0 !important;
  }

  .flatpickr-months {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    background: #fff !important;
    margin-bottom: 0.5rem !important;
    fill: #3c4043 !important;
  }

  .flatpickr-month {
    display: flex !important;
    align-items: center !important;
    height: auto !important;
    color: #3c4043 !important;
    fill: #3c4043 !important;
  }

  .flatpickr-current-month {
    position: static !important;
    display: flex !important;
    align-items: center !important;
    width: auto !important;
    left: auto !important;
    padding: 0 !important;
    font-size: 0.95rem !important;
    font-weight: 500 !important;
    color: #3c4043 !important;
  }

  .flatpickr-current-month .cur-month {
    margin-right: 0.35rem !important;
    font-weight: 500 !important;
    font-size: 0.95rem !important;
    color: #3c4043 !important;
    background: transparent !important;
    padding: 0 !important;
  }

  .flatpickr-current-month .numInputWrapper {
    width: 3.6em !important;
  }

  .flatpickr-current-month .numInputWrapper span {
    display: none !important;
  }

  .flatpickr-current-month input.cur-year {
    font-weight: 500 !important;
    font-size: 0.95rem !important;
    color: #3c4043 !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    -moz-appearance: textfield !important;
  }

  .flatpickr-current-month input.cur-year::-webkit-inner-spin-button,
  .flatpickr-current-month input.cur-year::-webkit-outer-spin-button {
    -webkit-appearance: none !important;
    margin: 0 !important;
  }

  .flatpickr-prev-month,
  .flatpickr-next-month {
    position: static !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 28px !important;
    height: 28px !important;
    padding: 0 !important;
    border-radius: 50% !important;
    fill: #3c4043 !important;
    color: #3c4043 !important;
  }

  .flatpickr-prev-month:hover,
  .flatpickr-next-month:hover {
    background: #f1f3f4 !important;
  }

  .flatpickr-prev-month:hover svg,
  .flatpickr-next-month:hover svg,
  .flatpickr-prev-month svg,
  .flatpickr-next-month svg {
    fill: #3c4043 !important;
  }

  .flatpickr-weekdays {
    background: #fff !important;
    margin-bottom: 0.25rem !important;
  }

  .flatpickr-weekdaycontainer,
  .flatpickr-weekdaycontainer *,
  span.flatpickr-weekday {
    background: #fff !important;
    font-size: 0.65rem !important;
    font-weight: 600 !important;
    color: #70757a !important;
    text-transform: uppercase !important;
    text-decoration: none !important;
  }

  .flatpickr-days {
    border: none !important;
    width: 100% !important;
  }

  .flatpickr-day {
    background: transparent !important;
    color: #3c4043 !important;
    font-size: 0.78rem !important;
    font-weight: 400 !important;
    border: 1px solid transparent !important;
    border-radius: 50% !important;
    max-width: none !important;
    width: 14.28% !important;
    height: 32px !important;
    line-height: 32px !important;
  }

  .flatpickr-day:hover,
  .flatpickr-day:focus {
    background: #f1f3f4 !important;
    border-color: transparent !important;
  }

  .flatpickr-day.today {
    background: transparent !important;
    border-color: #1a73e8 !important;
    color: #3c4043 !important;
  }

  .flatpickr-day.selected,
  .flatpickr-day.selected:hover,
  .flatpickr-day.selected.today {
    background: #1a73e8 !important;
    border-color: #1a73e8 !important;
    color: #fff !important;
  }

  .flatpickr-day.prevMonthDay,
  .flatpickr-day.nextMonthDay {
    color: #bdbdbd !important;
  }
`;

const GCalToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0.9rem 1.5rem;
  border-bottom: 1px solid #e3e3e3;
  background: #fff;
  flex-wrap: wrap;
`;

const TodayButton = styled.button`
  border: 1px solid #dadce0;
  background: #fff;
  color: #3c4043;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: #f1f3f4;
  }
`;

const NavArrows = styled.div`
  display: flex;
  align-items: center;
`;

const ArrowButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 50%;
  color: #3c4043;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: #f1f3f4;
  }
`;

const ToolbarTitle = styled.h2`
  margin: 0;
  font-size: 1.375rem;
  font-weight: 500;
  color: #3c4043;
  text-transform: capitalize;
`;

const ViewSelect = styled.select`
  margin-left: auto;
  border: 1px solid #dadce0;
  background: #fff;
  color: #3c4043;
  border-radius: 8px;
  padding: 0.5rem 0.85rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #1a73e8;
  }
`;

const CalendarArea = styled.div`
  flex: 1;
  padding: 0 1.5rem 1.5rem 1.5rem;
  min-height: 0;
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const ConfigBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  background: #fef7e0;
  border: 1px solid #f4d97a;
  border-radius: 8px;
  padding: 0.85rem 1.25rem;
  margin: 1rem 1.5rem 0 1.5rem;
  font-size: 0.85rem;
  color: #4a3f00;
`;

const ConfigBannerLink = styled.a`
  color: #1a73e8;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`;

const DayHeaderCell = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.6rem 0;
`;

const WeekdayLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #70757a;
  text-transform: uppercase;
`;

const DayNumber = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1.35rem;
  font-weight: 400;
  color: ${({ $isToday }) => ($isToday ? "#fff" : "#3c4043")};
  background: ${({ $isToday }) => ($isToday ? "#1a73e8" : "transparent")};
`;

const EventContent = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.25;
  overflow: hidden;
`;

const EventTitle = styled.span`
  font-weight: 600;
  font-size: 0.78rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EventTime = styled.span`
  font-size: 0.7rem;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DetailRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  margin-bottom: 1rem;
`;

const DetailLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-olive);
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const DetailValue = styled.span`
  font-size: 0.95rem;
  color: var(--color-dark);
`;

const DetailActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e8e8e8;
`;

const DetailIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid #e0e0e0;
  background: #fff;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: #f1f3f4;
  }
`;

const CalendarGlobalStyle = styled.div`
  height: 100%;

  .rbc-calendar {
    font-family: inherit;
  }

  .rbc-time-view {
    border: 1px solid #e3e3e3;
    border-radius: 8px;
    overflow: hidden;
  }

  .rbc-time-header-content,
  .rbc-time-content {
    border-left: 1px solid #e3e3e3;
  }

  .rbc-header {
    border-bottom: 1px solid #e3e3e3;
    border-left: 1px solid #e3e3e3;
    padding: 0;
    overflow: visible;
    height: auto;
    min-height: 68px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .rbc-header:first-child,
  .rbc-time-header-gutter {
    border-left: none;
  }

  /* react-big-calendar sincroniza a largura da coluna de horários do
     cabeçalho com a do corpo medindo o DOM via JS uma única vez; como
     mudamos a fonte dos rótulos de hora, essa medição pode ficar
     desatualizada e desalinhar cabeçalho x grade. Fixamos os dois com a
     mesma largura via CSS para eliminar essa dependência de medição. */
  .rbc-time-header-gutter,
  .rbc-time-gutter {
    width: 56px !important;
    min-width: 56px !important;
    max-width: 56px !important;
  }

  .rbc-time-header {
    border-bottom: 1px solid #e3e3e3;
  }

  .rbc-row.rbc-time-header-cell {
    min-height: 68px;
  }

  /* Linha de eventos de "dia inteiro" não é usada nesta agenda — esconder
     evita o espaço vazio reservado acima da grade de horários. */
  .rbc-allday-cell {
    display: none;
  }

  .rbc-time-gutter .rbc-timeslot-group {
    border-bottom: 1px solid #f1f3f4;
  }

  .rbc-timeslot-group {
    border-bottom: 1px solid #f1f3f4;
    min-height: 52px;
  }

  .rbc-time-gutter .rbc-time-slot {
    color: #70757a;
    font-size: 0.7rem;
  }

  .rbc-day-slot .rbc-time-slot {
    border-top: none;
  }

  .rbc-time-content > * + * > * {
    border-left: 1px solid #e3e3e3;
  }

  .rbc-today {
    background-color: #e8f0fe;
  }

  .rbc-current-time-indicator {
    background-color: #ea4335;
    height: 2px;
  }

  .rbc-event {
    border: none;
    border-radius: 6px;
    padding: 2px 6px;
    box-shadow: none;
  }

  .rbc-event-label {
    display: none;
  }

  .rbc-event.rbc-selected {
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.15);
  }

  .rbc-off-range-bg {
    background: #fafafa;
  }
`;

/* =======================
   Custom RBC components
======================= */

function CustomDayHeader({ date }) {
  const weekday = format(date, "EEE", { locale: ptBR }).replace(".", "");
  const isToday = isSameDay(date, new Date());
  return (
    <DayHeaderCell>
      <WeekdayLabel>{weekday}</WeekdayLabel>
      <DayNumber $isToday={isToday}>{format(date, "d")}</DayNumber>
    </DayHeaderCell>
  );
}

function CustomEvent({ event }) {
  return (
    <EventContent>
      <EventTitle>{event.title}</EventTitle>
      {event.type === "booked" && (
        <EventTime>
          {format(event.start, "HH:mm")} – {format(event.end, "HH:mm")}
        </EventTime>
      )}
    </EventContent>
  );
}

function CustomToolbar({ label, onNavigate, onView, view }) {
  return (
    <GCalToolbar>
      <TodayButton onClick={() => onNavigate("TODAY")}>Hoje</TodayButton>
      <NavArrows>
        <ArrowButton onClick={() => onNavigate("PREV")} aria-label="Anterior">
          <ChevronLeft size={20} />
        </ArrowButton>
        <ArrowButton onClick={() => onNavigate("NEXT")} aria-label="Próximo">
          <ChevronRight size={20} />
        </ArrowButton>
      </NavArrows>
      <ToolbarTitle>{label}</ToolbarTitle>
      <ViewSelect value={view} onChange={(e) => onView(e.target.value)}>
        <option value="week">Semana</option>
        <option value="day">Dia</option>
      </ViewSelect>
    </GCalToolbar>
  );
}

const components = {
  header: CustomDayHeader,
  event: CustomEvent,
  toolbar: CustomToolbar
};

const TOAST_CONTAINER_ID = "weekly-calendar-toast";

export default function WeeklyCalendarView() {
  const companyUrl = Cookies.get("companyUrl");
  const companyInfo = JSON.parse(Cookies.get("companyInfo") || "{}");
  const [loading, setLoading] = useState(true);
  const [mobile, setMobile] = useState();
  const [events, setEvents] = useState([]);
  const [hasAnyOpenDay, setHasAnyOpenDay] = useState(true);
  const [range, setRange] = useState(() => {
    const start = startOfWeek(new Date(), { locale: ptBR });
    return { start, days: 7, view: "week" };
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editSchedule, setEditSchedule] = useState({ date: "", time: "" });
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const navigate = useNavigate();

  const toIsoDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const endDate = new Date(range.start);
      endDate.setDate(endDate.getDate() + range.days - 1);
      const response = await getSimpleAvailability(
        companyUrl,
        toIsoDate(range.start),
        toIsoDate(endDate),
        true
      );
      const days = response.data || [];
      const builtEvents = [];
      setHasAnyOpenDay(days.some((day) => day.openTime && day.closeTime));

      days.forEach((day) => {
        const [year, month, dayOfMonth] = day.date.split("-").map(Number);

        if (day.openTime && day.closeTime) {
          const openTime = day.openTime.slice(0, 5).split(":").map(Number);
          const closeTime = day.closeTime.slice(0, 5).split(":").map(Number);
          const open = new Date(year, month - 1, dayOfMonth, openTime[0], openTime[1]);
          const close = new Date(year, month - 1, dayOfMonth, closeTime[0], closeTime[1]);

          (day.intervals || []).forEach((interval) => {
            const startTime = interval.startTime.slice(0, 5).split(":").map(Number);
            const endTime = interval.endTime.slice(0, 5).split(":").map(Number);
            builtEvents.push({
              title: "Intervalo",
              start: new Date(year, month - 1, dayOfMonth, startTime[0], startTime[1]),
              end: new Date(year, month - 1, dayOfMonth, endTime[0], endTime[1]),
              type: "closed"
            });
          });

          builtEvents.push({
            title: "Fechado",
            start: new Date(year, month - 1, dayOfMonth, 0, 0),
            end: open,
            type: "closed"
          });
          builtEvents.push({
            title: "Fechado",
            start: close,
            end: new Date(year, month - 1, dayOfMonth, 23, 59),
            type: "closed"
          });
        } else {
          builtEvents.push({
            title: "Fechado",
            start: new Date(year, month - 1, dayOfMonth, 0, 0),
            end: new Date(year, month - 1, dayOfMonth, 23, 59),
            type: "closed"
          });
        }

        (day.bookedSlots || []).forEach((slot) => {
          const start = parseLocalDateTime(slot.start);
          builtEvents.push({
            title: `${slot.name || "Agendado"}${slot.serviceName ? " · " + slot.serviceName : ""}`,
            start,
            end: addMinutes(start, slot.durationMinutes || 30),
            type: "booked",
            color: slot.serviceColor,
            isoStart: slot.start,
            name: slot.name,
            telephone: slot.telephone,
            serviceName: slot.serviceName
          });
        });
      });

      setEvents(builtEvents);
    } catch (error) {
      toast.error("Erro ao buscar a agenda semanal.", { containerId: TOAST_CONTAINER_ID });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAvailableLogin()) {
      setMobile(isMobile());
      fetchAvailability();
    } else {
      navigate("/" + companyUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyUrl, navigate, range]);

  const eventPropGetter = useMemo(
    () => (event) => ({
      style: {
        backgroundColor: event.type === "closed" ? "#f1f3f4" : event.color || "#4285F4",
        color: event.type === "closed" ? "#70757a" : "#fff",
        borderRadius: "6px",
        border: "none"
      }
    }),
    []
  );

  const handleNavigate = (action, view, date) => {
    const days = view === "day" ? 1 : 7;
    if (action === "TODAY") {
      const start = view === "day" ? new Date() : startOfWeek(new Date(), { locale: ptBR });
      setRange({ start, days, view });
      return;
    }
    if (action === "PREV") {
      setRange((prev) => ({ start: addDays(prev.start, -prev.days), days: prev.days, view: prev.view }));
      return;
    }
    if (action === "NEXT") {
      setRange((prev) => ({ start: addDays(prev.start, prev.days), days: prev.days, view: prev.view }));
      return;
    }
    setRange({ start: view === "day" ? date : startOfWeek(date, { locale: ptBR }), days, view });
  };

  const handleViewChange = (newView) => {
    setRange((prev) => {
      if (newView === "day") {
        const today = new Date();
        const diffFromStart = differenceInCalendarDays(today, prev.start);
        const todayWithinRange = diffFromStart >= 0 && diffFromStart <= prev.days - 1;
        return { start: todayWithinRange ? today : prev.start, days: 1, view: "day" };
      }
      return { start: startOfWeek(prev.start, { locale: ptBR }), days: 7, view: "week" };
    });
  };

  const handleSelectMiniCalendarDate = (dates) => {
    const selected = dates[0];
    if (!selected) return;
    setRange({ start: startOfWeek(selected, { locale: ptBR }), days: 7, view: "week" });
  };

  const handleSelectEvent = (event) => {
    if (event.type !== "booked") return;
    setSelectedEvent(event);
  };

  const closeEventDetail = () => {
    setSelectedEvent(null);
    setShowEditDialog(false);
    setShowConfirmDelete(false);
  };

  const openEditDialog = () => {
    const [date, time] = selectedEvent.isoStart.split("T");
    setEditSchedule({ date, time: paraHoraSemSegundos(time) });
    setShowEditDialog(true);
  };

  const saveEdit = async () => {
    try {
      const response = await updateSchedule(companyUrl, {
        old: selectedEvent.isoStart,
        new: `${editSchedule.date}T${editSchedule.time}:00`
      });
      if (response.status === 200) {
        toast.success(response.data, { containerId: TOAST_CONTAINER_ID });
        fetchAvailability();
        closeEventDetail();
      }
    } catch (error) {
      toast.error("Erro ao alterar o agendamento.", { containerId: TOAST_CONTAINER_ID });
    }
  };

  const handleConfirmDelete = async (onlyUncheck) => {
    try {
      const response = await removeReservedScheduleByOwner(companyUrl, selectedEvent.isoStart, onlyUncheck);
      if (response.status === 200) {
        toast.success(response.data, { containerId: TOAST_CONTAINER_ID });
        fetchAvailability();
        closeEventDetail();
      } else {
        toast.error("Erro ao cancelar o agendamento.", { containerId: TOAST_CONTAINER_ID });
      }
    } catch (error) {
      toast.error("Erro ao cancelar o agendamento.", { containerId: TOAST_CONTAINER_ID });
    }
  };

  return (
    <>
      <Topbar {...companyInfo} loggedIn />
      <Container
        $width="100%"
        $display="flex"
        $flexdirection="column"
        $padding="0"
        $margin="0"
        $backgroundcolor="transparent"
        $boxshadow="none"
      >
        <Sidebar>
          <PageWrapper>
            {!mobile && (
              <MiniCalendarPanel>
                <MiniCalendarStyle>
                  <Flatpickr
                    value={range.start}
                    onChange={handleSelectMiniCalendarDate}
                    options={{
                      inline: true,
                      locale: Portuguese,
                      dateFormat: "d/m/Y",
                      monthSelectorType: "static"
                    }}
                  />
                </MiniCalendarStyle>
              </MiniCalendarPanel>
            )}
            <MainColumn>
              {!loading && !hasAnyOpenDay && (
                <ConfigBanner>
                  <span>
                    Nenhum horário de funcionamento configurado para este período. Configure os dias e horários de abertura para que os agendamentos disponíveis apareçam aqui.
                  </span>
                  <ConfigBannerLink href="/configurar-horario-semanal">
                    Configurar horários
                  </ConfigBannerLink>
                </ConfigBanner>
              )}
              <CalendarArea>
                {loading && (
                  <LoadingWrapper>
                    <span className="loader" />
                  </LoadingWrapper>
                )}
                {!loading && (
                  <CalendarGlobalStyle>
                    <Calendar
                      localizer={localizer}
                      culture="pt-BR"
                      messages={messages}
                      events={events}
                      views={["week", "day"]}
                      view={range.view}
                      date={range.start}
                      scrollToTime={new Date(1970, 0, 1, 7, 0, 0)}
                      onNavigate={(date, view, action) => handleNavigate(action, view, date)}
                      onView={handleViewChange}
                      onSelectEvent={handleSelectEvent}
                      eventPropGetter={eventPropGetter}
                      components={components}
                      style={{ height: "100%" }}
                    />
                  </CalendarGlobalStyle>
                )}
              </CalendarArea>
            </MainColumn>
          </PageWrapper>
          <ToastContainer
            containerId={TOAST_CONTAINER_ID}
            position={mobile ? "bottom-center" : "top-right"}
            autoClose={3000}
            style={mobile ? { margin: "0 5% 1rem 5%", width: "90%" } : undefined}
          />

          {/* DETALHES DO AGENDAMENTO */}
          <Dialog open={!!selectedEvent && !showEditDialog && !showConfirmDelete} onClose={closeEventDetail} mobile={mobile}>
            {selectedEvent && (
              <>
                <Title $fontweight="600" $fontsize="1.1rem" $color="var(--color-brown)" $texttransform="uppercase">
                  Agendamento
                </Title>
                <Separator $width="100%" $bordercolor="var(--color-olive)" $margin="0.75rem 0 1.5rem 0" $style="dotted" />

                <DetailRow>
                  <DetailLabel>Cliente</DetailLabel>
                  <DetailValue>{selectedEvent.name || "-"}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Telefone</DetailLabel>
                  <DetailValue>
                    {selectedEvent.telephone ? formataNumeroTelefone(selectedEvent.telephone) : "-"}
                  </DetailValue>
                </DetailRow>
                {selectedEvent.serviceName && (
                  <DetailRow>
                    <DetailLabel>Serviço</DetailLabel>
                    <DetailValue>{selectedEvent.serviceName}</DetailValue>
                  </DetailRow>
                )}
                <DetailRow>
                  <DetailLabel>Data</DetailLabel>
                  <DetailValue>{format(selectedEvent.start, "dd/MM/yyyy")}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Horário</DetailLabel>
                  <DetailValue>
                    {format(selectedEvent.start, "HH:mm")} – {format(selectedEvent.end, "HH:mm")}
                  </DetailValue>
                </DetailRow>

                {isEventScheduled(selectedEvent) && (
                  <DetailActions>
                    {selectedEvent.telephone && (
                      <DetailIconButton
                        type="button"
                        title="Falar no WhatsApp"
                        onClick={() => openWhatsApp(selectedEvent.telephone)}
                      >
                        <PhoneIcon color="green" size={18} />
                      </DetailIconButton>
                    )}
                    <DetailIconButton type="button" title="Editar horário" onClick={openEditDialog}>
                      <ClipboardPenLineIcon color="#007bff" size={18} />
                    </DetailIconButton>
                    <DetailIconButton type="button" title="Cancelar agendamento" onClick={() => setShowConfirmDelete(true)}>
                      <CircleXIcon color="red" size={18} />
                    </DetailIconButton>
                  </DetailActions>
                )}
              </>
            )}
          </Dialog>

          {/* EDITAR HORÁRIO */}
          <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} mobile={mobile}>
            <Title $fontweight="600" $fontsize="1.1rem" $color="var(--color-brown)" $texttransform="uppercase">
              Altere o agendamento
            </Title>
            <Separator $width="100%" $bordercolor="var(--color-olive)" $margin="0.75rem 0 2rem 0" $style="dotted" />

            <Label>Data:</Label>
            <DialogInput
              type="date"
              value={editSchedule.date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setEditSchedule({ ...editSchedule, date: e.target.value })}
            />

            <Label>Horário:</Label>
            <DialogInput
              value={editSchedule.time}
              onChange={(e) => setEditSchedule({ ...editSchedule, time: maskTime(e.target.value) })}
            />

            <Container $display="flex" $justifycontent="space-between" $backgroundcolor="transparent" $boxshadow="none">
              <Button type="button" variant="link" onClick={() => setShowEditDialog(false)}>Voltar</Button>
              <Button type="button" variant="confirm" onClick={saveEdit}>Salvar</Button>
            </Container>
          </Dialog>

          {/* CONFIRMAÇÃO DE CANCELAMENTO */}
          <ConfirmDialog
            isOpen={showConfirmDelete}
            title="Confirmação"
            message="Existe um agendamento vigente. Deseja apagar mesmo assim?"
            onConfirm={() => handleConfirmDelete(false)}
            onCancel={() => handleConfirmDelete(true)}
            close={() => setShowConfirmDelete(false)}
            confirmText="Confirmar"
            cancelText="Apenas cancelar"
          />
        </Sidebar>
      </Container>
    </>
  );
}

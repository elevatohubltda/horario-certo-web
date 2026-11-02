import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RefreshCw } from "lucide-react";
import { Button, Modal, errorMessage } from "../admin";
import { rescheduleCustomerAppointment } from "../../services/endpoints/customer";
import { formatSchedulesToISO } from "../../util/format";

const Banner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  width: ${(p) => p.$width || "80%"};
  max-width: 100%;
  box-sizing: border-box;
  margin: 1rem auto 0;
  padding: 0.85rem 1.1rem;
  border-radius: var(--ui-radius);
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1e3a8a;
  font-size: 0.875rem;

  .text {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const formatOld = (value) => {
  const [date, time = ""] = value.split("T");
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year} às ${time.slice(0, 5)}`;
};

// Aviso na agenda da empresa enquanto o cliente escolhe o novo horário
export function RescheduleBanner({ appointment, width }) {
  const navigate = useNavigate();
  return (
    <Banner $width={width}>
      <span className="text">
        <RefreshCw size={16} />
        <span>
          Remarcando <strong>{appointment.serviceName || "seu atendimento"}</strong>
          {appointment.professionalName ? ` com ${appointment.professionalName}` : ""} (antes: {formatOld(appointment.schedule)}).
          Escolha o novo horário.
        </span>
      </span>
      <Button $variant="outline" type="button" onClick={() => navigate("/area-do-cliente")}>
        Desistir
      </Button>
    </Banner>
  );
}

// Confirmação do novo horário; target = { data: "dd/mm/aaaa", horario: "hh:mm" }
export function RescheduleConfirm({ appointment, target, onClose }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    setSaving(true);
    try {
      const [schedule] = formatSchedulesToISO({ date: target.data, schedules: [target.horario] });
      await rescheduleCustomerAppointment(appointment.id, schedule);
      toast.success("Agendamento remarcado!");
      navigate("/area-do-cliente");
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível remarcar. Escolha outro horário."));
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!target}
      title="Confirmar novo horário"
      onClose={onClose}
      footer={
        <>
          <Button $variant="outline" type="button" onClick={onClose}>Voltar</Button>
          <Button type="button" onClick={confirm} disabled={saving}>
            {saving ? "Remarcando..." : "Remarcar"}
          </Button>
        </>
      }
    >
      {target && (
        <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.5, color: "var(--ui-text-secondary)" }}>
          Mudar <strong>{appointment.serviceName || "seu atendimento"}</strong> de {formatOld(appointment.schedule)} para{" "}
          <strong>{target.data} às {target.horario}</strong>?
        </p>
      )}
    </Modal>
  );
}

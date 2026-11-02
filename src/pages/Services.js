import React, { useEffect, useState } from "react";
import styled from "styled-components";
import "../styles/index.css";
import Cookies from "js-cookie";
import { PageLayout, Button as UiButton } from "../components/admin";
import { isAvailableLogin, isProfessional } from "../util/auth";
import { getProfessionals } from "../services/endpoints/professional";
import { useNavigate } from "react-router-dom";
import { isMobile } from "../util/util";
import { Title } from "../components/title";
import { Separator } from "../components/separator/style";
import { ToastContainer, toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { PlusIcon, Pencil, Trash2 } from "lucide-react";
import Dialog from "../components/dialog";
import {
  getServices,
  createService,
  updateService,
  deleteService,
  updateServiceStatus,
} from "../services/endpoints/service";
import { SERVICE_COLOR_PALETTE, DEFAULT_SERVICE_COLOR } from "../util/serviceColors";

/* =======================
   Styled Components
======================= */

const ServiceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
`;

const ServiceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: #fff;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  box-shadow: var(--ui-card-shadow);
  padding: 0.85rem 1rem;
  font-size: 0.9rem;
  color: var(--ui-text);
`;

const ServiceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
`;

const ServiceTexts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const ColorDot = styled.span`
  width: 12px;
  height: 12px;
  min-width: 12px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color || "#4285F4"};
`;

const ColorSwatchGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1rem;
`;

const ColorSwatch = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  border: 2px solid ${({ $selected }) => ($selected ? "var(--ui-primary)" : "transparent")};
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  padding: 0;
  transition: transform 0.15s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const ServiceName = styled.span`
  font-weight: 500;
  color: ${({ $active }) =>
    $active === false ? "var(--ui-muted)" : "var(--ui-text)"};
`;

const ServicePrice = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ $active }) =>
    $active === false ? "var(--ui-muted)" : "var(--ui-text-secondary)"};
`;

const StatusAction = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-sm);
  background: #fff;
  color: var(--ui-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    color: var(--ui-text);
  }
`;

const DeleteIconButton = styled(IconButton)`
  &:hover {
    background: #fef2f2;
    border-color: #fecaca;
    color: var(--ui-danger);
  }
`;

const StatusLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ $active }) =>
    $active === false ? "var(--ui-muted)" : "var(--ui-text-secondary)"};
`;

const StatusSwitch = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 50px;
  height: 30px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: ${({ $active }) =>
    $active === false ? "#d1d5db" : "var(--ui-primary)"};
  cursor: pointer;
  transition: background-color 0.2s ease;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);

  &:hover {
    background: ${({ $active }) =>
      $active === false ? "#9ca3af" : "#374151"};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.15);
  }
`;

const SwitchThumb = styled.span`
  position: absolute;
  top: 3px;
  left: ${({ $active }) => ($active === false ? "3px" : "23px")};
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff;
  transition: left 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
`;

const EmptyState = styled.div`
  padding: 2rem;
  background: #fff;
  border: 1px dashed var(--ui-input-border);
  border-radius: var(--ui-radius);
  text-align: center;
  color: var(--ui-muted);
  font-size: 0.9rem;
`;

const ModalLabel = styled.label`
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ui-text-secondary);
  margin-bottom: 0.35rem;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--ui-input-border);
  border-radius: var(--ui-radius-sm);
  background-color: #fff;
  color: var(--ui-text);
  font-size: 0.9rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--ui-primary);
  }
`;

const ProfessionalPriceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.25rem;
`;

const ProfessionalPriceRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 120px;
  align-items: center;
  gap: 0.5rem;

  label {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.85rem;
    color: var(--ui-text);
    cursor: pointer;
  }
`;

const ErrorMessage = styled.p`
  color: var(--ui-danger);
  font-size: 0.8rem;
  margin: 0.4rem 0 0 0;
`;

const Form = styled.form`
  width: 100%;
  background: transparent;
  box-shadow: none;
  border: none;
  padding: 0;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  margin: 0;
  width: 100%;
  margin-top: 1rem;
  gap: 0.5rem;
`;

/* =======================
   Component
======================= */

export default function Services() {
  const TOAST_CONTAINER_ID = "services-toast";
  const companyUrl = Cookies.get("companyUrl");
  const navigate = useNavigate();
  const [mobile, setMobile] = useState();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState("");
  const [newServiceColor, setNewServiceColor] = useState(DEFAULT_SERVICE_COLOR);
  const [nameError, setNameError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [durationError, setDurationError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  // Com mais de um profissional, o dono escolhe quem presta o serviço e o valor de cada um
  const [professionals, setProfessionals] = useState([]);
  // { [professionalId]: "R$ 0,00" } — presença na chave = profissional selecionado; vazio = valor padrão
  const [professionalPrices, setProfessionalPrices] = useState({});
  // Percentual que fica com o dono quando um profissional da equipe faz o serviço
  const [newServiceCommission, setNewServiceCommission] = useState("");
  const multiProfessional = professionals.length > 1;
  const ownerProfessionalId = professionals.find((p) => p.isOwner)?.id ?? null;
  // Profissional da equipe num serviço compartilhado: só altera o próprio valor
  const onlyOwnPrice = isProfessional() && editingService?.canEditDetails === false;

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const formatPriceInput = (value) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    return (Number(digits) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const parsePriceInput = (value) => {
    const digits = value.replace(/\D/g, "");
    return digits ? Number(digits) / 100 : 0;
  };

  const formatPercent = (value) => `${Number(value || 0).toLocaleString("pt-BR")}%`;
  // Quanto o profissional recebe: o valor do atendimento menos a parte do estabelecimento
  const professionalShare = (price, percent) => Number(price || 0) * (1 - Number(percent || 0) / 100);

  // Exemplo com o valor e o percentual digitados, para o dono ver na hora como fica a divisão
  const commissionExample = (() => {
    const percent = Number(String(newServiceCommission || "").replace(",", "."));
    const price = parsePriceInput(newServicePrice || "");
    if (!price || !percent || percent < 0 || percent > 100) return null;
    return `Exemplo: num atendimento de ${formatCurrency(price)}, o estabelecimento fica com ${formatCurrency(
      price * (percent / 100)
    )} e o profissional com ${formatCurrency(professionalShare(price, percent))}.`;
  })();

  const fetchServices = async () => {
    try {
      const response = await getServices(companyUrl);
      if (response.status === 200) {
        setServices(response.data);
      }
    } catch (error) {
      toast.error("Erro ao carregar os serviços", {
        containerId: TOAST_CONTAINER_ID,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessionals = async () => {
    try {
      const response = await getProfessionals(companyUrl);
      setProfessionals((response.data?.professionals || []).filter((p) => p.active));
    } catch {
      setProfessionals([]);
    }
  };

  useEffect(() => {
    if (isAvailableLogin()) {
      setMobile(isMobile());
      setLoading(false);
      fetchServices();
      // Profissional da equipe só gerencia os próprios serviços: não escolhe profissional
      if (!isProfessional()) fetchProfessionals();
    } else {
      navigate("/" + companyUrl);
    }
    // eslint-disable-next-line
  }, []);

  const openModal = () => {
    setEditingService(null);
    setProfessionalPrices(ownerProfessionalId ? { [ownerProfessionalId]: "" } : {});
    setNewServiceCommission("");
    setNewServiceName("");
    setNewServicePrice("");
    setNewServiceDuration("");
    setNewServiceColor(DEFAULT_SERVICE_COLOR);
    setNameError("");
    setPriceError("");
    setDurationError("");
    setShowModal(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setProfessionalPrices(
      Object.fromEntries((service.professionals || []).map((p) => [p.professionalId, formatCurrency(p.price)]))
    );
    setNewServiceCommission(
      service.commissionPercent != null && Number(service.commissionPercent) > 0 ? String(Number(service.commissionPercent)) : ""
    );
    setNewServiceName(service.name);
    setNewServicePrice(formatCurrency(service.price));
    setNewServiceDuration(String(service.durationMinutes || ""));
    setNewServiceColor(service.color || DEFAULT_SERVICE_COLOR);
    setNameError("");
    setPriceError("");
    setDurationError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    setNewServiceName("");
    setNewServicePrice("");
    setNewServiceDuration("");
    setNewServiceColor(DEFAULT_SERVICE_COLOR);
    setNameError("");
    setPriceError("");
    setDurationError("");
  };

  // Um mesmo serviço reúne todos os profissionais que o prestam, então o nome não se repete
  const isDuplicateName = (name) => {
    const trimmed = name.trim().toLowerCase();
    return services.some(
      (s) => s.name.trim().toLowerCase() === trimmed && (!editingService || s.id !== editingService.id)
    );
  };

  const toggleProfessional = (professionalId) =>
    setProfessionalPrices((prev) => {
      const next = { ...prev };
      if (professionalId in next) delete next[professionalId];
      else next[professionalId] = "";
      return next;
    });

  const handleNameChange = (value) => {
    setNewServiceName(value);
    const trimmed = value.trim().toLowerCase();
    const exists = isDuplicateName(value);
    if (trimmed && exists) {
      setNameError("Esse serviço já está cadastrado.");
    } else {
      setNameError("");
    }
  };

  const handlePriceChange = (value) => {
    const formatted = formatPriceInput(value);
    setNewServicePrice(formatted);

    if (!formatted) {
      setPriceError("");
      return;
    }

    if (parsePriceInput(formatted) <= 0) {
      setPriceError("Informe um valor maior que R$ 0,00.");
      return;
    }

    setPriceError("");
  };

  const handleSave = async () => {
    const trimmed = newServiceName.trim();
    const parsedPrice = parsePriceInput(newServicePrice);
    const parsedDuration = parseInt(newServiceDuration, 10);
    if (!trimmed) {
      setNameError("Digite o nome do serviço.");
      return;
    }
    if (!newServicePrice || parsedPrice <= 0) {
      setPriceError("Digite o valor do serviço.");
      return;
    }
    if (!newServiceDuration || isNaN(parsedDuration) || parsedDuration <= 0) {
      setDurationError("Digite a duração do serviço em minutos.");
      return;
    }
    const exists = !onlyOwnPrice && isDuplicateName(trimmed);
    if (exists) {
      setNameError("Esse serviço já está cadastrado.");
      return;
    }
    const selectedProfessionals = Object.keys(professionalPrices);
    if (multiProfessional && selectedProfessionals.length === 0) {
      toast.error("Selecione pelo menos um profissional para o serviço.", { containerId: TOAST_CONTAINER_ID });
      return;
    }
    const parsedCommission = newServiceCommission === "" ? 0 : Number(String(newServiceCommission).replace(",", "."));
    if (multiProfessional && (Number.isNaN(parsedCommission) || parsedCommission < 0 || parsedCommission > 100)) {
      toast.error("A parte do estabelecimento deve ficar entre 0% e 100%.", { containerId: TOAST_CONTAINER_ID });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: trimmed,
        price: parsedPrice,
        durationMinutes: parsedDuration,
        color: newServiceColor,
        // Valor em branco usa o valor padrão do serviço
        ...(multiProfessional
          ? {
              commissionPercent: parsedCommission,
              professionals: selectedProfessionals.map((id) => ({
                professionalId: Number(id),
                price: parsePriceInput(professionalPrices[id] || "") || parsedPrice,
              })),
            }
          : {}),
      };
      const response = editingService
        ? await updateService(companyUrl, editingService.id, payload)
        : await createService(companyUrl, payload);
      if (response.status === 200 || response.status === 201) {
        toast.success(
          editingService
            ? "Serviço atualizado com sucesso!"
            : "Serviço cadastrado com sucesso!",
          { containerId: TOAST_CONTAINER_ID }
        );
        closeModal();
        fetchServices();
      } else {
        toast.error(
          editingService ? "Erro ao atualizar o serviço" : "Erro ao cadastrar o serviço",
          { containerId: TOAST_CONTAINER_ID }
        );
      }
    } catch (error) {
      toast.error(
        editingService ? "Erro ao atualizar o serviço" : "Erro ao cadastrar o serviço",
        { containerId: TOAST_CONTAINER_ID }
      );
    } finally {
      setSaving(false);
    }
  };

  const openDeleteConfirm = (service) => setDeleteTarget(service);
  const closeDeleteConfirm = () => setDeleteTarget(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteService(companyUrl, deleteTarget.id);
      toast.success(
        deleteTarget.canEditDetails === false ? "Você saiu do serviço." : "Serviço excluído com sucesso!",
        { containerId: TOAST_CONTAINER_ID }
      );
      setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      if (error?.response?.status === 409) {
        toast.error(
          error.response.data ||
            "Não é possível excluir um serviço que já possui agendamentos. Inative-o em vez de excluir.",
          { containerId: TOAST_CONTAINER_ID }
        );
      } else {
        toast.error("Erro ao excluir o serviço", {
          containerId: TOAST_CONTAINER_ID,
        });
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (service) => {
    try {
      const nextActive = service.active === false;
      const response = await updateServiceStatus(companyUrl, service.id, nextActive);
      if (response.status === 200 || response.status === 204) {
        toast.success(
          nextActive
            ? "Serviço ativado com sucesso!"
            : "Serviço inativado com sucesso!",
          { containerId: TOAST_CONTAINER_ID }
        );
        setServices((prev) =>
          prev.map((item) =>
            item.id === service.id ? { ...item, active: nextActive } : item
          )
        );
      } else {
        toast.error("Erro ao atualizar o status do serviço", {
          containerId: TOAST_CONTAINER_ID,
        });
      }
    } catch (error) {
      toast.error("Erro ao atualizar o status do serviço", {
        containerId: TOAST_CONTAINER_ID,
      });
    }
  };

  return (
    <>
      <PageLayout
        title="Serviços"
        subtitle={loading
          ? "Carregando..."
          : `${services.length} serviço${services.length !== 1 ? "s" : ""} cadastrado${services.length !== 1 ? "s" : ""}`}
        actions={
          <UiButton onClick={openModal}>
            <PlusIcon size={16} />
            Novo serviço
          </UiButton>
        }
      >

          {!loading && services.length === 0 && (
            <EmptyState>
              Nenhum serviço cadastrado ainda. Clique em{" "}
              <strong>Novo serviço</strong> para adicionar.
            </EmptyState>
          )}

          {!loading && services.length > 0 && (
            <ServiceList>
              {services.map((service) => (
                <ServiceRow key={service.id}>
                  <ServiceInfo>
                    <ColorDot $color={service.color} />
                    <ServiceTexts>
                      <ServiceName $active={service.active}>{service.name}</ServiceName>
                      <ServicePrice $active={service.active}>
                        {multiProfessional && service.professionals?.length > 0
                          ? `${service.durationMinutes} min · ${service.professionals
                              .map((p) => `${p.professionalName} ${formatCurrency(p.price)}`)
                              .join(" · ")}`
                          : `${formatCurrency(service.price)} · ${service.durationMinutes} min`}
                        {isProfessional() && service.canEditDetails === false ? " · compartilhado" : ""}
                        {multiProfessional && Number(service.commissionPercent) > 0
                          ? ` · estabelecimento fica com ${formatPercent(service.commissionPercent)} nos atendimentos da equipe`
                          : ""}
                        {isProfessional() && Number(service.commissionPercent) > 0
                          ? ` · estabelecimento fica com ${formatPercent(service.commissionPercent)} · você recebe ${formatCurrency(
                              professionalShare(service.price, service.commissionPercent)
                            )}`
                          : ""}
                      </ServicePrice>
                    </ServiceTexts>
                  </ServiceInfo>
                  <StatusAction>
                    <StatusLabel $active={service.active}>
                      {service.active === false ? "Inativo" : "Ativo"}
                    </StatusLabel>
                    <StatusSwitch
                      type="button"
                      role="switch"
                      aria-checked={service.active !== false}
                      aria-label={service.active === false ? "Ativar serviço" : "Inativar serviço"}
                      $active={service.active}
                      title={
                        service.canEditDetails === false
                          ? "Só o dono ativa ou inativa um serviço compartilhado"
                          : service.active === false ? "Ativar serviço" : "Inativar serviço"
                      }
                      disabled={service.canEditDetails === false}
                      onClick={() => handleToggleStatus(service)}
                    >
                      <SwitchThumb $active={service.active} />
                    </StatusSwitch>
                    <IconButton
                      type="button"
                      title="Editar serviço"
                      aria-label="Editar serviço"
                      onClick={() => openEditModal(service)}
                    >
                      <Pencil size={16} />
                    </IconButton>
                    <DeleteIconButton
                      type="button"
                      title={service.canEditDetails === false ? "Sair do serviço" : "Excluir serviço"}
                      aria-label={service.canEditDetails === false ? "Sair do serviço" : "Excluir serviço"}
                      onClick={() => openDeleteConfirm(service)}
                    >
                      <Trash2 size={16} />
                    </DeleteIconButton>
                  </StatusAction>
                </ServiceRow>
              ))}
            </ServiceList>
          )}

          <ToastContainer
            containerId={TOAST_CONTAINER_ID}
            position={mobile ? "bottom-center" : "top-right"}
            autoClose={3000}
            style={mobile ? { margin: '0 5% 1rem 5%', width: '90%' } : undefined}
          />
      </PageLayout>

      <Dialog open={showModal} onClose={closeModal} mobile={mobile}>
        <Title
          $padding="0"
          $margin="0 0 0.5rem 0"
          $fontweight="600"
          $fontsize="1.25rem"
          $color="var(--ui-text)"
        >
          {editingService ? "Editar serviço" : "Novo serviço"}
        </Title>

        <Separator
          $width="100%"
          $bordercolor="var(--ui-border)"
          $margin="0 0 1rem 0"
          $style="dotted"
        />
        <Form>
            {onlyOwnPrice && (
              <ErrorMessage style={{ color: "#6b7280" }}>
                Este serviço é compartilhado com outros profissionais: você pode alterar só o seu valor.
              </ErrorMessage>
            )}
            <ModalLabel htmlFor="service-name">Nome do serviço</ModalLabel>
            <ModalInput
            id="service-name"
            type="text"
            placeholder="Ex: Consulta de 1 hora"
            value={newServiceName}
            disabled={onlyOwnPrice}
            onChange={(e) => handleNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !nameError) {
                e.preventDefault();
                handleSave();
              }
            }}
            autoFocus
            />
            {nameError && <ErrorMessage>{nameError}</ErrorMessage>}

            <ModalLabel htmlFor="service-price">
              {onlyOwnPrice ? "Seu valor em R$" : multiProfessional ? "Valor padrão em R$" : "Valor do serviço em R$"}
            </ModalLabel>
            <ModalInput
            id="service-price"
            type="text"
            placeholder="R$ 0,00"
            value={newServicePrice}
            onChange={(e) => handlePriceChange(e.target.value)}
            inputMode="numeric"
            />
            {priceError && <ErrorMessage>{priceError}</ErrorMessage>}
            {isProfessional() && Number(editingService?.commissionPercent) > 0 && (
              <ErrorMessage style={{ color: "#6b7280", marginTop: 0 }}>
                O estabelecimento fica com {formatPercent(editingService.commissionPercent)} de cada atendimento deste
                serviço (definido pelo dono). Com esse valor, você recebe{" "}
                {formatCurrency(professionalShare(parsePriceInput(newServicePrice || ""), editingService.commissionPercent))}{" "}
                por atendimento.
              </ErrorMessage>
            )}

            {multiProfessional && (
              <>
                <ModalLabel>Profissionais e valores</ModalLabel>
                <ProfessionalPriceList>
                  {professionals.map((p) => {
                    const selected = p.id in professionalPrices;
                    return (
                      <ProfessionalPriceRow key={p.id}>
                        <label>
                          <input type="checkbox" checked={selected} onChange={() => toggleProfessional(p.id)} />
                          {p.name}{p.isOwner ? " (você)" : ""}
                        </label>
                        <ModalInput
                          type="text"
                          inputMode="numeric"
                          placeholder={newServicePrice || "Valor padrão"}
                          value={professionalPrices[p.id] || ""}
                          disabled={!selected}
                          onChange={(e) =>
                            setProfessionalPrices((prev) => ({ ...prev, [p.id]: formatPriceInput(e.target.value) }))
                          }
                        />
                      </ProfessionalPriceRow>
                    );
                  })}
                </ProfessionalPriceList>
                <ErrorMessage style={{ color: "#6b7280", marginTop: 0 }}>
                  Deixe o valor em branco para usar o valor padrão.
                </ErrorMessage>

                <ModalLabel htmlFor="service-commission">Parte do estabelecimento nos atendimentos da equipe (%)</ModalLabel>
                <ModalInput
                  id="service-commission"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  placeholder="Ex: 40"
                  value={newServiceCommission}
                  onChange={(e) => setNewServiceCommission(e.target.value)}
                />
                <ErrorMessage style={{ color: "#6b7280", marginTop: 0 }}>
                  Quanto do valor do atendimento fica com o estabelecimento (você) quando um profissional da equipe faz
                  este serviço. O profissional fica com o restante. Nos seus próprios atendimentos o valor é todo seu.
                  {commissionExample && <><br />{commissionExample}</>}
                </ErrorMessage>
              </>
            )}

            <ModalLabel htmlFor="service-duration">Duração do serviço (minutos)</ModalLabel>
            <ModalInput
            id="service-duration"
            type="number"
            min="1"
            placeholder="Ex: 30"
            value={newServiceDuration}
            disabled={onlyOwnPrice}
            onChange={(e) => { setNewServiceDuration(e.target.value); setDurationError(""); }}
            />
            {durationError && <ErrorMessage>{durationError}</ErrorMessage>}

            {!onlyOwnPrice && <ModalLabel>Cor do serviço</ModalLabel>}
            {!onlyOwnPrice && <ColorSwatchGrid>
              {SERVICE_COLOR_PALETTE.map((color) => (
                <ColorSwatch
                  key={color.hex}
                  type="button"
                  $color={color.hex}
                  $selected={newServiceColor === color.hex}
                  title={color.name}
                  aria-label={color.name}
                  onClick={() => setNewServiceColor(color.hex)}
                />
              ))}
            </ColorSwatchGrid>}

            <ModalActions>
                <Button 
                    type="button" 
                    variant="link"
                    onClick={closeModal}
                >
                    Cancelar
                </Button>
                <Button
                  type="button"
                    variant="primary"
                    onClick={handleSave}
                    disabled={
                      !!nameError ||
                      !!priceError ||
                      !!durationError ||
                      !newServiceName.trim() ||
                      !newServicePrice ||
                      !newServiceDuration ||
                      saving
                    }
                >
                    {saving ? "Salvando..." : editingService ? "Salvar alterações" : "Salvar"}
                </Button>
            </ModalActions>
        </Form>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={closeDeleteConfirm} mobile={mobile}>
        <Title
          $padding="0"
          $margin="0 0 0.5rem 0"
          $fontweight="600"
          $fontsize="1.25rem"
          $color="var(--ui-text)"
        >
          {deleteTarget?.canEditDetails === false ? "Sair do serviço" : "Excluir serviço"}
        </Title>
        <Separator
          $width="100%"
          $bordercolor="var(--ui-border)"
          $margin="0 0 1rem 0"
          $style="dotted"
        />
        <Form>
          <p style={{ fontSize: "0.9rem", color: "var(--ui-text-secondary)", margin: "0 0 1.5rem 0" }}>
            {deleteTarget?.canEditDetails === false ? (
              <>Deixar de prestar o serviço <strong>{deleteTarget?.name}</strong>? Ele continua disponível com os outros profissionais.</>
            ) : (
              <>Tem certeza que deseja excluir o serviço <strong>{deleteTarget?.name}</strong>? Essa ação não pode ser desfeita.</>
            )}
          </p>
          <ModalActions>
            <Button type="button" variant="link" onClick={closeDeleteConfirm}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Excluindo..." : "Excluir"}
            </Button>
          </ModalActions>
        </Form>
      </Dialog>
    </>
  );
}

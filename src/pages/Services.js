import React, { useEffect, useState } from "react";
import styled from "styled-components";
import "../styles/index.css";
import Topbar from "../components/topbar";
import { Container } from "../components/container/style";
import Cookies from "js-cookie";
import Sidebar from "../components/sidebar";
import { isAvailableLogin } from "../util/auth";
import { useNavigate } from "react-router-dom";
import { isMobile } from "../util/util";
import { Title } from "../components/title";
import { Separator } from "../components/separator/style";
import { ToastContainer, toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { PlusIcon } from "lucide-react";
import Dialog from "../components/dialog";
import {
  getServices,
  createService,
  updateServiceStatus,
} from "../services/endpoints/service";

/* =======================
   Styled Components
======================= */

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(100% - 2rem);
  margin: 0 1rem 1rem 1rem;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background-color: var(--color-sage);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--color-olive);
  }
`;

const ServiceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: calc(100% - 2rem);
  margin: 0 1rem;
`;

const ServiceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1px solid var(--color-olive);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  color: var(--color-dark);
`;

const ServiceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const ServiceName = styled.span`
  font-weight: 500;
  color: ${({ $active }) =>
    $active === false ? "var(--color-muted)" : "var(--color-dark)"};
`;

const ServicePrice = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ $active }) =>
    $active === false ? "var(--color-muted)" : "var(--color-sage)"};
`;

const StatusAction = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const StatusLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ $active }) =>
    $active === false ? "var(--color-muted)" : "var(--color-sage)"};
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
    $active === false ? "#d6ddd6" : "#2d8cf0"};
  cursor: pointer;
  transition: background-color 0.2s ease;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);

  &:hover {
    background: ${({ $active }) =>
      $active === false ? "#c5d0c5" : "#1976d2"};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(45, 140, 240, 0.18);
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
  width: initial;
  margin: 0 1rem;
  padding: 2rem;
  border: 2px dashed var(--color-olive);
  border-radius: 8px;
  text-align: center;
  color: var(--color-muted);
  font-size: 0.9rem;
`;

const ModalLabel = styled.label`
  display: block;
  font-size: 0.8rem;
  color: var(--color-earth);
  margin-bottom: 0.4rem;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-sage);
  border-radius: 6px;
  background-color: #fff;
  color: var(--color-dark);
  font-size: 0.85rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--color-dark);
  }
`;

const ErrorMessage = styled.p`
  color: #ff8555;
  font-size: 0.8rem;
  margin: 0.4rem 0 0 0;
`;

const Form = styled.form`
  width: calc(100% - 2rem);
  background: transparent;
  box-shadow: none;
  padding: 1rem;
`;

const ModalActions = styled(Container)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  margin: 0;
  width: 100%;
  box-shadow: none;
`;

/* =======================
   Component
======================= */

export default function Services() {
  const TOAST_CONTAINER_ID = "services-toast";
  const companyUrl = Cookies.get("companyUrl");
  const companyInfo = JSON.parse(Cookies.get("companyInfo") || "{}");
  const navigate = useNavigate();
  const [mobile, setMobile] = useState();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [nameError, setNameError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    if (isAvailableLogin()) {
      setMobile(isMobile());
      setLoading(false);
      fetchServices();
    } else {
      navigate("/" + companyUrl);
    }
    // eslint-disable-next-line
  }, []);

  const openModal = () => {
    setNewServiceName("");
    setNewServicePrice("");
    setNameError("");
    setPriceError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setNewServiceName("");
    setNewServicePrice("");
    setNameError("");
    setPriceError("");
  };

  const handleNameChange = (value) => {
    setNewServiceName(value);
    const trimmed = value.trim().toLowerCase();
    const exists = services.some(
      (s) => s.name.trim().toLowerCase() === trimmed
    );
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
    if (!trimmed) {
      setNameError("Digite o nome do serviço.");
      return;
    }
    if (!newServicePrice || parsedPrice <= 0) {
      setPriceError("Digite o valor do serviço.");
      return;
    }
    const exists = services.some(
      (s) => s.name.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setNameError("Esse serviço já está cadastrado.");
      return;
    }
    setSaving(true);
    try {
      const response = await createService(companyUrl, {
        name: trimmed,
        price: parsedPrice,
      });
      if (response.status === 200 || response.status === 201) {
        toast.success("Serviço cadastrado com sucesso!", {
          containerId: TOAST_CONTAINER_ID,
        });
        closeModal();
        fetchServices();
      } else {
        toast.error("Erro ao cadastrar o serviço", {
          containerId: TOAST_CONTAINER_ID,
        });
      }
    } catch (error) {
      toast.error("Erro ao cadastrar o serviço", {
        containerId: TOAST_CONTAINER_ID,
      });
    } finally {
      setSaving(false);
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
      <Topbar {...companyInfo} loggedIn />

      <Container
        $width="100%"
        $display="flex"
        $flexdirection="column"
        $padding={!mobile ? "0" : "1rem"}
        $margin="0"
        $backgroundcolor="transparent"
        $borderRadius="0"
        $boxshadow="0"
      >
        <Sidebar>
          <Title
            $padding="1rem"
            $margin="1rem 0 0 0"
            $fontweight="600"
            $fontsize="2rem"
            $color="var(--color-dark)"
            $width="max-content"
          >
            Serviços
          </Title>

          <Separator
            $width="calc(100% - 2rem)"
            $bordercolor="var(--color-olive)"
            $margin="0 1rem 1rem 1rem"
            $style="dotted"
          />

          <PageHeader>
            <span
              style={{
                fontSize: "0.9rem",
                color: "var(--color-muted)",
                fontWeight: 500,
              }}
            >
              {loading
                ? "Carregando..."
                : `${services.length} serviço${services.length !== 1 ? "s" : ""} cadastrado${services.length !== 1 ? "s" : ""}`}
            </span>
            <AddButton onClick={openModal}>
              <PlusIcon size={15} />
              Novo serviço
            </AddButton>
          </PageHeader>

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
                    <ServiceName $active={service.active}>{service.name}</ServiceName>
                    <ServicePrice $active={service.active}>
                      {formatCurrency(service.price)}
                    </ServicePrice>
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
                      title={service.active === false ? "Ativar serviço" : "Inativar serviço"}
                      onClick={() => handleToggleStatus(service)}
                    >
                      <SwitchThumb $active={service.active} />
                    </StatusSwitch>
                  </StatusAction>
                </ServiceRow>
              ))}
            </ServiceList>
          )}

          <ToastContainer
            containerId={TOAST_CONTAINER_ID}
            position="top-right"
            autoClose={3000}
          />

        </Sidebar>
      </Container>

      <Dialog open={showModal} onClose={closeModal} mobile={mobile}>
        <Title
          $padding="0"
          $margin="0 0 0.5rem 0"
          $fontweight="600"
          $fontsize="1.25rem"
          $color="var(--color-dark)"
        >
          Novo serviço
        </Title>

        <Separator
          $width="100%"
          $bordercolor="var(--color-olive)"
          $margin="0 0 1rem 0"
          $style="dotted"
        />
        <Form>
            <ModalLabel htmlFor="service-name">Nome do serviço</ModalLabel>
            <ModalInput
            id="service-name"
            type="text"
            placeholder="Ex: Corte de cabelo"
            value={newServiceName}
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

            <ModalLabel htmlFor="service-price">Valor do serviço em R$</ModalLabel>
            <ModalInput
            id="service-price"
            type="text"
            placeholder="R$ 0,00"
            value={newServicePrice}
            onChange={(e) => handlePriceChange(e.target.value)}
            inputMode="numeric"
            />
            {priceError && <ErrorMessage>{priceError}</ErrorMessage>}

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
                    style={{
                        backgroundColor: "var(--color-sage)",
                        borderColor: "var(--color-sage)"
                    }}
                    onClick={handleSave}
                    disabled={
                      !!nameError ||
                      !!priceError ||
                      !newServiceName.trim() ||
                      !newServicePrice ||
                      saving
                    }
                >
                    {saving ? "Salvando..." : "Salvar"}
                </Button>
            </ModalActions>
        </Form>
      </Dialog>
    </>
  );
}

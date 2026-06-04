import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ClipboardPenLineIcon,
  CircleXIcon,
    CopyIcon,
  PhoneIcon,
  ClockPlusIcon,
  Trash2Icon,
  ChevronDownIcon
} from "lucide-react";
import { ThreeDots } from "react-loader-spinner";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";

import {
  createReservedScheduleByOwner,
  removeReservedScheduleByOwner,
  updateSchedule
} from "../../services/endpoints/reservedSchedule";
import { getServices } from "../../services/endpoints/service";

import { openWhatsApp } from "../../util/util";
import {
  formataNumeroTelefone,
  maskTime,
  paraHoraSemSegundos
} from "../../util/format";

import ConfirmDialog from "../confirmDialog";
import Dialog from "../dialog";
import { Title } from "../title";
import { Separator } from "../separator/style";
import { Container } from "../container/style";
import { PaginationControl } from "../paginationControl";
import { Button } from "../button";
import { ActionButton, DialogInput, DialogSelect, IconButton, Label, Table, TableHeaderActions, PageSizeField, SelectWrapper, TableWrapper, Td, Th, Tr } from "./style";
import { Tag } from "../tag";

const SortedTable = ({ data, loading, isMobile, onChange, showServiceColumn = true }) => {
    const companyUrl = Cookies.get("companyUrl");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showDialogConfirm, setShowDialogConfirm] = useState(false);
    const [showConfirmBulkDelete, setShowConfirmBulkDelete] = useState(false);
    const [showDialogEdit, setShowDialogEdit] = useState(false);
    const [showNewScheduleDialog, setShowNewScheduleDialog] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState("");
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [selectedSchedules, setSelectedSchedules] = useState([]);
        const [showCopyDialog, setShowCopyDialog] = useState(false);
        const [copySeparator, setCopySeparator] = useState(",");
        const [copyColumns, setCopyColumns] = useState({
            date: true,
            time: true,
            name: true,
            telephone: true,
            status: true
        });
    const [editAllowDateChange, setEditAllowDateChange] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [services, setServices] = useState([]);
    const [selectedServiceId, setSelectedServiceId] = useState("");

    const sortedData = useMemo(
        () => [...data].sort((a, b) => new Date(a.schedule) - new Date(b.schedule)),
        [data]
    );

    const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));

    const currentData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(start, start + itemsPerPage);
    }, [sortedData, currentPage, itemsPerPage]);

    const now = new Date()
        .toLocaleString("sv-SE", {
        timeZone: "America/Sao_Paulo",
        hour12: false
        })
        .replace(" ", "T");


    const openDeleteDialog = (item) => {
        setSelectedSchedule(item.schedule);
        setConfirmMessage(
        item.available
            ? "Deseja apagar o horário da sua agenda?"
            : "Existe um agendamento vigente. Deseja apagar mesmo assim?"
        );
        setShowDialogConfirm(true);
    };

    const handleConfirmDelete = async (force) => {
        if (showConfirmBulkDelete) {
            await confirmSelectedSchedules();
            return;
        }

        const response = await removeReservedScheduleByOwner(
        companyUrl,
        selectedSchedule,
        force
        );

        if (response.status === 200) {
        toast.success(response.data);
        onChange();
        } else {
        toast.error("Erro ao remover horário");
        }

        setShowDialogConfirm(false);
    };

    const confirmSelectedSchedules = async () => {
        try {
        for (const schedule of selectedSchedules) {
            const response = await removeReservedScheduleByOwner(
            companyUrl,
            schedule,
            false
            );

            if (response.status !== 200) {
            throw new Error("Erro ao remover horário");
            }
        }

        toast.success("Horários selecionados removidos com sucesso.");
        setSelectedSchedules([]);
        onChange();
        } catch (error) {
        toast.error("Erro ao remover horários selecionados.");
        }

        setShowConfirmBulkDelete(false);
    };

    const handleToggleSelect = (schedule) => {
        setSelectedSchedules((prev) =>
        prev.includes(schedule)
            ? prev.filter((item) => item !== schedule)
            : [...prev, schedule]
        );
    };

    const handleSelectAll = () => {
        const allSelected = currentData.length > 0 && currentData.every((item) => selectedSchedules.includes(item.schedule));

        if (allSelected) {
        setSelectedSchedules((prev) =>
            prev.filter((schedule) => !currentData.some((item) => item.schedule === schedule))
        );
        return;
        }

        setSelectedSchedules((prev) => [
        ...new Set([...prev, ...currentData.map((item) => item.schedule)])
        ]);
    };

    const handleDeleteSelected = () => {
        if (selectedSchedules.length === 0) return;

        setConfirmMessage(
        `Deseja apagar ${selectedSchedules.length} ${
            selectedSchedules.length === 1 ? "horário" : "horários"
        } selecionado${selectedSchedules.length === 1 ? "" : "s"}?`
        );
        setShowConfirmBulkDelete(true);
    };

    const handleClearSelection = () => {
        setSelectedSchedules([]);
    };

    const handleToggleCopyColumn = (column) => {
        setCopyColumns((prev) => ({
            ...prev,
            [column]: !prev[column]
        }));
    };

    const handleCopySelected = async () => {
        const selectedRows = sortedData.filter((item) =>
            selectedSchedules.includes(item.schedule)
        );

        if (selectedRows.length === 0) {
            toast.warn("Selecione ao menos um agendamento para copiar.");
            return;
        }

        const selectedColumnKeys = Object.keys(copyColumns).filter(
            (key) => copyColumns[key]
        );

        if (selectedColumnKeys.length === 0) {
            toast.warn("Selecione ao menos uma coluna.");
            return;
        }

        const separator = copySeparator || ",";

        const rows = selectedRows.map((item) => {
            const date = new Date(item.schedule);
            const map = {
                date: date.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                }),
                time: date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                }),
                name: item.name || "-",
                telephone: item.telephone || "-",
                status: getStatus(item)
            };

            return selectedColumnKeys.map((key) => map[key]).join(separator);
        });

        const text = rows.join("\n");

        try {
            await navigator.clipboard.writeText(text);
            toast.success("Agendamentos copiados para a area de transferencia.");
            setShowCopyDialog(false);
        } catch (error) {
            toast.error("Nao foi possivel copiar os dados.");
        }
    };

    const openEditDialog = (item, allowDateChange = false) => {
        const [date, time] = item.schedule.split("T");
        setSelectedSchedule({
            date,
            date_new: date,
            schedule_old: paraHoraSemSegundos(time),
            schedule_new: paraHoraSemSegundos(time)
        });
        setEditAllowDateChange(allowDateChange);
        setShowDialogEdit(true);
    };

    const openNewScheduleDialog = (item) => {
        const [date, time] = item.schedule.split("T");
        setSelectedSchedule({
        date,
        schedule_new: paraHoraSemSegundos(time)
        });
        setSelectedServiceId("");
        setShowNewScheduleDialog(true);
    };

    const handleGetServices = useCallback(async () => {
        try {
            const response = await getServices(companyUrl);
            setServices(response.data || []);
        } catch (error) {
            console.error("Erro ao buscar serviços:", error);
            setServices([]);
        }
    }, [companyUrl]);

    const saveEdit = async () => {
        const newDate = editAllowDateChange ? selectedSchedule.date_new : selectedSchedule.date;
        const response = await updateSchedule(companyUrl, {
            old: `${selectedSchedule.date}T${selectedSchedule.schedule_old}:00`,
            new: `${newDate}T${selectedSchedule.schedule_new}:00`
        });

        if (response.status === 200) {
            toast.success(response.data);
            onChange();
            setShowDialogEdit(false);
        }
    };

    const saveNewSchedule = async () => {
        const payload = {
            schedule: `${selectedSchedule.date}T${selectedSchedule.schedule_new}:00`,
            name,
            telephone: phone,
            ...(selectedServiceId ? { service: selectedServiceId } : {})
        };

        const response = await createReservedScheduleByOwner(companyUrl, payload);

        if (response.status === 200) {
        toast.success(response.data);
        onChange();
        setName("");
        setPhone("");
        setSelectedServiceId("");
        setShowNewScheduleDialog(false);
        }
    };

    const getStatus = (item) => {
        if(item.available && item.schedule >= now) {
            return "Disponível";
        } else if (!item.available && item.schedule >= now) {
            return "Agendado";
        } else if (!item.available && item.schedule < now) {
            return "Concluído";
        } else {
            return "Expirado";
        }
    }

    const getBackgroundByStatus = (item) => {
        if(item.available && item.schedule >= now) {
            return "green";
        } else if (!item.available && item.schedule >= now) {
            return "red";
        } else if (!item.available && item.schedule < now) {
            return "blue";
        } else {
            return "gray";
        }
    }

    const getServiceType = (item) => {
        if (item?.service && typeof item.service === "object") {
            return item.service.name || "";
        }

        return item?.service || item?.servico || "";
    }

    useEffect(() => {
        setCurrentPage(1);
        setSelectedSchedules([]);
    }, [data]);

    useEffect(() => {
        handleGetServices();
    }, [handleGetServices]);

    useEffect(() => {
        if (currentPage > totalPages) {
        setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    if (loading) {
        return (
            <div className="loading-slide-dashboard">
                <ThreeDots height={20} width={60} color="var(--color-sage)" />
                <p>Buscando horários...</p>
            </div>
        );
    }

    if (currentData.length === 0) {
        return (
            <div className="loading-slide-dashboard">
                <p>Nenhum horário encontrado.</p>
            </div>
        );
    }

    return (
        <>
            {currentData.length > 0 && 
                <>
                    <TableHeaderActions>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            {selectedSchedules.length > 0 && (
                                <>
                                    <Button
                                        type="button"
                                        variant="link"
                                        disabled={selectedSchedules.length === 0}
                                        onClick={handleClearSelection}
                                    >
                                        Limpar seleção
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="confirm"
                                        style={{
                                            borderRadius: '999px',
                                            background: 'transparent',
                                            color: 'red',
                                            border: '1px solid red',
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                        disabled={selectedSchedules.length === 0}
                                        onClick={handleDeleteSelected}
                                    >
                                        <Trash2Icon size={16} style={{ marginRight: 6 }} />
                                            Excluir
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="confirm"
                                        style={{
                                            borderRadius: '999px',
                                            background: 'transparent',
                                            color: 'rgb(0, 123, 255)',
                                            border: '1px solid rgb(0, 123, 255)',
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                        onClick={() => setShowCopyDialog(true)}
                                    >
                                        <CopyIcon size={16} style={{ marginRight: 6 }} />
                                        Copiar
                                    </Button>
                                </>
                            )}
                            <span style={{ color: 'var(--color-dark)', fontSize: '0.9rem' }}>
                                {selectedSchedules.length} selecionado{selectedSchedules.length === 1 ? '' : 's'}
                            </span>
                        </div>
                        <PageSizeField>
                            <label htmlFor="page-size">Registros por página:</label>
                            <SelectWrapper>
                                <select
                                    id="page-size"
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                                <ChevronDownIcon size={16} />
                            </SelectWrapper>
                        </PageSizeField>
                    </TableHeaderActions>
                    <TableWrapper>
                        <Table>
                        <thead>
                            <tr>
                            <Th>
                                <input
                                    type="checkbox"
                                    checked={currentData.length > 0 && currentData.every((item) => selectedSchedules.includes(item.schedule))}
                                    onChange={handleSelectAll}
                                />
                            </Th>
                            <Th>Data</Th>
                            <Th>Horário</Th>
                            <Th>Nome</Th>
                            {showServiceColumn && <Th>Serviço</Th>}
                            <Th>Status</Th>
                            <Th>Ações</Th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentData.map((item, index) => {
                            const date = new Date(item.schedule);
                            const serviceType = getServiceType(item);
                            return (
                                <Tr key={index}>
                                <Td>
                                    <input
                                        type="checkbox"
                                        checked={selectedSchedules.includes(item.schedule)}
                                        onChange={() => handleToggleSelect(item.schedule)}
                                    />
                                </Td>
                                <Td>
                                    {date.toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: '2-digit'
                                    })}
                                </Td>
                                <Td>
                                    {date.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}
                                </Td>
                                <Td>{item.name || "-"}</Td>
                                {showServiceColumn && (
                                    <Td>
                                        {serviceType && (
                                            <Tag
                                                $color="#fff"
                                                $background="var(--color-olive)"
                                                $texttransform="uppercase"
                                                $margin="0 auto"
                                            >
                                                {serviceType}
                                            </Tag>
                                        )}
                                    </Td>
                                )}
                                <Td>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <Tag 
                                            $color="#fff"
                                            $background={getBackgroundByStatus(item)}
                                            $texttransform="uppercase"
                                        >
                                            {getStatus(item)}
                                        </Tag>
                                    </div>
                                </Td>
                                <Td>
                                    <ActionButton>
                                    {getStatus(item) === "Disponível" && (
                                        <>
                                            <IconButton onClick={() => openNewScheduleDialog(item)}>
                                                <ClockPlusIcon color="green" size={16} />
                                            </IconButton>
                                            <IconButton onClick={() => openEditDialog(item)}>
                                                <ClipboardPenLineIcon color="#007bff" size={16} />
                                            </IconButton>
                                            <IconButton onClick={() => openDeleteDialog(item)}>
                                                <CircleXIcon color="red" size={16} />
                                            </IconButton>
                                        </>
                                    )}
                                    

                                    {getStatus(item) === "Agendado" && (
                                        <>
                                            {item.telephone && (
                                                <IconButton onClick={() => openWhatsApp(item.telephone)}>
                                                    <PhoneIcon color="green" size={16} />
                                                </IconButton>
                                            )}
                                            <IconButton onClick={() => openEditDialog(item, true)}>
                                                <ClipboardPenLineIcon color="#007bff" size={16} />
                                            </IconButton>
                                            <IconButton onClick={() => openDeleteDialog(item)}>
                                                <CircleXIcon color="red" size={16} />
                                            </IconButton>
                                        </>
                                    )}
                                    </ActionButton>
                                </Td>
                                </Tr>
                            );
                            })}
                        </tbody>
                        </Table>
                    </TableWrapper>
                    <PaginationControl
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />

                    {/* Confirm Dialog */}
                    <ConfirmDialog
                        isOpen={showDialogConfirm || showConfirmBulkDelete}
                        title="Confirmação"
                        message={confirmMessage}
                        onConfirm={() => handleConfirmDelete(false)}
                        onCancel={showConfirmBulkDelete ? () => setShowConfirmBulkDelete(false) : () => handleConfirmDelete(true)}
                        close={() => {
                            setShowDialogConfirm(false);
                            setShowConfirmBulkDelete(false);
                        }}
                        confirmText="Confirmar"
                        cancelText={showConfirmBulkDelete ? "Cancelar" : confirmMessage && confirmMessage.includes('vigente') ? "Apenas cancelar" : ""}
                    />

                    {showCopyDialog && (
                        <Dialog open onClose={() => setShowCopyDialog(false)} mobile={isMobile}>
                            <Title
                                $fontweight="600"
                                $fontsize="1.1rem"
                                $color="var(--color-brown)"
                                $texttransform="uppercase"
                            >
                                Copiar selecionados
                            </Title>

                            <Separator
                                $width="100%"
                                $bordercolor="var(--color-olive)"
                                $margin="0.75rem 0 1rem 0"
                                $style="dotted"
                            />

                            <Label>Colunas para copiar:</Label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
                                <label><input type="checkbox" checked={copyColumns.date} onChange={() => handleToggleCopyColumn("date")} /> Data</label>
                                <label><input type="checkbox" checked={copyColumns.time} onChange={() => handleToggleCopyColumn("time")} /> Horario</label>
                                <label><input type="checkbox" checked={copyColumns.name} onChange={() => handleToggleCopyColumn("name")} /> Nome</label>
                                <label><input type="checkbox" checked={copyColumns.telephone} onChange={() => handleToggleCopyColumn("telephone")} /> Telefone</label>
                                <label><input type="checkbox" checked={copyColumns.status} onChange={() => handleToggleCopyColumn("status")} /> Status</label>
                            </div>

                            <Label>Separador entre colunas:</Label>
                            <DialogInput
                                value={copySeparator}
                                onChange={(e) => setCopySeparator(e.target.value)}
                                placeholder=","
                            />

                            <Container
                                $display="flex"
                                $justifycontent="space-between"
                                $backgroundcolor="transparent"
                                $boxshadow="none"
                            >
                                <Button type="button" variant="link" onClick={() => setShowCopyDialog(false)}>
                                    Voltar
                                </Button>
                                <Button type="button" variant="confirm" onClick={handleCopySelected}>
                                    Copiar
                                </Button>
                            </Container>
                        </Dialog>
                    )}
                    {/* Edit Dialog */}
                    {showDialogEdit && (
                        <Dialog open onClose={() => setShowDialogEdit(false)}>
                        <Title
                            $fontweight="600"
                            $fontsize="1.1rem"
                            $color="var(--color-brown)"
                            $texttransform="uppercase"
                        >
                            Altere o agendamento
                        </Title>

                        <Separator
                            $width="100%"
                            $bordercolor="var(--color-olive)"
                            $margin="0.75rem 0 2rem 0"
                            $style="dotted"
                        />

                        {editAllowDateChange && (
                            <>
                                <Label>Data:</Label>
                                <DialogInput
                                    type="date"
                                    value={selectedSchedule.date_new}
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={(e) =>
                                        setSelectedSchedule({
                                            ...selectedSchedule,
                                            date_new: e.target.value
                                        })
                                    }
                                />
                            </>
                        )}

                        <Label>Horário:</Label>
                        <DialogInput
                            value={selectedSchedule.schedule_new}
                            onChange={(e) =>
                            setSelectedSchedule({
                                ...selectedSchedule,
                                schedule_new: maskTime(e.target.value)
                            })
                            }
                        />

                        <Container
                            $display="flex"
                            $justifycontent="space-between"
                            $backgroundcolor="transparent"
                            $boxshadow="none"
                        >
                            <Button type="button" variant="link" onClick={() => setShowDialogEdit(false)}>Voltar</Button>
                            <Button type="button" variant="confirm" onClick={saveEdit}>Salvar</Button>
                        </Container>
                        </Dialog>
                    )}

                    {/* New Schedule Dialog */}
                    {showNewScheduleDialog && (
                        <Dialog open onClose={() => setShowNewScheduleDialog(false)}>
                        <Title
                            $fontweight="600"
                            $fontsize="1.1rem"
                            $color="var(--color-brown)"
                            $texttransform="uppercase"
                        >
                            Agendamento manual
                        </Title>

                        <Separator
                            $width="100%"
                            $bordercolor="var(--color-olive)"
                            $margin="0.75rem 0 2rem 0"
                            $style="dotted"
                        />

                        <Label>Horário:</Label>
                        <DialogInput
                            value={selectedSchedule.schedule_new}
                            onChange={(e) =>
                            setSelectedSchedule({
                                ...selectedSchedule,
                                schedule_new: maskTime(e.target.value)
                            })
                            }
                        />

                        <Label>Digite o nome:</Label>
                        <DialogInput
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <Label>Digite o telefone com DDD:</Label>
                        <DialogInput
                            value={phone}
                            onChange={(e) =>
                            setPhone(formataNumeroTelefone(e.target.value))
                            }
                        />

                        <Label>Serviço:</Label>
                        <DialogSelect
                            value={selectedServiceId}
                            onChange={(e) => setSelectedServiceId(e.target.value)}
                        >
                            <option value="">
                                {services.length ? "Selecione um serviço" : "Nenhum serviço cadastrado"}
                            </option>
                            {services.map((service) => {
                                const serviceId = service.id || service._id || service.servicoId;
                                if (!serviceId) return null;

                                return (
                                    <option key={serviceId} value={serviceId}>
                                        {service.name}
                                    </option>
                                );
                            })}
                        </DialogSelect>

                        <Container
                            $display="flex"
                            $justifycontent="space-between"
                            $backgroundcolor="transparent"
                            $boxshadow="none"
                        >
                            <Button type="button" variant="link" onClick={() => setShowNewScheduleDialog(false)}>
                            Voltar
                            </Button>
                            <Button type="button" variant="confirm" onClick={saveNewSchedule}>Salvar</Button>
                        </Container>
                        </Dialog>
                    )}
                    
                    <ToastContainer
                        position={isMobile ? "bottom-center" : "top-right"}
                        autoClose={3000}
                        style={isMobile ? { margin: '0 5% 1rem 5%', width: '90%' } : undefined}
                    />
                </>
            }
        </>
    );
};

export default SortedTable;
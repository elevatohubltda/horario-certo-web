import React, { useMemo, useState } from "react";
import {
  ClipboardPenLineIcon,
  CircleXIcon,
  PhoneIcon,
  ClockPlusIcon
} from "lucide-react";
import { ThreeDots } from "react-loader-spinner";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";

import {
  createReservedScheduleByOwner,
  removeReservedScheduleByOwner,
  updateSchedule
} from "../../services/endpoints/reservedSchedule";

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
import { ActionButton, DialogInput, IconButton, Label, Table, TableWrapper, Td, Th, Tr } from "./style";
import { Tag } from "../tag";

const SortedTable = ({ data, loading, isMobile, onChange }) => {
    const itemsPerPage = 10;
    const companyUrl = Cookies.get("companyUrl");
    const [currentPage, setCurrentPage] = useState(1);
    const [showDialogConfirm, setShowDialogConfirm] = useState(false);
    const [showDialogEdit, setShowDialogEdit] = useState(false);
    const [showNewScheduleDialog, setShowNewScheduleDialog] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState("");
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    const sortedData = useMemo(
        () => [...data].sort((a, b) => new Date(a.schedule) - new Date(b.schedule)),
        [data]
    );

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);

    const currentData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(start, start + itemsPerPage);
    }, [sortedData, currentPage]);

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

    const openEditDialog = (item) => {
        const [date, time] = item.schedule.split("T");
        setSelectedSchedule({
        date,
        schedule_old: paraHoraSemSegundos(time),
        schedule_new: paraHoraSemSegundos(time)
        });
        setShowDialogEdit(true);
    };

    const openNewScheduleDialog = (item) => {
        const [date, time] = item.schedule.split("T");
        setSelectedSchedule({
        date,
        schedule_new: paraHoraSemSegundos(time)
        });
        setShowNewScheduleDialog(true);
    };

    const saveEdit = async () => {
        const response = await updateSchedule(companyUrl, {
        old: `${selectedSchedule.date}T${selectedSchedule.schedule_old}:00`,
        new: `${selectedSchedule.date}T${selectedSchedule.schedule_new}:00`
        });

        if (response.status === 200) {
        toast.success(response.data);
        onChange();
        setShowDialogEdit(false);
        }
    };

    const saveNewSchedule = async () => {
        const response = await createReservedScheduleByOwner(companyUrl, {
        schedule: `${selectedSchedule.date}T${selectedSchedule.schedule_new}:00`,
        name,
        telephone: phone
        });

        if (response.status === 200) {
        toast.success(response.data);
        onChange();
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
                    <TableWrapper>
                        <Table>
                        <thead>
                            <tr>
                            <Th>Data</Th>
                            <Th>Horário</Th>
                            <Th>Nome</Th>
                            <Th>Status</Th>
                            <Th>Ações</Th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentData.map((item, index) => {
                            const date = new Date(item.schedule);
                            return (
                                <Tr key={index}>
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
                                <Td style={{display: 'flex', justifyContent: 'center'}}>
                                    <Tag 
                                        $color="#fff"
                                        $background={getBackgroundByStatus(item)}
                                        $texttransform="uppercase"
                                    >
                                        {getStatus(item)}
                                    </Tag>
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
                        isOpen={showDialogConfirm}
                        title="Confirmação"
                        message={confirmMessage}
                        onConfirm={() => handleConfirmDelete(false)}
                        onCancel={() => handleConfirmDelete(true)}
                        close={() => setShowDialogConfirm(false)}
                        confirmText={confirmMessage && confirmMessage.includes('vigente') ? "Cancelar e apagar horário" : "Confirmar"}
                        cancelText={confirmMessage && confirmMessage.includes('vigente') ? "Apenas cancelar" : ""}
                    />

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

                        <Container
                            $display="flex"
                            $justifycontent="space-between"
                            $backgroundcolor="transparent"
                        >
                            <Button variant="link" onClick={() => setShowDialogEdit(false)}>Voltar</Button>
                            <Button variant="confirm" onClick={saveEdit}>Salvar</Button>
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

                        <Container
                            $display="flex"
                            $justifycontent="space-between"
                            $backgroundcolor="transparent"
                        >
                            <Button variant="link" onClick={() => setShowNewScheduleDialog(false)}>
                            Voltar
                            </Button>
                            <Button variant="confirm" onClick={saveNewSchedule}>Salvar</Button>
                        </Container>
                        </Dialog>
                    )}
                    
                    {/* Toast notification */}
                    <ToastContainer
                        position={isMobile ? "bottom-right" : "top-right"}
                        autoClose={3000}
                    />
                </>
            }
        </>
    );
};

export default SortedTable;
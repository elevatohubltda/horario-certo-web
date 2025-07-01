import React, { useMemo, useState } from 'react';
import { ClipboardPenLineIcon, CircleXIcon, PhoneIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import styled from 'styled-components';
import { openWhatsApp } from '../../util/util';
import { ThreeDots } from "react-loader-spinner";
import { removeReservedScheduleByOwner, updateSchedule } from '../../services/endpoints/reservedSchedule';
import Cookies from "js-cookie";
import ConfirmDialog from '../confirmDialog';
import { toast, ToastContainer } from 'react-toastify';
import { maskTime, paraHoraSemSegundos } from '../../util/format';
import Dialog from '../dialog';
import { Title } from '../title';
import { Separator } from '../separator/style';
import { Container } from '../container/style';

const ActionButton = styled.div`
    display: flex;  
    justify-content: center;
    align-items: center;
    gap: 8px;
`;

const Button = styled.button`
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    ${({ variant }) =>
        variant === 'confirm'
        ? `
        background-color: #6A5ACD;
        color: white;
    `
        : (
            (variant === 'icon') ?
        `
        background-color: transparent;
        padding: 0;
    `
            : (
            (variant === 'link') ?
            `
        background-color: transparent;
        color: #000;
    `
                :
               `
            background-color: #ccc;
            color: #333;
        ` 
        )
    )
}
`;

const Pagination = styled.div`
    display: flex;
    justify-content: center;
    margin-top: 16px;
    gap: 8px;
`;

const PageButton = styled.button`
    padding: 6px 12px;
    border: 1px solid #ccc;
    background-color: ${({ active }) => (active ? '#6a5acd0a' : 'white')};
    cursor: pointer;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const SortedTable = ({ data, loading, isMobile }) => {
    const itemsPerPage = 10;
    const companyUrl = Cookies.get("companyUrl");
    const [currentPage, setCurrentPage] = useState(1);
    const [showDialogConfirm, setShowDialogConfirm] = useState(false);
    const [showDialogEdit, setShowDialogEdit] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState();
    const [selectedSchedule, setSelectedSchedule] = useState()

    const sortedData = useMemo(
        () => [...data].sort((a, b) => new Date(a.schedule) - new Date(b.schedule)),
        [data]
    );

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const currentData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(start, start + itemsPerPage);
    }, [sortedData, currentPage]);

    const handleConfirm = async () => {
        const response = await removeReservedScheduleByOwner(companyUrl, selectedSchedule, false)
        if(response.status === 200){
            toast.success(response.data);
            setShowDialogConfirm(false);
            setSelectedSchedule();
        } else{
            toast.error("Erro ao cancelar");
        }
    };
    const handleCancel = async () => {
        const response = await removeReservedScheduleByOwner(companyUrl, selectedSchedule, true)
        if(response.status === 200){
            toast.success(response.data);
            setShowDialogConfirm(false);
            setSelectedSchedule();
        } else{
            toast.error("Erro ao cancelar");
        }
    };
    const handleOpenDialogConfirm = (item, schedule) => {
        setSelectedSchedule(schedule)
        if(item.available === true){
            setConfirmMessage("Deseja, de fato, apagar o horário da sua agenda?");
        } else {
            setConfirmMessage("Existe um agendamento vigente para esse horário. Deseja apagar o horário mesmo assim?");
        }
        setShowDialogConfirm(true);
    }
    const handleOpenEditConfirm = (item) => {
        const [datePart, timePart] = item.schedule.split("T")
        setSelectedSchedule({date: datePart, schedule_old: paraHoraSemSegundos(timePart), schedule_new: paraHoraSemSegundos(timePart)})
        setShowDialogEdit(true);
    }

    const handleSelectedSchedule = (parameter, value) => {
        setSelectedSchedule((prev) => ({
            ...prev,
            [parameter]: value
        }));
    }

    const handleContact = (telephone) => openWhatsApp(telephone);
    
    const getStatusCell = (item) => {
        const today = new Date();
        const itemDateObj = new Date(item.schedule);

        today.setHours(0, 0, 0, 0);
        itemDateObj.setHours(0, 0, 0, 0);

        const diffTime = today - itemDateObj;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays > 0) {
            return (
            <td style={{ color: item.available ? 'gray' : 'blue' }}>
                {item.available ? 'Expirado' : 'Concluído'}
            </td>
            );
        } else {
            return (
            <td style={{ color: item.available ? 'green' : 'red' }}>
                {item.available ? 'Disponível' : 'Agendado'}
            </td>
            );
        }
    };

    const getActionButtons = (item, handleOpenEditConfirm, handleOpenDialogConfirm, handleContact) => {
        const today = new Date();
        const itemDateObj = new Date(item.schedule);

        today.setHours(0, 0, 0, 0);
        itemDateObj.setHours(0, 0, 0, 0);

        const buttons = [];

        if (item.available && itemDateObj >= today) {
            buttons.push(
            <Button variant="icon" key="edit" onClick={() => handleOpenEditConfirm(item)}>
                <ClipboardPenLineIcon size={16} color="blue" />
            </Button>,
            <Button variant="icon" key="cancel" onClick={() => handleOpenDialogConfirm(item, item.schedule)}>
                <CircleXIcon size={16} color="red" />
            </Button>
            );
        }

        if (!item.available && itemDateObj <= today) {
            buttons.push(
            <Button variant="icon" key="phone" onClick={() => handleContact(item.telephone)}>
                <PhoneIcon size={16} color="green" />
            </Button>,
            <Button variant="icon" key="cancel" onClick={() => handleOpenDialogConfirm(item, item.schedule)}>
                <CircleXIcon size={16} color="red" />
            </Button>
            );
        }

        return buttons.length > 0 ? (
            <td><ActionButton>{buttons}</ActionButton></td>
        ) : <td>-</td>;
    };

    const makeEditCall = async () => {
        const response = await updateSchedule(
            companyUrl, 
            {   
                new: selectedSchedule.date+"T"+selectedSchedule.schedule_new+":00", 
                old: selectedSchedule.date+"T"+selectedSchedule.schedule_old+":00"
            }
        )
        if(response.status === 200){
            toast.success(response.data);
            setShowDialogEdit(false);
            setSelectedSchedule();
        } else{
            toast.error("Erro ao editar");
        }
    }

    if(loading) {
        return (
            <div className="loading-slide-dashboard">
                <ThreeDots color="#6A5ACD" height={20} width={60} />
                <p>Buscando horários...</p>
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="loading-slide-dashboard">
                <p>Nenhum horário encontrado.</p>
            </div>
        );
    }

    return (
        <>
            <div style={{ overflowX: 'auto', width: '100%'}}>
                <table
                    border="1"
                    cellPadding="8"
                    cellSpacing="0"
                    style={{
                    borderCollapse: 'collapse',
                    width: '100%',
                    marginTop: '20px',
                    border: 'none'
                    }}
                >
                    <thead style={{ backgroundColor: '#6a5acd0a', textAlign: 'center' }}>
                    <tr>
                        <th>Data</th>
                        <th>Horário</th>
                        <th>Nome</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                    </thead>
                    <tbody style={{ fontSize: '14px', color: '#333' }}>
                    {currentData.map((item, index) => {
                        const dateObj = new Date(item.schedule);
                        const date = dateObj.toLocaleDateString();
                        const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        return (
                        <tr key={index} style={{ textAlign: 'center' }}>
                            <td>{date}</td>
                            <td>{time}</td>
                            <td>{item.name ?? '-'}</td>
                            {getStatusCell(item)}
                            {getActionButtons(item, handleOpenEditConfirm, handleOpenDialogConfirm, handleContact)}
                        </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            <Pagination>
                <PageButton
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
                >
                <ChevronLeftIcon size={16} />
                </PageButton>
                {[...Array(totalPages)].map((_, i) => (
                <PageButton
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    active={currentPage === i + 1}
                >
                    {i + 1}
                </PageButton>
                ))}
                <PageButton
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
                >
                <ChevronRightIcon size={16} />
                </PageButton>
            </Pagination>
            <ConfirmDialog
                isOpen={showDialogConfirm}
                title="Confirmação"
                message={confirmMessage}
                onConfirm={handleConfirm}
                onCancel={confirmMessage && confirmMessage.includes('vigente') ? handleCancel : null}
                confirmText={confirmMessage && confirmMessage.includes('vigente') ? "Cancelar e apagar horário" : "Confirmar"}
                cancelText={confirmMessage && confirmMessage.includes('vigente') ? "Apenas cancelar" : ""}
                close={() => setShowDialogConfirm(false)}
            />
            <ToastContainer position={isMobile ? 'bottom-right' : 'top-right'} className={isMobile ? 'mobile' : 'desktop'} autoClose={3000} />
            {showDialogEdit && 
                <Dialog open={showDialogEdit} onClose={() => setShowDialogEdit(false)}>
                    <Title
                        $fontweight="600"
                        $fontsize="1.25rem"
                        $color="#6A5ACD"
                        $texttransform="uppercase"
                    >
                        Altere o agendamento
                    </Title>
                    <Separator $width="100%" $bordercolor="#ccc" $margin="1rem 0 3rem 0" />
                    <form style={{ backgroundColor: "transparent", boxShadow: "none", width: "100%", padding: "0" }}>
                        <label>Horário:</label>
                        <input 
                            type="text" 
                            value={selectedSchedule.schedule_new}
                            onChange={(e) => handleSelectedSchedule('schedule_new',maskTime(e.target.value))}
                        />
                        <Separator $width="100%" $bordercolor="#ccc" />
                        <Container
                            $width="auto"
                            $display="flex"
                            $alignitems="flex-end"
                            $justifycontent="space-between"
                            $margin="0"
                            $backgroundcolor="transparent"
                        >
                        <Button
                            style={{ fontSize: "0.8rem", padding: "0.5rem 1rem", backgroundColor: "transparent", borderColor: "transparent", color: "#6A5ACD" }}
                            onClick={() => setShowDialogEdit(false)}
                            type="button"
                        >
                            Voltar
                        </Button>
                        <Button
                            variant="confirm"
                            style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }}
                            onClick={makeEditCall}
                        >
                            Salvar
                        </Button>
                        </Container>
                    </form>
                </Dialog>
            }
        </>
    );
};

export default SortedTable;
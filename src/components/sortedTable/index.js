import React, { useMemo, useState } from 'react';
import { ClipboardPenLineIcon, CircleXIcon, PhoneIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import styled from 'styled-components';
import { openWhatsApp } from '../../util/util';
import { ThreeDots } from "react-loader-spinner";

const ActionButton = styled.div`
    display: flex;  
    justify-content: center;
    align-items: center;
    gap: 8px;
`;

const Button = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;

    &:hover svg {
        stroke-width: 3;
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

const SortedTable = ({ data, loading }) => {
    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);

    const sortedData = useMemo(
        () => [...data].sort((a, b) => new Date(a.schedule) - new Date(b.schedule)),
        [data]
    );

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const currentData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(start, start + itemsPerPage);
    }, [sortedData, currentPage]);

    const handleEdit = (id) => console.log(`Edit item with id: ${id}`);
    const handleCancel = (id) => console.log(`Cancel item with id: ${id}`);
    const handleContact = (telephone) => openWhatsApp(telephone);

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
                        <td style={{ color: item.available ? 'green' : 'red' }}>
                        {item.available ? 'Disponível' : 'Agendado'}
                        </td>
                        <td>
                        <ActionButton>
                            <Button onClick={() => handleEdit(item.id)}>
                            <ClipboardPenLineIcon size={16} color='blue' />
                            </Button>
                            {!item.available && (
                            <>
                                <Button onClick={() => handleCancel(item.id)}>
                                <CircleXIcon size={16} color='red' />
                                </Button>
                                <Button onClick={() => handleContact(item.telephone)}>
                                <PhoneIcon size={16} color='green' />
                                </Button>
                            </>
                            )}
                        </ActionButton>
                        </td>
                    </tr>
                    );
                })}
                </tbody>
            </table>

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
        </>
    );
};

export default SortedTable;
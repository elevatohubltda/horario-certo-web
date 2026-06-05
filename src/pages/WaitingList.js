import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Topbar from "../components/topbar";
import Sidebar from "../components/sidebar";
import { Title } from "../components/title";
import { Separator } from "../components/separator/style";
import { getWaitingQueue, deleteWaitingQueueEntry } from "../services/endpoints/waitingQueue";
import { getCompany } from "../services/endpoints/company";
import { isAvailableLogin } from "../util/auth";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Phone, MessageCircle, Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

const Section = styled.div`
  margin-bottom: 2rem;
`;

const DateLabel = styled.h4`
  font-size: 0.85rem;
  color: var(--color-olive);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.5rem 0;
`;

const EntryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background-color: #f9f9f7;
  margin-bottom: 0.5rem;
  gap: 1rem;
`;

const EntryName = styled.span`
  flex: 1;
  font-size: 0.95rem;
  color: var(--color-dark);
  font-weight: 500;
`;

const EntryPosition = styled.span`
  font-size: 0.75rem;
  color: var(--color-olive);
  min-width: 1.5rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  text-decoration: none;
  background-color: ${({ $color }) => $color || "var(--color-sage)"};
  color: #fff;
  transition: opacity 0.2s;

  &:hover { opacity: 0.85; }
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background-color: #fee2e2;
  color: #ef4444;
  transition: background-color 0.2s;

  &:hover { background-color: #fecaca; }
`;

const EmptyState = styled.p`
  color: var(--color-olive);
  font-size: 0.9rem;
  text-align: center;
  margin-top: 3rem;
`;

export default function WaitingList() {
  const navigate = useNavigate();
  const [companyInfo, setCompanyInfo] = useState(null);
  const [entries, setEntries] = useState([]);
  const companyUrl = Cookies.get("companyUrl");

  useEffect(() => {
    if (!isAvailableLogin()) { navigate("/login"); return; }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const [companyRes, queueRes] = await Promise.all([
        getCompany(companyUrl),
        getWaitingQueue(),
      ]);
      setCompanyInfo(companyRes.data);
      setEntries(queueRes.data || []);
    } catch {
      toast.error("Erro ao carregar a lista de espera.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteWaitingQueueEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch {
      toast.error("Erro ao remover da fila.");
    }
  };

  const grouped = entries.reduce((acc, entry) => {
    const key = entry.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  const formatPhone = (raw) => raw.replace(/\D/g, '');

  return (
    <>
      <Topbar
        name={companyInfo?.name}
        imagem={companyInfo?.imagem}
        whatsapp={companyInfo?.whatsapp}
        instagram={companyInfo?.instagram}
      />
      <Sidebar>
        <Title $fontweight="600" $fontsize="1.3rem" $color="var(--color-brown)" $texttransform="uppercase">
          Lista de Espera
        </Title>
        <Separator $width="100%" $bordercolor="var(--color-olive)" $margin="0.5rem 0 1.5rem 0" $style="dotted" />

        {Object.keys(grouped).length === 0 ? (
          <EmptyState>Nenhum cliente na fila de espera.</EmptyState>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <Section key={date}>
              <DateLabel>{date}</DateLabel>
              {items.map((entry, index) => {
                const digits = formatPhone(entry.telephone);
                return (
                  <EntryRow key={entry.id}>
                    <EntryPosition>{index + 1}º</EntryPosition>
                    <EntryName>{entry.name}</EntryName>
                    <Actions>
                      <IconButton
                        href={`https://wa.me/55${digits}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        $color="#25d366"
                        title="Abrir no WhatsApp"
                      >
                        <MessageCircle size={16} />
                      </IconButton>
                      <IconButton
                        href={`tel:+55${digits}`}
                        $color="#4a7c59"
                        title="Ligar"
                      >
                        <Phone size={16} />
                      </IconButton>
                      <DeleteButton onClick={() => handleDelete(entry.id)} title="Remover da fila">
                        <Trash2 size={16} />
                      </DeleteButton>
                    </Actions>
                  </EntryRow>
                );
              })}
            </Section>
          ))
        )}
      </Sidebar>
      <ToastContainer position="top-right" autoClose={3000} closeButton={false} />
    </>
  );
}

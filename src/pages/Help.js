import { useEffect, useState } from "react";
import styled from "styled-components";
import "../styles/index.css";
import Topbar from "../components/topbar";
import Sidebar from "../components/sidebar";
import { Container } from "../components/container/style";
import { Title } from "../components/title";
import { isAvailableLogin } from "../util/auth";
import { isMobile } from "../util/util";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  Rocket,
  CalendarDays,
  Clock,
  Scissors,
  BarChart2,
  Bell,
  Banknote,
  ListOrdered,
  ChevronDown,
  Search,
} from "lucide-react";

/* ── Layout ── */

const PageHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const PageTitle = styled(Title)`
  margin: 0 0 0.35rem;
  font-size: 1.4rem;
  font-weight: 700;
`;

const PageSubtitle = styled.p`
  margin: 0;
  color: rgba(30, 44, 40, 0.55);
  font-size: 0.9rem;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 999px;
  padding: 0.6rem 1rem;
  margin: 1.25rem 0 0;
  max-width: 440px;
  cursor: text;

  svg { color: rgba(30, 44, 40, 0.4); flex-shrink: 0; }

  input {
    border: none;
    outline: none;
    background: transparent;
    font-size: 0.88rem;
    color: var(--color-dark);
    width: 100%;

    &::placeholder { color: rgba(30, 44, 40, 0.4); }
  }
`;

/* ── Topic tabs ── */

const TopicTabs = styled.div`
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
`;

const TopicTab = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(30,44,40,0.3)' : 'rgba(0,0,0,0.1)')};
  background: ${({ $active }) => ($active ? 'var(--color-dark)' : '#fff')};
  color: ${({ $active }) => ($active ? '#fff' : 'var(--color-dark)')};
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;

  svg { flex-shrink: 0; }

  &:hover {
    border-color: rgba(30, 44, 40, 0.3);
    background: ${({ $active }) => ($active ? 'var(--color-dark)' : 'rgba(30,44,40,0.04)')};
  }
`;

/* ── FAQ accordion ── */

const FaqCard = styled.div`
  background: #fff;
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
`;

const FaqCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(0,0,0,0.05);

  svg { color: var(--color-dark); flex-shrink: 0; }

  h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-dark);
  }

  span {
    margin-left: auto;
    font-size: 0.75rem;
    color: rgba(30, 44, 40, 0.45);
    white-space: nowrap;
  }
`;

const FaqList = styled.div`
  display: flex;
  flex-direction: column;
`;

const FaqItem = styled.div`
  border-bottom: 1px solid rgba(0,0,0,0.05);

  &:last-child { border-bottom: none; }
`;

const FaqQuestion = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1.25rem;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-dark);
  line-height: 1.4;
  transition: background 0.15s ease;

  &:hover { background: rgba(0,0,0,0.02); }

  .chevron {
    flex-shrink: 0;
    color: rgba(30, 44, 40, 0.45);
    transition: transform 0.22s ease;
    transform: ${({ $open }) => ($open ? 'rotate(180deg)' : 'rotate(0deg)')};
  }
`;

const FaqAnswer = styled.div`
  max-height: ${({ $open }) => ($open ? '20rem' : '0')};
  overflow: hidden;
  transition: max-height 0.28s ease;

  p {
    margin: 0;
    padding: 0 1.25rem 1rem 1.25rem;
    color: rgba(30, 44, 40, 0.65);
    font-size: 0.85rem;
    line-height: 1.65;
  }
`;

const EmptyState = styled.div`
  background: #fff;
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 2.5rem 1.5rem;
  text-align: center;
  color: rgba(30, 44, 40, 0.45);
  font-size: 0.9rem;
`;

/* ── Static data ── */

const topics = [
  {
    id: 'primeiros-passos',
    label: 'Primeiros passos',
    Icon: Rocket,
    items: [
      {
        q: 'Como compartilho o link de agendamento com meus clientes?',
        a: 'No menu superior, clique no ícone de usuário e selecione "Link compartilhável". Um modal abre com o link único da sua empresa. Você pode copiar o link ou compartilhar diretamente no WhatsApp. Envie para seus clientes pela bio do Instagram, grupo de WhatsApp ou onde preferir — eles agendam pelo navegador, sem instalar nada.'
      },
      {
        q: 'Como configuro as informações da minha empresa?',
        a: 'Acesse "Configurações" no menu lateral. Lá você edita o nome da empresa, o número de WhatsApp, o Instagram, a logo e o tempo mínimo para cancelamento de agendamentos. Salve as alterações ao finalizar.'
      },
      {
        q: 'Como faço login no aplicativo mobile?',
        a: 'Baixe o aplicativo Horário Certo na App Store (iOS) ou Google Play (Android). Na tela de login, use o mesmo e-mail e senha do painel web. O aplicativo sincroniza tudo em tempo real.'
      },
      {
        q: 'O que devo configurar primeiro ao criar minha conta?',
        a: 'Siga essa ordem para ter tudo pronto rapidamente: (1) Cadastre seus serviços com nome e preço em "Serviços". (2) Crie os horários disponíveis para o dia em "Criar agendamentos". (3) Ajuste as informações da empresa em "Configurações". (4) Compartilhe o link com seus clientes pelo menu superior. Em menos de 30 minutos sua agenda já pode receber agendamentos.'
      },
    ]
  },
  {
    id: 'agendamentos',
    label: 'Agendamentos',
    Icon: CalendarDays,
    items: [
      {
        q: 'Como vejo os agendamentos?',
        a: 'No Dashboard você vê um resumo dos próximos agendamentos. Para a visão completa, acesse "Agendamentos" no menu lateral — lá você filtra por período (3 dias, 7 dias ou personalizado), por status (Disponível, Agendado, Concluído, Expirado) e por serviço.'
      },
      {
        q: 'O que significa cada status de agendamento?',
        a: '"Disponível" significa que o horário foi criado por você mas ainda não foi reservado por nenhum cliente. "Agendado" indica que um cliente reservou o horário. "Concluído" é um horário agendado cuja data/hora já passou. "Expirado" é um horário disponível que não foi reservado e já passou.'
      },
      {
        q: 'Como cancelo um agendamento?',
        a: 'Na listagem de "Agendamentos", localize o horário desejado na tabela e use a ação de cancelamento disponível. Se você tiver o WhatsApp ativo, o cliente pode ser notificado automaticamente.'
      },
      {
        q: 'O cliente recebe confirmação quando agenda?',
        a: 'Você sempre recebe uma notificação push no celular quando um cliente agenda (desde que o app esteja instalado e as notificações ativas). Se você tiver o recurso de WhatsApp contratado, o cliente também recebe uma mensagem automática de confirmação.'
      },
      {
        q: 'O que acontece quando um cliente tenta agendar em um horário já ocupado?',
        a: 'Horários com status "Agendado" ficam automaticamente indisponíveis na página pública. O cliente só consegue reservar horários com status "Disponível", eliminando o risco de duplo agendamento.'
      },
    ]
  },
  {
    id: 'agenda-horarios',
    label: 'Agenda e horários',
    Icon: Clock,
    items: [
      {
        q: 'Como crio os horários disponíveis para um dia?',
        a: 'Acesse "Criar agendamentos" no menu lateral. Selecione a data, informe o horário de abertura, o de fechamento e a duração de cada atendimento em minutos. Clique em "Gerar horários" — o sistema calcula automaticamente todos os slots do dia. Revise e clique em "Salvar agendamentos".'
      },
      {
        q: 'Como bloqueio um dia inteiro (folga ou feriado)?',
        a: 'Simplesmente não crie horários para aquele dia em "Criar agendamentos". Sem horários cadastrados, o dia fica sem disponibilidade na página pública e os clientes não conseguem agendar nessa data.'
      },
      {
        q: 'Como adiciono um intervalo de almoço ou pausa no meio do dia?',
        a: 'Em "Criar agendamentos", após preencher os horários de abertura e fechamento, clique em "Inserir intervalo". Informe o início e o fim da pausa (ex.: 12:00 às 13:00). O sistema ignora esse período ao gerar os horários disponíveis. Você pode adicionar mais de um intervalo se precisar.'
      },
      {
        q: 'Posso remover um horário específico antes de salvar?',
        a: 'Sim. Após gerar os horários, eles aparecem como chips na tela. Clique no X de qualquer chip para remover aquele slot individualmente antes de salvar. Também é possível limpar todos de uma vez com o botão "Limpar horários".'
      },
    ]
  },
  {
    id: 'servicos',
    label: 'Serviços',
    Icon: Scissors,
    items: [
      {
        q: 'Como adiciono um novo serviço?',
        a: 'Acesse "Serviços" no menu lateral e clique em "Novo serviço". Preencha o nome (ex.: Corte, Barba, Corte + Barba) e o valor em reais. O serviço fica disponível imediatamente para seus clientes escolherem ao agendar.'
      },
      {
        q: 'Como altero o nome ou o preço de um serviço?',
        a: 'Em "Serviços", clique no serviço que deseja editar. Altere o nome ou o valor e salve. Atenção: não é possível cadastrar dois serviços com o mesmo nome.'
      },
      {
        q: 'Como desativo um serviço temporariamente sem excluí-lo?',
        a: 'Na listagem de serviços, use o toggle (chave) ao lado do serviço para inativá-lo. Um serviço inativo some da página pública mas permanece no histórico de agendamentos. Você pode reativá-lo a qualquer momento pelo mesmo toggle.'
      },
      {
        q: 'A duração do serviço é configurada em Serviços?',
        a: 'Não. A duração de cada slot de atendimento é definida em "Criar agendamentos", no campo "Duração do agendamento (minutos)". Esse valor vale para todos os horários gerados naquele dia. O cadastro de serviços registra apenas nome e valor.'
      },
    ]
  },
  {
    id: 'analises',
    label: 'Análises e relatórios',
    Icon: BarChart2,
    items: [
      {
        q: 'O que aparece no Dashboard?',
        a: 'O Dashboard exibe três cards de resumo (agendamentos realizados, em aberto e total no período) e uma lista dos próximos agendamentos. Use o filtro de período — "essa semana", "próximos 15 dias" ou "próximos 30 dias" — para ajustar a visualização.'
      },
      {
        q: 'O que mostra a página de Análise?',
        a: 'A página "Análise" traz quatro métricas principais: visualizações da sua página, agendamentos realizados, horários não agendados e valor total dos agendamentos. Cada card compara o período atual com o anterior e exibe variação percentual. Há também um gráfico de barras por dia e um gráfico de pizza por serviço. Use o filtro para ver os últimos 7, 15 ou 30 dias.'
      },
      {
        q: 'Para que serve a seção de Relatórios?',
        a: 'Em "Relatórios" você vê a lista detalhada de cada agendamento: data, hora, status, serviço, nome e telefone do cliente. Há filtros por período (incluindo datas personalizadas), status e serviço. Você também pode ordenar qualquer coluna clicando no cabeçalho.'
      },
      {
        q: 'Como exporto os dados de relatórios?',
        a: 'Na página "Relatórios" há dois botões de exportação: "Exportar CSV" (planilha) e "Exportar PDF". Ambos geram o arquivo com os dados filtrados no momento da exportação, incluindo logo e data de geração.'
      },
    ]
  },
  {
    id: 'notificacoes',
    label: 'Notificações',
    Icon: Bell,
    items: [
      {
        q: 'Como ativo as notificações push no celular?',
        a: 'As notificações push funcionam pelo aplicativo mobile. Após instalar o app e fazer login, acesse "Notificações Push" no menu. Ative a opção e permita o acesso quando o sistema operacional solicitar. Você passa a receber alertas em tempo real para novos agendamentos e cancelamentos.'
      },
      {
        q: 'O que são as notificações de WhatsApp e como configuro?',
        a: 'As notificações de WhatsApp são mensagens automáticas enviadas para seus clientes — um lembrete antes do agendamento ("Lembrete de agendamento") e uma mensagem incentivando o retorno após um período sem visita ("Notificação de retorno"). Acesse "Notificações" no menu lateral para configurar os prazos. Esse recurso exige o WhatsApp contratado no plano.'
      },
      {
        q: 'Qual é a diferença entre "Notificações" e "Notificações Push" no menu?',
        a: '"Notificações" configura o envio automático de mensagens de WhatsApp para os seus clientes (requer recurso adicional de WhatsApp). "Notificações Push" configura os alertas que chegam no seu próprio celular via aplicativo, avisando sobre novos agendamentos e cancelamentos — aparece apenas quando você está usando o app mobile.'
      },
      {
        q: 'Recebi uma notificação de agendamento cancelado — o que faço?',
        a: 'O horário volta automaticamente para o status "Disponível" após o cancelamento. Você pode verificar em "Agendamentos" e, se quiser, entrar em contato com um cliente da lista de espera para oferecer o horário liberado.'
      },
    ]
  },
  {
    id: 'assinatura',
    label: 'Assinatura',
    Icon: Banknote,
    items: [
      {
        q: 'Como vejo minha fatura e faço o pagamento?',
        a: 'Acesse "Assinatura" no menu lateral. Se houver uma fatura em aberto, você verá o QR Code do Pix e o código para cópia. O código expira após um tempo — se isso acontecer, a página atualiza automaticamente com um novo. Após pagar, clique em "Já fiz o pagamento" para confirmar.'
      },
      {
        q: 'Como mudo de plano?',
        a: 'Em "Assinatura", clique em "Mudar assinatura". Você será direcionado para a página de troca de plano, onde pode escolher um novo plano e confirmar a alteração.'
      },
      {
        q: 'O que acontece se eu não pagar a fatura no prazo?',
        a: 'Após o vencimento, há um período de carência de 5 dias. Se a fatura continuar em aberto após esse prazo, sua agenda é bloqueada — clientes não conseguem fazer novos agendamentos e a página pública exibe uma mensagem de indisponibilidade. Para reativar, acesse "Assinatura", gere a fatura em atraso (com multa de 2% e juros de 1% a.m. pro-rata) e efetue o pagamento.'
      },
      {
        q: 'Como adiciono o recurso de WhatsApp ao meu plano?',
        a: 'Acesse "Mudar assinatura" e selecione o recurso adicional desejado: WhatsApp Básico (até 500 mensagens/mês) ou WhatsApp Plus (mensagens ilimitadas). Confirme a contratação para ativar o recurso no seu plano.'
      },
    ]
  },
  {
    id: 'lista-de-espera',
    label: 'Lista de espera',
    Icon: ListOrdered,
    items: [
      {
        q: 'Como funciona a lista de espera?',
        a: 'Quando não há horários disponíveis na sua agenda, o cliente pode entrar na lista de espera pela página pública, informando nome e telefone. Você gerencia essa fila pela página "Lista de espera" no menu lateral.'
      },
      {
        q: 'Como vejo e contato quem está na lista de espera?',
        a: 'Acesse "Lista de espera" no menu lateral. A tabela exibe a posição na fila do dia, a data de entrada, o nome e o telefone de cada cliente. Use o botão de WhatsApp para abrir uma conversa direta ou o botão de ligação para ligar pelo celular.'
      },
      {
        q: 'O sistema notifica o cliente automaticamente quando um horário abre?',
        a: 'O contato com clientes da lista de espera é feito manualmente por você, pelos botões de WhatsApp e ligação disponíveis na página. Não há envio automático de notificação ao liberar um horário — você escolhe quem contatar e quando.'
      },
      {
        q: 'Como removo um cliente da lista de espera?',
        a: 'Na página "Lista de espera", clique no ícone de lixeira ao lado do cliente para removê-lo da fila. Útil quando o cliente já foi atendido por outro canal ou não tem mais interesse.'
      },
    ]
  },
];

export default function Help() {
  const navigate = useNavigate();
  const companyUrl = Cookies.get("companyUrl");
  const [companyInfo] = useState(
    Cookies.get("companyInfo") ? JSON.parse(Cookies.get("companyInfo")) : undefined
  );
  const [mobile, setMobile] = useState(false);
  const [activeTopicId, setActiveTopicId] = useState(topics[0].id);
  const [openItem, setOpenItem] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isAvailableLogin()) {
      setMobile(isMobile());
    } else {
      navigate("/" + companyUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeTopic = topics.find((t) => t.id === activeTopicId);

  const filteredItems = search.trim().length > 1
    ? topics.flatMap((t) =>
        t.items
          .filter(
            (item) =>
              item.q.toLowerCase().includes(search.toLowerCase()) ||
              item.a.toLowerCase().includes(search.toLowerCase())
          )
          .map((item) => ({ ...item, topicLabel: t.label }))
      )
    : activeTopic.items.map((item) => ({ ...item, topicLabel: activeTopic.label }));

  const isSearching = search.trim().length > 1;

  const handleTabChange = (id) => {
    setActiveTopicId(id);
    setOpenItem(null);
    setSearch("");
  };

  return (
    <>
      {companyInfo && (
        <>
          <Topbar
            name={companyInfo.name}
            imagem={companyInfo.imagem}
            whatsapp={companyInfo.whatsapp}
            instagram={companyInfo.instagram}
            loggedIn={true}
          />
          <Container
            $width="100%"
            $display="flex"
            $flexdirection="column"
            $padding={mobile ? "1rem" : "0"}
            $margin="0"
            $backgroundcolor="transparent"
            $borderRadius="0"
            $boxshadow="none"
          >
            <Sidebar>
              <Container
                $width="90%"
                $borderRadius="0 1rem 2rem 1rem"
                $padding="0 0 3rem 0"
                $display="flex"
                $flexdirection="column"
                $backgroundcolor="transparent"
                $boxshadow="none"
              >
                <PageHeader>
                  <PageTitle>Central de Ajuda</PageTitle>
                  <PageSubtitle>
                    Encontre respostas rápidas sobre como usar o Horário Certo
                  </PageSubtitle>
                  <SearchBar>
                    <Search size={15} />
                    <input
                      type="text"
                      placeholder="Buscar dúvida..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </SearchBar>
                </PageHeader>

                {!isSearching && (
                  <TopicTabs>
                    {topics.map(({ id, label, Icon }) => (
                      <TopicTab
                        key={id}
                        type="button"
                        $active={activeTopicId === id}
                        onClick={() => handleTabChange(id)}
                      >
                        <Icon size={14} />
                        {label}
                      </TopicTab>
                    ))}
                  </TopicTabs>
                )}

                <FaqCard>
                  <FaqCardHeader>
                    {!isSearching && activeTopic && (
                      <>
                        <activeTopic.Icon size={18} />
                        <h2>{activeTopic.label}</h2>
                        <span>{activeTopic.items.length} tópicos</span>
                      </>
                    )}
                    {isSearching && (
                      <>
                        <Search size={18} />
                        <h2>Resultados para "{search}"</h2>
                        <span>{filteredItems.length} encontrado{filteredItems.length !== 1 ? 's' : ''}</span>
                      </>
                    )}
                  </FaqCardHeader>

                  <FaqList>
                    {filteredItems.length === 0 ? (
                      <EmptyState>Nenhuma dúvida encontrada para "{search}"</EmptyState>
                    ) : (
                      filteredItems.map((item, i) => {
                        const key = `${activeTopicId}-${i}`;
                        const isOpen = openItem === key;
                        return (
                          <FaqItem key={key}>
                            <FaqQuestion
                              type="button"
                              $open={isOpen}
                              onClick={() => setOpenItem(isOpen ? null : key)}
                              aria-expanded={isOpen}
                            >
                              {item.q}
                              <ChevronDown size={16} className="chevron" />
                            </FaqQuestion>
                            <FaqAnswer $open={isOpen}>
                              <p>{item.a}</p>
                            </FaqAnswer>
                          </FaqItem>
                        );
                      })
                    )}
                  </FaqList>
                </FaqCard>
              </Container>
            </Sidebar>
          </Container>
        </>
      )}
    </>
  );
}

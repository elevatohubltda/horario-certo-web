import { useEffect, useState } from "react";
import styled from "styled-components";
import "../styles/index.css";
import { PageLayout } from "../components/admin";
import { isAdmin, isAvailableLogin } from "../util/auth";
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
  Users,
  UserRound,
  ChevronDown,
  Search,
} from "lucide-react";

/* ── Layout ── */

const PageHeader = styled.div`
  margin-bottom: 1.25rem;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 999px;
  padding: 0.6rem 1rem;
  margin: 0;
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
        q: 'O que devo configurar primeiro ao criar minha conta?',
        a: 'Siga esta ordem: (1) Em "Configurações", preencha os dados da empresa (nome, WhatsApp, Instagram, logo, e-mail e CPF/CNPJ) e escolha o modo de agenda. (2) Cadastre seus serviços em "Serviços". (3) Defina seus horários: no modo Simples, em "Configuração Horários"; no modo Padrão, em "Criar agendamentos". (4) Compartilhe o link com seus clientes. Em poucos minutos sua agenda já pode receber agendamentos. Se preferir, nossa equipe faz essa configuração junto com você.'
      },
      {
        q: 'Como compartilho o link de agendamento com meus clientes?',
        a: 'No menu do usuário (ícone no canto superior direito), clique em "Link compartilhável" para copiar o link da sua agenda ou enviar direto pelo WhatsApp. Coloque o link na bio do Instagram, no status e nas conversas com clientes: eles agendam pelo navegador do celular, sem baixar nada e sem cadastro. Em "Divulgação" você também baixa cartazes prontos com o QR Code da sua agenda.'
      },
      {
        q: 'Qual a diferença entre o modo Simples e o modo Padrão de agenda?',
        a: 'No modo Simples, você informa os dias de atendimento, o horário de abertura e fechamento e os intervalos da semana, e cada serviço tem a própria duração: o sistema calcula sozinho os horários livres. É o modo recomendado e o único que permite equipe com vários profissionais. No modo Padrão, você cria manualmente os horários de cada dia em "Criar agendamentos". O modo é escolhido em "Configurações".'
      },
      {
        q: 'Como uso o Horário Certo no celular?',
        a: 'O painel funciona no navegador do celular e do computador, com o mesmo usuário e senha. O aplicativo Horário Certo, com notificações no celular, ainda não está nas lojas de aplicativos; quando estiver disponível, avisaremos por aqui.'
      },
      {
        q: 'Como funciona o teste grátis?',
        a: 'Todo cadastro começa com 14 dias grátis, sem cartão. Durante o teste você usa todos os recursos, exceto o envio de mensagens pelo WhatsApp, que começa após o pagamento da primeira mensalidade (no plano Fundador, o WhatsApp já funciona durante o teste). Para assinar antes do fim do teste, use "Assinar agora" em "Assinatura".'
      },
    ]
  },
  {
    id: 'agenda-horarios',
    label: 'Agenda e horários',
    Icon: Clock,
    items: [
      {
        q: 'Como defino meus dias e horários de atendimento (modo Simples)?',
        a: 'Acesse "Configuração Horários". Para cada dia da semana, marque se atende e informe a abertura, o fechamento e, se quiser, o intervalo (ex.: almoço das 12:00 às 13:00). Os clientes só veem horários livres dentro desse período, já considerando a duração de cada serviço e os agendamentos existentes.'
      },
      {
        q: 'Como crio os horários de um dia (modo Padrão)?',
        a: 'Acesse "Criar agendamentos", selecione a data, informe abertura, fechamento e a duração de cada atendimento e clique em "Gerar horários". Você pode inserir intervalos e remover horários específicos antes de salvar.'
      },
      {
        q: 'Como bloqueio um dia de folga ou feriado?',
        a: 'No modo Simples, deixe o dia como fechado em "Configuração Horários" na semana correspondente. No modo Padrão, basta não criar horários para aquele dia. Sem horários disponíveis, os clientes não conseguem agendar nessa data.'
      },
      {
        q: 'Onde vejo minha agenda?',
        a: 'No modo Simples, use "Agenda semanal": ela mostra a semana (ou o dia) com os agendamentos coloridos pela cor do serviço, os intervalos e os períodos fechados. No celular, a agenda abre na visão do dia. No modo Padrão, use "Agendamentos", com filtros por período, status e serviço. O Dashboard mostra um resumo dos próximos atendimentos.'
      },
    ]
  },
  {
    id: 'agendamentos',
    label: 'Agendamentos',
    Icon: CalendarDays,
    items: [
      {
        q: 'Como o cliente agenda?',
        a: 'Ele abre o seu link, escolhe o serviço, o profissional (ou "sem preferência") e o horário, e informa nome e WhatsApp. Não precisa baixar aplicativo nem criar conta. Um horário reservado some na hora para os outros clientes, então não há agendamento duplicado.'
      },
      {
        q: 'O cliente recebe confirmação e lembrete?',
        a: 'Sim, pelo WhatsApp, a partir do pagamento da primeira mensalidade: confirmação na hora do agendamento e lembrete antes do horário (a antecedência é configurada em "Notificações"). No teste grátis as mensagens não são enviadas, exceto no plano Fundador, em que já funcionam durante o teste.'
      },
      {
        q: 'Como cancelo ou altero um agendamento?',
        a: 'Abra o agendamento na agenda e use as ações disponíveis: falar com o cliente no WhatsApp, editar data e horário ou cancelar. Profissionais da equipe só alteram os próprios agendamentos.'
      },
      {
        q: 'O cliente pode cancelar ou remarcar sozinho?',
        a: 'Sim. Quem agenda com conta na área do cliente pode cancelar e remarcar por lá; quem agenda sem conta cancela pelo código recebido. Em "Configurações" você define a antecedência mínima para o cliente desmarcar: dentro desse prazo, só o estabelecimento consegue cancelar.'
      },
      {
        q: 'Posso trocar o profissional de um agendamento já feito?',
        a: 'Ainda não. Nesse caso, cancele o agendamento e faça um novo com o outro profissional.'
      },
    ]
  },
  {
    id: 'servicos',
    label: 'Serviços',
    Icon: Scissors,
    items: [
      {
        q: 'Como cadastro um serviço?',
        a: 'Acesse "Serviços" e clique em "Novo serviço". Informe o nome, o valor, a duração em minutos e a cor que aparece na agenda. Com equipe, escolha quais profissionais fazem o serviço e o valor de cada um.'
      },
      {
        q: 'Como funciona a comissão da equipe?',
        a: 'No cadastro do serviço, informe a "Parte do estabelecimento nos atendimentos da equipe" (%). Cada atendimento guarda o valor e a comissão do momento, e o Dashboard e os Relatórios mostram o faturamento e a parte do estabelecimento.'
      },
      {
        q: 'Como altero ou deixo de oferecer um serviço?',
        a: 'Em "Serviços", clique no serviço para editar nome, valor, duração ou cor. Para tirar um serviço da sua agenda, exclua-o: com equipe, você pode só deixar de prestá-lo, e ele continua disponível com os outros profissionais. Não é possível ter dois serviços com o mesmo nome.'
      },
    ]
  },
  {
    id: 'equipe',
    label: 'Equipe',
    Icon: Users,
    items: [
      {
        q: 'Como cadastro os profissionais da minha equipe?',
        a: 'Acesse "Profissionais" e clique em "Novo profissional". Cada profissional ganha usuário e senha próprios, com agenda e serviços próprios. O número de profissionais depende do seu plano e aparece no topo da tela. A agenda com equipe funciona no modo Simples.'
      },
      {
        q: 'O que o profissional vê no sistema?',
        a: 'Ele vê e gerencia só os próprios agendamentos, serviços e lista de espera, e no Dashboard só o próprio faturamento. Dados da assinatura e da empresa ficam só com o dono.'
      },
      {
        q: 'Como o cliente escolhe o profissional?',
        a: 'Na sua página, o cliente escolhe o profissional ou "sem preferência". Com "sem preferência", ele vê os horários livres de todos os profissionais que fazem o serviço.'
      },
    ]
  },
  {
    id: 'notificacoes',
    label: 'Notificações',
    Icon: Bell,
    items: [
      {
        q: 'Quais mensagens de WhatsApp meus clientes recebem?',
        a: 'Confirmação ao agendar, lembrete antes do horário, aviso de remarcação e de cancelamento e, se você ativar, a "Notificação de retorno" para clientes que costumam voltar e ainda não voltaram. Em "Notificações" você liga cada envio e define a antecedência do lembrete e os dias da mensagem de retorno. O WhatsApp está incluso em todos os planos e começa após a primeira mensalidade; no plano Fundador, já durante o teste grátis.'
      },
      {
        q: 'Como ativo as notificações no meu celular?',
        a: 'As notificações push chegam pelo aplicativo Horário Certo. No app, abra o menu, entre em "Notificações Push", ative e permita quando o celular pedir. Cada pessoa da equipe ativa no próprio celular.'
      },
      {
        q: 'Que avisos chegam no celular e posso escolher quais quero?',
        a: 'Você pode receber: novos agendamentos, cancelamentos, remarcações feitas pelo cliente, avisos da lista de espera (nova pessoa e vaga liberada por cancelamento) e o resumo do dia, às 7h. O dono recebe também os lembretes da assinatura. Em "Notificações Push", logo abaixo do botão principal, você liga e desliga cada tipo. Avisos importantes da assinatura (pagamento confirmado, cobrança recusada e agenda bloqueada) sempre chegam enquanto as notificações estiverem ativadas.'
      },
      {
        q: 'Meu funcionário recebe os avisos de cobrança?',
        a: 'Não. Cada profissional recebe só os avisos dos próprios agendamentos. Avisos da assinatura vão só para o dono.'
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
        a: 'Quando não encontra horário, o cliente entra na lista de espera do dia pela sua página, informando nome e telefone. Você vê a fila em "Lista de espera", com botões para chamar no WhatsApp ou ligar.'
      },
      {
        q: 'Sou avisado quando alguém entra na lista ou quando abre uma vaga?',
        a: 'Sim, pelas notificações do aplicativo: quando alguém entra na lista e quando um cancelamento libera horário num dia com gente esperando. O contato com o cliente da lista é feito por você, pelos botões da tela.'
      },
      {
        q: 'Como removo alguém da lista de espera?',
        a: 'Em "Lista de espera", clique no ícone de lixeira ao lado do cliente.'
      },
    ]
  },
  {
    id: 'clientes',
    label: 'Seus clientes',
    Icon: UserRound,
    items: [
      {
        q: 'Meu cliente precisa criar conta para agendar?',
        a: 'Não. Ele pode agendar só com nome e WhatsApp. Se quiser, cria uma conta na área do cliente (com e-mail e senha ou com o Google) para ver, remarcar e cancelar os horários em todos os estabelecimentos que usam o Horário Certo.'
      },
      {
        q: 'Por que um agendamento não aparece na área do cliente?',
        a: 'Na área do cliente aparecem só os agendamentos feitos com a conta conectada. Os feitos sem conta e os já cancelados não aparecem lá.'
      },
      {
        q: 'O que acontece quando alguém clica em "Entrar" na minha página?',
        a: 'O sistema pergunta se a pessoa é cliente ou estabelecimento. Clientes vão para a área do cliente; você vai para o seu painel.'
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
        a: 'Resumo do período escolhido: total de agendamentos, faturamento e, com equipe, a parte do estabelecimento, além da lista dos próximos atendimentos.'
      },
      {
        q: 'O que mostra a página de Análise?',
        a: 'Visualizações da sua página, agendamentos realizados, horários não agendados e valor total, comparando com o período anterior, com gráficos por dia e por serviço. Filtre por 7, 15 ou 30 dias.'
      },
      {
        q: 'Como exporto meus relatórios?',
        a: 'Em "Relatórios" você vê cada agendamento com data, hora, status, serviço, cliente e valores, com filtros por período, status e serviço. Use "Exportar CSV" (planilha) ou "Exportar PDF".'
      },
    ]
  },
  {
    id: 'assinatura',
    label: 'Assinatura',
    Icon: Banknote,
    items: [
      {
        q: 'Como pago minha mensalidade?',
        a: 'Em "Assinatura", escolha Pix ou cartão de crédito. No Pix, a fatura do mês aparece com QR Code e código para copiar; o código é renovado automaticamente se expirar. No cartão, a cobrança é automática todo mês e o cartão é cadastrado numa página segura da Stripe: o Horário Certo não vê nem guarda os dados dele.'
      },
      {
        q: 'Posso assinar antes do fim do teste grátis?',
        a: 'Sim. Em "Assinatura", clique em "Assinar agora" e escolha Pix ou cartão. O teste termina, o WhatsApp é liberado assim que o pagamento é confirmado e sua mensalidade passa a vencer no dia do pagamento.'
      },
      {
        q: 'Como troco o cartão ou volto para o Pix?',
        a: 'Em "Assinatura", na área Forma de pagamento: "Trocar cartão" abre a página segura para cadastrar outro cartão, e "Voltar a pagar via Pix" desliga a cobrança no cartão e as próximas faturas passam a ser por Pix.'
      },
      {
        q: 'O que acontece se o pagamento atrasar?',
        a: 'Depois do vencimento há 3 dias de carência com a agenda funcionando. Se continuar em aberto, a agenda é bloqueada: o painel mostra como regularizar e sua página fica indisponível para os clientes. A fatura em atraso tem multa de 2% e juros de 1% ao mês, proporcionais aos dias. Pagou, a agenda volta na hora.'
      },
      {
        q: 'Meu cartão foi recusado. E agora?',
        a: 'Você recebe um aviso e, em "Assinatura", aparece o botão "Atualizar cartão". Novas tentativas de cobrança são feitas nos dias seguintes. Você também pode pagar pelo Pix. Se a mensalidade só for paga depois do bloqueio, a multa e os juros entram na cobrança seguinte do cartão.'
      },
      {
        q: 'Como mudo de plano?',
        a: 'Em "Assinatura", clique em "Mudar assinatura" e escolha o novo plano. No cartão, o novo valor vale a partir da próxima cobrança.'
      },
      {
        q: 'Como cancelo minha assinatura? Tenho direito a reembolso?',
        a: 'Em "Assinatura", use "Cancelar assinatura", a qualquer momento, sem multa. Você continua usando até o fim do período já pago e não é mais cobrado; até lá dá para desfazer o cancelamento. Se pedir em até 7 dias do primeiro pagamento, pode escolher o reembolso integral (o acesso termina no mesmo dia).'
      },
    ]
  },
];

export default function Help() {
  const navigate = useNavigate();
  const companyUrl = Cookies.get("companyUrl");
  // Admin não tem empresa: usa um objeto vazio para a página renderizar mesmo assim
  const [companyInfo] = useState(
    Cookies.get("companyInfo") ? JSON.parse(Cookies.get("companyInfo")) : (isAdmin() ? {} : undefined)
  );
  const [activeTopicId, setActiveTopicId] = useState(topics[0].id);
  const [openItem, setOpenItem] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isAvailableLogin()) {
    } else {
      navigate(companyUrl ? "/" + companyUrl : "/login");
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
            <PageLayout title="Central de ajuda" subtitle="Encontre respostas rápidas sobre como usar o Horário Certo.">
                <PageHeader>
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
            </PageLayout>
      )}
    </>
  );
}

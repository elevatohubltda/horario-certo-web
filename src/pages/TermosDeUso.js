import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Page = styled.main`
  min-height: 100vh;
  background: var(--ui-page-bg);
  padding: 2.5rem 1rem 4rem;
  box-sizing: border-box;
`;

const Container = styled.div`
  max-width: 760px;
  margin: 0 auto;
  background: #fff;
  border-radius: 14px;
  border: 1px solid var(--ui-border);
  padding: 2.4rem 2.8rem;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);

  @media (max-width: 640px) {
    padding: 1.5rem 1.2rem;
  }
`;

const BackBtn = styled.button`
  border: none;
  background: none;
  color: var(--ui-text);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;

  &:hover { text-decoration: underline; }
`;

const Logo = styled.p`
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--ui-text);
  text-transform: uppercase;
  margin: 0 0 0.5rem;
`;

const H1 = styled.h1`
  font-size: 1.7rem;
  color: var(--ui-text);
  margin: 0 0 0.4rem;
`;

const Updated = styled.p`
  font-size: 0.78rem;
  color: var(--ui-muted);
  margin: 0 0 2rem;
`;

const Hr = styled.hr`
  border: none;
  border-top: 1px solid var(--ui-border);
  margin: 1.8rem 0;
`;

const H2 = styled.h2`
  font-size: 1.05rem;
  color: var(--ui-text);
  margin: 0 0 0.6rem;
`;

const P = styled.p`
  font-size: 0.88rem;
  color: var(--ui-text-secondary);
  line-height: 1.7;
  margin: 0 0 0.8rem;
`;

const Ul = styled.ul`
  padding-left: 1.3rem;
  margin: 0 0 0.8rem;

  li {
    font-size: 0.88rem;
    color: var(--ui-text-secondary);
    line-height: 1.7;
    margin-bottom: 0.25rem;
  }
`;

const Tag = styled.span`
  display: inline-block;
  background: #f3f4f6;
  color: var(--ui-text-secondary);
  border-radius: 6px;
  padding: 0.15rem 0.55rem;
  font-size: 0.78rem;
  font-weight: 600;
  margin-right: 0.4rem;
  margin-bottom: 0.4rem;
`;

const ContactBox = styled.div`
  background: #f9fafb;
  border: 1px solid var(--ui-border);
  border-radius: 10px;
  padding: 1rem 1.2rem;
  margin-top: 0.5rem;

  p {
    margin: 0;
    font-size: 0.86rem;
    color: var(--ui-text-secondary);
    line-height: 1.7;
  }

  strong {
    color: var(--ui-text);
  }
`;

// Dados de identificação da empresa (exigidos pela LGPD e pelo Decreto 7.962/2013 do comércio eletrônico)
const COMPANY = {
  legalName: 'L&L Tecnologia Ltda',
  brand: 'ElevatoHub',
  cnpj: '46.647.130/0001-11',
  address: 'Rua Ruy dos Anjos Peirão, 189, Santo Antônio, Formiga/MG, CEP 35574-076',
  email: 'elevatohubltda@gmail.com',
};

export default function TermosDeUso() {
  const navigate = useNavigate();

  return (
    <Page>
      <Container>
        <BackBtn onClick={() => navigate(-1)}>← Voltar</BackBtn>

        <Logo>Horário Certo</Logo>
        <H1>Termos de Uso e Política de Privacidade</H1>
        <Updated>Última atualização: novembro de 2026</Updated>

        <P>
          Bem-vindo ao <strong>Horário Certo</strong>, plataforma de agendamentos online desenvolvida e
          operada pela <strong>{COMPANY.legalName}</strong> ({COMPANY.brand}), inscrita no CNPJ{' '}
          {COMPANY.cnpj}. Ao utilizar nossos serviços, você concorda com os termos descritos neste
          documento, em conformidade com a{' '}
          <strong>Lei Geral de Proteção de Dados Pessoais (LGPD, Lei nº 13.709/2018)</strong>, o Marco Civil
          da Internet e o Código de Defesa do Consumidor.
        </P>
        <P>Este documento vale para dois públicos:</P>
        <Ul>
          <li><strong>Estabelecimentos</strong> (prestadores de serviço) que contratam o Horário Certo para organizar a agenda.</li>
          <li><strong>Clientes finais</strong>, que agendam horários com esses estabelecimentos pelo link deles, com ou sem conta.</li>
        </Ul>

        <Hr />

        <H2>1. Quem somos e papéis no tratamento dos dados</H2>
        <P>
          A <strong>{COMPANY.legalName}</strong> é a <strong>controladora</strong> dos dados das contas dos
          estabelecimentos, das contas de clientes finais (área do cliente) e dos dados técnicos da plataforma.
        </P>
        <P>
          Em relação aos dados dos clientes de cada estabelecimento (nome, telefone e agendamentos), o{' '}
          <strong>estabelecimento é o controlador</strong> e a {COMPANY.legalName} atua como{' '}
          <strong>operadora</strong>, tratando esses dados apenas para prestar o serviço contratado e conforme
          as instruções do estabelecimento.
        </P>

        <Hr />

        <H2>2. Dados pessoais coletados</H2>
        <P>Coletamos apenas os dados necessários para a prestação do serviço:</P>
        <Ul>
          <li><strong>Dados da empresa:</strong> nome fantasia, endereço de acesso (link), WhatsApp, Instagram e logo.</li>
          <li><strong>Dados do responsável e da equipe:</strong> nome de usuário e senha (guardada em hash irreversível).</li>
          <li><strong>Dados de cobrança:</strong> e-mail e CPF ou CNPJ, usados exclusivamente para gerar as cobranças da assinatura na Stripe e emitir a nota fiscal de serviço (NFS-e) de cada mensalidade paga.</li>
          <li><strong>Dados dos clientes finais nos agendamentos:</strong> nome, telefone/WhatsApp, serviço e horário.</li>
          <li><strong>Conta do cliente final (área do cliente):</strong> nome, e-mail, telefone, senha (em hash irreversível) ou, no login com o Google, nome, e-mail e o identificador da conta Google. Guardamos também o histórico de agendamentos feitos com a conta.</li>
          <li><strong>Dados técnicos:</strong> registros de acesso e de envio de mensagens, mantidos para segurança, diagnóstico e controle de uso.</li>
        </Ul>
        <P>
          Telefones e outros dados de contato são guardados criptografados. Não coletamos dados sensíveis
          (origem racial, saúde, biometria etc.) nem fazemos rastreamento para publicidade.
        </P>

        <Hr />

        <H2>3. Para que usamos os dados</H2>
        <Ul>
          <li>Prestar o serviço de agendamento online contratado pelo estabelecimento.</li>
          <li>Permitir que o cliente final veja, cancele e remarque os próprios agendamentos na área do cliente.</li>
          <li>Enviar confirmações, lembretes, avisos de remarcação ou cancelamento e mensagens de retorno pelo WhatsApp, quando o estabelecimento ativar esses recursos.</li>
          <li>Enviar notificações no aplicativo para o estabelecimento e sua equipe.</li>
          <li>Cobrar a assinatura mensal (Pix ou cartão de crédito) e controlar o acesso conforme o pagamento.</li>
          <li>Cumprir obrigações legais e fiscais e prevenir fraudes.</li>
        </Ul>

        <Hr />

        <H2>4. Base legal</H2>
        <P>O tratamento é realizado com base nos seguintes fundamentos da LGPD:</P>
        <Ul>
          <li><Tag>Art. 7º, V</Tag> Execução de contrato: entregar o serviço ao estabelecimento e a área do cliente a quem cria conta.</li>
          <li><Tag>Art. 7º, II</Tag> Cumprimento de obrigação legal: guarda de registros fiscais e de acesso.</li>
          <li><Tag>Art. 7º, VI</Tag> Exercício regular de direitos: cobranças e defesa em processos.</li>
          <li><Tag>Art. 7º, IX</Tag> Legítimo interesse: segurança, prevenção de fraudes e melhoria do serviço.</li>
          <li><Tag>Art. 7º, I</Tag> Consentimento: quando for pedido de forma específica, como no aceite deste documento.</li>
        </Ul>

        <Hr />

        <H2>5. Cookies e armazenamento no navegador</H2>
        <P>
          Usamos somente <strong>cookies e armazenamento local funcionais</strong>, necessários para a
          plataforma funcionar. Não usamos cookies de publicidade nem ferramentas de analytics de terceiros.
        </P>
        <Ul>
          <li><strong>Sessão do painel:</strong> token de acesso em cookie protegido (inacessível a scripts) e cookies com a data de expiração e as informações básicas da empresa logada (nome, configurações e recursos do plano).</li>
          <li><strong>Sessão do cliente final</strong> (<Tag>hc_customer_token</Tag><Tag>hc_customer_session</Tag>): cookies protegidos que mantêm o cliente conectado. O de acesso dura 30 minutos e é renovado sozinho; o de sessão dura até 1 ano e se renova enquanto a conta é usada. Ao sair da conta, os dois são apagados.</li>
          <li><strong>Preferências</strong> (armazenamento local): aceite deste documento, a escolha de agendar sem cadastro e a indicação de que o navegador já tem uma conta de cliente.</li>
          <li><strong>Login com o Google:</strong> ao usar o botão do Google, o próprio Google pode gravar cookies conforme a política de privacidade dele.</li>
        </Ul>
        <P>
          Sem esses cookies não é possível entrar no painel nem na área do cliente. As páginas públicas e o
          agendamento sem cadastro continuam funcionando.
        </P>

        <Hr />

        <H2>6. Com quem compartilhamos</H2>
        <P>Os dados são compartilhados somente com os fornecedores abaixo, na medida necessária para o serviço:</P>
        <Ul>
          <li><strong>Stripe</strong>: nome, e-mail e CPF/CNPJ do estabelecimento, para as cobranças da assinatura por Pix e cartão. Os dados do cartão são digitados direto na página da Stripe; o Horário Certo não vê nem guarda número, validade ou código de segurança.</li>
          <li><strong>Focus NFe</strong>: nome, e-mail e CPF/CNPJ do estabelecimento e o valor da mensalidade, para emitir a nota fiscal de serviço no sistema nacional da NFS-e (a nota é enviada para o e-mail cadastrado).</li>
          <li><strong>Z-API</strong>: nome e telefone do cliente final e o texto da mensagem, para o envio pelo WhatsApp.</li>
          <li><strong>Google (Firebase)</strong>: guarda as logos dos estabelecimentos e entrega as notificações do aplicativo.</li>
          <li><strong>Google (login)</strong>: confirma a identidade de quem entra na área do cliente com o Google.</li>
          <li><strong>Railway e Vercel</strong>: hospedagem do sistema e do banco de dados, com tráfego criptografado (HTTPS/TLS).</li>
          <li><strong>Backblaze</strong>: guarda as cópias de segurança diárias do banco de dados, criptografadas antes do envio.</li>
          <li><strong>Sentry</strong>: registra erros técnicos do sistema para que possam ser corrigidos. O envio de IP, cookies e dados de identificação está desligado.</li>
        </Ul>
        <P>
          Cada estabelecimento vê apenas os agendamentos feitos com ele. Alguns desses fornecedores podem
          processar dados fora do Brasil, sempre com as garantias exigidas pela LGPD. Não vendemos, alugamos
          nem cedemos dados pessoais para fins comerciais.
        </P>

        <Hr />

        <H2>7. Prazo de guarda e exclusão</H2>
        <P>
          Os dados são mantidos enquanto a conta estiver ativa. Depois do encerramento do contrato ou de um
          pedido de exclusão, eles são apagados em até <strong>30 dias</strong>, salvo quando a lei exigir
          guarda por mais tempo, como os registros fiscais (5 anos) e os registros de acesso (6 meses, pelo
          Marco Civil da Internet).
        </P>
        <P>
          Para excluir a conta de estabelecimento ou a conta de cliente final, envie o pedido para{' '}
          <strong>{COMPANY.email}</strong> a partir do e-mail cadastrado.
        </P>

        <Hr />

        <H2>8. Seus direitos como titular</H2>
        <P>A LGPD garante os direitos abaixo, que podem ser exercidos pelo e-mail do item 13:</P>
        <Ul>
          <li><strong>Confirmação e acesso:</strong> saber se tratamos seus dados e receber uma cópia.</li>
          <li><strong>Correção</strong> de dados incompletos ou desatualizados.</li>
          <li><strong>Anonimização, bloqueio ou eliminação</strong> de dados desnecessários ou tratados em desconformidade.</li>
          <li><strong>Portabilidade</strong> dos dados em formato estruturado.</li>
          <li><strong>Revogação do consentimento</strong>, sem afetar o que foi feito antes.</li>
          <li><strong>Oposição</strong> a tratamentos baseados em legítimo interesse.</li>
        </Ul>
        <P>
          Pedidos sobre agendamentos feitos com um estabelecimento específico também podem ser feitos direto a
          ele, que é o controlador desses dados.
        </P>

        <Hr />

        <H2>9. Segurança</H2>
        <P>
          Adotamos medidas técnicas e organizacionais para proteger os dados: comunicação por HTTPS/TLS,
          senhas em hash bcrypt, dados de contato criptografados, cookies de sessão protegidos, limite de
          tentativas de login e controle de acesso por empresa e por perfil. Em caso de incidente de segurança
          que possa afetar os titulares, comunicaremos a ANPD e as pessoas afetadas, como prevê a LGPD.
        </P>

        <Hr />

        <H2>10. Termos de uso do serviço (estabelecimentos)</H2>
        <P>
          O <strong>Horário Certo</strong> é uma plataforma por assinatura para prestadores de serviço que
          atendem com hora marcada. Ao contratar o serviço, o estabelecimento concorda com o seguinte:
        </P>
        <Ul>
          <li><strong>Teste grátis:</strong> todo cadastro começa com 14 dias grátis, sem cartão. Durante o teste, todos os recursos ficam disponíveis, exceto o envio de mensagens pelo WhatsApp.</li>
          <li><strong>WhatsApp:</strong> o envio de mensagens aos clientes é liberado somente depois do pagamento da primeira mensalidade. O estabelecimento pode encerrar o teste antes e assinar a qualquer momento pela tela de assinatura.</li>
          <li><strong>Cobrança:</strong> a assinatura é mensal, paga por Pix ou cartão de crédito. Quem assina antes do fim do teste passa a ter vencimento no dia do primeiro pagamento.</li>
          <li><strong>Atraso:</strong> após o vencimento há 3 dias de carência. Depois disso o acesso é bloqueado até o pagamento, com multa de 2% e juros de 1% ao mês, proporcionais aos dias de atraso.</li>
          <li><strong>Cupons de desconto:</strong> valem nas condições informadas no cadastro. Um cupom pode ter data limite para novos cadastros e quantidade máxima de usos. O cupom de "1ª mensalidade grátis" cobre apenas a primeira mensalidade; as seguintes são cobradas pelo valor do plano.</li>
          <li><strong>Plano Fundador:</strong> disponível para os 30 primeiros assinantes, com o preço mantido enquanto a assinatura estiver ativa.</li>
          <li><strong>Cancelamento:</strong> pode ser feito a qualquer momento, sem multa e sem fidelidade, conforme o item 11.</li>
          <li><strong>Dados dos clientes:</strong> o estabelecimento é o controlador dos dados dos seus clientes, deve informá-los sobre o uso da plataforma e é responsável pelo conteúdo que cadastra.</li>
          <li><strong>Uso adequado:</strong> é proibido usar o serviço para fins ilícitos, spam ou coleta abusiva de dados. O estabelecimento responde pelo uso das suas credenciais e das de sua equipe.</li>
        </Ul>
        <P>
          Fazemos o possível para manter a plataforma disponível, mas não respondemos por indisponibilidades
          causadas por falhas de terceiros (hospedagem, WhatsApp, processadores de pagamento, operadoras),
          nem pelo bloqueio do número de WhatsApp por decisão do próprio WhatsApp.
        </P>

        <Hr />

        <H2>11. Cancelamento e reembolso</H2>
        <P>
          Esta política vale para a assinatura dos estabelecimentos. O cancelamento é feito pelo próprio
          estabelecimento, a qualquer momento, na tela <strong>Assinatura</strong> do painel. Os demais pedidos
          (como cobrança indevida ou desconto por instabilidade) são feitos pelo e-mail{' '}
          <strong>{COMPANY.email}</strong>, a partir do e-mail cadastrado na conta; respondemos em até 5 dias úteis.
        </P>
        <Ul>
          <li>
            <strong>Arrependimento (7 dias):</strong> quem cancelar em até 7 dias corridos após o pagamento da
            primeira mensalidade pode escolher, na própria tela de cancelamento, receber o valor de volta
            integralmente, como prevê o artigo 49 do Código de Defesa do Consumidor. Nesse caso o acesso termina
            no mesmo dia. Vale para a primeira mensalidade de cada estabelecimento.
          </li>
          <li>
            <strong>Cancelamento depois disso:</strong> o acesso continua até o fim do período já pago, e a
            mensalidade seguinte não é cobrada. Não há devolução proporcional dos dias que restam do mês. Até o
            último dia de acesso, o cancelamento pode ser desfeito na mesma tela.
          </li>
          <li>
            <strong>Cobrança indevida:</strong> pagamento em duplicidade ou com valor errado por falha nossa é
            devolvido integralmente, sem prazo para pedir.
          </li>
          <li>
            <strong>Sistema fora do ar:</strong> se a plataforma ficar mais de 24 horas fora do ar no mesmo mês,
            somando as interrupções, o estabelecimento recebe desconto na mensalidade seguinte, proporcional ao
            tempo fora do ar. O pedido deve ser feito em até 30 dias, e o tempo é medido pelo nosso monitor de
            disponibilidade. Não contam manutenções avisadas com 48 horas de antecedência, problemas na internet
            ou no aparelho do estabelecimento e bloqueios do número de WhatsApp feitos pelo próprio WhatsApp.
          </li>
          <li>
            <strong>Como o dinheiro volta:</strong> pelo mesmo meio do pagamento, em até 10 dias úteis depois da
            aprovação do pedido. No Pix, para a conta que pagou; no cartão, como estorno na fatura, no prazo da
            operadora.
          </li>
          <li>
            Mensalidades quitadas por cupom (como a 1ª mensalidade grátis) não geram reembolso, porque não houve
            pagamento.
          </li>
        </Ul>

        <Hr />

        <H2>12. Alterações neste documento</H2>
        <P>
          Podemos atualizar este documento periodicamente. Mudanças relevantes serão avisadas por e-mail ou na
          plataforma com pelo menos 15 dias de antecedência. Continuar usando o serviço depois desse prazo
          significa concordar com a nova versão.
        </P>

        <Hr />

        <H2>13. Contato e encarregado de dados (DPO)</H2>
        <ContactBox>
          <p>
            Para exercer seus direitos, pedir a exclusão de dados ou esclarecer dúvidas sobre este documento,
            fale com o encarregado de proteção de dados:
          </p>
          <p style={{ marginTop: '0.6rem' }}>
            <strong>E-mail:</strong> {COMPANY.email}<br />
            <strong>Razão social:</strong> {COMPANY.legalName}<br />
            <strong>CNPJ:</strong> {COMPANY.cnpj}<br />
            <strong>Endereço:</strong> {COMPANY.address}<br />
            <strong>Plataforma:</strong> horariocerto.elevatohub.com.br
          </p>
          <p style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: 'var(--ui-muted)' }}>
            Autoridade Nacional de Proteção de Dados (ANPD):{' '}
            <span style={{ color: 'var(--ui-text)' }}>gov.br/anpd</span>
          </p>
        </ContactBox>
      </Container>
    </Page>
  );
}

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Page = styled.main`
  min-height: 100vh;
  background: #f5f6f3;
  padding: 2.5rem 1rem 4rem;
  box-sizing: border-box;
`;

const Container = styled.div`
  max-width: 760px;
  margin: 0 auto;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e0e4dc;
  padding: 2.4rem 2.8rem;
  box-shadow: 0 2px 16px rgba(0,0,0,0.06);

  @media (max-width: 640px) {
    padding: 1.5rem 1.2rem;
  }
`;

const BackBtn = styled.button`
  border: none;
  background: none;
  color: var(--color-sage, #6a9c6a);
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
  color: var(--color-sage, #6a9c6a);
  text-transform: uppercase;
  margin: 0 0 0.5rem;
`;

const H1 = styled.h1`
  font-size: 1.7rem;
  color: #1a2118;
  margin: 0 0 0.4rem;
`;

const Updated = styled.p`
  font-size: 0.78rem;
  color: #8a9087;
  margin: 0 0 2rem;
`;

const Hr = styled.hr`
  border: none;
  border-top: 1px solid #e8ece5;
  margin: 1.8rem 0;
`;

const H2 = styled.h2`
  font-size: 1.05rem;
  color: #1a2118;
  margin: 0 0 0.6rem;
`;

const P = styled.p`
  font-size: 0.88rem;
  color: #4a5148;
  line-height: 1.7;
  margin: 0 0 0.8rem;
`;

const Ul = styled.ul`
  padding-left: 1.3rem;
  margin: 0 0 0.8rem;

  li {
    font-size: 0.88rem;
    color: #4a5148;
    line-height: 1.7;
    margin-bottom: 0.25rem;
  }
`;

const Tag = styled.span`
  display: inline-block;
  background: #eef4ee;
  color: #4a7a4a;
  border-radius: 6px;
  padding: 0.15rem 0.55rem;
  font-size: 0.78rem;
  font-weight: 600;
  margin-right: 0.4rem;
  margin-bottom: 0.4rem;
`;

const ContactBox = styled.div`
  background: #f5f8f4;
  border: 1px solid #dce5d8;
  border-radius: 10px;
  padding: 1rem 1.2rem;
  margin-top: 0.5rem;

  p {
    margin: 0;
    font-size: 0.86rem;
    color: #4a5148;
    line-height: 1.7;
  }

  strong {
    color: #1a2118;
  }
`;

export default function TermosDeUso() {
  const navigate = useNavigate();

  return (
    <Page>
      <Container>
        <BackBtn onClick={() => navigate(-1)}>← Voltar</BackBtn>

        <Logo>Horário Certo</Logo>
        <H1>Termos de Uso e Política de Privacidade</H1>
        <Updated>Última atualização: junho de 2026</Updated>

        <P>
          Bem-vindo ao <strong>Horário Certo</strong>, plataforma de agendamentos online
          desenvolvida e operada pela Elevatohub. Ao utilizar nossos serviços, você concorda
          com os termos descritos neste documento, em conformidade com a{' '}
          <strong>Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018)</strong>
          {' '}e demais legislações aplicáveis.
        </P>

        <Hr />

        {/* ── 1. Quem somos ── */}
        <H2>1. Controlador de Dados</H2>
        <P>
          O controlador responsável pelo tratamento dos seus dados pessoais é a{' '}
          <strong>Elevatohub</strong>. Para exercer qualquer direito previsto na LGPD ou
          obter esclarecimentos, utilize o canal de contato ao final deste documento.
        </P>

        <Hr />

        {/* ── 2. Dados coletados ── */}
        <H2>2. Dados Pessoais Coletados</H2>
        <P>Coletamos apenas os dados necessários para a prestação do serviço:</P>
        <Ul>
          <li><strong>Dados cadastrais da empresa:</strong> nome fantasia, URL de acesso, WhatsApp, Instagram.</li>
          <li><strong>Dados do responsável:</strong> nome de usuário e senha (armazenada em hash irreversível).</li>
          <li><strong>Dados de cobrança:</strong> e-mail e CPF ou CNPJ, utilizados exclusivamente para emissão de cobranças via Mercado Pago (processador de pagamentos terceiro).</li>
          <li><strong>Dados dos clientes finais:</strong> nome, telefone/WhatsApp e horário de agendamento, inseridos diretamente pelo estabelecimento.</li>
          <li><strong>Dados técnicos:</strong> logs de acesso e horários de requisição, armazenados temporariamente para segurança e diagnóstico.</li>
        </Ul>
        <P>
          Não coletamos dados sensíveis (raça, saúde, biometria, etc.) nem realizamos
          rastreamento comportamental para fins publicitários.
        </P>

        <Hr />

        {/* ── 3. Finalidade ── */}
        <H2>3. Finalidade do Tratamento</H2>
        <Ul>
          <li>Prestação do serviço de agendamentos online contratado.</li>
          <li>Processamento de pagamentos mensais via PIX (Mercado Pago).</li>
          <li>Envio de notificações via WhatsApp habilitadas pelo próprio estabelecimento.</li>
          <li>Comunicações operacionais (lembretes, confirmações, cancelamentos).</li>
          <li>Cumprimento de obrigações legais e regulatórias.</li>
        </Ul>

        <Hr />

        {/* ── 4. Base legal ── */}
        <H2>4. Base Legal</H2>
        <P>O tratamento dos dados é realizado com base nos seguintes fundamentos da LGPD:</P>
        <Ul>
          <li><Tag>Art. 7º, I</Tag> Consentimento do titular, coletado no ato do cadastro.</li>
          <li><Tag>Art. 7º, V</Tag> Execução de contrato, para entrega do serviço contratado.</li>
          <li><Tag>Art. 7º, VI</Tag> Exercício regular de direitos, para emissão de cobranças.</li>
          <li><Tag>Art. 7º, IX</Tag> Legítimo interesse do controlador, para segurança e prevenção de fraudes.</li>
        </Ul>

        <Hr />

        {/* ── 5. Cookies ── */}
        <H2>5. Uso de Cookies</H2>
        <P>
          Utilizamos exclusivamente <strong>cookies funcionais e de sessão</strong>, estritamente
          necessários para o funcionamento da plataforma. Não utilizamos cookies de rastreamento,
          publicidade ou analytics de terceiros.
        </P>
        <P>Os cookies utilizados são:</P>
        <Ul>
          <li><strong>token</strong> — Token de autenticação JWT. Necessário para manter a sessão ativa.</li>
          <li><strong>expirationDate</strong> — Data de expiração da sessão.</li>
          <li><strong>companyUrl</strong> — Identificador da empresa logada.</li>
          <li><strong>companyInfo</strong> — Informações básicas da empresa (nome, imagem).</li>
          <li><strong>companyProperties</strong> — Configurações da empresa.</li>
          <li><strong>companyFeatures</strong> — Recursos habilitados no plano atual.</li>
        </Ul>
        <P>
          Todos os cookies são do tipo <strong>SameSite=Strict; Secure</strong> e expiram junto
          com a sessão ou no prazo máximo de 1 dia. Ao recusar cookies, você pode continuar
          navegando nas páginas públicas, mas o acesso ao painel administrativo ficará
          indisponível pois depende da sessão autenticada.
        </P>

        <Hr />

        {/* ── 6. Compartilhamento ── */}
        <H2>6. Compartilhamento de Dados</H2>
        <P>
          Os dados são compartilhados somente com os seguintes terceiros, na medida estritamente
          necessária:
        </P>
        <Ul>
          <li><strong>Mercado Pago</strong> — e-mail e CPF/CNPJ para processamento de pagamentos PIX.</li>
          <li><strong>Z-API</strong> — número de telefone do cliente final para envio de notificações via WhatsApp, quando o estabelecimento habilitar este recurso.</li>
          <li><strong>Railway / Heroku</strong> — infraestrutura de hospedagem (dados em trânsito criptografado via TLS).</li>
          <li><strong>Google Cloud Storage</strong> — armazenamento de imagens de perfil.</li>
        </Ul>
        <P>Não vendemos, alugamos ou cedemos dados pessoais a terceiros para fins comerciais.</P>

        <Hr />

        {/* ── 7. Retenção ── */}
        <H2>7. Prazo de Retenção</H2>
        <P>
          Os dados são mantidos enquanto a conta estiver ativa. Após o encerramento do
          contrato ou solicitação de exclusão, os dados são removidos em até{' '}
          <strong>30 dias</strong>, salvo obrigação legal de guarda por prazo superior (ex:
          registros fiscais por 5 anos conforme o Código Tributário Nacional).
        </P>

        <Hr />

        {/* ── 8. Direitos do titular ── */}
        <H2>8. Seus Direitos como Titular</H2>
        <P>A LGPD garante a você os seguintes direitos, exercíveis mediante solicitação:</P>
        <Ul>
          <li><strong>Confirmação e acesso</strong> — saber se tratamos seus dados e obter uma cópia.</li>
          <li><strong>Correção</strong> — solicitar a atualização de dados incompletos ou incorretos.</li>
          <li><strong>Anonimização, bloqueio ou eliminação</strong> — de dados desnecessários ou tratados em desconformidade.</li>
          <li><strong>Portabilidade</strong> — receber seus dados em formato estruturado e interoperável.</li>
          <li><strong>Revogação do consentimento</strong> — a qualquer momento, sem prejuízo da licitude dos tratamentos realizados anteriormente.</li>
          <li><strong>Oposição</strong> — contestar tratamento realizado com base em legítimo interesse.</li>
        </Ul>

        <Hr />

        {/* ── 9. Segurança ── */}
        <H2>9. Segurança dos Dados</H2>
        <P>
          Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo:
          autenticação por JWT, senhas armazenadas em hash bcrypt, comunicação via HTTPS/TLS,
          e acesso restrito por controle de permissões. Em caso de incidente de segurança que
          possa afetar seus dados, notificaremos a ANPD e os titulares afetados conforme
          previsto na LGPD.
        </P>

        <Hr />

        {/* ── 10. Termos de uso ── */}
        <H2>10. Termos de Uso do Serviço</H2>
        <P>
          O <strong>Horário Certo</strong> é uma plataforma SaaS destinada a
          estabelecimentos que realizam atendimentos com hora marcada (barbearias, salões,
          clínicas, etc.). Ao contratar o serviço, o estabelecimento:
        </P>
        <Ul>
          <li>Declara ser o responsável pelos dados dos seus clientes finais inseridos na plataforma, atuando como <strong>operador</strong> em relação a esses dados.</li>
          <li>Compromete-se a informar seus próprios clientes sobre o uso da plataforma para gestão de agendamentos.</li>
          <li>Não utilizará o serviço para fins ilícitos, spam ou coleta abusiva de dados.</li>
          <li>Responsabiliza-se pelo uso indevido de suas credenciais de acesso.</li>
        </Ul>
        <P>
          O serviço é fornecido "no estado em que se encontra". A Elevatohub não se
          responsabiliza por indisponibilidades causadas por falhas de terceiros (provedores
          de infraestrutura, processadores de pagamento, etc.).
        </P>

        <Hr />

        {/* ── 11. Alterações ── */}
        <H2>11. Alterações neste Documento</H2>
        <P>
          Podemos atualizar esta política periodicamente. Alterações relevantes serão
          comunicadas por e-mail ou mediante aviso na plataforma com antecedência mínima de
          15 dias. O uso continuado após a vigência das alterações implica aceite dos novos termos.
        </P>

        <Hr />

        {/* ── 12. Contato ── */}
        <H2>12. Contato e Encarregado (DPO)</H2>
        <ContactBox>
          <p>
            Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados,
            entre em contato com nosso Encarregado de Proteção de Dados:
          </p>
          <p style={{ marginTop: '0.6rem' }}>
            <strong>E-mail:</strong> privacidade@elevatohub.com.br<br />
            <strong>Empresa:</strong> Elevatohub<br />
            <strong>Plataforma:</strong> horariocerto.elevatohub.com.br
          </p>
          <p style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: '#8a9087' }}>
            Autoridade Nacional de Proteção de Dados (ANPD):{' '}
            <span style={{ color: 'var(--color-sage, #6a9c6a)' }}>gov.br/anpd</span>
          </p>
        </ContactBox>
      </Container>
    </Page>
  );
}

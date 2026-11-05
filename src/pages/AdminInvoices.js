import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  emitTestInvoice,
  getAdminClients,
  getAdminInvoices,
  getTestInvoice,
  retryAdminInvoice,
} from "../services/endpoints/admin";
import {
  AdminLayout,
  Badge,
  Button,
  Card,
  Field,
  FieldHint,
  Muted,
  Notice,
  Select,
  Table,
  TableCard,
  errorMessage,
  formatDate,
  formatMoney,
} from "../components/admin";

const STATUS = {
  PENDING: { label: "Na fila", tone: "gray" },
  PROCESSING: { label: "Processando", tone: "blue" },
  AUTHORIZED: { label: "Emitida", tone: "green" },
  ERROR: { label: "Erro", tone: "red" },
  CANCELLED: { label: "Cancelada", tone: "yellow" },
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function AdminInvoices() {
  const [config, setConfig] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [testCompanyId, setTestCompanyId] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const response = await getAdminInvoices();
      setConfig(response.data?.config || null);
      setInvoices(response.data?.invoices || []);
    } catch (error) {
      toast.error(errorMessage(error, "Erro ao carregar as notas fiscais"));
    }
  }, []);

  useEffect(() => {
    load();
    getAdminClients()
      .then((response) => setClients(response.data || []))
      .catch(() => {});
  }, [load]);

  const sortedClients = useMemo(
    () => [...clients].sort((a, b) => (a.companyName || "").localeCompare(b.companyName || "", "pt-BR")),
    [clients]
  );

  const homologation = config?.environment !== "producao";

  // Emite a nota de teste e acompanha até sair o resultado (a autorização é assíncrona)
  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const { data } = await emitTestInvoice(testCompanyId || null);
      let result = data;
      for (let attempt = 0; attempt < 10 && result?.status === "PROCESSING"; attempt += 1) {
        await wait(3000);
        result = { ref: data.ref, ...(await getTestInvoice(data.ref)).data };
      }
      setTestResult({ ref: data.ref, ...result });
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível emitir a nota de teste"));
    } finally {
      setTesting(false);
    }
  };

  const handleRetry = async (invoice) => {
    setBusyId(invoice.paymentId);
    try {
      await retryAdminInvoice(invoice.paymentId);
      toast.success("Nota colocada na fila: sai em até 10 minutos");
      await load();
    } catch (error) {
      toast.error(errorMessage(error, "Não foi possível reenviar a nota"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout
      title="Notas fiscais"
      subtitle="NFS-e das mensalidades, emitidas automaticamente pela Focus NFe depois de cada pagamento."
    >
      {config && (
        <Card style={{ flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <strong>Situação:</strong>
            <Badge $tone={homologation ? "yellow" : "green"}>
              {homologation ? "Homologação (testes)" : "Produção"}
            </Badge>
            <Badge $tone={config.automatic ? "green" : "gray"}>
              {config.automatic ? "Emissão automática ligada" : "Emissão automática desligada"}
            </Badge>
          </div>
          {!config.tokenConfigured && <Notice>Falta a variável FOCUS_NFE_TOKEN no Railway.</Notice>}
          {!config.serviceCodeConfigured && (
            <Notice>
              Falta a variável NFSE_SERVICE_CODE (código de tributação nacional, informado pelo contador) no Railway.
            </Notice>
          )}
          {homologation && (
            <FieldHint>
              Em homologação as mensalidades pagas ficam na fila e só são emitidas quando FOCUS_NFE_ENV passar para
              "producao".
            </FieldHint>
          )}
        </Card>
      )}

      {homologation && config?.tokenConfigured && (
        <Card style={{ flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <strong>Nota de teste (sem valor fiscal)</strong>
          <Field>
            Tomador
            <Select value={testCompanyId} onChange={(e) => setTestCompanyId(e.target.value)}>
              <option value="">Sem tomador identificado</option>
              {sortedClients.map((client) => (
                <option key={client.companyId} value={client.companyId}>
                  {client.companyName} ({client.companyUrl})
                </option>
              ))}
            </Select>
          </Field>
          <div>
            <Button type="button" onClick={handleTest} disabled={testing || !config.serviceCodeConfigured}>
              {testing ? "Emitindo..." : "Emitir nota de teste de R$ 1,00"}
            </Button>
          </div>
          {testResult && (
            <Notice>
              <div>
                <div>
                  Resultado: <strong>{STATUS[testResult.status]?.label || testResult.status}</strong> ({testResult.ref})
                </div>
                {testResult.number && <div>Número: {testResult.number}</div>}
                {testResult.pdfUrl && (
                  <a href={testResult.pdfUrl} target="_blank" rel="noopener noreferrer">Abrir PDF</a>
                )}
                {testResult.error && <div style={{ color: "var(--ui-danger)" }}>{testResult.error}</div>}
              </div>
            </Notice>
          )}
        </Card>
      )}

      <TableCard>
        {invoices.length === 0 ? (
          <Muted style={{ padding: "1.5rem" }}>Nenhuma nota ainda.</Muted>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Pagamento</th>
                <th>Valor</th>
                <th>Situação</th>
                <th>Nota</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const status = STATUS[invoice.status] || { label: invoice.status, tone: "gray" };
                return (
                  <tr key={invoice.paymentId}>
                    <td>
                      {invoice.companyName}
                      <Muted>{invoice.companyUrl}</Muted>
                    </td>
                    <td>{formatDate(invoice.paymentDate)}</td>
                    <td>{formatMoney(invoice.amount)}</td>
                    <td>
                      <Badge $tone={status.tone}>{status.label}</Badge>
                      {invoice.error && (
                        <Muted style={{ maxWidth: 320, whiteSpace: "normal" }}>{invoice.error}</Muted>
                      )}
                    </td>
                    <td>
                      {invoice.url ? (
                        <a href={invoice.url} target="_blank" rel="noopener noreferrer">
                          Nº {invoice.number || "-"}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {invoice.status === "ERROR" && (
                        <Button
                          type="button"
                          $variant="outline"
                          disabled={busyId === invoice.paymentId}
                          onClick={() => handleRetry(invoice)}
                        >
                          Reenviar
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </TableCard>
    </AdminLayout>
  );
}

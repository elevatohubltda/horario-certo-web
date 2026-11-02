import React, { useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import CustomerLayout, { Content } from "../../components/customer/CustomerLayout";
import CustomerAuthForm from "../../components/customer/CustomerAuthForm";
import { Card, Message } from "../../components/admin";
import { useCustomer } from "../../util/customerSession";
import { isMobile } from "../../util/util";

const Wrapper = styled.div`
  max-width: 420px;
  margin: 1.5rem auto 0;
`;

const Heading = styled.div`
  margin-bottom: 1.25rem;
  text-align: center;

  h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--ui-text);
  }

  p {
    margin: 0.4rem 0 0;
    font-size: 0.9rem;
    color: var(--ui-muted);
  }
`;

// Só aceita destinos internos (evita redirecionar para outro site)
const safeRedirect = (value) => (value && value.startsWith("/") && !value.startsWith("//") ? value : "/area-do-cliente");

export default function CustomerAuth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = safeRedirect(params.get("redirect"));
  const { customer, loading } = useCustomer();
  const mobile = isMobile();

  useEffect(() => {
    if (customer) navigate(redirect, { replace: true });
  }, [customer, navigate, redirect]);

  return (
    <CustomerLayout>
      <Content>
        <Wrapper>
          <Heading>
            <h1>Área do cliente</h1>
            <p>Acompanhe, remarque e cancele seus agendamentos.</p>
          </Heading>
          {loading ? (
            <Message>Carregando...</Message>
          ) : (
            <Card $padding="1.5rem">
              <CustomerAuthForm initialMode={params.get("modo") === "criar" ? "register" : "login"} />
            </Card>
          )}
        </Wrapper>
      </Content>
      <ToastContainer position={mobile ? "bottom-center" : "top-right"} autoClose={3000} />
    </CustomerLayout>
  );
}

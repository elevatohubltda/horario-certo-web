import React from "react";
import styled from "styled-components";
import "../styles/index.css";
import { ToastContainer, toast } from "react-toastify";
import { updatePassword } from "../services/endpoints/user";
import { isMobile } from "../util/util";
import { Button, Card, Field, Input, PageLayout } from "../components/admin";

/* =======================
   Styled Components
======================= */

const FormCard = styled(Card)`
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1.25rem;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 0.25rem;
`;

/* =======================
   Component
======================= */

export default function ChangePassword() {
  const mobile = isMobile();
  const [saving, setSaving] = React.useState(false);
  const [password, setPassword] = React.useState({
    stepOne: "",
    stepTwo: ""
  });

  const update = async () => {
    if (
      password.stepOne === "" ||
      password.stepTwo === "" ||
      password.stepOne !== password.stepTwo
    ) {
      toast.error("Preencha todos os campos corretamente!");
      return;
    }

    setSaving(true);
    try {
      const response = await updatePassword({ password: password.stepOne });
      if (response.status === 200) {
        toast.success("Senha alterada com sucesso!");
        setPassword({ stepOne: "", stepTwo: "" });
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      toast.error(error?.response?.data || "Não foi possível alterar a senha.");
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = (parameter, value) => {
    setPassword(prev => ({
      ...prev,
      [parameter]: value
    }));
  };

  return (
    <PageLayout title="Alterar senha" subtitle="Defina uma nova senha para o seu acesso.">
      <FormCard>
        <Field>
          Nova senha
          <Input
            type="password"
            placeholder="Digite a nova senha"
            value={password.stepOne}
            onChange={e => handlePassword("stepOne", e.target.value)}
          />
        </Field>

        <Field>
          Confirme a nova senha
          <Input
            type="password"
            placeholder="Digite a nova senha novamente"
            value={password.stepTwo}
            onChange={e => handlePassword("stepTwo", e.target.value)}
            onKeyDown={e => e.key === "Enter" && update()}
          />
        </Field>

        <Actions>
          <Button onClick={update} disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </Actions>
      </FormCard>

      <ToastContainer
        position={mobile ? "bottom-center" : "top-right"}
        autoClose={3000}
        style={mobile ? { margin: '0 5% 1rem 5%', width: '90%' } : undefined}
      />
    </PageLayout>
  );
}

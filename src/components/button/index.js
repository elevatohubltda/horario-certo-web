import styled from "styled-components";

// Botão padrão do sistema (mesmo visual dos botões das telas de gestão):
// confirm = pílula escura, link = discreto, icon = só ícone, disabled/padrão = cinza
export const Button = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 0.45rem 0.95rem;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid transparent;
    transition: opacity 0.2s ease, background-color 0.2s ease;

    &:disabled {
        opacity: 0.6;
        cursor: default;
    }

    ${({ variant }) =>
        variant === 'confirm'
        ? `
        background-color: var(--ui-primary);
        border-color: var(--ui-primary);
        color: #fff;

        &:hover:not(:disabled) { opacity: 0.9; }
    `
        : (
            (variant === 'icon') ?
        `
        background-color: transparent;
        padding: 0;
        border-radius: 8px;
    `
            : (
            (variant === 'link') ?
            `
        background-color: transparent;
        color: var(--ui-text-secondary);

        &:hover:not(:disabled) { background-color: #f3f4f6; }
    `
                :
               `
            background-color: #e5e7eb;
            color: var(--ui-muted);
            cursor: default;
        `
        )
    )
}
`;

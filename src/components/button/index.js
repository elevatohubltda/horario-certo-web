import styled from "styled-components";

export const Button = styled.button`
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    ${({ variant }) =>
        variant === 'confirm'
        ? `
        background-color: var(--color-sage);
        color: white;
    `
        : (
            (variant === 'icon') ?
        `
        background-color: transparent;
        padding: 0;
    `
            : (
            (variant === 'link') ?
            `
        background-color: transparent;
        color: #000;
    `
                :
               `
            background-color: #ccc;
            color: #fff;
        ` 
        )
    )
}
`;
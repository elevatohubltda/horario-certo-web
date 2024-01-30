import React from 'react';
import { InputStyle } from './style';


const Input = ({label, placeholder, value, onChange, size, disabled, type, name }) => {
  return (
    <InputStyle>
        {label && <label htmlFor={name}>{label}</label>}
        <input 
            placeholder={placeholder}
            value={value}
            type={type}
            name={name}
            onChange={onChange}
            disabled={disabled}
            className={size} 
        />
    </InputStyle>
  );
}

export default Input;
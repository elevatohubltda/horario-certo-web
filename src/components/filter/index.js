import React from 'react';
import { FilterStyle } from './style';
import { ReactComponent as Calendar } from '../../assets/icons/calendar.svg';

export default function CustomFilter(){
  return (
    <FilterStyle>
      <button>
        3 dias
      </button>
      <button>
        7 dias
      </button>
      <button>
        <Calendar/>
      </button>
    </FilterStyle>
  );
}
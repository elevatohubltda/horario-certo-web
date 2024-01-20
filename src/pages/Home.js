import React from 'react'
import { useState } from 'react';
import Topbar from '../components/topbar';
import { Container } from '../components/container/style';
import 'react-modern-calendar-datepicker/lib/DatePicker.css';
import { Calendar } from "react-modern-calendar-datepicker";
import { getTodayToCalendar, monthsOfYear, myCustomLocale } from '../util/date';
import { CalendarContainer } from '../components/calendar/style';
import { MiddlePageColumn } from '../components/middle-page-column/style';
import '../style/index.css';

function Home() {
  const [selectedDay, setSelectedDay] = useState({
    year: new Date().getFullYear(),
    month: Number(new Date().getMonth()+1),
    day: new Date().getDate()
  });

  return (
    <>
      <Topbar/>
      <Container>
          <CalendarContainer>
            <Calendar
              value={selectedDay}
              onChange={setSelectedDay}
              minimumDate={getTodayToCalendar()}
              colorPrimary='#6a5acd'
              locale={myCustomLocale}
              shouldHighlightWeekends
            />
          </CalendarContainer>
          <div className='appointments-box'>
            <h2 className='header-title'>{selectedDay.day} de {monthsOfYear[selectedDay.month]} de {selectedDay.year}</h2>
            <div className='content'>
              <span className='title'>
                Horários Disponíveis
              </span>
              <div className='appointments-available'>
                <div className='appointment-item'>
                  08:00
                </div>
                <div className='appointment-item'>
                  08:40
                </div>
                <div className='appointment-item'>
                  09:40
                </div>
                <div className='appointment-item'>
                  10:20
                </div>
                <div className='appointment-item'>
                  11:00
                </div>
                <div className='appointment-item'>
                  12:20
                </div>
                <div className='appointment-item'>
                  13:00
                </div>
                <div className='appointment-item'>
                  13:40
                </div>
                <div className='appointment-item'>
                  14:20
                </div>
                <div className='appointment-item'>
                  16:20
                </div>
                <div className='appointment-item'>
                  17:00
                </div>
              </div>
            </div>
          </div>
      </Container>
    </>
  );
}

export default Home;
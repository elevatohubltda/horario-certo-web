import React, { useRef } from 'react'
import { useState } from 'react';
import Topbar from '../components/topbar';
import { Container } from '../components/container/style';
import 'react-modern-calendar-datepicker/lib/DatePicker.css';
import { Calendar } from "react-modern-calendar-datepicker";
import { getTodayToCalendar, monthsOfYear, myCustomLocale } from '../util/date';
import { CalendarContainer } from '../components/calendar/style';
import Modal from 'react-bootstrap/Modal';
import close from '../assets/icons/close.svg';
import {ReactComponent as Loading} from '../assets/icons/loading-color.svg';
import '../style/index.css';
import { formatPhoneNumber } from '../util/format';

function Home() {
  const windowSize = useRef([window.innerWidth, window.innerHeight]);
  const [selectedDay, setSelectedDay] = useState({
    year: new Date().getFullYear(),
    month: Number(new Date().getMonth()+1),
    day: new Date().getDate()
  });
  const [selectedTime, setSelectedTime] = useState();
  const [clientData, setClientData] = useState({
    name: '',
    cellphone: ''
  });
  const [clientDataValidator, setClientDataValidator] = useState({
    name: '',
    cellphone: ''
  });
  const [isOpen, setIsOpen] = useState(false);
  const [schedulingDone, setSchedulingDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [randomCode, setRandomCode] = useState();

  const selectTimebox = (time) => {
    setSelectedTime(time);
    setIsOpen(true);
  }

  const handleClose = () => setIsOpen(false)

  const handleClientData = (parameter, value) => {
    setClientData((prev) => ({
      ...prev,
      [parameter]: value
    }))
  }

  const submitScheduling = () => {
    if(clientData.cellphone === '' || clientData.cellphone.length !== 16){
      setClientDataValidator((previous) => (
        {
          ...previous,
          cellphone: true
        })
      )
    } else{
      let previousObject = clientDataValidator;
      delete previousObject.cellphone;
      setClientDataValidator(previousObject);
    }
    if(clientData.name === ''){
      setClientDataValidator((previous) => (
        {
          ...previous,
          name: true
        })
      )
    } else{
      let previousObject = clientDataValidator;
      delete previousObject.name;
      setClientDataValidator(previousObject);
    }

    if( clientData.cellphone !== '' && 
        clientData.cellphone.length === 16 &&
        clientData.name !== ''
    ){
      let randomCode = (Math.random() + 1).toString(36).substring(7).toLocaleUpperCase();
      setRandomCode(randomCode);
      //enviar o codigo random na request tbm
      setLoading(true);
      setTimeout(() => {   
        setLoading(false);
      }, "3000");
      setSchedulingDone(true);
    }
  }

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
            <h2 className='header-title'>{selectedDay.day} de {monthsOfYear[selectedDay.month-1]} de {selectedDay.year}</h2>
            <div className='content'>
              <span className='title'>
                Horários Disponíveis
              </span>
              <div className='appointments-available'>
                <div className='appointment-item unavailable' onClick={() => selectTimebox("08:00")}>
                  08:00
                </div>
                <div className='appointment-item available' onClick={() => selectTimebox("08:40")}>
                  08:40
                </div>
                <div className='appointment-item available' onClick={() => selectTimebox("09:40")}>
                  09:40
                </div>
                <div className='appointment-item unavailable' onClick={() => selectTimebox("10:20")}>
                  10:20
                </div>
                <div className='appointment-item available' onClick={() => selectTimebox("11:00")}>
                  11:00
                </div>
                <div className='appointment-item available' onClick={() => selectTimebox("12:20")}>
                  12:20
                </div>
                <div className='appointment-item available' onClick={() => selectTimebox("13:00")}>
                  13:00
                </div>
                <div className='appointment-item unavailable' onClick={() => selectTimebox("13:40")}>
                  13:40
                </div>
                <div className='appointment-item available' onClick={() => selectTimebox("14:20")}>
                  14:20
                </div>
                <div className='appointment-item unavailable' onClick={() => selectTimebox("16:20")}>
                  16:20
                </div>
                <div className='appointment-item available' onClick={() => selectTimebox("17:00")}>
                  17:00
                </div>
              </div>
            </div>
          </div>
          <Modal
            show={isOpen}
            onHide={handleClose}
          >
            {!schedulingDone &&
              <>
                <Modal.Header>
                  <span>Finalize seu agendamento</span>
                  <button onClick={handleClose}>
                    <img src={close} alt="close-button" />
                  </button>
                </Modal.Header>
                <Modal.Body>
                  <div className='form'>
                    <label>Horário selecionado:</label>
                    <input value={selectedTime} disabled className='full'/>
                    <label>Nome:</label>
                    <input 
                      type='text' 
                      className='full'
                      required="required"
                      value={clientData.name} 
                      onChange={(e) => handleClientData('name', e.target.value)}
                    />
                    {clientDataValidator['name'] === true && 
                      <span className='validation-error'>
                        *Favor digite seu nome
                      </span>
                    }
                    <label>Celular:</label>
                    <input 
                      type='tel' 
                      placeholder='(xx) x xxxx-xxxx'
                      required="required"
                      className='full'
                      value={clientData.cellphone} 
                      onChange={(e) => handleClientData('cellphone', formatPhoneNumber(e.target.value))}
                    />
                    {clientDataValidator['cellphone'] === true && 
                      <span className='validation-error'>
                        *Favor digite seu telefone corretamente
                      </span>
                    }
                  </div>
                </Modal.Body>
                <Modal.Footer>
                    {
                      loading && 
                        <Loading />
                    }
                    {!loading && 
                      <button 
                        className='full'
                        onClick={submitScheduling}
                      >
                        FINALIZAR AGENDAMENTO
                      </button>
                    }
                </Modal.Footer>
              </>
            }
            {schedulingDone &&
              <>
                <Modal.Header>
                  <span>Agendamento concluído</span>
                  <button onClick={handleClose}>
                    <img src={close} alt="close-button" />
                  </button>
                </Modal.Header>
                <Modal.Body>
                  <p>
                    Seu agendamento para as<span className='bold'> {selectedTime} </span>
                    do dia <span className='bold'> {selectedDay.day}/{(selectedDay.month) < 10 ? '0' + (selectedDay.month) : selectedDay.month}/{selectedDay.year} </span>
                    foi concluído com sucesso. Seu código caso queira fazer o cancelamento é<span className='bold'> {randomCode}</span>. 
                  </p>
                </Modal.Body>
              </>
            }
          </Modal>
      </Container>
    </>
  );
}

export default Home;
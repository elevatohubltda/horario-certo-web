import React from "react";
import Slider from "react-slick";
import { ReactComponent as ArrowLeft } from '../assets/icons/arrow-left.svg';
import { ReactComponent as ArrowRight } from '../assets/icons/arrow-right.svg';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import "../styles/index.css";
import { getWeekDay } from "../util/date";
import Topbar from "../components/topbar";
import { Container } from "../components/container/style";
import CustomFilter from "../components/filter";

const horarios = [
  { data: "11/04/2025", horarios: ["08:40", "09:40", "11:00", "12:20", "14:20", "17:00"] },
  { data: "12/04/2025", horarios: ["08:00", "10:20", "13:00", "15:40", "17:30"] },
  { data: "13/04/2025", horarios: ["09:00", "11:00", "14:00", "16:20"] },
];

export default function Home() {
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <button><ArrowRight/></button>,
    prevArrow: <button><ArrowLeft/></button>
  };

  return (
    <>
      <Topbar/>
      <Container width="80%" margin="1rem 0 0 0" padding="0 0 3em 0" backgroundcolor="#fff" borderradius="1rem">
      <CustomFilter/>
        <Slider {...settings}>
          {horarios.map((item, index) => (
            <div key={index} className="slide">
              <h3>{item.data}</h3>
              <span>{"("+getWeekDay(item.data)+")"}</span>
              <div className="horarios-container">
                {item.horarios.map((horario, i) => (
                  <button 
                    key={i} 
                    className="horario-btn"
                    onClick={() => alert(`Horário selecionado: ${horario}`)}
                  >
                    {horario}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </Slider>

      </Container>
    </>
  );
}
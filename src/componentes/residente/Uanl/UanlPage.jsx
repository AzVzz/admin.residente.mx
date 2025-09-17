import React, { useEffect, useState } from "react";
import UanlListado from "./UanlListado";
import { getNotasUanl } from "../../api/uanlApi";
import { useNavigate } from "react-router-dom";

const UanlMain = () => {
  const [notasUanl, setNotasUanl] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getNotasUanl().then(data => {
      setNotasUanl(data);
    });
  }, []);

  const handleCardClick = (id) => {
    navigate(`/uanl/${id}`);
  };

  return (
    <UanlListado notasUanl={notasUanl} onCardClick={handleCardClick} />
  );
};

export default UanlMain;
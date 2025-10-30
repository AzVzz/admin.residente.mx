import React, { useEffect, useLayoutEffect, useState } from "react";
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

  // Este efecto se encarga de hacer scroll cuando las notas están listas
  useLayoutEffect(() => {
    if (notasUanl.length > 0) {
      setTimeout(() => {
        const lastId = localStorage.getItem("uanlLastNotaId");
        if (lastId) {
          const el = document.getElementById(`nota-${lastId}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          // Borra el valor después de 2 segundos
          setTimeout(() => {
            localStorage.removeItem("uanlLastNotaId");
          }, 2000);
        }
      }, 100);
    }
  }, [notasUanl]);

  // Detecta el regreso con la flecha del navegador
  useEffect(() => {
    const onPopState = () => {
      setTimeout(() => {
        const lastId = localStorage.getItem("uanlLastNotaId");
        if (lastId) {
          const el = document.getElementById(`nota-${lastId}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }, 100);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const handleCardClick = (id) => {
    localStorage.setItem("uanlLastNotaId", id); // Guarda el id
    navigate(`/uanl/${id}`);
  };

  return (
    <UanlListado notasUanl={notasUanl} onCardClick={handleCardClick} />
  );
};

export default UanlMain;
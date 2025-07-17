import './Reconocimientos.css';

const Reconocimientos = ({
  recTitulo1,
  recTitulo2,
  recTitulo3,
  recTitulo4,
  recTitulo5,
  recTitulo6,
  recFecha1,
  recFecha2,
  recFecha3,
  recFecha4,
  recFecha5,
  recFecha6
}) => {
  // Crear array de reconocimientos válidos
  const todosReconocimientos = [
    { titulo: recTitulo1, fecha: recFecha1 },
    { titulo: recTitulo2, fecha: recFecha2 },
    { titulo: recTitulo3, fecha: recFecha3 },
    { titulo: recTitulo4, fecha: recFecha4 },
    { titulo: recTitulo5, fecha: recFecha5 },
    { titulo: recTitulo6, fecha: recFecha6 }
  ];

  // Filtrar solo los que tienen título y fecha
  const reconocimientosValidos = todosReconocimientos.filter(
    item => item.titulo && item.fecha
  );

  // Ordenar por fecha descendente (más reciente primero)
  const reconocimientosOrdenados = [...reconocimientosValidos].sort((a, b) => {
    return parseInt(b.fecha) - parseInt(a.fecha);
  });

  // No renderizar si no hay reconocimientos
  if (reconocimientosValidos.length === 0) return null;

  return (
    <div className="container-reconocimientos">
      <h3 className="text-categoria">Reconocimientos</h3>
      <div className="espaciador"></div>
      {reconocimientosOrdenados.map((item, index) => (
        <div key={index} className="reconocimiento-item">
          <p className="text-fecha">{item.fecha}</p>
          <h4 className="text-global">{item.titulo}</h4>
        </div>
      ))}
    </div>
  );
};

export default Reconocimientos;
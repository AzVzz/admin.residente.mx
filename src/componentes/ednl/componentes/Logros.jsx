import './Logros.css'

const Logros = ({ logros = [] }) => {
  const logrosData = Array.isArray(logros) ? logros : [];
  
  if (!logrosData.length) return null;

  // Ordenar logros por fecha (de mayor a menor)
  const logrosOrdenados = [...logrosData].sort((a, b) => b.fecha - a.fecha);

  return (
    <div className="container-logros">
      <h3 className="text-categoria">Principales Logros</h3>
      {logrosOrdenados.slice(0, 5).map((logro, index) => (
        <div className="logros-item" key={index}>
          <p className="text-fecha">{logro.fecha}</p>
          <h4 className="text-global">{logro.descripcion}</h4>
        </div>
      ))}
    </div>
  )
}

export default Logros
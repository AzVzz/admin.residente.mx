import './QuePedir.css';

const QuePedir = ({ platillos }) => {
  // Limpiar y limitar a 6 elementos
  const items = (platillos || []).slice(0, 6).filter(item => item);

  if (items.length === 0) return null; // No renderizar si no hay platillos

  const capitalizarFrase = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="container-que-pedir">
      <h3 className="text-categoria">Qué pedir la primera vez</h3>
      <div className="que-pedir-item">
        {items.map((platillo, index) => (
          <div className="div1" key={index}>
            <h4>{index + 1}</h4>
            <p className="text-global leading-tight">{capitalizarFrase(platillo)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default QuePedir;
import './ExpertosOpinan.css';

const ExpertosOpinan = ({ expertos = [] }) => {
  // Validar si hay contenido para mostrar
  if (!expertos.length) return null;

  const experto = expertos[0];

  return (
    <div className="container-expertos-opinan">
      <h3 className="text-categoria">Expertos opinan</h3>
      <div className="expertos-opinan-item gap-5">
        {experto.frase && <p className="font-roman font-bold 
        text-[clamp(1.8rem,4vw,3.2rem)] leading-tight">"{experto.frase}"</p>}

        {(experto.nombre || experto.puesto || experto.empresa) && (
          <h4 className="text-global text-right">
            {experto.nombre}
            {(experto.puesto || experto.empresa) && <br />}

            {[experto.puesto, experto.empresa]
              .filter(Boolean)
              .join(', ')}
          </h4>
        )}
      </div>
    </div>
  );
};

export default ExpertosOpinan;
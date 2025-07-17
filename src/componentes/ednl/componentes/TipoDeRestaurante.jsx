const TipoDeRestaurante = ({ tipo }) => {
  return (
    <div className="flex items-center flex-col">
      <h3 className="text-28">Restaurante</h3>
      <h2 className="text-categoria max-w-[480px]">{tipo || "No especificado"}</h2>
    </div>
  );
};

export default TipoDeRestaurante;
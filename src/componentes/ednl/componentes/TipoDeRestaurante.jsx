const TipoDeRestaurante = ({ tipo }) => {
  return (
    <div className="flex items-center flex-col">
      <h2 className="text-categoria max-w-[480px]">{tipo || "No especificado"}</h2>
    </div>
  );
};

export default TipoDeRestaurante;
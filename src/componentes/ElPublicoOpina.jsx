const ElPublicoOpina = ({
  testimonio1, testimonioPersona1,
  testimonio2, testimonioPersona2,
  testimonio3, testimonioPersona3
}) => {
  // Crear array de testimonios válidos
  const testimonios = [
    { texto: testimonio1, persona: testimonioPersona1 },
    { texto: testimonio2, persona: testimonioPersona2 },
    { texto: testimonio3, persona: testimonioPersona3 }
  ].filter(testimonio => testimonio.texto && testimonio.texto.trim() !== "");

  // No renderizar si no hay testimonios
  if (testimonios.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-categoria">
        El público opina
      </h3>

      <div className="space-y-4">
        {testimonios.map((testimonio, index) => (
          <div key={index} className="mb-10">
            <p className="text-global">"{testimonio.texto}"</p>
            {testimonio.persona && (
              <h4 className="text-global text-right -mt-2">
                {testimonio.persona}
              </h4>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ElPublicoOpina;
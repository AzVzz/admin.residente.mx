import { useFormContext } from "react-hook-form";

const Informacion = ({ nombreRestaurante }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const informacion = [
    {
      value: "nombre_restaurante",
      label: "Nombre del restaurante",
      placeholder: "Ej. Residente's Pizza",
      maxLength: 23,
    },
    {
      value: "fecha_inauguracion",
      label: "Año de inauguración",
      placeholder: "Ej. 1998",
      type: "number",
    },
    {
      value: "comida",
      label: "Comida que venden",
      placeholder: "Ej. Tacos, Mariscos, Pizza, etc.",
      maxLength: 30,
    },
    {
      value: "telefono",
      label: "Teléfono",
      placeholder: "Ej. 8131224560",
      pattern: /^[0-9()+-\s]{10,}$/,
    },
    {
      value: "ticket_promedio",
      label: "Ticket promedio por persona (en pesos MXN) *",
      placeholder: "Ej. 230",
      type: "number",
    },
    {
      value: "platillo_mas_vendido",
      label: " Platillo más vendido",
      placeholder: "Ej. Pizza de queso",
    },
    {
      value: "numero_sucursales",
      label: "Número de sucursales",
      placeholder: "Ej. 12",
      type: "number",
    },
    /*{ value: "recomendacion", label: "Recomendación *", placeholder: "Ej. La pizza de queso es un clásico irresistible, con su queso fundido sobre una masa crujiente que ofrece una conbinación perfecta de sabor y textura en cada bocado." }*/
  ];
  return (
    <div className="info">
      <fieldset>
        <legend>Información importante *</legend>
        {informacion.map((info) => (
          <div key={info.value} className="input-group">
            <label htmlFor={info.value}>{info.label}</label>
            <input
              id={info.value}
              type={info.type || "text"}
              maxLength={info.maxLength}
              {...register(info.value, {
                pattern: info.pattern,
                maxLength: info.maxLength,
              })}
              placeholder={info.placeholder}
              className={errors[info.value] ? "error-border" : ""}
            />
            {errors[info.value]?.type === "maxLength" && (
              <p className="error">
                {info.label} debe tener máximo {info.maxLength} caracteres
              </p>
            )}
          </div>
        ))}
      </fieldset>
    </div>
  );
};

export default Informacion;

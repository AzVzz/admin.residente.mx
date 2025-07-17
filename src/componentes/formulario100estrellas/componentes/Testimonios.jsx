// src/componentes/Testimonios.jsx
import { useFormContext } from 'react-hook-form';

const Testimonios = ({ numero }) => {
    const { register, watch, formState: { errors } } = useFormContext();
    
    // Limites de caracteres
    const limiteCaracteres = {
        descripcion: 350,
        persona: 50
    }
    
    // Observar los valores de los campos
    const descripcion = watch(`testimonio_descripcion_${numero}`) || '';
    const persona = watch(`testimonio_persona_${numero}`) || '';

    return (
        <div className="input-group">
            <label>Testimonio {numero}</label>
            <textarea
                className="input-grande"
                {...register(`testimonio_descripcion_${numero}`)}
                placeholder={`Descripción del testimonio ${numero}`}
                maxLength={limiteCaracteres.descripcion}
            />
            <span className="contador-caracteres">
                {descripcion.length}/{limiteCaracteres.descripcion}
            </span>

            <label>Persona del testimonio {numero}</label>
            <input
                type="text"
                {...register(`testimonio_persona_${numero}`)}
                placeholder={`Nombre de la persona ${numero}`}
                maxLength={limiteCaracteres.persona}
            />
            <span className="contador-caracteres">
                {persona.length}/{limiteCaracteres.persona}
            </span>
        </div>
    )
}

export default Testimonios;
// src/componentes/QuePido.jsx
import { useFormContext } from 'react-hook-form';

const QuePido = ({ numero }) => {
    const { register } = useFormContext();

    return (
        <div className="input-group">
            <label>Platillo título {numero}</label>
            <input
                type="text"
                {...register(`platillo_${numero}`)}
                placeholder={`Platillo ${numero}`}
            />
        </div>
    )
}

export default QuePido;
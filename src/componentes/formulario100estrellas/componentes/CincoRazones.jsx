// src/componentes/CincoRazones.jsx
import { useFormContext } from 'react-hook-form';

const CincoRazones = ({ numero }) => {
    const { register, formState: { errors } } = useFormContext();

    return (
        <div className="input-group">
            <div className="input-pair">
                <div className="titulo-container">
                    <label>Razón título {numero}</label>
                    <input
                        type="text"
                        // CAMBIO: Usar campo específico para título
                        {...register(`razon_titulo_${numero}`, { 
                            //required: "El título es requerido" 
                        })}
                        placeholder="Variedad de opciones"
                        style={{ width: '100%' }}
                    />
                </div>

                <div className="cuerpo-container">
                    <label>Razón cuerpo {numero}</label>
                    <input 
                        type="text"
                        // CAMBIO: Usar campo específico para descripción
                        {...register(`razon_descripcion_${numero}`, { 
                            //required: "La descripción es requerida" 
                        })}
                        placeholder="Ej. En Residente's Pizza hay pizzas, alitas, tacos y cervezas: una combinación deliciosa para todos los gustos."
                        style={{ width: '100%' }}
                    />
                </div>
            </div>
            
            {errors[`razon_titulo_${numero}`] && (
                <span className="error">{errors[`razon_titulo_${numero}`].message}</span>
            )}
            {errors[`razon_descripcion_${numero}`] && (
                <span className="error">{errors[`razon_descripcion_${numero}`].message}</span>
            )}
        </div>
    )
}

export default CincoRazones;
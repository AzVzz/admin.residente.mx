import { useFormContext } from 'react-hook-form';

const ExpertosOpinan = () => {
    const { register, formState: { errors } } = useFormContext();

    return (
        <div className="form-expertos-opinan">
            <fieldset>
                <legend>Expertos Opinan</legend>
                <div className="input-group">
                    <label>Frase (sin comillas *)</label>
                    <textarea
                        className="input-grande"
                        placeholder="Ej. Comida deliciosa, un buen servicio y un ambiente agradable. Volvería sin dudarlo"
                        {...register('exp_op_frase')}  // Cambiado de 'exp_op_cuerpo' a 'exp_op_frase'
                    />
                </div>
                
                <div className="input-group">
                    <label>Nombre del experto</label>
                    <input
                        placeholder="Ej. Juan Perez"
                        {...register('exp_op_nombre')}
                    />
                </div>
                
                <div className="input-group">
                    <label>Puesto</label>
                    <input
                        placeholder="Ej. Director de alimentos"
                        {...register('exp_op_puesto')}
                    />
                </div>
                
                <div className="input-group">
                    <label>Empresa</label>
                    <input
                        placeholder="Ej. Sigma"
                        {...register('exp_op_empresa')}
                    />
                </div>
            </fieldset>
        </div>
    )
}

export default ExpertosOpinan;
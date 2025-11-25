import { useFormContext } from 'react-hook-form';

const ExpertosOpinan = () => {
    const { register, watch, formState: { errors } } = useFormContext();
    const fraseValue = watch('exp_op_frase') || '';

    return (
        <div className="form-expertos-opinan">
            <fieldset>
                <legend>Expertos Opinan</legend>
                <div className="input-group">
                    <label>Frase (sin comillas *)</label>
                    <textarea
                        className="input-grande"
                        placeholder="Ej. Comida deliciosa, un buen servicio y un ambiente agradable. Volvería sin dudarlo"
                        maxLength={250}
                        {...register('exp_op_frase', {
                            maxLength: {
                                value: 250,
                                message: 'La frase no debe exceder los 250 caracteres'
                            }
                        })}
                    />
                    <p style={{textAlign: 'right', fontSize: '12px', marginTop: '4px'}}>{fraseValue.length} / 250</p>
                    {errors.exp_op_frase && <p className="error-message" style={{color: 'red', fontSize: '12px'}}>{errors.exp_op_frase.message}</p>}
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

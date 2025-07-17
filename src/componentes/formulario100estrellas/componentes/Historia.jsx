import { useFormContext } from 'react-hook-form';

const Historia = () => {
    const { register, watch, formState: { errors } } = useFormContext();
    const MAX_CARACTERES = 1000;
    const historiaValue = watch('historia') || '';

    return (
        <div className="form-historia">
            <div className="input-group">
                <fieldset>
                    <legend>
                        Describe la historia de tu restaurante *

                    </legend>
                    <textarea
                        className="input-grande"
                        {...register('historia', {
                            //required: true,
                            maxLength: {
                                value: MAX_CARACTERES,
                                message: `Máximo ${MAX_CARACTERES} caracteres permitidos`
                            }
                        })}
                        maxLength={MAX_CARACTERES}
                    />
                    {errors.historia?.type === 'maxLength' && (
                        <p className="error">{errors.historia.message}</p>
                    )}
                    <span className="contador-caracteres">
                        {historiaValue.length}/{MAX_CARACTERES}
                    </span>
                </fieldset>
            </div>
        </div>
    )
}

export default Historia;
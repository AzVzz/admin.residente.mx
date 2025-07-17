import { useFormContext } from 'react-hook-form';

const Resenas = () => {
    const { register, watch, formState: { errors } } = useFormContext();

    const limiteCaracteres = {
        fundadores: 200,
        atmosfera: 250,
        receta_especial: 250,
        platillo_iconico: 100,
        promocion: 200
    }

    const resenas = [
        {
            value: "fundadores",
            label: "Describe quiénes son los fundadores o por qué se fundó"
        },
        {
            value: "atmosfera",
            label: "Describe brevemente la atmósfera del lugar (ambiente, decoración, música, etc.)"
        },
        {
            value: "receta_especial",
            label: "Menciona la especialidad de tu menú y algunos de sus ingredientes"
        },
        {
            value: "platillo_iconico",
            label: "Menciona dos o tres platillos más vendidos"
        },
        {
            value: "promocion",
            label: "Menciona una promoción o beneficio fijo para el consumidor"
        }
    ]

    return (
        <div className="form-resena">
            <fieldset>
                <legend>Reseña *</legend>
                {resenas.map((rna) => {
                    const valorActual = watch(rna.value) || '';
                    const limite = limiteCaracteres[rna.value];

                    return (
                        <div key={rna.label} className="input-group">
                            <label htmlFor={rna.label}>
                                {rna.label}
                            </label>
                            <textarea
                                id={rna.value}
                                {...register(rna.value)}
                                className="input-grande"
                                maxLength={limite}
                            />
                            <span className="contador-caracteres">{valorActual.length}/{limite}</span>
                        </div>
                    )
                })}
            </fieldset>
        </div>
    )
}

export default Resenas
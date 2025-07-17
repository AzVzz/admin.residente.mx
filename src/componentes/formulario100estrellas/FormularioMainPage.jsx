import FormularioMain from "./FormularioMain";
import RestaurantFetcher from '../api/RestaurantFetcher';
import { useParams } from 'react-router-dom';

const FormularioMainPage = () => {
    const { slug } = useParams();

    return (
        <>
            <RestaurantFetcher slug={slug}>
                {({ loading, error, restaurante }) => {
                    if (loading) return <p>Cargando</p>
                    if (error) return <p>Error: {error}</p>
                    if (!restaurante) return <div>Restaurante no encontrado</div>

                    return (
                        <FormularioMain 
                            restaurante={restaurante}
                            esEdicion={true}
                        />
                    )
                }}
            </RestaurantFetcher>
        </>
    )
}

export default FormularioMainPage;
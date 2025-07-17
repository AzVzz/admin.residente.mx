const BotonesAnunciateSuscribirme = () => {
    return (
        <div className="flex flex-col mb-5">
            <botton className="flex justify-center items-center bg-black h-8 text-white uppercase cursor-pointer">Anunciate</botton>

            <p className="text-[15px]">Suscríbete a nuestro newsletter</p>
            <botton className="flex justify-center items-center bg-black h-8 text-white uppercase cursor-pointer">Suscribirme</botton>

            <div>
                <p><span className="cursor-pointer">Opción</span></p>
                <p><span className="cursor-pointer">Cultura Restaurantera</span></p>
                <p><span className="cursor-pointer">Comida y Bebida</span></p>
                <p><span className="cursor-pointer">Postres y Snack</span></p>
                <p><span className="cursor-pointer">Perfiles y Entrevistas</span></p>
                <p><span className="cursor-pointer">Gastro Destinos</span></p>
            </div>
        </div>
    )
}

export default BotonesAnunciateSuscribirme;
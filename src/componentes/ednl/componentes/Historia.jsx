const Historia = ({ historia }) => {
    if (!historia) return null;
    return (
        <div className="contenedor-categoria">
            <h3 className="text-categoria">
                Historia
            </h3>
            <p className="text-global text-center">{historia}</p>
        </div>
    )
}

export default Historia
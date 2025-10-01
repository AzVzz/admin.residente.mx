import { useEffect, useState } from "react";
import { catalogoNotasGet } from "../../api/notasPublicadasGet.js";
import FotoNewsletter from "./FotoNewsletter";

const NewsletterPage = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        catalogoNotasGet()
            .then(data => setPosts(Array.isArray(data) ? data : []))
            .catch(() => setPosts([]));
    }, []);

    // Filtrar por tipo de nota
    const filtrarPostsPorTipoNota = (tipo) => posts.filter(post => post.tipo_nota === tipo);

    // Acción al hacer click en una tarjeta
    const handleCardClick = (post) => {
        // Tu lógica de navegación o acción
    };

    return (
        <FotoNewsletter
            posts={posts}
            filtrarPostsPorTipoNota={filtrarPostsPorTipoNota}
            handleCardClick={handleCardClick}
        />
    );
};

export default NewsletterPage;
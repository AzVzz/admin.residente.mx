import { useEffect, useState } from "react";
import { catalogoNotasGet } from "../../api/notasPublicadasGet.js";
import InstaHistory from "./InstaHistory";

const InstaHistoryPage = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        catalogoNotasGet()
            .then(data => setPosts(Array.isArray(data) ? data : []))
            .catch(() => setPosts([]));
    }, []);

    const filtrarPostsPorTipoNota = (tipo) => posts.filter(post => post.tipo_nota === tipo);

    const handleCardClick = (post) => {
        // Tu lógica de navegación o acción
    };

    return (
        <InstaHistory
            posts={posts}
            filtrarPostsPorTipoNota={filtrarPostsPorTipoNota}
            handleCardClick={handleCardClick}
        />
    );
};

export default InstaHistoryPage;
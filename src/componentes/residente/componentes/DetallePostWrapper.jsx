import { useParams, useNavigate } from "react-router-dom";
import DetallePost from "./DetallePost";
import { useEffect, useState } from "react";
import { notasPublicadasPorId } from "../../api/notasPublicadasGet";

const DetallePostWrapper = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNota = async () => {
            try {
                const nota = await notasPublicadasPorId(id);
                setPost(nota);
            } catch (error) {
                setPost(null);
            }
            setLoading(false);
        };
        fetchNota();
    }, [id]);

    if (loading) return <div>Cargando...</div>;
    if (!post) return <div>No se encontró la nota</div>;

    /*return <DetallePost post={post} onVolver={() => navigate(-1)} />;
    return <DetallePost post={post} onVolver={() => navigate(-1)} sinFecha />;*/
};

export default DetallePostWrapper;
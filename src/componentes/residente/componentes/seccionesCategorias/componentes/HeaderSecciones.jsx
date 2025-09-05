import { useState, useEffect } from "react";
import { catalogoHeadersGet, catalogoSeccionesGet } from '../../../../api/CatalogoSeccionesGet';
import { urlApi } from '../../../../api/url';
import { FaInstagram, FaFacebookF, FaYoutube, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
const HeaderSecciones = () => {
    const [menuHeader, setMenuHeader] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        //Obtener ambos Menús
        Promise.all([catalogoHeadersGet(), catalogoSeccionesGet()])
            .then(([headers, secciones]) => {
                //Solo tomara los 2 primeros de opcionesHeader
                const primeros = headers.slice(0, 2);
                //Inserta el Anunciate al menú
                const anunciate = headers.find(h => h.seccion.toLowerCase().includes("anunciate"));

                const seccionesMenu = secciones.map(sec => ({
                    seccion: sec.seccion,
                    submenu: sec.categorias.map(cat => ({
                        nombre: cat.nombreCompleto || cat.nombre,
                        url: "#"
                    }))
                }));

                let menu = [...primeros, ...seccionesMenu];
                if (anunciate) menu.push(anunciate);
                setMenuHeader(menu);
            })
            .catch(() => setMenuHeader([]));
    }, []);



    return (
        <header className="w-full mb-6">
            <div className="max-w-[1080px] mx-auto w-full">
                <div className="flex flex-row items-end pt-6 pb-2">
                    {/* Logo y texto a la izquierda */}
                    <div className="flex flex-col items-start">
                        <Link to="/residente">
                            <img
                                src={`${urlApi}fotos/fotos-estaticas/residente-logos/negros/logo-guia-nl.webp`}
                                className="w-60 h-auto mb-1"
                                alt="Logo Guía NL"
                            />
                        </Link>
                    </div>
                </div>
            </div>
            {/* Menú Amarillo debajo, alineado con el logo */}
            <div className="w-full bg-[#fff200]">
                <div className="max-w-[1080px] mx-auto flex justify-between items-center sm:px-5 px-2 sm:py-0.5 py-0">
                    <div className="flex gap-1 sm:gap-6 items-center sm:text-sm text-[8px] font-semibold">
                        {menuHeader.map((section, idx) =>
                            section.url ? (
                                <a
                                    key={idx}
                                    href={section.url}
                                    className="hover:underline text-black font-roman"
                                    rel="noopener noreferrer"
                                    target={section.url.startsWith('http') ? '_blank' : undefined}
                                >
                                    {section.seccion}
                                </a>
                            ) : (
                                <div key={idx} className="relative group">
                                    <a href="#" className="hover:underline text-black font-roman">{section.seccion}</a>
                                    {section.submenu && (
                                        <div className="absolute left-0 top-full mt-2 bg-gray-900/75 border border-gray-700 rounded shadow-lg z-50 min-w-[260px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 backdrop-blur-xs">
                                            <ul>
                                                {section.submenu.map((item, subIdx) => (
                                                    <li key={subIdx}>
                                                        <button
                                                            type="button"
                                                            className="block px-4 py-2 text-white hover:bg-gray-800/70 text-sm cursor-pointer font-roman w-full text-left"
                                                            onClick={() => navigate(
                                                                `/seccion/${section.seccion.replace(/\s+/g, '').toLowerCase()}/categoria/${item.nombre.replace(/\s+/g, '').toLowerCase()}`,
                                                                { state: { seccion: section.seccion, categoria: item.nombre } }
                                                            )}
                                                        >
                                                            {item.nombre}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                    <div className="sm:flex gap-1.5 hidden">
                        <img src={`${urlApi}/fotos/fotos-estaticas/residente-logos/negros/b2b.webp`} className="object-contain h-4 w-12 b2b cursor-pointer" />
                        <a href="http://instagram.com/residentemty" target="_blank" rel="noopener noreferrer"><FaInstagram className="w-4 h-4 text-black hover:text-gray-400" /></a>
                        <a href="http://facebook.com/residentemx" target="_blank" rel="noopener noreferrer"><FaFacebookF className="w-4 h-4 text-black hover:text-gray-400" /></a>
                        <a href="http://youtube.com/@revistaresidente5460" target="_blank" rel="noopener noreferrer"><FaYoutube className="w-4 h-4 text-black hover:text-gray-400" /></a>
                        <a href="tel:+528114186985" target="_blank" rel="noopener noreferrer"><FaWhatsapp className="w-4 h-4 text-black hover:text-gray-400" /></a>
                        <a href="mailto:contacto@residente.mx?subject=%C2%A1Quiero%20mas%20informaci%C3%B3n%20de%20Residente!"><FaEnvelope className="w-4 h-4 text-black hover:text-gray-400" /></a>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default HeaderSecciones;
import { useEffect, useState } from "react";

const ScrollToTopButton = () => {
    const [visible, setVisible] = useState(false);
    const [footerVisible, setFooterVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 200);
            const footer = document.querySelector("footer");
            if (footer) {
                const rect = footer.getBoundingClientRect();
                setFooterVisible(rect.top < window.innerHeight);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Animación: fade y scale
    const show = visible && !footerVisible;

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={`
                fixed bottom-8 right-8 z-50
                w-14 h-14 flex items-center justify-center
                rounded-full bg-black text-white shadow-lg text-3xl
                transition-all duration-300
                ${show ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-75 pointer-events-none"}
                hover:bg-gray-800
            `}
            aria-label="Ir arriba"
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.25)" }}
        >
            <span style={{fontSize: "2rem", lineHeight: 1}}>↑</span>
        </button>
    );
};

export default ScrollToTopButton;
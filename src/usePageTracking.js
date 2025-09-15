import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function usePageTracking() {
    const location = useLocation();

    useEffect(() => {
        if (window.gtag) {
            window.gtag("config", "G-N08M6VV1EF", {
                page_path: location.pathname,
            });
        }
    }, [location]);
}

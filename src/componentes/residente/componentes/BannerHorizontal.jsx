import { useEffect, useState } from "react";
import Skeleton from "@mui/material/Skeleton";
import { revistaGetUltima } from "../../api/revistasGet";
import { useData } from "../../DataContext";

const BannerHorizontal = ({ size = "big" }) => {
  const { revistaActual, loadingRevista, updateRevistaData } = useData();
  const [bannerLoaded, setBannerLoaded] = useState(false);

  useEffect(() => {
    // Solo hacer la llamada si no tenemos datos aún
    if (!revistaActual && !loadingRevista) {
      updateRevistaData(null, true, null);
      
      revistaGetUltima()
        .then((data) => {
          updateRevistaData(data, false, null);
        })
        .catch((error) => {
          updateRevistaData(null, false, error);
        });
    }
  }, [revistaActual, loadingRevista, updateRevistaData]);

  const sizesBanners = {
    big: {
      minWidth: "100px",
      maxWidth: "1080px",
      maxHeight: "116px",

    },
    medium: {
      width: "736px",
      height: "96px",
    },
    small: {
      width: "680px",
      height: "70px",
    },
  };

  const style = sizesBanners[size] || sizesBanners.big;

  return (
    <div
      className="relative overflow-hidden mx-auto"
      style={style}
    >
      {/* Skeleton ocupa el mismo espacio que el wrapper */}
      {(loadingRevista || !bannerLoaded) && (
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{ width: "100%", height: "100%" }}
        />
      )}

      {revistaActual && revistaActual.pdf ? (
        <a
          href={revistaActual.pdf}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="block w-full h-full object-cover"
        >
          <img
            src={revistaActual.imagen_banner}
            alt="Banner Revista"
            className={`w-full h-full object-cover transition-opacity duration-300${
              bannerLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setBannerLoaded(true)}
          />
        </a>
      ) : (
        <img
          src={revistaActual?.imagen_banner}
          alt="Banner Revista"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            bannerLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setBannerLoaded(true)}
        />
      )}
    </div>
  );
};

export default BannerHorizontal;

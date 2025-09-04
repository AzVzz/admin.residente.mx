import React, { createContext, useState, useContext } from "react";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  // Estados para datos globales
  const [revistaActual, setRevistaActual] = useState(null);
  const [loadingRevista, setLoadingRevista] = useState(false);
  const [errorRevista, setErrorRevista] = useState(null);

  // Función para actualizar los datos de revista (será llamada desde BannerHorizontal)
  const updateRevistaData = (data, loading = false, error = null) => {
    setRevistaActual(data);
    setLoadingRevista(loading);
    setErrorRevista(error);
  };

  const value = {
    // Datos de revista
    revistaActual,
    loadingRevista,
    errorRevista,
    updateRevistaData,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData debe ser usado dentro de un DataProvider");
  }
  return context;
};

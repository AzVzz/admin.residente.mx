import { Controller, useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  notaInstafotoDelete,
  notaInstafotoDeleteAlternative,
} from "../../../../api/notaCrearPostPut";
import { useAuth } from "../../../../Context";

const InstafotoSelector = ({
  instafotoActual,
  notaId,
  onInstafotoEliminada,
  token,
}) => {
  const { control, setValue, watch } = useFormContext();
  const { usuario } = useAuth();
  const instafotoSeleccionada = watch("instafoto");
  const [previewUrl, setPreviewUrl] = useState(null);

  // Ocultar si el usuario es invitado
  if (usuario?.rol === "invitado") {
    return null;
  }

  // Actualiza la previsualización cuando el usuario selecciona una imagen
  useEffect(() => {
    if (instafotoSeleccionada && typeof instafotoSeleccionada !== "string") {
      const file = instafotoSeleccionada;
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [instafotoSeleccionada]);

  // Si hay preview, mostrarla; si no, mostrar la instafoto actual de la nota
  const mostrarImagen = previewUrl || instafotoActual;

  const handleEliminarInstafoto = async () => {
    if (!window.confirm("¿Seguro que deseas eliminar la instafoto?")) return;

    try {
      console.log("Intentando eliminar instafoto:", {
        instafotoActual,
        notaId,
        tipoNotaId: typeof notaId,
        esValido: notaId && !isNaN(notaId),
      });

      // Si hay una instafoto actual en la base de datos, eliminarla
      if (instafotoActual && notaId) {
        console.log("Eliminando instafoto de la base de datos...");

        try {
          // Intentar primero con DELETE
          await notaInstafotoDelete(notaId, token);
          console.log("Instafoto eliminada exitosamente con método DELETE");
        } catch (deleteError) {
          console.log(
            "Método DELETE falló, intentando con método PUT:",
            deleteError.message
          );
          try {
            // Si DELETE falla, intentar con PUT
            await notaInstafotoDeleteAlternative(notaId, token);
            console.log("Instafoto eliminada exitosamente con método PUT");
          } catch (putError) {
            console.error("Ambos métodos fallaron:", putError.message);
            throw putError;
          }
        }

        onInstafotoEliminada();
      } else {
        console.log("No hay instafoto en la base de datos o falta notaId");
        // Aún así, limpiar la interfaz
      }

      // Limpiar el input de archivo y la previsualización
      setValue("instafoto", null);
      setPreviewUrl(null);
      console.log("Instafoto eliminada localmente");
    } catch (error) {
      console.error("Error al eliminar la instafoto:", error);
      console.error("Detalles del error:", error.message);

      // Si es un error 404, mostrar mensaje más específico
      if (
        error.message.includes("404") ||
        error.message.includes("no encontrada")
      ) {
        alert(
          "La instafoto ya no existe en la base de datos. Se limpiará de la interfaz."
        );
        // Limpiar la interfaz aunque no se pueda eliminar del servidor
        setValue("instafoto", null);
        setPreviewUrl(null);
        onInstafotoEliminada();
      } else {
        alert(`Error al eliminar la instafoto: ${error.message}`);
      }
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Instafoto
      </label>
      <Controller
        name="instafoto"
        control={control}
        render={({ field }) => (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              field.onChange(file);
            }}
            className="block w-full text-sm rounded-md py-2 px-3 border border-gray-300 text-gray-500 cursor-pointer bg-white"
          />
        )}
      />
      {mostrarImagen && (
        <div className="mt-2">
          <img
            src={mostrarImagen}
            alt="Instafoto"
            className="max-h-68 shadow border mb-2"
          />
          {(instafotoActual || previewUrl) && (
            <button
              type="button"
              onClick={handleEliminarInstafoto}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Eliminar instafoto
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default InstafotoSelector;

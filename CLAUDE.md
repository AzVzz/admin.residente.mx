# CLAUDE.md - Admin Dashboard (admin.residente.mx)

## Proyecto

Panel de administracion y dashboard para la plataforma Residente. SPA con React para gestion de notas, restaurantes, recetas, cupones, usuarios B2B, newsletter, infografias, videos y mas. Se despliega bajo la ruta `/admin/` del dominio `residente.mx`.

## Tech Stack

- **Framework:** React 19.1 con Vite 6.4
- **Compilador:** SWC (via @vitejs/plugin-react-swc)
- **Styling:** Tailwind CSS 4.1 via `@tailwindcss/vite`
- **UI:** Material-UI (MUI) 7.3, Headless UI 2.2
- **Routing:** React Router DOM 7.6
- **State:** Context API + SWR 2.3 para cache de datos
- **Forms:** react-hook-form 7.56
- **Editor:** TipTap 3.11 (rich text)
- **Pagos:** @stripe/stripe-js 8.5
- **Auth:** JWT (jwt-decode) + CryptoJS para storage encriptado
- **Iconos:** react-icons 5.5, @mui/icons-material
- **PWA:** vite-plugin-pwa + Workbox 7.4

## Estructura del Proyecto

```
src/
  App.jsx                     # Routing principal con React Router
  main.jsx                    # Entry point (AuthProvider + BrowserRouter base="/admin")
  index.css                   # Estilos globales + Tailwind @import
  componentes/
    api/                      # Funciones de comunicacion con backend
      url.js                  # urlApi, imgApi centralizados
      loginPost.js            # POST /api/usuarios/login
      notasPublicadasGet.js   # GET /api/notas
      notasCompletasGet.js    # GET /api/notas/todas
      infografiaApi.js        # CRUD infografias (axios)
      ... (un archivo por endpoint)
    residente/                # Componentes por dominio/feature
      Admin/                  # Componentes exclusivos admin
      B2B/                    # Dashboard y gestion B2B
        B2BDashboard.jsx
        B2BRegistroForm.jsx
      Colaboradores/          # Gestion de colaboradores
      Invitados/              # Gestion de invitados
      InstaHistory/           # Integracion Instagram
      Newsletter/             # Gestion de newsletter
      componentes/            # Componentes compartidos
        compFormularioMain/   # Formulario principal de notas
        componentesColumna1/  # Layout columna izquierda
        componentesColumna2/  # Layout columna derecha
        formularioColaboradores/
        seccionesCategorias/  # Editor de secciones/categorias
        extras/               # Componentes utilitarios
      infografia/             # Creacion de infografias
      paginaCliente/          # Paginas de cliente/micrositio
      PlantillasRehusables/   # Templates reutilizables
    ednl/                     # Directorio de restaurantes
      RestaurantePage.jsx
    formulario100estrellas/   # Formulario 100 estrellas
    promociones/              # Gestion de promociones/cupones
    culturallAccess/          # Formularios de acceso cultural
    rutas/                    # Componentes de proteccion de rutas
      B2BRoute.jsx            # Guard para rutas B2B
    utils/                    # Componentes utilitarios
    Context.jsx               # AuthProvider (token, usuario, login, logout)
    DataProvider.jsx          # Provider de datos globales
    Login.jsx
    Registro.jsx
    ForgotPassword.jsx
    ResetPassword.jsx
    Header.jsx
    MegaMenu.jsx
  hooks/
    useDebounce.js            # Debounce de valores
    useNotasCache.js          # SWR cache para notas/recetas
    useApiCache.js            # Cache generico de API
    useFormStorage.js         # Persistencia de formularios
    useGeminiSEO.js           # SEO con Gemini AI
    useClientesValidos.js     # Fetch de clientes validos
  utils/
    secureStorage.js          # localStorage encriptado con CryptoJS
    imageUtils.js             # Utilidades de imagen
    useAutoFitText.js         # Auto-fit texto
  iconos/                     # Componentes de iconos SVG
  fonts/                      # Fuentes NeueHaas (.woff2)
public/
  .htaccess                   # SPA fallback Apache (redirige a index.html)
  residente.svg               # Favicon
```

## Reglas y Convenciones

### Siempre usar JSX
- **Todos los componentes son `.jsx`** (nunca `.js` para componentes, nunca `.tsx`)
- Funciones utilitarias y hooks si pueden ser `.js`
- **No TypeScript** en este proyecto

### Siempre usar Tailwind CSS 4
- **Nunca CSS puro** a menos que sea absolutamente necesario (slick-carousel overrides, animaciones complejas)
- Tailwind v4 configurado en `vite.config.js` con `@tailwindcss/vite`
- Theme customizado en `index.css` con `@theme { }`:
  - Color principal: `amarillo: "#FFF200"`
  - Fuentes: `--font-haas`, `--font-roman`, `--font-display-bold`
- Container comun: `max-w-[1080px] mx-auto`

### Naming
- **Componentes:** PascalCase: `ListaNotas.jsx`, `B2BDashboard.jsx`
- **Hooks:** camelCase con prefijo `use`: `useDebounce.js`, `useNotasCache.js`
- **API functions:** descriptivo + accion: `notasPublicadasGet.js`, `loginPost.js`
- **Variables:** camelCase: `nombreUsuario`, `isLoading`, `esDestacada`
- **Booleanos:** prefijos `is`, `has`, `es`: `isLoading`, `esDestacada`
- **Constantes:** UPPER_SNAKE_CASE: `AUTH_COOKIE_NAME`, `COOKIE_MAX_AGE`

### Patron de Componente
```jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "./Context";
import { useNavigate } from "react-router-dom";

const NuevoComponente = () => {
  const { token, usuario } = useAuth();
  const navigate = useNavigate();
  const [datos, setDatos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${urlApi}api/endpoint`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setDatos(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  return (
    <div className="max-w-[1080px] mx-auto py-8">
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
        </div>
      )}
      {datos.map((item) => (
        <div key={item.id} className="border-b py-4">
          {item.nombre}
        </div>
      ))}
    </div>
  );
};

export default NuevoComponente;
```

### Patron de API Function
```js
// src/componentes/api/nuevaEntidadGet.js
import { urlApi } from "./url.js";

export const nuevaEntidadGet = async (token) => {
  const response = await fetch(`${urlApi}api/nueva-entidad`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Error HTTP: ${response.status}`);
  }

  return await response.json();
};
```

### Patron de Hook con SWR
```js
import useSWR from "swr";
import { urlApi } from "../componentes/api/url";

export function useNuevosDatos(token, options = {}) {
  const fetcher = async (url) => {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Error al obtener datos");
    return res.json();
  };

  const { data, error, isLoading, mutate } = useSWR(
    token ? `${urlApi}api/endpoint` : null,
    fetcher,
    {
      dedupingInterval: 5 * 60 * 1000,
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return { datos: data || [], error, isLoading, mutate };
}
```

### Autenticacion
- **AuthProvider** en `Context.jsx` provee: `token`, `usuario`, `saveToken`, `saveUsuario`, `logout`
- **Cookies** cross-subdomain en `.residente.mx` (7 dias)
- **localStorage** como backup (encriptado con CryptoJS en `secureStorage.js`)
- **Roles:** `residente` (admin), `colaborador`, `invitado`, `b2b`, `vendedor`
- Usar `const { token, usuario } = useAuth()` en componentes

### Proteccion de Rutas
```jsx
// Ruta protegida B2B
<Route path="/dashboardb2b" element={
  <B2BRoute><B2BDashboard /></B2BRoute>
} />
```

```jsx
// B2BRoute.jsx
const B2BRoute = ({ children }) => {
  const { usuario, token } = useAuth();
  if (!token || !usuario) return <Navigate to="/registro" replace />;
  if (usuario.rol?.toLowerCase() !== "b2b") return <div>No autorizado</div>;
  return children;
};
```

### Routing
- Base path: `/admin` (configurado en `<BrowserRouter basename="/admin">`)
- Build base: `/admin/` (en `vite.config.js`)
- Lazy loading extensivo con `React.lazy()` + `Suspense`
- Rutas publicas: `/registro`, `/login`, `/forgot-password`, `/100-estrellas`
- Rutas admin: `/dashboard`, `/notas`, `/formnewsletter`
- Rutas B2B: `/dashboardb2b`

### Formularios
- **react-hook-form** para formularios complejos (notas, restaurantes)
- **Controlled inputs** para formularios simples (login, busqueda)
- **useFormStorage** para persistir datos de formulario entre sesiones

### Rich Text (TipTap)
```jsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const editor = useEditor({
  extensions: [StarterKit, Image],
  content: contenidoInicial,
  onUpdate: ({ editor }) => onChange(editor.getHTML()),
});
```

### Orden de Imports
1. React y core (`react`, `react-dom`)
2. React Router (`react-router-dom`)
3. Context y hooks propios
4. Funciones API
5. Componentes locales y externos
6. Iconos
7. Librerias UI (MUI, Headless UI)

### Comunicacion con Backend
- **Fetch API** como metodo principal
- **Axios** solo para `multipart/form-data` (subida de imagenes)
- **Base URL:** `https://admin.residente.mx/` (centralizado en `url.js`)
- **Auth:** Bearer token en header `Authorization`
- **SWR** para cache y revalidacion de datos de lectura
- Dev proxy en Vite para `/api/gemini`, `/api/stripe`, `/fotos`

## Comandos

```bash
npm run dev        # Servidor desarrollo (localhost:5173)
npm run build      # Build produccion
npm run preview    # Preview del build
npm run lint       # ESLint
```

## PWA

- Service Worker con Workbox via vite-plugin-pwa
- `navigateFallback: "/admin/index.html"` para SPA routing
- `navigateFallbackDenylist: [/^\/api\//]` para no interceptar API
- Estrategias: CacheFirst (assets), StaleWhileRevalidate (imagenes), NetworkFirst (API)
- No tiene manifest de instalacion (solo cache)

## Deployment

- Se despliega bajo `/admin/` de `residente.mx`
- `.htaccess` en public/ para SPA fallback en Apache
- Excluye archivos estaticos (.js, .css, .png, etc.) del redirect a index.html
- Comparte dominio con el sitio Astro publico

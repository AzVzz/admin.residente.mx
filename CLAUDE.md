# CLAUDE.md — Admin Dashboard (admin.residente.mx)

> **Antes de buscar componentes, APIs, hooks, rutas o estilos**, consulta primero **`maps.md`** en la raíz del repo. Tiene el inventario exhaustivo: archivos, endpoints consumidos, rutas React Router, integraciones, env vars. Este archivo solo cubre convenciones y patrones que Claude debe respetar siempre.

## Proyecto

Panel de administración React. Despliega bajo `/admin/` de `residente.mx`. Sirve dashboard para `residente` (admin), `b2b`, `colaborador`, `invitado`, `vendedor`.

## Tech stack

- React 19.1 + Vite 6.4 (SWC)
- Tailwind CSS 4.1 vía `@tailwindcss/vite`
- React Router DOM 7.6
- MUI 7.3 + Headless UI 2.2
- Forms: react-hook-form 7.56
- Editor: TipTap 3.11
- Cache: SWR 2.3
- Pagos: @stripe/stripe-js 8.5
- Auth: jwt-decode 4 + crypto-js 4.2
- PWA: vite-plugin-pwa + Workbox

## Reglas de oro

### Lenguaje
- **Componentes en `.jsx`** (nunca `.js` para componentes, nunca `.tsx`). No TypeScript.
- Hooks y utils sí pueden ser `.js`.

### Estilos
- **Tailwind 4 siempre.** Nunca CSS puro salvo overrides necesarios (slick-carousel, animaciones complejas).
- Theme en `index.css` con `@theme { }`. Color principal `amarillo: #FFF200`. Fuentes `--font-haas`, `--font-roman`, `--font-display-bold`.
- Container estándar: `max-w-[1080px] mx-auto`.

### Naming
- Componentes: PascalCase (`ListaNotas.jsx`, `B2BDashboard.jsx`).
- Hooks: `use` + camelCase (`useDebounce.js`).
- API fns: descriptivo + verbo (`notasPublicadasGet.js`, `loginPost.js`).
- Booleanos: prefijo `is`/`has`/`es` (`isLoading`, `esDestacada`).
- Constantes: UPPER_SNAKE_CASE.

## Patrones

### Componente
```jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "./Context";
import { urlApi } from "./api/url";

const Componente = () => {
  const { token } = useAuth();
  const [datos, setDatos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${urlApi}api/endpoint`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDatos(await res.json());
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  return <div className="max-w-[1080px] mx-auto py-8">{/* ... */}</div>;
};

export default Componente;
```

### API function (`src/componentes/api/`)
```js
import { urlApi } from "./url.js";

export const nuevaEntidadGet = async (token) => {
  const res = await fetch(`${urlApi}api/nueva-entidad`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || `Error HTTP: ${res.status}`);
  }
  return res.json();
};
```

### Hook con SWR
```js
import useSWR from "swr";
import { urlApi } from "../componentes/api/url";

export function useDatos(token) {
  const fetcher = async (url) => {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Error");
    return res.json();
  };
  return useSWR(token ? `${urlApi}api/endpoint` : null, fetcher, {
    dedupingInterval: 5 * 60 * 1000,
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
}
```

### Ruta protegida
```jsx
<Route path="/dashboardb2b" element={
  <B2BRoute><B2BDashboard /></B2BRoute>
} />
```
`B2BRoute` y `ResidenteRoute` viven en `src/componentes/rutas/`.

## Autenticación

- `AuthProvider` (`Context.jsx`) provee `token`, `usuario`, `saveToken`, `saveUsuario`, `logout`.
- Cookies cross-subdomain en `.residente.mx` (7 días) + localStorage encriptado AES (`secureStorage.js`).
- Roles: `residente`, `colaborador`, `invitado`, `b2b`, `vendedor`.
- Uso: `const { token, usuario } = useAuth()`.

## Backend

- Base URL en `src/componentes/api/url.js` (`urlApi`, `imgApi`).
- Default `https://admin.residente.mx/`.
- Fetch API principal; Axios solo para `multipart/form-data`.
- Auth: header `Authorization: Bearer <token>`.
- SWR para lectura con cache.
- Dev proxy en Vite para `/api/gemini`, `/api/stripe`, `/fotos`.

## Routing

- `<BrowserRouter basename="/admin">` en `main.jsx`.
- `base="/admin/"` en `vite.config.js`.
- Lazy loading extensivo con `React.lazy()` + `Suspense`.

## Formularios

- `react-hook-form` para complejos.
- Controlled inputs para simples.
- `useFormStorage` para persistir entre sesiones.

## TipTap (rich text)

```jsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const editor = useEditor({
  extensions: [StarterKit, Image],
  content: contenidoInicial,
  onUpdate: ({ editor }) => onChange(editor.getHTML()),
});
```

## Orden de imports

1. React core
2. React Router
3. Context y hooks propios
4. Funciones API
5. Componentes locales/externos
6. Iconos
7. UI libs (MUI, Headless UI)

## Variables de entorno (prefijo `VITE_`)

| Variable | Default |
|----------|---------|
| `VITE_API_URL` | `https://admin.residente.mx/` |
| `VITE_IMG_URL` | `https://residente.mx/` |
| `VITE_STRIPE_PUBLIC_KEY` | requerido para checkout |

## Comandos

```bash
npm run dev       # localhost:5173
npm run build
npm run preview
npm run lint
```

## PWA & deploy

- Service Worker con Workbox (`navigateFallback: /admin/index.html`, denylist `/^\/api\//`).
- Estrategias: CacheFirst (assets), StaleWhileRevalidate (imágenes), NetworkFirst (API).
- `.htaccess` en `public/` hace SPA fallback en Apache, excluyendo `.js/.css/.png/...` del redirect.
- Comparte dominio con el sitio Astro público.

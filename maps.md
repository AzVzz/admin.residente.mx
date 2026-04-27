# Mapa del repositorio — admin.residente.mx

Panel administrativo de residente.mx. React 19 + Vite 6 + Tailwind 4 + React Router 7 + TipTap. Sirve dashboard para residente (admin), B2B (empresas), colaboradores e invitados. Base path `/admin/`.

---

## 1. Estructura general

```
admin.residente.mx/
├── src/
│   ├── App.jsx                # Router principal + layout (Header, MegaMenu, Footer)
│   ├── main.jsx               # Entry: AuthProvider + BrowserRouter (basename="/admin")
│   ├── index.css              # Tailwind + @font-face + @theme
│   ├── usePageTracking.js     # Tracking de páginas
│   ├── ViewportAdjuster.jsx   # Ajuste viewport
│   ├── ScaledDesktop.jsx      # Escalado desktop
│   ├── componentes/           # Componentes por dominio
│   │   ├── api/               # Cliente HTTP al backend
│   │   ├── rutas/             # B2BRoute, ResidenteRoute (guards)
│   │   ├── residente/         # Dashboard admin (notas, recetas, etc)
│   │   ├── ednl/              # Estrellas de Nuevo León (restaurantes)
│   │   ├── formulario100estrellas/
│   │   ├── promociones/
│   │   ├── eventos/
│   │   ├── culturallAccess/
│   │   ├── Context.jsx        # AuthProvider
│   │   └── DataContext.jsx    # DataProvider (revistaActual)
│   ├── hooks/                 # Custom hooks
│   ├── utils/                 # secureStorage, imageUtils
│   └── iconos/                # SVG icons
├── public/                    # .htaccess SPA fallback
├── vite.config.js             # Tailwind, PWA, base="/admin/"
├── package.json
├── nginx.conf                 # Reverse proxy
├── Dockerfile
└── CLAUDE.md
```

### Configuración clave
- `vite.config.js` — Tailwind via `@tailwindcss/vite`, PWA `vite-plugin-pwa`, `base="/admin/"`, proxy dev a backend, `envPrefix="VITE_"`
- `package.json` — React 19.1, Vite 6.4, Tailwind 4.1, react-router-dom 7.6, @stripe/stripe-js 8.5, TipTap 3.11, MUI 7.3, SWR 2.3
- `index.html` — Google Fonts (Bebas Neue, Montserrat, Outfit, Playfair Display, Roboto) + locales NeueHaasGrotesk

### Variables de entorno
| Variable | Default | Uso |
|----------|---------|-----|
| `VITE_API_URL` | `https://admin.residente.mx/` | Base backend |
| `VITE_IMG_URL` | `https://residente.mx/` | CDN imágenes |
| `VITE_STRIPE_PUBLIC_KEY` | requerido checkout | Stripe public key |

---

## 2. Routing (React Router 7)

Configurado en `src/App.jsx`. `basename="/admin"` en `main.jsx`. Lazy-loading extensivo.

### Públicas / sin protección
| Ruta | Componente | Propósito |
|------|------------|-----------|
| `/registro` | `Registro.jsx` | Registro público |
| `/login` | `Login.jsx` | Login |
| `/recuperar-password` | `ForgotPassword.jsx` | Solicitar reset |
| `/restablecer-password/:token` | `ResetPassword.jsx` | Confirmar reset |
| `/100-estrellas` / `/formulario` | `FormularioMain.jsx` | Listado formularios 100 estrellas |
| `/formulario/:slug` | `FormularioMainPage.jsx` | Formulario específico |
| `/ednl` | `ListaRestaurantes.jsx` | Directorio restaurantes |
| `/restaurantes/:slug` | `RestaurantePage.jsx` | Detalle restaurante |
| `/culturallaccess` | `CulturalAcessForm.jsx` | Formulario acceso cultural |

### Lectura / contenido
- `/antiguo-main` → `ResidenteMain.jsx` (legacy)
- `/notas/*` / `/notas/:id` → `BannerRevista.jsx` / `DetallePost.jsx`
- `/seccion/:seccion/categoria/:categoria/*` → `MainSeccionesCategorias.jsx`
- `/uanl` / `/uanl/:id` → `UanlPage.jsx` / `DetalleUanl.jsx`
- `/colaborador/:id` → `DetalleColaborador.jsx`
- `/editar-perfil-colaborador` → `EditarPerfilColaborador.jsx` (auth)
- `/editar-perfil-invitado` → `EditarPerfilInvitado.jsx` (auth)
- `/foto-news` → `NewsletterPage.jsx`
- `/linkinbio` → `LinkInBio.jsx`
- `/instahistory` → `InstaHistoryPage.jsx`
- `/instarecomendaciones` → `InstaRecomendacionesPage.jsx`
- `/:nombreCliente` → `PaginaCliente.jsx` (mama-de-rocco, barrio-antiguo, etc.)

### Admin / Dashboard (`<ResidenteRoute>`)
| Ruta | Componente |
|------|------------|
| `/dashboard` | `ListaNotas.jsx` |
| `/dashboard/nota/nueva` / `/dashboard/nota/editar/:id` | `FormMainResidente.jsx` |
| `/dashboard/receta/nueva` / `/dashboard/receta/editar/:id` | `FormularioReceta.jsx` |
| `/preguntassemanales` | `PreguntasSemanales.jsx` |
| `/formnewsletter` | `FormNewsletter.jsx` |
| `/correos` | `CampanasNewsletter.jsx` |
| `/correos/nueva` / `/correos/editar/:id` | `NuevaCampana.jsx` |
| `/videosDashboard` | `VideosDashboard.jsx` |
| `/videosFormulario` | `Videos.jsx` |
| `/promo` | `PromoMain.jsx` |
| `/revistas/nueva` | `FormularioRevistaBannerNueva.jsx` |
| `/infografias` | `InfografiaForm.jsx` |
| `/infografia` | `InfografiaMain.jsx` |
| `/banners` | `ComprarBanner.jsx` |
| `/admin/uanl` | `ListaNotasUanl.jsx` |
| `/admin/codigos` | `GestionCodigos.jsx` |
| `/dashboardtickets` | `ListaTickets.jsx` |
| `/evento` | `EventoMain.jsx` |
| `/dashboardeventos` | `ListaEventos.jsx` |
| `/registrocolaboradores` | `OpinionEditorial.jsx` |

### B2B (`<B2BRoute>`)
- `/registrob2b` / `/registrob2b/prueba` → `RegistroB2BConPlanes.jsx`
- `/registroinvitados` → `RegistroInvitados.jsx`
- `/dashboardb2b` → `B2BDashboard.jsx`
- `/stripe-checkout` → `StripeCheckout.jsx`
- `/success-tienda` → `SuccessTienda.jsx`
- `/terminos-y-condiciones` → `TerminosyCondiciones.jsx`

### B2C
- `/cuestionarioB2C` → `cuestionarioB2C.jsx`
- `/B2C` → `B2CInterior.jsx`
- `/guia-destinos` → `GastroDestinos.jsx`

### Especiales
- `/plantilla` → `PlantillaNotas.jsx`
- `/video` → `VideoResidente.jsx`
- `*` → `NoEncontrado.jsx` (404)

---

## 3. Cliente HTTP (`src/componentes/api/`)

Centralización en `url.js`:
- `urlApi` — `VITE_API_URL || "https://admin.residente.mx/"`
- `imgApi` — `VITE_IMG_URL || "https://residente.mx/"`

Métodos: Fetch API (principal) con `Authorization: Bearer ${token}`. Axios solo para multipart/form-data.

### Archivos por dominio

| Archivo | Endpoint backend |
|---------|------------------|
| `loginPost.js` | `POST /api/usuarios/login` |
| `registroPost.js` | `POST /api/usuarios/registro-formulario` |
| `registrob2bPost.js` | `POST /api/usuariosb2b` |
| `notasPublicadasGet.js` | `GET /api/notas` |
| `notasCompletasGet.js` | `GET /api/notas/todas` |
| `notasCategoriasBuscador.js` | `GET /api/notas/categorias` |
| `notasPorSeccionCategoriaGet.js` | `GET /api/notas/por-seccion-categoria` |
| `notaCrearPostPut.js` | `PUT /api/notas/:id` |
| `notaDelete.js` | `DELETE /api/notas/:id` |
| `notaImagenDelete.js` | `DELETE /api/notas/imagen/:id/imagen` |
| `recetasApi.js` | CRUD `/api/recetas` |
| `infografiaApi.js` / `infografiasGet.js` | CRUD `/api/infografias` |
| `restaurantesBasicosGet.js` | `GET /api/restaurante/basicos` |
| `restaurantesPorSeccionCategoriaGet.js` | `GET /api/restaurante/por-seccion-categoria` |
| `bannersApi.js` | CRUD `/api/banners` |
| `bannerNewsletterGet.js` | `GET /api/bannersnewsletter` |
| `cuponesGet.js` | `GET /api/tickets`, `/api/tickets/stats-b2b` |
| `giveawayDescuentosGet.js` | `GET /api/giveaway/descuentos` |
| `catalogoSeccionesGet.js` | `GET /api/catalogo/secciones` |
| `catalogoTipoLugarGet.js` | `GET /api/catalogo/tipo-lugar` |
| `invitadosApi.js` | CRUD `/api/invitados` |
| `consejerosApi.js` | `GET /api/consejeros` |
| `preguntasApi.js` | CRUD `/api/preguntas-tema-semanas` |
| `eventosGet.js` | GET/POST `/api/eventos` |
| `uanlApi.js` | CRUD `/api/notas/uanl` |
| `videosApi.js` | CRUD `/api/video` |
| `temaSemanaApi.js` | GET/POST `/api/preguntas-tema-semanas` |
| `buscadorGet.js` | `GET /api/buscar/global` |
| `revistasGet.js` | `GET /api/revistas` |

### Wrappers / Fetchers
- `RestaurantFetcher.jsx`, `RestaurantPoster.jsx`, `SeccionesDataFetcher.jsx`
- `ImagenNotaSelector.jsx` — Selector imagen para notas

---

## 4. Componentes por dominio

### Auth & rutas (`componentes/`, `componentes/rutas/`)
- `Context.jsx` — **AuthProvider**: token JWT, usuario, login/logout. Cookies `.residente.mx` (7 días) + localStorage encriptado AES (CryptoJS)
- `DataContext.jsx` — **DataProvider**: revistaActual, loadingRevista, errorRevista
- `rutas/B2BRoute.jsx` — Guard rol === "b2b"
- `rutas/ResidenteRoute.jsx` — Guard rol === "residente"
- `Login.jsx`, `Registro.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`

### Layout core
- `Header.jsx`, `MegaMenu.jsx`, `FooterPrincipal.jsx`, `DropdownMenu.jsx`
- `NoEncontrado.jsx`, `Proximamente.jsx`
- `SearchResults.jsx`, `ElPublicoOpina.jsx`
- `StripeCheckout.jsx`
- `VirtualizedGrid.jsx`, `VirtualizedList.jsx` (react-window)

### Residente / Admin (`componentes/residente/`)

**Dashboard & Admin:**
- `ResidenteMain.jsx` (legacy), `Registro.jsx`
- `Admin/BuscadorDashboard.jsx`, `Admin/GestionCodigos.jsx`

**B2B:**
- `B2B/B2BDashboard.jsx` — Dashboard B2B (suscripciones, beneficios, tienda)
- `B2B/CancelSubscriptionButton.jsx`
- `B2B/FormularioAnuncioRevista.jsx`, `B2B/FormularioBanner.jsx`
- `B2B/SuccessTienda.jsx`, `B2B/beneficiosConfig.js`
- `B2B/FormularioNuevoClienteB2b/`:
  - `FormMain.jsx`, `RegistroB2BConPlanes.jsx`
  - `SelectorPlanesB2B.jsx`, `SelectorBeneficiosB2B.jsx`
  - `TerminosyCondiciones.jsx`, `RegistroInvitados.jsx`
  - `TiendaClientes/CheckoutCliente.jsx`

**B2C:**
- `B2C/B2CInterior.jsx`, `B2C/GastroDestinos.jsx`
- `componentes/cuestionarioB2C/cuestionarioB2C.jsx`

**Colaboradores & Invitados:**
- `Colaboradores/DetalleColaborador.jsx`, `Colaboradores/EditarPerfilColaborador.jsx`
- `Invitados/EditarPerfilInvitado.jsx`
- `formularioColaboradores/MenuColaboradores.jsx`, `RespuestasSemana.jsx`, `OpinionEditorial.jsx`

**Newsletter:**
- `Newsletter/CampanasNewsletter.jsx`, `NuevaCampana.jsx`, `NewsletterPage.jsx`
- `Newsletter/EditorTextoRico.jsx` (TipTap), `Newsletter/FotoNewsletter.jsx`

**Infografías:**
- `infografia/InfografiaMain.jsx`, `InfografiaForm.jsx`, `InfografiaCard.jsx`

**UANL:**
- `Uanl/UanlPage.jsx`, `UanlListado.jsx`, `DetalleUanl.jsx`

**Instagram:**
- `instagram/LinkInBio.jsx`
- `InstaHistory/InstaHistoryPage.jsx`, `InstaHistory.jsx`
- `InstaHistory/InstaHistoryRecomendaciones/InstaHistoryRecomendaciones.jsx`, `InstaRecomendacionesPage.jsx`

**Página Cliente (micrositios):**
- `paginaCliente/PaginaCliente.jsx`
- `paginaCliente/componentes/`: `Carrusel.jsx`, `BarrioAntiguoGifs.jsx`, `TarjetasHorizontal.jsx`

**Plantillas:**
- `PlantillasRehusables/PlantillaNotas.jsx`, `PlantillaPostPrincipal.jsx`, `PlantillaTresTarjetas.jsx`, `PlantillaLateralPostTarjetas.jsx`

**Formulario Main (`compFormularioMain/`):**
- Formularios: `FormMainResidente.jsx`, `FormularioReceta.jsx`, `FormNewsletter.jsx`, `FormularioRevistaBanner.jsx`
- Listas: `ListaNotas.jsx`, `ListaRecetas.jsx`, `ListaNotasUanl.jsx`, `ListaNotasUsuarios.jsx`, `ListaBlogsColaborador.jsx`, `ListaTickets.jsx`
- Componentes nota: `Titulo.jsx`, `Subtitulo.jsx`, `Contenido.jsx` (TipTap), `Imagen.jsx`, `ImagenNotaSelector.jsx`, `Autor.jsx`, `NombreRestaurante.jsx`, `CategoriasTipoNotaSelector.jsx`, `ZonasSelector.jsx`, `OpcionesPublicacion.jsx`, `SlugInput.jsx`, `BotonSubmitNota.jsx`, `AlertaNota.jsx`, `InstafotoSelector.jsx`, `MentionList.jsx`, `mentionSuggestion.js`
- Videos: `Videos.jsx`, `VideosDashboard.jsx`
- Búsqueda/filtros: `SearchNotas.jsx`, `SearchNotasLocal.jsx`, `FiltroAutor.jsx`, `FiltroEstadoNota.jsx`, `FiltroFechas.jsx`, `FiltroTipoCliente.jsx`, `FiltroVistas.jsx`, `BuscadorDashboard.jsx`
- Utils: `BotonScroll.jsx`, `ModalAsignarRecursos.jsx`, `SEOComparison.jsx`, `MenuColaboradoresDashboard.jsx`, `UsuariosB2BPanel.jsx`, `TodoB2b.jsx`
- TodoB2bComponentes: `GestionAnunciosB2B.jsx`, `HistorialGoogleAnalytics.jsx`, `FormGoogleAnalytics.jsx`, `TablaUsuariosB2B.jsx`

**Columnas layout:**
- `componentesColumna1/`: `BotonesAnunciateSuscribirme.jsx`, `Infografia.jsx`, `MiniaturasVideos.jsx`
- `componentesColumna2/`: `CarruselDescuentos.jsx`, `CarruselPosts.jsx`, `Colaboradores.jsx`, `DirectorioVertical.jsx`, `EnPortada.jsx`, `GiveawayDescuentos.jsx`, `MainLateralPostTarjetas.jsx`, `NotasAcervo.jsx`, `PortadaRevista.jsx`, `PostPrincipal.jsx`, `TarjetaHorizontalPost.jsx`, `TarjetaVerticalPost.jsx`, `TresTarjetas.jsx`, `VideosHorizontal.jsx`

**Secciones/Categorías dinámicas:**
- `seccionesCategorias/MainSeccionesCategorias.jsx`
- Subcomponentes: `CateogoriaHeader.jsx`, `HeaderSecciones.jsx`, `BarraMarquee.jsx`, `BarraStickerMarquee.jsx`, `CincoNotasRRR.jsx`, `CincoNotasBuscador.jsx`, `CincoInfografiasRRR.jsx`, `RecomendacionesRestaurantes.jsx`, `ImagenesRestaurantesDestacados.jsx`, `Cupones.jsx`, `CuponesCarrusel.jsx`, `TicketPromoMini.jsx`

**Banners:**
- `componentes/banners/`: `BannersDashboard.jsx`, `BannerForm.jsx`, `BannerList.jsx`, `BannerSlotManager.jsx`, `ComprarBanner.jsx`, `ComprasList.jsx`, `PaquetesList.jsx`

**Otros:**
- `componentes/BannerHorizontal.jsx`, `BannerRevista.jsx`, `DetalleBannerRevista.jsx`, `ListadoBannerRevista.jsx`
- `NoticiasAdmin.jsx`, `DetallePost.jsx`, `DetallePostWrapper.jsx`, `EditarNoticia.jsx`
- `ResidenteHome.jsx`, `SeccionesPrincipales.jsx`
- `ShowComentarios.jsx`, `PostComentarios.jsx`
- `SmartTagsInput.jsx`, `ClientesVetados.jsx`
- `BannerChevrolet.jsx`, `extras/VideoResidente.jsx`

### Restaurantes EDNL (`componentes/ednl/`)
- `ListaRestaurantes.jsx`, `RestaurantePage.jsx`
- Subcomponentes: `CincoRazones.jsx`, `Colaboraciones.jsx`, `ContenidoRestaurante.jsx`, `ExpertosOpinan.jsx`, `Footer.jsx`, `GridComponent.jsx`, `Historia.jsx`, `Logros.jsx`, `PlatilloEstrellaCarrusel.jsx`, `QuePedir.jsx`, `Reconocimientos.jsx`, `TipoDeRestaurante.jsx`, `ResidentRestaurantVibes.jsx`

### Formulario 100 Estrellas (`componentes/formulario100estrellas/`)
- `FormularioMain.jsx`, `FormularioMainPage.jsx`
- Subcomponentes: `Categorias.jsx`, `CincoRazones.jsx`, `CodigoVestir.jsx`, `Colaboraciones.jsx`, `ExpertosOpinan.jsx`, `FotosLugar.jsx`, `Geolocalizacion.jsx`, `Historia.jsx`, `Imagen.jsx`, `Imagenes.jsx`, `Informacion.jsx`, `Logo.jsx`, `Logros.jsx`, `NuevasSeccionesCategorias.jsx`, `OcasionIdeal.jsx`, `QuePido.jsx`, `Reconocimientos.jsx`, `RedesSociales.jsx`, `Resenas.jsx`, `Sucursales.jsx`, `Testimonios.jsx`, `TipoLugar.jsx`, `TipoRestaurante.jsx`, `UbicacionPrincipal.jsx`, `ZonasHabilitadas.jsx`

### Promociones & Eventos
- `promociones/PromoMain.jsx`, `componentes/FormularioPromo.jsx`, `FormularioPromoExt.jsx`, `TicketPromo.jsx`
- `eventos/EventoMain.jsx`, `ListaEventos.jsx`, `componentes/FormularioEvento.jsx`, `TicketEvento.jsx`

### Acceso Cultural
- `culturallAccess/CulturalAcessForm.jsx`

### Iconos (`src/iconos/`)
- `SocialMediaIcons.jsx`, `StarIcon.jsx`, `Iconografia.jsx`

---

## 5. Hooks personalizados (`src/hooks/`)

| Hook | Propósito |
|------|-----------|
| `useApiCache.js` | `fetchWithCache` custom |
| `useClientesValidos.js` | Lista clientes válidos con caché módulo (15 min TTL) |
| `useDebounce.js` | Debounce 300ms default |
| `useFormStorage.js` | Persistencia formulario en localStorage por formId |
| `useGeminiSEO.js` | Optimización SEO via `/api/gemini` |
| `useNotasCache.js` | SWR para notas con paginación + filtros |

---

## 6. Contextos / estado global

### `Context.jsx` — AuthProvider
- `token` (JWT), `usuario` (rol, email, id)
- `saveToken(token)`, `saveUsuario(usuario)`, `logout()`
- **Cookies cross-domain:** `.residente.mx`, 7 días, SameSite=Lax
- **localStorage** encriptado AES (CryptoJS) en `secureStorage.js`
- **Roles:** `residente` (admin), `b2b`, `colaborador`, `invitado`, `vendedor`

### `DataContext.jsx` — DataProvider
- `revistaActual`, `loadingRevista`, `errorRevista`, `updateRevistaData()`

---

## 7. Servicios / utils (`src/utils/`)

- `secureStorage.js` — Encriptación AES (CryptoJS) en localStorage
- `imageUtils.js` — Resize, conversión formatos
- `useAutoFitText.js` — Auto-ajuste tamaño texto

Helpers en componentes:
- `mentionSuggestion.js` — Sugerencias TipTap mentions
- `beneficiosConfig.js` — Mapeo beneficios → planes B2B

---

## 8. Autenticación / autorización

**Flujo:**
1. `Login.jsx` → `loginPost(email, password)` → `POST /api/usuarios/login`
2. Backend retorna `{ token, usuario }`
3. `AuthContext.saveToken` + `saveUsuario` guardan en cookies + localStorage encriptado
4. `<ResidenteRoute>` / `<B2BRoute>` verifican rol antes de renderizar

**Roles:**
- `residente` — Admin completo (`/dashboard`, `/notas`, `/correos`, etc.)
- `b2b` — `/dashboardb2b`
- `colaborador` — Respuestas semanales, opinión editorial
- `invitado` — Edición perfil
- `vendedor` — En desarrollo

---

## 9. Integraciones

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Stripe** | @stripe/stripe-js 8.5 | `StripeCheckout.jsx` → `POST /api/stripe/create-subscription-session` (B2B), `/api/stripe-suscripciones` |
| **TipTap** | 3.11 | Editor rico (notas, recetas, newsletter): `EditorTextoRico.jsx`, `Contenido.jsx`. Extensiones: starter-kit, image, mention |
| **html-to-image / html2canvas** | 1.11 / 1.4 | Capturar tickets, promos, infografías como imagen |
| **react-slick** | 0.30 | Carruseles |
| **react-window** | 2.2 | Listas/grids virtualizadas |
| **Tippy.js** | 6.3 | Tooltips |
| **jwt-decode** | 4.0 | Parsear JWT cliente |
| **CryptoJS** | 4.2 | Encriptación localStorage |
| **MUI** | 7.3 | Componentes UI |
| **Headless UI** | 2.2 | Componentes UI |
| **react-hook-form** | 7.56 | Formularios |
| **SWR** | 2.3 | Cache/fetching (notas) |
| **react-icons** | 5.5 | Iconos |
| **Google Analytics (B2B)** | — | `FormGoogleAnalytics.jsx`, `HistorialGoogleAnalytics.jsx`, `/api/productosb2b` |
| **Geolocalización** | — | `Geolocalizacion.jsx` (formulario 100 estrellas) |
| **Instagram** | — | LinkInBio, InstaHistory, InstaRecomendaciones |

---

## 10. Estilos

- Tailwind CSS 4.1 vía `@tailwindcss/vite` (sin tailwind.config.js)
- `src/index.css` — `@import "tailwindcss"`, `@font-face NeueHaasGrotesk`, keyframes (marquee 90s), `@theme` variables
- Theme tokens (`vite.config.js` + index.css):
  - `colors.amarillo: #FFF200`
  - `--font-haas`, `--font-roman`, `--font-grotesk`
- Container: `max-w-[1080px] mx-auto`
- CSS modules específicos: `iconos/SocialMedia.css`, `StripeCheckout.css`, `MegaMenu.css`, `Footer.css`, `formulario100estrellas/FormularioMain.css`, `ednl/**/*.css`, `infografia/InfografiaMain.css`

---

## 11. Tecnologías clave

| Categoría | Tech | Versión |
|-----------|------|---------|
| Framework | React | 19.1 |
| Build | Vite | 6.4 |
| Compilador | SWC | 1.10 |
| Routing | React Router DOM | 7.6 |
| Estilos | Tailwind CSS | 4.1 |
| UI | MUI / Headless UI | 7.3 / 2.2 |
| Forms | react-hook-form | 7.56 |
| Rich Text | TipTap | 3.11 |
| Cache | SWR | 2.3.8 |
| Pagos | @stripe/stripe-js | 8.5 |
| Auth | jwt-decode | 4.0 |
| Crypto | crypto-js | 4.2 |
| PWA | vite-plugin-pwa | 1.2 |
| HTTP | Fetch + Axios | — |

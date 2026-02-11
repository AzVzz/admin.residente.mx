# Admin Residente

Dashboard de administracion construido con React + Vite.

## Desarrollo con Docker (recomendado)

Ver [residente-docker/README.md](../residente-docker/README.md) para setup inicial.

```bash
# Desde residente-docker/
scripts\docker.bat up

# Admin disponible en http://localhost:5173/admin/
```

---

## Flujo de trabajo: hacer cambios y probar

### 1. Editar codigo

Editar archivos en `admin.residente.mx/src/`. Vite hace **hot reload automatico** - los cambios se ven al instante en el navegador sin reiniciar nada.

### 2. Probar

Abrir http://localhost:5173/admin/ (OJO: con `/` al final) y verificar que:
- El login funciona
- CRUD de contenido funciona (crear, editar, borrar notas/restaurantes/tickets)
- Los cambios se reflejan en la base de datos local (probar desde otro endpoint o MySQL directo)

### 3. Si cambias package.json (nueva dependencia)

```bash
scripts\docker.bat rebuild admin
```

### 4. Ver logs si algo falla

```bash
scripts\docker.bat logs admin
```

### 5. Subir a produccion

```bash
cd admin.residente.mx
git add . && git commit -m "descripcion del cambio"
git push origin main
```

GitHub Actions automaticamente:
1. `pnpm install` + `pnpm build`
2. rsync de `dist/` a `~/admin.residente.mx/httpdocs/` en Plesk

### Deploy manual (si falla Actions)

```bash
pnpm run build
scp -r dist/* usuario@servidor:~/admin.residente.mx/httpdocs/
```

---

## Configuracion de URL del backend (local vs produccion)

Admin conecta al backend via `VITE_API_URL`:

| Entorno | Valor | Donde se define |
|---------|-------|--------------------|
| Docker local | `http://localhost:3000/` | `residente-docker/.env` |
| Docker produccion | `https://admin.residente.mx/` | `docker-compose.prod.yml` |
| Sin Docker (dev) | `http://localhost:3000/` | Fallback en `src/componentes/api/url.js` |
| Produccion (Plesk) | `https://admin.residente.mx/` | Fallback en `src/componentes/api/url.js` |

### Archivo url.js

```
src/componentes/api/url.js
  -> Lee import.meta.env.VITE_API_URL
  -> Fallback: https://admin.residente.mx/
```

En Docker local no necesitas tocar nada. El `docker-compose.yml` ya pasa `http://localhost:3000/`.

En produccion, el build de GitHub Actions no define `VITE_API_URL`, asi que cae al fallback `https://admin.residente.mx/`.

---

## Modo produccion en Docker

Al correr `scripts\docker.bat prod`, el admin usa una imagen diferente:

| | Desarrollo (`up`) | Produccion (`prod`) |
|---|---|---|
| Servidor | Vite dev server | Nginx |
| Puerto | 5173 | 80 |
| URL | http://localhost:5173/admin | http://localhost/admin |
| Hot reload | Si | No |
| API | Directo al backend | Nginx proxea `/api/` al backend |

---

## Desarrollo sin Docker

```bash
npm install
npm run dev
```

Requiere que el backend este corriendo en `http://localhost:3000`.

---

## Estructura

```
admin.residente.mx/
  src/
    componentes/
      api/
        url.js            # Config URL backend (lee VITE_API_URL)
      paginas/            # Paginas del dashboard
    App.jsx               # Router principal
  public/                 # Assets estaticos
  Dockerfile              # Multi-target: dev, build, prod
  nginx.conf              # Config Nginx (modo produccion Docker)
  .github/
    workflows/
      deploy.yml          # CI/CD: pnpm build -> rsync a Plesk
```

## Docker targets

El Dockerfile tiene 3 targets:
- **dev** - Vite dev server con hot reload (default en `docker.bat up`)
- **build** - Solo construye los assets estaticos
- **prod** - Nginx sirviendo el build + proxy `/api/` al backend (usado en `docker.bat prod`)

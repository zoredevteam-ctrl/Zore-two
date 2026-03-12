# README2 / Informe técnico del código (Zore-two)

Fecha del informe: 2026-03-12  
Entorno donde se revisó: Windows + PowerShell, Node.js `v24.14.0` (repo sin `node_modules`)

## 1) Resumen (estado actual)

En el estado actual del repositorio, el bot **no puede arrancar** sin instalar dependencias (`node_modules` no existe). Aun con dependencias instaladas, hay **fallos que rompen funcionalidad en Windows** (carga de plugins por rutas absolutas y uso de `rm -rf`), y hay scripts/configuraciones inconsistentes (modo `qr`/`code`, `npm test` apunta a un archivo inexistente).

Este informe lista **qué partes existen**, **cómo se conectan**, y **qué errores/problemas** se detectan por revisión estática y ejecuciones mínimas reproducibles.

## 2) Estructura del repositorio (alto nivel)

- `index.js`: arranque del bot principal + sub-bots, carga plugins, conexión Baileys.
- `handler.js`: enrutador de mensajes/comandos, carga de `events/`, control de permisos/roles.
- `settings.js`: configuración global (owners, textos, links, APIs), crea carpetas de sesión y hace `watchFile`.
- `lib/`
  - `database.js`: inicialización y wrapper de LowDB (`database.json`).
  - `simple.js`: normalizador `smsg()` de mensajes Baileys.
  - `print.js`: logging de mensajes.
- `events/` (5 archivos): listeners extra (welcome, goodbye, antilink, antispam, nsfw).
- `plugins/` (61 archivos): comandos/funcionalidades.

## 3) Flujo de ejecución (cómo funciona)

1. `index.js` importa `./settings.js` (efectos globales: owners, prefijo, creación de carpetas, logs).
2. `index.js` crea el `Map plugins`, llama `loadPlugins()` y luego `startBot()`.
3. `startBot()` crea socket Baileys (`makeWASocket`) y registra:
   - `connection.update` (QR y reconexión)
   - `messages.upsert` (convierte mensaje con `smsg()` y pasa al `handler`)
4. `handler.js`:
   - (intenta) `loadEvents(conn)` una vez y luego procesa prefijo/comando y ejecuta el plugin correspondiente.
   - maneja roles: owner/root owner/premium/admin/bot admin, etc.
5. `lib/database.js` usa LowDB para `database.json` y expone `database.read()`/`save()`.

## 4) Comprobaciones ejecutadas (reproducibles) y resultados

### 4.1 Sintaxis (Node)
- `node --check index.js` ✅
- `node --check handler.js` ✅
- `node --check` sobre `plugins/*.js` ✅ (no detecta errores lógicos/ESM en runtime)

### 4.2 Tests (NPM)
- `npm test` ❌ en PowerShell por política de ejecución (bloquea `npm.ps1`).
- `npm.cmd test` ❌ porque el script intenta ejecutar `node test.js` y **`test.js` no existe**.

### 4.3 Arranque mínimo
- `node index.js --qr` ❌: falla importando `chalk` desde `settings.js` porque **no hay dependencias instaladas** (`node_modules` ausente).

### 4.4 Carga de plugins en Windows (ESM)
En `index.js`, `loadPlugins()` usa `import(<ruta-absoluta-windows>)`.
Esto en ESM en Windows falla con:
- `ERR_UNSUPPORTED_ESM_URL_SCHEME` (requiere `file://...`)

Ejemplo reproducible:
- `node --input-type=module -e "import('C:\\...\\plugins\\main-menu.js')"`
  → falla indicando que en Windows **rutas absolutas deben ser URLs `file://`**.

## 5) Problemas detectados (errores y cosas que “no funcionan”)

### P0 (bloqueantes / rompen el bot)

1) **No hay dependencias instaladas**
- `node_modules` no existe, por lo que `import chalk`, `baileys`, `lowdb`, etc. fallan al iniciar.
- No hay `package-lock.json` / `yarn.lock` / `pnpm-lock.yaml`, lo que hace la instalación menos reproducible.

2) **Carga de plugins rota en Windows por rutas absolutas**
- `index.js` hace `import(\`${filePath}?t=\${Date.now()}\`)` donde `filePath` es `C:\...\plugins\archivo.js`.
- En Node ESM (Windows) eso falla; debe convertirse a URL con `pathToFileURL(filePath).href`.
- Resultado: aun con dependencias instaladas, **los plugins no se cargarán** en Windows.

3) **Uso de `rm -rf` (Linux) dentro de Windows**
- En `index.js`, al manejar `DisconnectReason.loggedOut/forbidden` ejecuta:
  - `exec('rm -rf ./Sessions/Owner/*')`
- En Windows esto no existe (salvo entornos tipo WSL/Git Bash). Debe reemplazarse por `fs.rmSync(...)` o equivalente multiplataforma.

4) **Modo `qr`/`code` inconsistente y “code” incompleto**
- `package.json`:
  - `qr`: `node index.js qr`
  - `code`: `node index.js code`
- `index.js` busca `--qr` y `--code` (no `qr`/`code`).
- Además, el flujo “código de emparejamiento” no se ve implementado en `index.js` (no hay `requestPairingCode`).
- Resultado: esos scripts no activan el modo esperado y el modo “code” aparenta estar incompleto.

5) **Script de test roto**
- `package.json` define `test: node test.js` pero `test.js` no existe → `MODULE_NOT_FOUND`.

### P1 (rompen features específicas o se comportan mal)

6) **Eventos cargados solo una vez (afecta sub-bots)**
- `handler.js` tiene `let eventsLoaded = false` a nivel módulo.
- `loadEvents(conn)` retorna si ya se cargó una vez.
- Resultado: si el bot principal carga eventos primero, **los sub-bots pueden quedarse sin listeners** en su `conn` (porque no se registran por conexión).

7) **`lib/database.js`: import de `JSONFile` probablemente incorrecto con LowDB v3**
- Con `lowdb@^3`, lo usual es `import { JSONFile } from 'lowdb/node'`.
- Aquí está `import { JSONFile } from 'lowdb'` con un comentario de que se cambió para “evitar error”.
- Resultado probable: al instalar dependencias, **puede romper el arranque** al importar la DB (depende de la versión exacta instalada).

8) **Plugin `plugins/voz-hola.js` está roto**
- Usa `require('fs')` en un proyecto ESM (`"type": "module"`) → `require` no existe.
- Usa `conn.sendMessage(...)` pero `conn` no está definido en ese scope.
- Además, referencia `./media/saludo-zero-two.opus` y la carpeta `media/` **no existe** en el repo.

9) **Plugin `plugins/proteccion.js` no detecta texto correctamente**
- Usa `m.text` (que no se define en `lib/simple.js`), y solo cae a `m.caption`.
- En mensajes normales de texto, `text` queda vacío y no detecta groserías.
- Si la intención es moderar texto, debería usar `m.body` o que `smsg()` asigne `m.text = m.body`.

10) **Errores ocultos por `catch {}`**
- `index.js` y partes de handler/plugins silencian excepciones sin log.
- Esto dificulta saber por qué “no funciona” algo (plugins que no cargan, fallos de import, etc.).

### P2 (mantenibilidad / scripts / calidad)

11) **`nodemon` no está en dependencias**
- Script `test2`: `nodemon index.js`, pero `nodemon` no aparece en `dependencies`/`devDependencies`.

12) **Textos con caracteres “raros” (encoding)**
- Se observan caracteres corruptos/extraños en `README.md`, `settings.js` y banners ASCII.
- Esto suele ser mezcla de codificación (UTF-8 vs ANSI/Windows-1252) o archivos guardados con encoding incorrecto.

## 6) Riesgos de seguridad (muy importante)

- **Clave/API hardcodeada** en `plugins/descargas-tt.js` (`apikey=...`) y otros endpoints similares: expone credenciales y puede dejar de funcionar si el proveedor bloquea.
- **Números de owners hardcodeados** en `settings.js`: datos sensibles y difícil de mantener entre despliegues.
- **Ejecución remota de comandos**: `plugins/owner-exec2.js` permite ejecutar comandos del sistema desde WhatsApp (aunque esté restringido a `rowner`). Es un riesgo alto si la cuenta/owner se compromete.

## 7) Recomendaciones (orden sugerido)

1. Instalar dependencias y fijar lockfile (`package-lock.json`) para reproducibilidad.
2. Arreglar `loadPlugins()` para usar `pathToFileURL(filePath).href` y loguear errores al cargar plugins.
3. Reemplazar `rm -rf` por borrado multiplataforma con `fs.rmSync` (o equivalente) en `index.js`.
4. Unificar argumentos de arranque (`qr`/`code` vs `--qr`/`--code`) e implementar realmente “pairing code” si es un feature requerido.
5. Corregir `lib/database.js` según la API real de `lowdb@3` (probable `lowdb/node`).
6. Arreglar o desactivar `plugins/voz-hola.js` y revisar `plugins/proteccion.js` para que use `m.body`.
7. Revisar seguridad: quitar API keys del repo (usar `.env`), revisar `owner-exec2.js`, y documentar hardening.

---

Si quieres, puedo además:
- aplicarte los fixes P0/P1 en el código (para que arranque en Windows), o
- dejar un “modo diagnóstico” que loguee qué plugins fallan al cargar y por qué.


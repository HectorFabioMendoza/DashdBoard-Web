# Manual de Despliegue: Inventario Distribuidora JR

> **Nota de origen**: la herramienta de conteo físico ("Inventario JRP") fue construida originalmente para **Cacharrería JRP**, con su propio repositorio y su propio manual (`Inventario JRP/manual_tunel_cloudflare.md`). Distribuidora JR reutiliza esa misma herramienta para su propia operación, en su propio servidor y con su propia infraestructura de red. Este documento cubre **únicamente** el despliegue y operación para Distribuidora JR — no editar el manual original de Cacharrería JRP con detalles de este despliegue.

---

## 1. Dónde vive la aplicación

* **Servidor**: Buenaventura, IP local `192.168.1.101`.
* **Alojamiento**: IIS (no `npm run dev` — la app corre siempre, sobrevive reinicios del servidor).
  - Sitio dedicado `Inventario JRP` (nombre interno en IIS), carpeta física `C:\inetpub\Inventario`, puerto `8081`.
  - También montada como Aplicación bajo `Default Web Site` en la ruta `/Inventario`, para acceso cómodo en la red local sin puerto.
* **Branding visible**: "Inventario" / "Distribuidora JR" en los encabezados de Supervisor y Operario, y en el título de la pestaña del navegador (código fuente en `Inventario JRP/src/App.tsx`, `Inventario JRP/src/components/OperatorConsole.tsx`, `Inventario JRP/index.html` — build ya desplegado).

## 2. Cómo acceder

* **Dentro de la red de la oficina (Buenaventura)**:
  - `http://192.168.1.101:8081`
  - o `http://192.168.1.101/Inventario`
* **Desde otra ciudad (operarios en Cali, Palmira, etc.)**: no hay acceso directo — se requiere abrir un túnel temporal (ver sección 3).

## 3. Actualizar el código en el servidor

1. En tu PC, dentro de la carpeta `Inventario JRP/`, corre:
   ```powershell
   npm run build
   ```
2. Copia el resultado al servidor (por RDP, con la unidad local redirigida):
   ```powershell
   robocopy "\\tsclient\D\4 Hector Fabio\Dashboard Web\Inventario JRP\dist" "C:\inetpub\Inventario" /E
   ```
3. Recarga `http://localhost:8081` o `http://localhost/Inventario` en el servidor con `Ctrl+F5` para confirmar.

No hace falta reiniciar IIS ni el Application Pool para que los cambios de archivos estáticos se reflejen.

## 4. Acceso remoto temporal (operarios fuera de Buenaventura)

Usamos Cloudflare Quick Tunnel, pero **corriendo directamente en el servidor** (no en una PC remota) — el túnel solo puede reenviar tráfico hacia una dirección que él mismo pueda alcanzar por red, y una PC en otra ciudad no puede alcanzar la IP interna del servidor.

**Requisito ya instalado en el servidor**: binario standalone `C:\cloudflared\cloudflared.exe` (no requiere Node.js).

**Abrir el túnel** (PowerShell, dentro de la sesión RDP del servidor):
```powershell
C:\cloudflared\cloudflared.exe tunnel --url http://localhost:8081
```
Genera un enlace `https://xxxxx-xxxxx-xxxxx.trycloudflare.com`. Compártelo con los operarios (WhatsApp, correo, o QR). Como el build de producción ya incluye `firebase_config.json`, la app se autoconfigura sola al abrir el enlace — no hace falta configurar nada manualmente.

**Cerrar el túnel**: `Ctrl+C` en esa misma consola. El enlace muere de inmediato.

## 5. Solución de problemas

| Síntoma | Causa probable | Arreglo |
|---|---|---|
| 403.14 Forbidden | Carpeta del sitio vacía (falta el `robocopy`) | Repetir paso 3.2 |
| 403.18 Forbidden en `/Inventario` | Conflicto de Application Pool dedicado | Reutilizar `DefaultAppPool` en vez de uno nuevo |
| `npx` no reconocido en el servidor | El servidor no tiene Node.js | Usar el binario standalone `cloudflared.exe` (sección 4), no `npx` |
| Timeout / `Unable to reach the origin service` en la consola del túnel | `cloudflared` corriendo en una PC que no puede alcanzar `192.168.1.101` por red (ciudades distintas) | Correr el túnel **en el servidor mismo**, no en una PC remota |

## 6. Próximo paso: Tailscale

Cacharrería JRP (el proyecto original de esta herramienta) **ya tiene una red Tailscale funcionando**. El plan es sumar el servidor de Distribuidora JR a esa misma red existente, en vez de exponer el puerto `8081` al internet público — esto eliminaría la necesidad del túnel de Cloudflare para accesos frecuentes (quedaría solo como respaldo puntual) y cerraría la exposición pública actual del servidor.

**Este paso queda pendiente y lo ejecuta el usuario directamente** — no está hecho todavía.

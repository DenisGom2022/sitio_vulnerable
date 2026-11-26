# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React (Vite) en el frontend, API Express (Node.js) y MySQL, todo orquestado con Docker Compose.
Es la misma familia tecnológica que `~/proyectos/lab-owasp`. Docker requiere `sudo` en esta máquina.

## Users

- **Alumnos de seguridad web / DevSecOps** en una clase o taller. Su tarea es auditar una tienda
  online como lo haría un pentester en un encargo real de caja negra: navegar, registrarse,
  comprar e interceptar peticiones hasta encontrar y explotar los fallos.
- **El instructor** (el autor del proyecto). Levanta el entorno en la red de la clase, sabe dónde
  está cada fallo y comprueba lo que encuentran los alumnos por su cuenta (informes, demostración).

## Product Purpose

**Tornillo Mayor** es una ferretería online ficticia de bricolaje, herramientas y material de obra,
deliberadamente vulnerable. Vende a particulares y a profesionales (fontaneros, electricistas,
empresas de reformas). **No parece un laboratorio**: a primera
vista es una tienda corriente de Internet. Los fallos están en la lógica interna y solo se
descubren usándola y atacándola como un cliente o atacante real. Así se entrena el reconocimiento
y la explotación en un contexto realista, no en una consola de ejercicios guiada.

El objetivo se cumple cuando un alumno, sin ninguna pista dentro del sitio, puede encontrar y
explotar cada vulnerabilidad del catálogo desde los flujos normales de la tienda.

## Positioning

Une en una sola aplicación coherente las vulnerabilidades que hoy están repartidas en dos proyectos
de laboratorio aislados:
- `~/proyectos/lab-owasp`: escenarios guiados con editor y motor DAST.
- `~/proyectos/proyectos`: pares vulnerable/corregido por CWE, con panel monitor.

Aquí no hay monitor, ni editor, ni veredictos, ni versión corregida: solo el producto real con
fallos reales, como en un encargo de pentest.

## Operating Context

- Modalidad de **caja negra pura**: no hay marcador, flags, pistas, panel de monitor ni página de
  ayuda dentro del sitio. Nada en la interfaz delata que es un laboratorio.
- Se usa con las herramientas habituales del alumno: navegador, DevTools, proxy de interceptación
  (Burp/ZAP), curl. Algunas pruebas necesitan una página en otro origen (CORS, CSRF).
- El instructor lo despliega con Docker en su equipo y lo publica en la **red local de la clase**.
  **Nunca en Internet.**

## Capabilities and Constraints

### Funcionalidad de tienda (donde viven los fallos)

Catálogo amplio de ferretería (herramientas manuales y eléctricas, tornillería, fontanería,
electricidad, pintura, jardín) con buscador y filtros. Fichas con reseñas y fotos de obras de los
clientes. Registro, inicio y cierre de sesión, recuperación de contraseña, perfil con avatar,
carrito y checkout con tarjeta (ficticia), historial de pedidos.

**Registro durante el pedido:** el carrito se puede llenar sin cuenta. En el checkout, quien no
tiene cuenta crea una allí mismo (sin salir del pedido) y queda con la sesión iniciada con ese
usuario al terminar: el pedido queda a su nombre y puede volver a entrar más tarde con esas
credenciales. Este flujo conserva el mismo identificador de sesión del visitante anónimo (es el
punto natural del fallo nº 13, fijación de sesión).

Además, una **cuenta profesional** que importa presupuestos y pedidos en XML desde su software de
obra, una herramienta interna para **consultar el stock en el almacén del proveedor**, un panel
de administración y extensiones/plugins de la tienda (pasarelas, transportistas).

### Catálogo de vulnerabilidades (unión sin duplicados de ambos proyectos)

| # | Vulnerabilidad | CWE | Origen | Punto natural en la tienda |
|---|---|---|---|---|
| 1 | IDOR en perfil / pedidos | 639 | lab-owasp A01 | `/api/users/:id`, `/api/orders/:id` |
| 2 | Enumeración de usuarios por mensaje de error | 204 | lab-owasp A01-e2 | Login y recuperación |
| 3 | SSRF en descarga de avatar por URL | 918 | lab-owasp A01-e3/A10 | Perfil → avatar |
| 4 | CSRF en actualización de perfil | 352 | ambos | Perfil / cambio de email |
| 5 | CORS que refleja cualquier origen con credenciales | 942 | ambos | API de cuenta |
| 6 | XXE en importación de pedidos XML | 611 | ambos | Importar presupuesto/pedido XML (cuenta profesional) |
| 7 | Dependencia vulnerable (lodash 4.17.11) → prototype pollution → admin | 1321 | lab-owasp A03-e2 / A08-e2 | Preferencias de usuario (merge) |
| 8 | Script de terceros desde CDN sin SRI | 353 | lab-owasp A03 | `<script>` de analítica/widget |
| 9 | Cifrado determinista ECB / algoritmo débil (DES) | 327 | ambos | Datos de tarjeta / cupones cifrados |
| 10 | Token de recuperación de contraseña predecible | 640 | lab-owasp A04-e2 | Recuperación de contraseña |
| 11 | JWT cuya firma nunca se verifica | 347 | lab-owasp A04-e3 | Token de API / sesión |
| 12 | Token de sesión no validado contra el servidor | 613 | lab-owasp A07 | Sesión |
| 13 | Fijación de sesión (login no renueva el id) | 384 | ambos | Login y registro en el checkout |
| 14 | Contraseñas sin hash seguro | 916 | lab-owasp A06 | Tabla de usuarios / volcado |
| 15 | Inyección SQL (UNION) en el buscador | 89 | ambos | Búsqueda de productos |
| 16 | XSS reflejado en el término de búsqueda | 79 | ambos | Resultados de búsqueda |
| 17 | XSS almacenado por subida de "imagen" sin validar | 434 / 79 | lab-owasp A06-e3 | Fotos de obra en reseñas |
| 18 | Inyección de comandos del SO | 78 | ambos | Consulta de stock en el almacén del proveedor (herramienta interna) |
| 19 | Control de acceso por lista negra | 184 | lab-owasp A06-e2 | Rutas de administración |
| 20 | Gestión indebida de privilegios (servicio como root) | 269 | proyectos | Contenedor/servicio de diagnóstico |
| 21 | Descarga y `eval` de código de terceros sin verificar firma | 494 | lab-owasp A08 | Instalación de plugins |
| 22 | Logins fallidos que nunca se registran | 778 | lab-owasp A09 | Login |
| 23 | Inyección de logs (líneas falsas) | 117 | lab-owasp A09-e1 | Registro de actividad |
| 24 | Tarjeta y CVC en texto plano en los logs | 532 | lab-owasp A09-e2 | Checkout |
| 25 | Errores verbosos que filtran configuración interna | 209 | lab-owasp A10 | Cualquier error 500 |

La numeración OWASP sigue la de `lab-owasp` (Top 10 2025: A03 Supply Chain, A10 Exceptional
Conditions).

### Restricciones

- Cada fallo debe ser **explotable desde un flujo normal de la tienda**: formularios, enlaces,
  cookies, peticiones a la API. Nunca con botones de "atacar".
- **Sin versión corregida** en este proyecto.
- **Ninguna pista en la interfaz:** sin comentarios reveladores en el HTML del cliente y sin rutas
  tipo `/vuln`. Los únicos indicios son los que tendría una tienda real mal hecha.
- Datos **100 % ficticios** (sembrados en `init.sql`). Prohibido usar datos personales o tarjetas
  reales.
- El servicio se publica en la red local de la clase y **nunca en Internet**. MySQL solo en
  `127.0.0.1`.
## Brand Commitments

- **Nombre:** Tornillo Mayor. Es ficticio y no debe imitar a ninguna ferretería o cadena real.
- **Sector:** ferretería y bricolaje, con clientes particulares y profesionales.
- **Carácter:** una ferretería de toda la vida (negocio familiar con años de oficio) que dio el
  salto a lo online: trato cercano, consejo de quien conoce el material.
- El sitio debe resultar indistinguible de una tienda online real y corriente, sin estética de
  laboratorio, consola ni "hacker".
- Interfaz y contenido en español.

## Evidence on Hand

- Código de referencia de cada fallo en `~/proyectos/lab-owasp/backend/scenarios/*.js` y
  `~/proyectos/proyectos/<categoría>/<cwe>/`.
- Datos semilla de referencia en `~/proyectos/lab-owasp/database/init.sql`.
- No hay fotos de producto, logotipo, textos de marca ni reseñas reales. Hay que crearlos
  ficticios y nunca presentarlos como de una empresa real.

## Product Principles

1. **Realismo antes que didáctica.** Si un elemento delata que es un laboratorio, sobra. La
   didáctica la pone el instructor, no el sitio.
2. **Cada fallo vive donde viviría en una tienda real.** El fallo nace de una función creíble de la
   tienda, no de una función inventada para alojar el fallo.
3. **Explotable, reproducible, sin trucos.** Cada vulnerabilidad funciona siempre igual tras un
   reinicio limpio del entorno (`docker compose down -v && up`).
4. **Peligroso solo dentro del aula.** Vulnerable por diseño, pero confinado: red local,
   contenedores y datos ficticios.

## Accessibility & Inclusion

No se ha fijado ninguna norma propia del producto. Se aplica la misma base que una tienda real
(WCAG 2.2 AA en los flujos de compra) para que no parezca un sitio de juguete.

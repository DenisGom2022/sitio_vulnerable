---
version: 1
slug: "frontend-src-pages-home-jsx"
primary_target: "frontend/src/pages/Home.jsx"
related_targets: []
---

# Portada de la tienda (Home)

Modo: Persuade. Visitante: cliente de ferretería (particular o profesional); en la práctica, alumno auditando la tienda en caja negra. Acción: buscar o añadir al carrito. Prueba: catálogo real de ferretería con referencias, precios y stock. Restricción: nada delata un laboratorio.

## Direction contract

THESIS: La tienda es la cajonera metálica del fondo de la ferretería: cada categoría y cada oferta es un cajón con su portaetiquetas; abrirlo es comprar. Rechaza el carrusel naranja con rejilla de tarjetas de las grandes cadenas.

OWN-WORLD: Chapa esmaltada verde (#2E4B3F, sombra #1C2A24) como estructura de toda la página; gris cajonera #D9DCD5 de fondo; tarjetas blancas en portaetiquetas de aluminio; amarillo pegatina #F4C531 solo para ofertas y acción. Referencias de almacén estarcidas (REF 02-118). Estado como marca: añadido = trazo de rotulador, agotado = etiqueta tachada.

STORY: El visitante reconoce una ferretería seria con mucho surtido, ve las ofertas de la semana, busca o añade al carrito sin salir de la portada, y entiende que también atiende a profesionales.

FIRST VIEWPORT: Barra de chapa verde con logo, buscador ancho, cuenta y carrito. Debajo, a módulo fijo: columna izquierda de cajones-categoría con etiqueta y REF; a la derecha, cajonera de ofertas 4×3 con un cajón grande (2×2) abierto con la oferta estrella y su «Añadir al carrito» amarillo, el resto cajones con ilustración, precio y botón.

FORM: Cajonera de tornillería, puesto 1 (asignado por el sorteo), seed:8f51a34c73f534ad. Raises: REF estarcida (de Terminal de nave), estado como marca (de Mesa de montaje), rejilla entera por módulo (de Recreativa CRT). Interacción firma: al añadir, el cajón se cierra un instante y la etiqueta recibe el trazo de rotulador.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

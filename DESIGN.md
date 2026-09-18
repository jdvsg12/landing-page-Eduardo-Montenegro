---
name: Eduardo Montenegro Flórez
description: Sitio de práctica psicoanalítica — escucha rigurosa sobre papel sage.
colors:
  sage: "#8F958B"
  sage-deep: "#3f443d"
  sage-ink: "#4a5048"
  paper: "#F2F1EE"
  surface: "#D9D9D9"
  ink: "#1a1a1a"
  white: "#ffffff"
typography:
  display:
    fontFamily: "ui-serif, Georgia, Cambria, Times New Roman, serif"
    fontSize: "clamp(3rem, 8vw, 6rem)"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "normal"
  headline:
    fontFamily: "ui-serif, Georgia, Cambria, Times New Roman, serif"
    fontSize: "clamp(1.875rem, 4vw, 2.25rem)"
    fontWeight: 300
    lineHeight: 1.2
  title:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.09em"
  hero:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.025em"
  hero-lg:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.025em"
rounded:
  none: "0px"
  xs: "2px"
  sm: "6px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "32px"
  xl: "64px"
  section: "96px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.none}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "8px 0px"
  input-dark:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    rounded: "{rounded.none}"
    padding: "12px 0px"
---

# Design System: Eduardo Montenegro Flórez

## Overview

**Creative North Star: "El consultorio de papel sage"**

La interfaz se comporta como un consultorio: superficies quietas, tipografía que se deja leer, y un verde oliva que viene del retrato y de la práctica, no de un kit de wellness. El visitante evalúa a quién escuchar; el diseño no empuja, sostiene.

La densidad es editorial. Títulos en serif itálica, cuerpo en Geist, bloques anchos con mucho aire. No hay tarjetas de icono, no hay métricas, no hay promesa de bienestar. El contraste se toma del propio sage: texto secundario en `sage-ink` o blanco al 80% sobre `ink`, nunca gris sobre color.

**Key Characteristics:**
- Sage, paper, surface e ink como única paleta de marca
- Serif itálica para lo que se dice; sans para lo que se opera
- Esquinas a 0px en CTAs y campos
- Profundidad por apilado sticky y sombras de sección, no por glow

## Colors

La paleta es oliva y papel. El negro (`ink`) es la voz de acción; el sage es el clima.

### Primary
- **Sage** (#8F958B): hero, fondos de taller, filetes. El color del retrato y de la sala.
- **Sage deep** (#3f443d): degradados y anclas oscuras del sage.
- **Sage ink** (#4a5048): títulos grandes y texto sobre paper. Pasa contraste de texto grande.

### Neutral
- **Paper** (#F2F1EE): páginas interiores y nav sólida.
- **Surface** (#D9D9D9): sección de servicios, el tablero donde se apilan las fichas.
- **Ink** (#1a1a1a): contacto, footer, botones, formularios oscuros.
- **White** (#ffffff): texto sobre sage e ink.

### Named Rules
**The Hue Rule.** Sobre sage o ink, el texto secundario se tine de esa superficie (blanco/sage-ink). No se usa gris neutro sobre color.

**The No-Wellness Rule.** Nada de verdes saturados de “salud”, salvo el hover de WhatsApp (#25D366), que es el color de esa red.

## Typography

**Display Font:** ui-serif / Georgia (serif itálica en títulos de sección y fichas)
**Body Font:** Geist Sans (`--font-geist-sans`)
**Label/Mono Font:** Geist Mono, solo si hace falta dato; no como disfraz técnico

**Character:** La serif lleva la escucha; la sans, la navegación y el formulario. El lema va en itálica light, no en bold de campaña.

### Hierarchy
- **Display** (300, clamp 3–6rem, 1.1): títulos de servicio y “Servicios”.
- **Headline** (300, ~2rem): contacto, FAQ, talleres.
- **Title** (600, 1.25rem): “Perfil” y subtítulos de bloque.
- **Body** (400, 1.125rem, ~1.7): biografía y FAQ. Medida corta (~65ch) en fichas.
- **Label** (500, 0.875rem, tracking amplio): kickers y badges.

### Named Rules
**The One Display Rule.** Un momento de display por vista. El hero ya grita el nombre; las secciones siguientes hablan en serif más quieta.

## Layout

Contenedor `max-w-7xl` con `px-6` / `lg:px-8`. Secciones a `py-24 lg:py-32`. El hero sage queda sticky detrás; todo lo que sigue vive en una lámina opaca (`paper`, luego `surface` e `ink`) para que el retrato no se cuele por huecos.

Las fichas de servicio son sticky escalonadas (`--offset` + n × `--tab`). Ese apilado es el sistema, no una galería de cards.

Breakpoints observados: `md` (768), `lg` (1024).

## Elevation & Depth

Híbrido: las secciones se cubren unas a otras. Las sombras son estructurales (el peso de una sección sobre la anterior), no hovers de tarjeta.

### Shadow Vocabulary
- **Section overlap** (`0 -20px 60px rgba(0,0,0,0.15)` / `0.3` en contacto): el bloque que llega tapa al anterior.
- **Rest:** el resto es plano. Paper y surface no llevan sombra de card.

### Named Rules
**The Overlap Rule.** La profundidad es el scroll. No se inventa una card elevada para un servicio.

## Shapes

Radio 0 en botones, inputs y CTAs. El único redondeo vivo es el botón del menú móvil (círculo 48px) y el checkbox. Nada de píldoras.

## Components

### Buttons
- **Shape:** 0px
- **Primary:** `ink` sobre blanco invertido al hover, padding ~16×32, borde 1px blanco cuando van sobre ink
- **WhatsApp:** mismo bloque, hover al verde de la red
- **Ghost:** subrayado inferior, no pastilla

### Cards / Containers
- **Corner Style:** 0
- **Background:** `surface` en listado; `paper` en ficha
- **Border:** filete superior `neutral-400` en talleres; filete sage en detalle
- **Internal Padding:** aire vertical generoso (pt-6 / pb-6), no cajas apretadas

### Inputs / Fields
- **Style:** solo borde inferior, fondo transparente, texto blanco sobre ink
- **Focus:** filete blanco que crece + anillo `focus-visible` blanco
- **Error:** borde y texto rojo; `aria-invalid` ligado al mensaje

### Navigation
Fija, transparente sobre el hero, `ink` en contacto, `surface` en servicios, `paper` en páginas internas. Texto blanco o ink según la sección. Menú móvil: círculo 48px, overlay ink a pantalla completa.

## Do's and Don'ts

### Do:
- **Do** usar `sage`, `paper`, `surface`, `ink` y `sage-ink` antes que un gris de Tailwind.
- **Do** traducir ES / EN / FR de verdad, incluido el lema y el formulario.
- **Do** respetar `prefers-reduced-motion`: el lema y el título del hero se leen de inmediato; el marquee se detiene; el menú móvil se funde en vez de expandir un círculo.
- **Do** dar 44px de área de toque a controles (checkbox incluido).

### Don't:
- **Don't** prometer wellness, métricas o testimonios inventados.
- **Don't** poner gris sobre sage o ink.
- **Don't** activar dark mode: los tokens `.dark` de shadcn no son marca.
- **Don't** usar el admin como referencia visual del sitio público.

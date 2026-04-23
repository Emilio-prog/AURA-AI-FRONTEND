# Aura AI — Dashboard Design Document

## Visión general

El Dashboard de Aura AI es el panel de control principal de la aplicación de bienestar mental. Está diseñado para usuarios en situaciones de estrés o ansiedad, por lo que la experiencia prioriza la **calma visual**, la **accesibilidad inmediata** a herramientas de contención y una **densidad de información moderada**.

---

## Sistema de diseño

### Tipografía

| Uso | Familia | Peso | Tamaño |
|---|---|---|---|
| Headings | DM Sans | 700 | 24–26px |
| Body | DM Sans | 400 | 13–15px |
| Labels / chips | DM Sans | 600 | 11–13px |
| Datos / stats | DM Sans | 700 | 18–22px |

### Paleta de color

Todos los colores están definidos en `oklch` para una percepción perceptualmente uniforme y accesibilidad mejorada.

| Token | Valor | Uso |
|---|---|---|
| `C.pu` | `oklch(62% 0.20 280)` | Color primario — acento principal, botones, estados activos |
| `C.puL` | `oklch(94% 0.06 280)` | Fondo suave púrpura — fondos de cards activas, chips |
| `C.puM` | `oklch(85% 0.10 280)` | Borde medio púrpura — separadores, bordes de énfasis |
| `C.puD` | `oklch(45% 0.22 280)` | Púrpura oscuro — reservado para contraste alto |
| `C.mint` | `oklch(68% 0.14 175)` | Acento verde menta — éxito, disponibilidad, progreso |
| `C.mintL` | `oklch(94% 0.06 175)` | Fondo suave menta |
| `C.peach` | `oklch(74% 0.12 30)` | Acento melocotón — urgencia suave, botón SOS |
| `C.peachL` | `oklch(95% 0.05 30)` | Fondo suave melocotón |
| `C.yellow` | `oklch(82% 0.14 85)` | Acento amarillo — estadísticas, rachas |
| `C.yellowL` | `oklch(96% 0.05 85)` | Fondo suave amarillo |
| `C.blue` | `oklch(68% 0.16 240)` | Acento azul — sonidos, ambientes |
| `C.blueL` | `oklch(94% 0.05 240)` | Fondo suave azul |
| `C.text` | `oklch(18% 0.04 280)` | Texto principal |
| `C.muted` | `oklch(55% 0.04 280)` | Texto secundario / desactivado |
| `C.border` | `oklch(92% 0.02 280)` | Bordes de cards y separadores |
| `C.bg` | `oklch(97% 0.01 280)` | Fondo de página |

### Espaciado y geometría

| Elemento | Radio de borde | Padding interno |
|---|---|---|
| Cards grandes | `20px` | `24px` |
| Cards hero | `20px` | `24–40px` |
| Botones primarios | `14px` | `13px 22px` |
| Chips / badges | `100px` (pill) | `3px 10px` |
| Items de lista | `12–14px` | `10–12px` |
| Modales | `28–32px` | `36–48px` |
| Sidebar nav items | `14px` | `11px 14px` |

### Sombras

```css
/* Card hover */
box-shadow: 0 8px 32px oklch(62% 0.20 280 / 0.12);

/* Modal */
box-shadow: 0 24px 80px oklch(62% 0.20 280 / 0.25);

/* Botón SOS */
box-shadow: 0 8px 40px oklch(74% 0.12 30 / 0.50);
```

### Animaciones

| Nombre | Descripción | Uso |
|---|---|---|
| `breatheIn` | Scale 1 → 1.45 → 1 | Orbe de respiración en modal SOS |
| `ring` | Scale + fade out | Anillos pulsantes del botón SOS |
| `fadeUp` | Opacidad + translateY | Entrada de secciones al montar |
| `slideIn` | Opacidad + translateX | Entrada lateral de elementos |
| `pulse` | Opacidad 1 → 0.5 → 1 | Indicador de estado activo (SOS) |
| `floatOrb` | translateY + scale suave | Burbujas del minijuego |
| `bounce` | translateY | Puntos de "escribiendo" en chatbot |

---

## Estructura de layout

```
┌─────────────────────────────────────────────────────┐
│  Sidebar (240px fijo)  │  Main content (flex: 1)    │
│                        │  max-width: 900px centrado │
│  - Logo                │                            │
│  - Nav items           │  Contenido de sección      │
│  - User profile        │  activa                    │
└─────────────────────────────────────────────────────┘
```

- Layout principal: `display: flex`, `height: 100vh`, `overflow: hidden`
- Sidebar: fijo, `240px`, `z-index: 10`
- Main: scroll vertical interno (`overflowY: auto`)
- Grid interno de cards: `display: grid`, `gridTemplateColumns: 1fr 1fr` (columnas) o `repeat(3,1fr)` según contexto

---

## Componentes principales

### Sidebar
- Navegación de 9 secciones con iconos emoji
- Estado activo: fondo `C.puL`, color `C.pu`, peso 600
- Estado hover: fondo `C.bg`, color `C.text`
- Indicador pulsante (`.peach`) en el ítem SOS
- Perfil de usuario fijo en la parte inferior

### Dashboard (sección Inicio)
Compuesto por bloques en orden vertical:

1. **Header de bienvenida** — saludo dinámico por hora del día
2. **Grid 2 columnas**:
   - Botón SOS con anillos pulsantes y acción de modal
   - Selector de estado emocional (5 moods)
3. **MoodChart** — gráfica de barras antes/después (7 días)
4. **Minijuegos** — tabs Burbujas / Colores
5. **SoundPlayer** — selector de ambientes + slider de volumen
6. **Grid 2 columnas** — accesos rápidos a Diario y Chatbot
7. **TrustedContacts** — lista de contactos con estado

### Modal: Respiración SOS (`BreathingModal`)
- Overlay con `backdrop-filter: blur(16px)`
- Orbe animado que escala en fase "inhala/mantén" y encoge en "exhala"
- Ciclo automático 4-4-6 (inhala 4s, mantén 4s, exhala 6s, pausa 2s)
- Botón de envío SOS a contactos con confirmación visual

### Modal: Chatbot (`ChatbotModal`)
- Interfaz de chat con burbujas diferenciadas (usuario vs IA)
- Indicador de "escribiendo" con 3 puntos animados
- Respuestas simuladas con delay aleatorio (1.5–2.5s)
- Input con envío por Enter o botón

### Modal: Diario (`DiaryModal`)
- Selector de 7 emociones con emoji
- Textarea libre con estilo suave
- Confirmación visual al guardar

### MoodChart
- Barras duales (antes/después) por día de la semana
- Grid horizontal con líneas guía dashed
- Tooltip al hacer hover sobre cada día
- Resumen de 3 métricas: prom. antes, prom. después, mejora %

### BubbleGame
- 12 burbujas flotantes con posición y tamaño aleatorio
- Animación `floatOrb` individual por burbuja
- Al explotar todas, se regeneran con nuevas posiciones
- Contador de burbujas explotadas

### SoundPlayer
- 5 ambientes sonoros seleccionables
- Estado activo: fondo de color del sonido, texto blanco
- Slider de volumen interactivo con click en barra
- Indicador de reproducción activa

---

## Estados y persistencia

- La sección activa se persiste en `localStorage` con clave `aura-section`
- Al montar la app, se restaura la última sección visitada
- El estado de modales es local al componente `App` (no se persiste)
- Los estados de juegos (score, burbujas) son locales a cada instancia

---

## Patrón de interacción hover

Todos los elementos interactivos siguen este patrón consistente:

```jsx
onMouseEnter={e => {
  e.currentTarget.style.transform = 'translateY(-2px)';
  e.currentTarget.style.boxShadow = `0 8px 32px ${color}20`;
}}
onMouseLeave={e => {
  e.currentTarget.style.transform = 'translateY(0)';
  e.currentTarget.style.boxShadow = 'none';
}}
```

Cards de navegación usan `translateY(-4px)`, botones primarios `translateY(-2px)`.

---

## Secciones placeholder

Las secciones aún no desarrolladas (`configuracion`, `Pintura con Arena`, `Más ambientes`) usan el componente `PlaceholderSection` con:
- Borde dashed `1px solid C.border`
- Icono grande centrado
- Título y descripción explicativa

---

## Decisiones de diseño

| Decisión | Justificación |
|---|---|
| oklch en lugar de hex/hsl | Percepción perceptualmente uniforme; los colores "claros" (`puL`, `mintL`) tienen el mismo lightness relativo independientemente del matiz |
| Sin emojis en producción crítica | El botón SOS usa 🆘 intencionalmente — es reconocible universalmente, reduce la carga cognitiva en momentos de estrés |
| Animaciones lentas (6s, 12s) | Los usuarios en estado de ansiedad se benefician de estímulos visuales lentos y predecibles |
| Color melocotón para SOS | El peach es urgente pero no agresivo como el rojo; no activa respuesta de alarma pero sí llama la atención |
| Sidebar fijo de 240px | Navegación siempre visible elimina la necesidad de recordar dónde está cada función |
| Modal con blur overlay | Focaliza la atención del usuario durante ejercicios críticos (respiración, chatbot) sin perder contexto |

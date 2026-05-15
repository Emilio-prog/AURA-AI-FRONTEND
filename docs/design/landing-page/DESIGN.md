# Sistema de Diseño: Serenidad Digital

Este documento detalla el marco visual y estructural para la plataforma Aura AI. Como diseñadores, nuestro objetivo es trascender la interfaz de usuario convencional para crear una experiencia editorial que se sienta como un suspiro de alivio. No estamos construyendo solo una aplicación; estamos diseñando un refugio digital.

## 1. El Norte Creativo: "Minimalismo Orgánico"

Nuestra estrella polar es el **Minimalismo Orgánico**. A diferencia del minimalismo rígido y frío, nuestra estética se basa en la fluidez de la naturaleza. Rompemos la "cuadrícula perfecta" mediante el uso de asimetría intencional, elementos que se superponen suavemente y una escala tipográfica con aire editorial.

**Principios clave:**
- **Asimetría Intencional:** Evita la alineación central monótona. Desplaza elementos ligeramente para crear un ritmo visual más humano.
- **Respiración (White Space):** El espacio no es vacío; es claridad mental. Priorizamos márgenes generosos para reducir la carga cognitiva.
- **Fluidez Visual:** El uso de formas orgánicas (`radius.xl`) y capas translúcidas evoca la sensación de elementos flotando en un entorno sereno.

---

## 2. Paleta Cromática y Textura

La paleta se aleja de los blancos puros para abrazar tonos suaves que no fatigan la vista.

### Jerarquía de Superficies (Nesting)
Prohibimos la "Regla de la Línea de 1px". Para separar secciones, utilizamos cambios tonales o elevación física:
- **Fondo Base:** `surface` (`#f6fafe`).
- **Secciones de Contenido:** `surface-container-low` (`#eff4f9`) para áreas secundarias.
- **Tarjetas y Módulos:** `surface-container-lowest` (`#ffffff`) para destacar información crítica sobre fondos más oscuros.

### El Efecto Cristal (Glassmorphism)
Para elementos flotantes (como menús de navegación o modales de meditación), aplicamos:
- **Color:** `surface` con 60-80% de opacidad.
- **Efecto:** Backdrop-blur de 12px a 20px.
- **Propósito:** Integrar el contenido con el fondo, permitiendo que los gradientes de la marca se filtren suavemente a través de la interfaz.

### Gradientes de Firma
No uses colores planos en CTAs principales. Utiliza gradientes lineales suaves:
- De `primary` (`#4a50c8`) a `primary-container` (`#b8bbff`) con un ángulo de 135°. Esto aporta una "vibración" sutil y premium.

---

## 3. Tipografía Editorial

La tipografía debe sentirse autoritaria pero accesible.

- **Display & Headlines (Plus Jakarta Sans):** Nuestra voz de marca. Se utiliza en tamaños generosos (`display-lg` a `headline-sm`) para marcar el ritmo. La escala debe ser dramática para crear jerarquía visual clara.
- **Cuerpo y Etiquetas (Manrope):** Elegida por su legibilidad excepcional y calidez. 
- **Uso de Tono:** El texto principal utiliza `on-surface` (`#2a3439`), mientras que la información de apoyo utiliza `on-surface-variant` (`#576067`) para reducir el ruido visual.

---

## 4. Elevación y Profundidad Tonal

Reemplazamos las estructuras rígidas por una estratificación natural.

- **Capas de Contenedores:** Logramos profundidad apilando tiers de `surface-container`. Un card en `surface-container-lowest` sobre un fondo `surface-container-low` crea un relieve visual sin necesidad de sombras pesadas.
- **Sombras Ambientales:** Si un elemento debe "flotar" (ej. un botón de acción flotante), la sombra debe ser extra-difusa: `blur: 32px`, `spread: -4px`, `opacity: 6%` usando un tinte de `primary_dim` en lugar de gris.
- **Bordes Fantasma (Ghost Borders):** Si la accesibilidad requiere un borde, utiliza `outline-variant` (`#a9b3ba`) con una opacidad máxima del 15%. Nunca uses bordes negros o de alto contraste.

---

## 5. Componentes de la Experiencia

### Botones (Botones de Intención)
- **Primario:** Gradiente de firma, esquinas `full` (píldora), texto en `on-primary`.
- **Secundario:** Fondo `secondary-container`, texto `on-secondary-container`. Sin bordes.
- **Interacción:** El estado *hover* debe expandir suavemente el elemento o intensificar el gradiente, nunca un cambio brusco de color.

### Tarjetas (Módulos de Bienestar)
- **Regla de Oro:** Prohibido el uso de líneas divisorias.
- **Estructura:** Usa `radius.lg` (2rem). La separación se logra mediante espaciado vertical amplio y cambios sutiles en el color de fondo del contenedor.

### Inputs de Usuario
- **Estética:** Fondos en `surface-container-high` con `radius.sm`.
- **Estados de Error:** El color `error` (`#ac3149`) debe aplicarse con moderación, preferiblemente solo en el texto de ayuda o un borde sutil, para no generar ansiedad en el usuario.

### Chips de Ánimo
- Elementos orgánicos con `radius.full`. Utilizan los colores `tertiary` y `secondary` para diferenciar categorías de actividades o estados emocionales.

---

## 6. Guía de "Do's & Don'ts" (Principios de Uso)

### ✅ Sí hacer (Do's)
- **Usar ilustraciones cálidas:** Los elementos visuales deben tener trazos suaves y colores de la paleta `tertiary` para evocar empatía.
- **Priorizar el espacio en blanco:** Si una pantalla se siente "llena", aumenta el espaciado entre secciones usando nuestra escala.
- **Nombres de botones claros:** Usa verbos que inspiren calma (ej. "Comenzar viaje", "Respirar ahora").

### ❌ No hacer (Don'ts)
- **No usar bordes de 1px negros:** Rompen la suavidad de la "atmósfera" de la app.
- **No usar sombras paralelas genéricas:** Las sombras deben ser sutiles y teñidas, o simplemente no existir.
- **No amontonar información:** En salud mental, menos es más. Si una tarjeta tiene demasiados datos, divídela en una secuencia.

---

### Nota del Director de Diseño:
*"El diseño es un acto de cuidado. Cada token en este sistema, desde el radio de 2rem hasta el desenfoque del cristal, ha sido seleccionado para asegurar que el usuario de Aura AI se sienta seguro y comprendido desde el primer segundo."*
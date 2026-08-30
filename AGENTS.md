# JobTracker AI — Project Guidelines & Architecture Standards

Este documento define los estándares técnicos, principios de diseño UI/UX, pautas de accesibilidad y reglas de desarrollo para cualquier agente de IA o desarrollador trabajando en **JobTracker AI**.

---

## 1. 🏗️ Principios de Arquitectura & Código Limpio

- **Separación de Responsabilidades**:
  - `src/services/`: Lógica de negocio pura, clientes de IA, scrapers y generadores de documentos (sin dependencias directas del DOM de React).
  - `src/context/`: Estado global de la aplicación (Zustand) con persistencia selectiva y fusión segura de `.env`.
  - `src/components/`: Componentes modulares, reutilizables y tipados estrictamente.
  - `src/pages/`: Vistas principales con lazy loading y manejo de estados (loading, empty, error).
  - `extension/`: Extensión Chrome Manifest V3 independiente para extracción de vacantes.

- **Seguridad & Credenciales**:
  - **NUNCA** incluir API Keys en el código fuente.
  - Todas las variables sensibles deben definirse en `.env` bajo el prefijo `VITE_*` y documentarse en `.env.example`.
  - El archivo `.env` está estrictamente ignorado en `.gitignore`.

- **Manejo de Errores & Resiliencia**:
  - Toda llamada a servicios de IA (`AIService`, `CVTranslationService`, scrapers) debe implementar un mecanismo de fallback garantizado (e.g. motor de traducción semántico basado en reglas).
  - Fallar de manera silenciosa hacia un estado funcional básico antes que romper la UI.

---

## 2. 🎨 Estándares de Diseño UI/UX & Tailwind CSS

- **Tokens de Espaciado & Grilla**:
  - Sistema de cuadrícula basado en 8pt (Tailwind: `p-2`, `p-4`, `p-6`, `p-8`, `gap-3`, `gap-6`).
  - Margen y relleno consistentes en tarjetas y modales (`p-6` en desktop, `p-4` en móvil).

- **Jerarquía Tipográfica**:
  - Títulos de Página: `text-2xl font-bold tracking-tight text-foreground`.
  - Títulos de Sección / Modales: `text-lg font-semibold text-foreground`.
  - Texto Principal / Párrafos: `text-sm text-muted-foreground leading-relaxed`.
  - Etiquetas / Badges: `text-xs font-medium uppercase tracking-wider`.

- **Micro-Interacciones & Retroalimentación**:
  - Transiciones suaves: `transition-all duration-200 ease-in-out`.
  - Estados interactivos de botones: `hover:shadow-md active:scale-[0.98]`.
  - **Empty States**: Siempre incluir un icono ilustrativo, mensaje amigable y llamada a la acción clara (CTA).
  - **Loading States**: Emplear Skeletons con la forma exacta del componente en lugar de spinners genéricos para contenido principal.

- **Superficies & Profundidad (Glassmorphism sutil)**:
  - Tarjetas: `bg-card/80 backdrop-blur-md border border-border/50 shadow-sm hover:shadow-md rounded-xl`.

---

## 3. ♿ Pautas de Accesibilidad (WCAG 2.2 AA)

- **HTML Semántico**:
  - Usar `<button>`, `<nav>`, `<main>`, `<header>`, `<footer>`, `<dialog>` en lugar de `<div>` con eventos `onClick`.
  - En botones con solo iconos (ej. Lucide Icons), es obligatorio incluir `aria-label="Descripción de la acción"` o `title="..."`.

- **Navegación por Teclado**:
  - Mantener visibles los anillos de enfoque: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`.
  - Los modales deben capturar el foco, cerrarse con la tecla `Escape` y devolver el foco al elemento de origen.

- **Lectores de Pantalla (Screen Readers)**:
  - Regiones dinámicas (toasts, estado de carga, alertas) deben usar `role="status"` o `aria-live="polite"`.
  - Mensajes de error en formularios deben asociarse al input con `aria-invalid="true"` y `aria-describedby="error-id"`.

- **Contraste de Color**:
  - Ratio mínimo de 4.5:1 para texto estándar y 3:1 para texto grande o elementos gráficos interactivos.

---

## 4. ⚡ Optimización & Rendimiento Frontend

- **Code Splitting**: Cargar rutas secundarias con `React.lazy()` y `Suspense`.
- **Memoización**: Emplear `useMemo` y `useCallback` en cálculos intensivos (análisis de compatibilidad ATS, filtros de listas de más de 50 vacantes).
- **Gestión de Cuota en Storage**: Limpiar datos temporales o de scraping obsoletos para evitar superar el límite de 5MB de `localStorage`.

---

## 5. 📄 Estándar ATS para Resumes (PDF & DOCX)

- **Diseño a 1 Columna**: Prohibido el uso de tablas complejas, encabezados/pies flotantes o gráficos en el cuerpo del CV.
- **Tipografía Universal**: Fuentes estándar (Arial, Calibri, Times New Roman, Helvetica, Georgia) entre 10pt y 12pt para cuerpo, 14pt–16pt para títulos.
- **Nombres de Sección Estándar**:
  - `SUMMARY` / `PROFESSIONAL SUMMARY`
  - `EXPERIENCE` / `WORK EXPERIENCE`
  - `SKILLS` / `TECHNICAL SKILLS`
  - `EDUCATION`
  - `PROJECTS`
  - `LANGUAGES`
- **Traducción Universal al Inglés**: Al descargar con idioma `en`, todo el documento (cargos, meses, locaciones, viñetas, educación y categorías) debe renderizarse 100% en inglés.

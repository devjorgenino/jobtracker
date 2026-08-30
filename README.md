<div align="center">

# 💼 JobTracker AI — Career & ATS Suite

**Plataforma Integral de Gestión de Postulaciones, Optimización de CV con Inteligencia Artificial y Extensión Web de Captura en 1-Clic.**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=for-the-badge)](https://github.com/pmndrs/zustand)
[![AI Engine](https://img.shields.io/badge/AI-OmniRoute%20%2F%20OpenRouter%20%2F%20Ollama-8A2BE2?style=for-the-badge&logo=openai&logoColor=white)](https://openrouter.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

<br />

[✨ Características Principales](#-características-principales) •
[🤖 Configuración de IA](#-configuración-de-ia-y-modelos) •
[🧩 Extensión de Navegador](#-extensión-de-navegador-captura-en-1-clic) •
[📄 Motor ATS y Plantilla PDF](#-motor-ats-y-plantilla-pdf-personalizada) •
[🚀 Inicio Rápido](#-inicio-rápido) •
[📁 Estructura](#-estructura-del-proyecto)

</div>

---

## 🌟 Descripción General

**JobTracker AI** es una solución profesional de grado de producción diseñada para desarrolladores, profesionales tech y buscadores activos de empleo. Combina un **tablero Kanban interactivo**, un **motor de análisis ATS con IA (Applicant Tracking System)**, **generador de cartas de presentación y estrategias de outreach**, gestión de **CV Maestro** y una **extensión web para Chrome/Brave/Edge** que captura vacantes automáticamente en 1 solo clic.

---

## ✨ Características Principales

### 📊 1. Tablero Kanban & Ciclo de Vida de Postulaciones
* **Flujo Visual Drag-and-Drop**: Organiza postulaciones por etapas (`Lista de Deseos`, `Postulado`, `Screening HR`, `Prueba Técnica`, `Entrevista Final`, `Oferta Recibida`, `Rechazado` y `Archivado`).
* **Filtros Avanzados en Tiempo Real**: Búsqueda instantánea por empresa, cargo, modalidad (`Remoto`, `Híbrido`, `Presencial`), prioridad (`Baja`, `Media`, `Alta`, `Crítica`) y portal de origen.
* **Métricas y Estadísticas Rápidas**: Contadores en vivo de vacantes activas, procesos en curso y ofertas conseguidas.
* **Historial de Actividad**: Registro cronológico de cambios de estado, notas y fechas clave.

### 🧠 2. Suite de Optimización ATS & IA
* **Auditoría de Compatibilidad ATS**: Calcula el % de Match contra cualquier vacante, detectando palabras clave faltantes, brechas técnicas y alineación de experiencia.
* **Sastrería de CV (CV Tailoring)**: Reescribe los logros de tu CV Maestro usando verbos de acción y métricas cuantificables alineadas a la vacante objetivo sin inventar credenciales.
* **Traducción Profesional de CV**: Traduce tu CV con terminología técnica estándar a *Inglés*, *Alemán*, *Francés*, *Portugués*, *Italiano* o *Español*.
* **Generador de Cartas de Presentación (Cover Letters)**: Redacta cartas persuasivas, concisas y adaptadas al tono de la empresa.
* **Simulador de Entrevistas (STAR Method)**: Genera preguntas técnicas y de comportamiento específicas con guías de respuesta modelo.
* **Estrategia de Outreach**: Plantillas personalizadas de mensajes para reclutadores por LinkedIn InMail, Email directo y solicitudes de referidos.

### 🧭 3. Navegación Inteligente y Sidebar Colapsable
* **Menú Lateral Dinámico**: Opción de colapsar (`w-20`) y expandir (`w-64`) con animaciones fluidas, tooltips flotantes accesibles y sincronización en la barra superior.
* **Persistencia de Preferencia**: El estado del menú se guarda automáticamente en `localStorage`.
* **Accesibilidad Total (A11y)**: Compatible con teclado (`aria-expanded`, `aria-label`, foco visual accesible) conforme a estándares **WCAG 2.2 AA**.

### 📄 4. Motor de Exportación PDF
* **Exportación Directa**: Generación limpia con `@react-pdf/renderer`.
* **Inyección en Plantilla Propia (`formato.pdf`)**: Relleno automático de campos de formulario interactivo (AcroForms) o superposición precisa con `pdf-lib`.

### 🧩 5. Extensión de Navegador (Captura en 1-Clic)
* Extrae puesto, empresa, salario, ubicación, requisitos y descripción completa desde **LinkedIn**, **Indeed**, **InfoJobs**, **Computrabajo**, **Wellfound**, **Y Combinator** y portales web genéricos.
* Sincronización bidireccional instantánea con la aplicación web.

---

## 🤖 Configuración de IA y Modelos

JobTracker AI cuenta con una arquitectura de IA agnóstica compatible con cualquier endpoint OpenAI-Compatible. Puedes utilizar modelos gratuitos en la nube o modelos 100% locales y privados:

| Proveedor | Endpoint Base | Modelos Destacados | Tipo |
| :--- | :--- | :--- | :--- |
| **OpenRouter (Recomendado)** | `https://openrouter.ai/api/v1` | `qwen/qwen-2.5-72b-instruct:free`<br>`meta-llama/llama-3.3-70b-instruct:free`<br>`google/gemini-2.0-flash-exp:free`<br>`deepseek/deepseek-r1:free` | 🌐 Nube (Gratis / Pago) |
| **Groq Cloud** | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile`<br>`mixtral-8x7b-32768` | ⚡ Ultra Rápido |
| **Ollama Local** | `http://localhost:11434/v1` | `qwen2.5:7b`<br>`llama3.3:latest`<br>`mistral:latest` | 🦙 100% Offline / Privado |
| **LM Studio** | `http://localhost:1234/v1` | Cualquier modelo GGUF cargado | 💻 Local GUI |

> 💡 **Presets en 1 Clic**: Desde la sección **Ajustes / OmniRoute & IA**, dispones de botones de configuración rápida para alternar entre proveedores al instante con prueba de conexión integrada.

---

## 🧩 Extensión de Navegador (Captura en 1-Clic)

El proyecto incluye una extensión Manifest V3 lista para usar ubicada en la carpeta `extension/`:

### 📥 Instalación de la Extensión en Chrome / Brave / Edge:
1. Abre tu navegador y dirígete a `chrome://extensions/` (o `brave://extensions/` / `edge://extensions/`).
2. Activa el **Modo de desarrollador** (esquina superior derecha).
3. Haz clic en **Cargar descomprimida** (*Load unpacked*).
4. Selecciona la carpeta `jobtracker/extension`.
5. ¡Listo! Al navegar en cualquier oferta de empleo en LinkedIn, Indeed, etc., abre la extensión y presiona **"Guardar en JobTracker"** o **"Guardar y Optimizar CV"**.

---

## 📄 Motor ATS y Plantilla PDF Personalizada

La aplicación permite generar PDFs con tu propio diseño profesional:

1. Coloca tu archivo PDF base en `public/formato.pdf`.
2. **Si el PDF tiene campos de formulario (AcroForms)**: Se rellenarán automáticamente (`nombre`, `titulo`, `contacto`, `perfil`, `experiencia`, `educacion`, `competencias`).
3. **Si el PDF es estático sin formulario**: Se utilizará como fondo membretado dibujando el contenido tipográfico optimizado en la capa frontal.
4. **Si no existe `public/formato.pdf`**: Se generará un diseño elegante por defecto mediante `@react-pdf/renderer`.

---

## 🚀 Inicio Rápido

### Prerrequisitos
* **Node.js**: v18.0 o superior
* **npm** o **pnpm** / **yarn** / **bun**

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/jobtracker.git
cd jobtracker
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Copia el archivo de ejemplo `.env.example` a `.env`:
```bash
cp .env.example .env
```

Configura tus credenciales (opcional si usas modelos locales con Ollama):
```env
# OpenRouter / OmniRoute (Modelos gratuitos y de pago)
VITE_OMNIROUTE_BASE_URL=https://openrouter.ai/api/v1
VITE_OMNIROUTE_API_KEY=tu_api_key_de_openrouter
VITE_OMNIROUTE_MODEL=qwen/qwen-2.5-72b-instruct:free
```

### 4. Ejecutar en Modo Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

### 5. Compilar para Producción
```bash
npm run build
```

---

## 📁 Estructura del Proyecto

```
jobtracker/
├── extension/                 # 🧩 Extensión Manifest V3 (Chrome, Brave, Edge)
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── content.js             # Scraping de LinkedIn, Indeed, etc.
│   └── background.js
├── public/                    # 🎨 Recursos estáticos y plantilla PDF
│   └── formato.pdf            # (Opcional) Plantilla base para CV
├── src/
│   ├── components/
│   │   ├── common/            # Modales, Botones, Badges, Tabs
│   │   ├── cv/                # Formularios y previsualizadores de CV
│   │   ├── kanban/            # Columnas, Tarjetas y Filtros de empleo
│   │   └── layout/            # Sidebar Colapsable, Navbar y Shell
│   ├── context/
│   │   └── store.ts           # Store global Zustand con persistencia
│   ├── pages/
│   │   ├── KanbanPage.tsx     # Tablero principal de gestión
│   │   ├── OptimizePage.tsx   # Suite ATS, Sastrería y Traducción
│   │   ├── StrategyPage.tsx   # Cartas de presentación, Outreach y Simulador
│   │   ├── CVPage.tsx         # Gestión del CV Maestro
│   │   ├── ExtensionPage.tsx  # Tutorial y estado de la extensión
│   │   └── SettingsPage.tsx   # Configuración de IA y Presets rápidos
│   ├── services/
│   │   ├── ai/                # Clientes OpenAI-compatible (OmniRoute, Ollama, Groq)
│   │   ├── cv/                # Motores de análisis ATS, sastrería y traducción
│   │   ├── export/            # Generador y parseador de PDFs
│   │   └── sync/              # Sincronizador de eventos con la extensión web
│   ├── types/                 # Definiciones de tipos TypeScript
│   └── utils/                 # Helpers de clases y formatos
├── .env.example               # Plantilla de variables de entorno
├── tailwind.config.js         # Configuración de estilos
├── tsconfig.json              # Configuración de TypeScript
└── vite.config.ts             # Configuración de Vite
```

---

## 🔒 Privacidad y Almacenamiento Local-First

* **Privacidad Primero**: Toda tu información de postulaciones, notas y CV se almacena de forma local en tu navegador mediante `localStorage`.
* **Sin Base de Datos Externa**: No requiere backend centralizado; tus datos son 100% tuyos.
* **Copia de Seguridad y Restauración**: Puedes exportar e importar tu base de datos completa en formato JSON en cualquier momento desde la sección de Ajustes.

---

## 🛠️ Tecnologías Utilizadas

* **Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
* **Estilos & UI**: [Tailwind CSS](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/), [Sonner Toasts](https://sonner.emilkowal.ski/)
* **Estado Global**: [Zustand](https://github.com/pmndrs/zustand) con middleware de persistencia
* **Drag & Drop**: [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)
* **Motor de Documentos**: [@react-pdf/renderer](https://react-pdf.org/), [pdf-lib](https://pdf-lib.js.org/)
* **Cliente HTTP**: [Axios](https://axios-http.com/)

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo `LICENSE` para más detalles.

<div align="center">

Hecho con ❤️ para potenciar la carrera de los desarrolladores y profesionales tech.

</div>

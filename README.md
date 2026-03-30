# JobTracker

Application to track your job applications with a Kanban board, CV management, and AI-powered features.

## Features

- **Kanban Board**: Visual tracking of job applications through different stages (Applied, Interview, Offer, Rejected)
- **CV Management**: Generate and manage custom CVs in PDF format
- **ATS Analysis**: Analyze CV compatibility with job descriptions using AI
- **AI Assistant**: Get help with job search, CV optimization, and interview preparation

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **PDF Generation**: @react-pdf/renderer, pdf-lib
- **Drag & Drop**: @hello-pangea/dnd
- **AI**: Qwen (via API)
- **UI Components**: Radix UI

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## PDF optimizado con plantilla (formato.pdf)

En la página **Optimizador**, al generar un CV optimizado con IA puedes descargar o previsualizar un PDF que respeta un diseño fijo:

1. **Coloca tu plantilla** en la carpeta `public` con el nombre **`formato.pdf`**.
2. El PDF generado usará ese archivo como base:
   - **Si el PDF tiene campos de formulario (AcroForm)**  
     Se rellenan automáticamente. Nombres de campo sugeridos (en español o inglés):  
     `nombre`, `titulo`, `contacto` / `email`, `perfil` / `resumen`, `experiencia`, `educacion`, `competencias` / `skills`, `formacion_adicional`.
   - **Si el PDF no tiene formulario**  
     Se usa la primera página como fondo y se dibuja el contenido optimizado encima (mismo diseño que el CV por defecto).
3. Si no existe `public/formato.pdf`, la app genera el PDF con el layout por defecto (@react-pdf/renderer) sin plantilla.

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── common/      # Generic components (Button, Card, Input, etc.)
│   ├── cv/          # CV-related components
│   ├── kanban/      # Kanban board components
│   └── layout/      # Layout components (Sidebar, Layout)
├── context/         # State management (Zustand store)
├── pages/           # Page components
├── services/        # API services (qwen, pdfFromTemplate)
├── types/           # TypeScript types
└── utils/           # Utility functions
```

## License

MIT

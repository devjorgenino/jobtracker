# 🚀 JobTracker AI - Extractor de Vacantes Remotas (Extensión de Navegador)

Extensión de navegador (Manifest V3) diseñada para capturar ofertas de empleo remoto en **1 solo clic** desde cualquier portal de empleo y sincronizarlas en tiempo real con tu suite **JobTracker**.

---

## 🌟 Portales con Soporte Optimizado

| Portal | Modalidades y Datos Extraídos |
| :--- | :--- |
| **LinkedIn** | Título, Empresa, Ubicación, Modalidad Remota, Salario, Reclutador/Contacto, Stack tecnológico, Descripción. |
| **Indeed** | Título, Empresa, Salario, Ubicación, Descripción completa, Tipo de contrato. |
| **InfoJobs** | Título, Empresa, Rango salarial, Ubicación, Requisitos, Descripción detallada. |
| **CompuTrabajo** | Título, Empresa, País/Ciudad, Salario, Requisitos, Descripción (Soporte para todos los dominios LATAM). |
| **Get on Board** | Título, Empresa, Nivel de seniority, Modalidad remota (Global/LATAM), Salario, Stack, Descripción. |
| **Glassdoor** | Título, Empresa, Estimaciones salariales, Ubicación, Descripción. |
| **Torre.ai** | Título, Organización, Rango de compensación, Skills, Requisitos remotos. |
| **We Work Remotely / RemoteOK** | Categoría remota, Tags tecnológicos, Salario, Descripción, Enlace directo. |
| **Cualquier otro portal (Genérico)** | Parser Inteligente con Schema.org (`JobPosting` JSON-LD), OpenGraph meta tags y heurística DOM. |

---

## 📥 Cómo Instalar en Chrome / Edge / Brave / Opera

1. Abre tu navegador y dirígete a la gestión de extensiones:
   - **Google Chrome**: `chrome://extensions/`
   - **Microsoft Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
2. Activa el **Modo de desarrollador** (Developer mode) en la esquina superior derecha.
3. Haz clic en **Cargar descomprimida** (Load unpacked).
4. Selecciona la carpeta `extension` ubicada en la raíz de este proyecto:
   `C:\Users\jorge\OneDrive\Documents\GitHub\jobtracker\extension`
5. ¡Listo! El icono de JobTracker AI aparecerá en tu barra de herramientas.

---

## ⚡ Formas de Uso

### 1. Botón Flotante en 1 Clic (Directo en la Página)
Al navegar en cualquier oferta de empleo de LinkedIn, Indeed, Get on Board, etc., verás un botón flotante azul en la esquina inferior derecha: **"Guardar en JobTracker"**.
Al hacer clic, la vacante se extrae y se envía instantáneamente a tu aplicación JobTracker.

### 2. Popup de la Extensión
Haz clic en el icono de la extensión en tu barra de navegación para:
- Revisar y editar los datos antes de guardar (Salario, Modalidad, Prioridad, Estado inicial).
- Ver las tecnologías detectadas automáticamente.
- Hacer clic en **"Guardar y Optimizar CV"** para abrir JobTracker con tu CV optimizado al instante para esa vacante.
- Copiar la información como JSON.

### 3. Menú Contextual
Selecciona cualquier texto con una oferta de trabajo, haz clic derecho y elige **"Guardar selección como vacante en JobTracker"**.

---

## 🔄 Sincronización Automática con JobTracker Web App
La extensión se comunica con la app web mediante:
- **BroadcastChannel (`jobtracker_channel`)**
- **Window PostMessage API**
- **Almacenamiento Local (`chrome.storage.local`)**
- Cualquier vacante guardada desde la extensión aparece inmediatamente en el tablero Kanban y en la vista de Optimización de CV sin recargar la página.

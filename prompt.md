# IDE utilizado Cursor

## 1. Prompt inicial en el chat de Cursor:

En base al proyecto, analiza la historia de usuario `@docs/requerimientos/hu-agregar_candidato.md` y genera tres tickets con su respectivo plan de implementación para cada una de las tareas técnicas requeridas. Adicionalmente, genera un archivo `.md` para cada ticket y guárdalos en la siguiente carpeta: `@docs/tareas`.

---

# Resultado del prompt inicial

# Ticket 1 - Frontend: Formulario "Agregar Candidato"

### Objetivo
Implementar la interfaz para alta de candidatos desde el dashboard, con UX clara y validaciones en cliente.

### Alcance
- Botón visible "Agregar candidato" en pantalla principal.
- Vista/formulario con campos:
  - nombre
  - apellido
  - email
  - teléfono
  - dirección
  - educación
  - experiencia laboral
- Carga de CV (`.pdf`, `.docx`).
- Validaciones de frontend:
  - campos requeridos
  - formato email
  - formatos de archivo permitidos
- Estados de UI:
  - loading durante envío
  - éxito ("candidato añadido")
  - error de negocio/técnico

### Plan de implementación
- Crear estructura base en `frontend/src`:
  - `components/CandidateForm.tsx`
  - `pages/CandidatesPage.tsx` (o integrar temporalmente en `App.tsx`)
  - `services/candidatesApi.ts`
- Implementar formulario controlado con `useState` o `react-hook-form`.
- Añadir validación local y mensajes inline por campo.
- Implementar selector de archivo y pre-validación (`accept=".pdf,.doc,.docx"`).
- Consumir endpoint backend de creación y mostrar feedback global.
- Ajustar estilos básicos para accesibilidad/responsive.

### Criterios de aceptación del ticket
- El usuario puede abrir el formulario desde la pantalla principal.
- No se permite enviar datos inválidos.
- Se muestra confirmación en éxito y mensaje claro en error.

## Ticket 2 - Backend: API y Persistencia de Candidato

### Objetivo
Desarrollar backend para recibir, validar y almacenar la información del candidato.

### Alcance
- Modelo Prisma `Candidate` (actualmente solo existe `User`).
- Endpoint `POST /candidates`.
- Parseo de JSON + multipart para CV.
- Validación de payload en servidor.
- Respuesta consistente para éxito y errores.

### Plan de implementación
- Extender `backend/prisma/schema.prisma` con `Candidate`:
  - campos de HU + metadatos (timestamps)
  - email con restricción única (recomendado)
- Ejecutar migración Prisma (`migrate dev`) y regenerar client.
- En `backend/src/index.ts`:
  - habilitar `express.json()`
  - registrar ruta `POST /candidates`
- Implementar validaciones backend (ej. `Zod`/`Joi` o validación manual):
  - requeridos
  - email válido
  - tipos y longitudes razonables
- Manejar subida de CV:
  - usar `multer` para multipart
  - guardar archivo en almacenamiento temporal o ruta de uploads
- Persistir candidato y metadatos del archivo (nombre, mime, path/url).
- Estandarizar manejo de errores (`400`, `409`, `500`) con mensajes útiles.

### Criterios de aceptación del ticket
- `POST /candidates` crea candidatos válidos.
- Rechaza payload inválido con mensajes claros.
- Guarda o registra correctamente el CV.

## Ticket 3 - Seguridad y Privacidad de Datos de Candidato

### Objetivo
Asegurar protección de datos personales y documentos adjuntos.

### Alcance
- Validaciones y límites de subida.
- Endurecimiento básico del API.
- Gestión segura de configuración sensible.
- Preparación para cumplimiento y trazabilidad.

### Plan de implementación
- Restringir uploads:
  - tamaño máximo (ej. 5 MB)
  - mimetypes permitidos (`application/pdf`, doc/docx)
  - nombre de archivo saneado
- Añadir middlewares de seguridad:
  - `helmet`
  - `cors` configurado por entorno
  - rate limit en endpoint de creación
- Proteger datos sensibles:
  - no loggear payload completo ni PII
  - sanitizar mensajes de error
- Configurar secretos en `.env` y documentar variables requeridas.
- Definir estrategia de almacenamiento de CV:
  - local seguro para dev
  - recomendación de object storage para prod
- Añadir pruebas mínimas de seguridad:
  - rechazo de tipos no permitidos
  - rechazo por tamaño excesivo
  - validación de inputs maliciosos simples

### Criterios de aceptación del ticket
- No se aceptan archivos o entradas fuera de política.
- Se minimiza exposición de PII en logs y respuestas.
- Endpoint protegido con controles básicos de abuso.

## Orden recomendado de ejecución
1. Ticket 2 (Backend) para tener contrato API estable.
2. Ticket 1 (Frontend) conectando al endpoint real.
3. Ticket 3 (Seguridad) como hardening antes de cierre.

#2. Segundo Promtp
Implementa los tickets@docs/tareas en el orden correspondiente


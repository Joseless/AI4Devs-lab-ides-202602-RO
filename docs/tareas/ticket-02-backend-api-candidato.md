# Ticket 02 - Backend: API y persistencia de candidato

## Resumen
Desarrollar en backend el flujo completo para recibir, validar y guardar la informacion del candidato, incluyendo el manejo del CV adjunto.

## Objetivo
Exponer una API estable para alta de candidatos y persistir los datos en PostgreSQL mediante Prisma.

## Alcance
- Modelo de datos `Candidate` en Prisma.
- Migracion de base de datos para crear tabla de candidatos.
- Endpoint `POST /candidates`.
- Validacion de payload y manejo de errores.
- Recepcion de archivo CV y guardado de metadatos asociados.

## Plan de implementacion
1. Extender `backend/prisma/schema.prisma` con modelo `Candidate` y campos de la HU.
2. Ejecutar migracion de Prisma y regenerar cliente:
   - `npx prisma migrate dev`
   - `npx prisma generate`
3. Configurar middlewares en Express:
   - `express.json()` para payload JSON
   - `multer` para `multipart/form-data` en CV
4. Implementar ruta `POST /candidates` en `backend/src/index.ts` o router modular.
5. Aplicar validaciones de servidor:
   - campos requeridos
   - email valido
   - consistencia de tipos
6. Persistir candidato y metadatos del archivo (nombre, tipo, ruta/url).
7. Estandarizar respuestas:
   - `201` creado
   - `400` validacion
   - `409` conflicto (ej. email duplicado)
   - `500` error interno
8. Agregar pruebas de endpoint (feliz + errores esperados).

## Criterios de aceptacion
- El endpoint crea candidatos validos y devuelve `201`.
- Datos invalidos se rechazan con `400` y mensaje claro.
- Conflictos de datos (si aplica) devuelven `409`.
- Se procesa correctamente el CV y se registran sus metadatos.

## Dependencias
- Debe completarse antes de integrar frontend final (`Ticket 01`).
- Aporta base para controles de seguridad de `Ticket 03`.

## Estimacion
- 1 a 2 dias de desarrollo + pruebas de API.

# Ticket 03 - Seguridad y privacidad de datos de candidato

## Resumen
Implementar controles de seguridad y privacidad para proteger datos personales y documentos adjuntos del proceso de alta de candidatos.

## Objetivo
Reducir riesgo de exposicion de PII y abuso del endpoint de creacion, cumpliendo practicas basicas de seguridad para entornos web.

## Alcance
- Restricciones estrictas para carga de CV.
- Hardening de API con middlewares de seguridad.
- Politica de logs sin datos sensibles.
- Configuracion por entorno para CORS y secretos.
- Pruebas de seguridad basicas del flujo.

## Plan de implementacion
1. Configurar restricciones de upload:
   - tamano maximo (ej. 5 MB)
   - mimetypes permitidos (`application/pdf`, doc/docx)
   - sanitizacion de nombre de archivo
2. Aplicar middlewares de seguridad en backend:
   - `helmet`
   - `cors` con origenes permitidos por variable de entorno
   - `express-rate-limit` para `POST /candidates`
3. Revisar manejo de errores para evitar fuga de informacion interna.
4. Revisar logs y eliminar impresiones de payload con PII o datos de archivos.
5. Documentar variables de entorno de seguridad y operacion.
6. Agregar pruebas de regresion de seguridad:
   - archivo no permitido
   - archivo demasiado grande
   - entradas mal formadas

## Criterios de aceptacion
- El endpoint rechaza archivos fuera de politica.
- Existe limite de tamano y control de tipo de archivo.
- La API no retorna trazas internas al cliente.
- Logs no exponen datos sensibles del candidato.
- Se valida por pruebas que los controles funcionan.

## Dependencias
- Se implementa sobre el flujo de API de `Ticket 02`.

## Estimacion
- 1 dia de implementacion + 0.5 dia de pruebas y ajuste.

# Ticket 01 - Frontend: Formulario de alta de candidato

## Resumen
Implementar en frontend la interfaz para agregar candidatos al ATS, incluyendo formulario, validaciones en cliente, carga de CV y mensajes de confirmacion/error.

## Objetivo
Permitir que un reclutador capture y envie la informacion de un candidato desde una pantalla visible y facil de usar.

## Alcance
- Boton o enlace visible "Agregar candidato" en la vista principal.
- Formulario con campos:
  - nombre
  - apellido
  - correo electronico
  - telefono
  - direccion
  - educacion
  - experiencia laboral
  - CV (PDF o DOCX)
- Validaciones de cliente:
  - campos obligatorios
  - formato de email
  - extension de archivo permitida
- Estados de UX:
  - carga al enviar
  - exito al guardar
  - error al fallar

## Plan de implementacion
1. Crear componentes y estructura base:
   - `frontend/src/components/CandidateForm.tsx`
   - `frontend/src/services/candidatesApi.ts`
   - integracion inicial en `frontend/src/App.tsx` o pagina dedicada
2. Implementar formulario controlado para capturar todos los campos de la HU.
3. Agregar validaciones de UI y mensajes por campo.
4. Implementar carga de archivo CV con `accept=".pdf,.doc,.docx"`.
5. Conectar formulario con endpoint `POST /candidates`.
6. Mostrar notificaciones de exito/error y bloquear doble envio.
7. Ajustar estilo para uso responsive y accesible.

## Criterios de aceptacion
- El boton para agregar candidato es visible en pantalla principal.
- El formulario no permite envio con datos invalidos.
- Se puede adjuntar CV en formato permitido.
- Se muestra confirmacion de alta al finalizar correctamente.
- Se muestran mensajes claros cuando falla la solicitud.

## Dependencias
- Requiere API de creacion implementada en `Ticket 02`.

## Estimacion
- 1 a 2 dias de desarrollo + pruebas manuales basicas.

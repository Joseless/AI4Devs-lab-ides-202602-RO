import React, { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import {
  CandidateFormValues,
  createCandidate,
} from '../services/candidatesApi';

type CandidateErrors = Partial<Record<keyof CandidateFormValues, string>>;

const emptyForm: CandidateFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  education: '',
  workExperience: '',
  cv: null,
};

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const getFieldLabel = (field: keyof CandidateFormValues): string => {
  const labels: Record<keyof CandidateFormValues, string> = {
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: 'Correo electrónico',
    phone: 'Teléfono',
    address: 'Dirección',
    education: 'Educación',
    workExperience: 'Experiencia laboral',
    cv: 'CV',
  };

  return labels[field];
};

const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const CandidateForm = (): JSX.Element => {
  const [formValues, setFormValues] = useState<CandidateFormValues>(emptyForm);
  const [errors, setErrors] = useState<CandidateErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const inputFields = useMemo(
    () =>
      [
        { name: 'firstName', type: 'text' },
        { name: 'lastName', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'tel' },
        { name: 'address', type: 'text' },
        { name: 'education', type: 'text' },
        { name: 'workExperience', type: 'text' },
      ] as const,
    [],
  );

  const validate = (values: CandidateFormValues): CandidateErrors => {
    const validationErrors: CandidateErrors = {};

    inputFields.forEach(({ name }) => {
      const fieldValue = values[name].trim();
      if (!fieldValue) {
        validationErrors[name] = `${getFieldLabel(name)} es obligatorio.`;
      }
    });

    if (values.email.trim() && !isValidEmail(values.email.trim())) {
      validationErrors.email = 'El correo electrónico no es válido.';
    }

    if (!values.cv) {
      validationErrors.cv = 'Debe adjuntar un CV en formato PDF o DOCX.';
    } else if (!allowedMimeTypes.has(values.cv.type)) {
      validationErrors.cv = 'Formato de CV no permitido. Use PDF o DOCX.';
    }

    return validationErrors;
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setFormValues((previous) => ({
      ...previous,
      [name]: value,
    }));
    setErrors((previous) => ({ ...previous, [name]: '' }));
  };

  const handleCvChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = event.target.files?.[0] || null;
    setFormValues((previous) => ({
      ...previous,
      cv: selectedFile,
    }));
    setErrors((previous) => ({ ...previous, cv: '' }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setMessageType('');

    const validationErrors = validate(formValues);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await createCandidate(formValues);
      setMessage(response.message);
      setMessageType('success');
      setErrors({});
      setFormValues(emptyForm);
    } catch (error: unknown) {
      const fallbackMessage = 'No se pudo guardar el candidato.';
      const errorMessage =
        error instanceof Error ? error.message : fallbackMessage;
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="candidate-section">
      <h1>Dashboard de Reclutamiento</h1>
      <button className="primary-button" type="button">
        Agregar candidato
      </button>

      <form className="candidate-form" onSubmit={handleSubmit} noValidate>
        <h2>Nuevo candidato</h2>

        {inputFields.map((field) => (
          <label key={field.name} className="form-field">
            <span>{getFieldLabel(field.name)}</span>
            <input
              name={field.name}
              type={field.type}
              value={formValues[field.name]}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
            {errors[field.name] ? (
              <small className="field-error">{errors[field.name]}</small>
            ) : null}
          </label>
        ))}

        <label className="form-field">
          <span>CV (PDF o DOCX)</span>
          <input
            name="cv"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleCvChange}
            disabled={isSubmitting}
          />
          {errors.cv ? <small className="field-error">{errors.cv}</small> : null}
        </label>

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar candidato'}
        </button>

        {messageType ? (
          <p
            className={messageType === 'success' ? 'feedback-success' : 'feedback-error'}
            role="status"
          >
            {message}
          </p>
        ) : null}
      </form>
    </section>
  );
};

export type CandidateFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  education: string;
  workExperience: string;
  cv: File | null;
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3010';

export const createCandidate = async (
  candidate: CandidateFormValues,
): Promise<{ message: string }> => {
  const formData = new FormData();
  formData.append('firstName', candidate.firstName.trim());
  formData.append('lastName', candidate.lastName.trim());
  formData.append('email', candidate.email.trim());
  formData.append('phone', candidate.phone.trim());
  formData.append('address', candidate.address.trim());
  formData.append('education', candidate.education.trim());
  formData.append('workExperience', candidate.workExperience.trim());

  if (candidate.cv) {
    formData.append('cv', candidate.cv);
  }

  const response = await fetch(`${API_BASE_URL}/candidates`, {
    method: 'POST',
    body: formData,
  });

  const data = (await response.json()) as { message?: string };

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo guardar el candidato.');
  }

  return { message: data.message || 'Candidato añadido exitosamente.' };
};

export interface FormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
  /** Valeurs saisies, renvoyées pour que React ne vide pas le formulaire après une erreur. */
  values?: Record<string, string>;
}

export const initialFormState: FormState = {};

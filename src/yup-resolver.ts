import type { FormErrors } from '@mantine/form';
import { ObjectSchema, ValidationError } from 'yup';

export function yupResolver(schema: ObjectSchema<any>) {
  return (values: Record<string, unknown>): FormErrors => {
    try {
      schema.validateSync(values, { abortEarly: false });
      return {};
    } catch (yupError) {
      const results: FormErrors = {};

      if (yupError instanceof ValidationError) {
        yupError.inner.forEach((error) => {
          results[error.path.replaceAll('[', '.').replaceAll(']', '')] = error.message;
        });
      }

      return results;
    }
  };
}

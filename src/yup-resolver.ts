import type { FormErrors } from '@mantine/form';
import { ObjectSchema, ValidationError } from 'yup';

export interface YupResolverOptions {
  mode?: 'sync' | 'async';
}

function getValidationErrors(yupError: ValidationError): FormErrors {
  const results: FormErrors = {};

  yupError.inner.forEach((error) => {
    if (!error.path) {
      return;
    }

    results[error.path.replaceAll('[', '.').replaceAll(']', '')] = error.message;
  });

  return results;
}

export function yupResolver(
  schema: ObjectSchema<any>,
  options: YupResolverOptions & { mode: 'async' }
): (values: Record<string, unknown>) => Promise<FormErrors>;

export function yupResolver(
  schema: ObjectSchema<any>,
  options?: YupResolverOptions
): (values: Record<string, unknown>) => FormErrors;

export function yupResolver(schema: ObjectSchema<any>, options?: YupResolverOptions) {
  return (values: Record<string, unknown>) => {
    if (options?.mode === 'async') {
      return schema
        .validate(values, { abortEarly: false })
        .then(() => ({}))
        .catch((yupError: unknown) => {
          if (yupError instanceof ValidationError) {
            return getValidationErrors(yupError);
          }

          throw yupError;
        });
    }

    try {
      schema.validateSync(values, { abortEarly: false });
      return {};
    } catch (yupError) {
      if (yupError instanceof ValidationError) {
        return getValidationErrors(yupError);
      }

      throw yupError;
    }
  };
}

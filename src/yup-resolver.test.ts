import * as yup from 'yup';
import { act, renderHook } from '@testing-library/react';
import { useForm } from '@mantine/form';
import { yupResolver } from './yup-resolver';

const schema = yup.object().shape({
  name: yup.string().min(2, 'Name should have at least 2 letters'),
  email: yup.string().required('Invalid email').email('Invalid email'),
  age: yup.number().min(18, 'You must be at least 18 to create an account'),
});

it('validates basic fields with given yup schema', () => {
  const hook = renderHook(() =>
    useForm({
      initialValues: {
        name: '',
        email: '',
        age: 16,
      },
      validate: yupResolver(schema),
    })
  );

  expect(hook.result.current.errors).toStrictEqual({});
  act(() => hook.result.current.validate());

  expect(hook.result.current.errors).toStrictEqual({
    name: 'Name should have at least 2 letters',
    email: 'Invalid email',
    age: 'You must be at least 18 to create an account',
  });

  act(() => hook.result.current.setValues({ name: 'John', email: 'john@email.com', age: 16 }));
  act(() => hook.result.current.validate());

  expect(hook.result.current.errors).toStrictEqual({
    age: 'You must be at least 18 to create an account',
  });
});

const nestedSchema = yup.object().shape({
  nested: yup.object().shape({
    field: yup.string().min(2, 'Field should have at least 2 letters'),
  }),
});

it('validates nested fields with given yup schema', () => {
  const hook = renderHook(() =>
    useForm({
      initialValues: {
        nested: {
          field: '',
        },
      },
      validate: yupResolver(nestedSchema),
    })
  );

  expect(hook.result.current.errors).toStrictEqual({});
  act(() => hook.result.current.validate());

  expect(hook.result.current.errors).toStrictEqual({
    'nested.field': 'Field should have at least 2 letters',
  });

  act(() => hook.result.current.setValues({ nested: { field: 'John' } }));
  act(() => hook.result.current.validate());

  expect(hook.result.current.errors).toStrictEqual({});
});

const listSchema = yup.object().shape({
  list: yup.array().of(
    yup.object().shape({
      name: yup.string().min(2, 'Name should have at least 2 letters'),
    })
  ),
});

it('validates list fields with given yup schema', () => {
  const hook = renderHook(() =>
    useForm({
      initialValues: {
        list: [{ name: '' }],
      },
      validate: yupResolver(listSchema),
    })
  );

  expect(hook.result.current.errors).toStrictEqual({});
  act(() => hook.result.current.validate());

  expect(hook.result.current.errors).toStrictEqual({
    'list.0.name': 'Name should have at least 2 letters',
  });

  act(() => hook.result.current.setValues({ list: [{ name: 'John' }] }));
  act(() => hook.result.current.validate());

  expect(hook.result.current.errors).toStrictEqual({});
});

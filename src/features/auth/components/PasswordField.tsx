import VisibilityOffRounded from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRounded from '@mui/icons-material/VisibilityRounded';
import {
  IconButton,
  InputAdornment,
  TextField,
  type TextFieldProps,
} from '@mui/material';
import { useState } from 'react';
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';

interface PasswordFieldProps<Values extends FieldValues> {
  readonly autoComplete: string;
  readonly control: Control<Values>;
  readonly disabled?: boolean;
  readonly label: string;
  readonly name: Path<Values>;
  readonly textFieldProps?: Omit<
    TextFieldProps,
    'autoComplete' | 'disabled' | 'label' | 'name' | 'type'
  >;
}

export const PasswordField = <Values extends FieldValues>({
  autoComplete,
  control,
  disabled,
  label,
  name,
  textFieldProps,
}: PasswordFieldProps<Values>) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...textFieldProps}
          {...field}
          fullWidth
          autoComplete={autoComplete}
          disabled={disabled}
          error={fieldState.invalid}
          helperText={fieldState.error?.message ?? textFieldProps?.helperText}
          label={label}
          type={isVisible ? 'text' : 'password'}
          slotProps={{
            ...textFieldProps?.slotProps,
            input: {
              ...textFieldProps?.slotProps?.input,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    type="button"
                    aria-label={`${isVisible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
                    onClick={() => setIsVisible((current) => !current)}
                  >
                    {isVisible ? (
                      <VisibilityOffRounded />
                    ) : (
                      <VisibilityRounded />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      )}
    />
  );
};

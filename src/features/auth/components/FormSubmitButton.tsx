import { CircularProgress, Button, type ButtonProps } from '@mui/material';

interface FormSubmitButtonProps extends Omit<ButtonProps, 'type'> {
  readonly pendingLabel: string;
  readonly isPending: boolean;
}

export const FormSubmitButton = ({
  children,
  isPending,
  pendingLabel,
  ...buttonProps
}: FormSubmitButtonProps) => (
  <Button
    {...buttonProps}
    fullWidth
    disabled={isPending || buttonProps.disabled}
    type="submit"
    variant={buttonProps.variant ?? 'contained'}
  >
    {isPending ? (
      <>
        <CircularProgress
          size={18}
          color="inherit"
          aria-label={pendingLabel}
          sx={{ mr: 1 }}
        />
        {pendingLabel}
      </>
    ) : (
      children
    )}
  </Button>
);

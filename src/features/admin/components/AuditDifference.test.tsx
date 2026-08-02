import { render, screen } from '@testing-library/react';

import { AuditDifference } from '@/features/admin/components/AuditDifference';

describe('AuditDifference', () => {
  it('renders changed fields safely and suppresses sensitive keys', () => {
    render(
      <AuditDifference
        before={{ status: 'PREGAME', token: 'old' }}
        after={{ status: '<FINAL>', token: 'new' }}
      />,
    );
    expect(screen.getByText('status')).toBeInTheDocument();
    expect(screen.getByText('<FINAL>')).toBeInTheDocument();
    expect(screen.queryByText('token')).not.toBeInTheDocument();
    expect(screen.queryByText('new')).not.toBeInTheDocument();
  });
});

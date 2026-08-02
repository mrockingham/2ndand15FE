import { useNavigate } from 'react-router-dom';

import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { GameForm } from '@/features/admin/components/GameForm';
import {
  useCreateAdminGameMutation,
  useRefreshRoleOnForbidden,
} from '@/features/admin/queries';
import type {
  ManualGameCreateInput,
  ManualGameInput,
} from '@/features/admin/types';

export const AdminGameCreatePage = () => {
  const navigate = useNavigate();
  const mutation = useCreateAdminGameMutation();
  useRefreshRoleOnForbidden(mutation.error);
  return (
    <>
      <AdminPageHeader
        title="Create manual game"
        description="Enter one schedule record with explicit kickoff timezone and source provenance."
      />
      <GameForm
        submitLabel="Create game"
        error={mutation.error}
        isSubmitting={mutation.isPending}
        onSubmit={async (input: ManualGameCreateInput | ManualGameInput) => {
          const game = await mutation.mutateAsync(
            input as ManualGameCreateInput,
          );
          await navigate(`/admin/games/${game.id}`, { replace: true });
        }}
      />
    </>
  );
};

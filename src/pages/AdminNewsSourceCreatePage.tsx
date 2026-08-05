import { Navigate, useNavigate } from 'react-router-dom';

import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { SourceForm } from '@/features/newsInbox/components/SourceForm';
import { useCreateNewsSourceMutation } from '@/features/newsInbox/queries';
import type { NewsSourceInput } from '@/features/newsInbox/types';
import { useCurrentUserQuery } from '@/features/users/queries';

export const AdminNewsSourceCreatePage = () => {
  const isAdmin = useCurrentUserQuery().data?.role === 'ADMIN';
  const mutation = useCreateNewsSourceMutation();
  const navigate = useNavigate();
  if (!isAdmin) return <Navigate to="/admin/news-sources" replace />;
  return (
    <>
      <AdminPageHeader
        title="New news source"
        description="Register an explicit publisher and feed. New feeds should be tested before ingestion."
      />
      <SourceForm
        error={mutation.error}
        isSubmitting={mutation.isPending}
        onSubmit={async (input) => {
          const source = await mutation.mutateAsync(input as NewsSourceInput);
          await navigate(`/admin/news-sources/${source.id}`, { replace: true });
        }}
      />
    </>
  );
};

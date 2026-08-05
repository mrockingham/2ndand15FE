import { useNavigate } from 'react-router-dom';

import {
  AdminError,
  AdminLoading,
} from '@/features/admin/components/AdminRequestState';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { ManualCandidateForm } from '@/features/newsInbox/components/ManualCandidateForm';
import {
  useManualCandidateMutation,
  useNewsSourcesQuery,
} from '@/features/newsInbox/queries';

export const AdminNewsCandidateManualPage = () => {
  const sourcesQuery = useNewsSourcesQuery({ limit: 100 });
  const mutation = useManualCandidateMutation();
  const navigate = useNavigate();
  if (sourcesQuery.isPending)
    return <AdminLoading label="Loading source choices" />;
  if (sourcesQuery.isError)
    return (
      <AdminError
        error={sourcesQuery.error}
        onRetry={() => void sourcesQuery.refetch()}
      />
    );
  const sources =
    sourcesQuery.data?.pages.flatMap((page) => page.sources) ?? [];
  return (
    <>
      <AdminPageHeader
        title="Add manual candidate"
        description="Capture a publisher URL and metadata for private editorial review."
      />
      <ManualCandidateForm
        sources={sources}
        error={mutation.error}
        isSubmitting={mutation.isPending}
        onSubmit={async (input) => {
          const candidate = await mutation.mutateAsync(input);
          await navigate(`/admin/news-candidates/${candidate.id}`, {
            replace: true,
          });
        }}
      />
    </>
  );
};

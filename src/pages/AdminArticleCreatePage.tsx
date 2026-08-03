import { useNavigate } from 'react-router-dom';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { toEditorialFields } from '@/features/articles/articleFormMapping';
import { ArticleForm } from '@/features/articles/components/ArticleForm';
import { useCreateArticleMutation } from '@/features/articles/queries';
import type { ArticleFormValues } from '@/features/articles/schemas';

export const AdminArticleCreatePage = () => {
  const mutation = useCreateArticleMutation();
  const navigate = useNavigate();
  return (
    <>
      <AdminPageHeader
        title="New article"
        description="New articles begin as drafts and are never public until an explicit publish or schedule action."
      />
      <ArticleForm
        error={mutation.error}
        isSubmitting={mutation.isPending}
        onSubmit={async (values: ArticleFormValues) => {
          const article = await mutation.mutateAsync({
            ...toEditorialFields(values),
            teamIds: values.teamIds,
            changeSummary: values.changeSummary.trim() || null,
          });
          await navigate(`/admin/articles/${article.id}`, { replace: true });
        }}
      />
    </>
  );
};

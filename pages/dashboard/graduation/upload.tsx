import React from 'react';
import { useRouter } from 'next/router';
import { GradUploadPanel } from '@components/graduation/upload-panel';

export default function GraduationParsePage() {
  const router = useRouter();
  const redirectTo =
    typeof router.query.redirectTo === 'string' ? router.query.redirectTo : '/dashboard/course/my';

  return <GradUploadPanel title="졸업요건 엑셀 업로드" redirectTo={redirectTo} />;
}

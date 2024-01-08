import React from 'react';

import { Container, Space, Title } from '@mantine/core';

import { useUser } from '@clerk/nextjs';
import { useMemberStatus } from '@hooks/auth';
import { useGraduation } from '@hooks/graduation';
import { useScrollIntoView } from '@mantine/hooks';

import Loading from '@components/loading';
import GradRecommend from '@components/grad-recommend';
import GradOverallStatus from '@components/grad-overall-status';
import DashboardUnsignedPage from '@components/dashboard-unsigned-page';
import GradSpecificDomainStatus from '@components/grad-specific-domain-status';
import GraduationLoadingSkeleton from '@components/graduation-loading-skeleton';
import DashboardFileUploadEncouragement from '@components/dashboard-file-upload-encouragement';

export default function Index() {
  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
    offset: 60,
  });

  const { isLoaded: isAuthStateLoaded, isSignedIn } = useUser();
  const { data: status, isLoading: isMemberStatusLoading } = useMemberStatus();
  const { isLoading, status: gradStatus, isInitialLoading, isFetching } = useGraduation();

  if (!isAuthStateLoaded || isMemberStatusLoading) {
    return <Loading content="잠시만 기다려주세요..." />;
  }

  if (isAuthStateLoaded && !isSignedIn) {
    return <DashboardUnsignedPage />;
  }

  if (isAuthStateLoaded && isSignedIn && status?.isNewUser) {
    return <DashboardFileUploadEncouragement />;
  }

  if (!status?.isNewUser && (isLoading || isInitialLoading || isFetching)) {
    return <GraduationLoadingSkeleton />;
  }

  return (
    <Container size="lg">
      <Title order={3} mb="lg" mt={40}>
        종합적인 현황 📋
      </Title>
      <Space h={16} />
      <GradOverallStatus
        scrollIntoView={scrollIntoView}
        totalCredits={gradStatus.totalCredits}
        totalPercentage={gradStatus.totalPercentage}
        overallStatus={gradStatus.domains}
        minDomain={gradStatus.minDomain}
        minDomainPercentage={gradStatus.minDomainPercentage}
        feedbackNumbers={gradStatus.numbers}
      />
      <Space h={40} />
      <Title order={3} mb="lg" mt={40}>
        세부적인 현황 📑
      </Title>
      <Space h={16} />
      <GradSpecificDomainStatus specificDomainStatusArr={gradStatus.categoriesArr} />
      <Space h={16} />
      <Title order={3} mt={40} mb="lg" ref={targetRef}>
        영역별 피드백 모음
      </Title>
      <Space h={16} />
      <GradRecommend specificDomainStatusArr={gradStatus.categoriesArr} />
      <Space h={80} />
    </Container>
  );
}

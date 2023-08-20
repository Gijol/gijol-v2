import { Container, Space, createStyles, Center, Text } from '@mantine/core';
import { useScrollIntoView } from '@mantine/hooks';
import GradSpecificDomainStatus from '../../components/grad-specific-domain-status';
import GradOverallStatus from '../../components/grad-overall-status';
import GradRecommend from '../../components/grad-recommend';
import { useGraduation } from '../../lib/hooks/graduation';
import Loading from '../../components/loading';
import React from 'react';
import { useUser } from '@clerk/nextjs';
import GraduationLoadingSkeleton from '../../components/graduation-loading-skeleton';
import DashboardFileUploadEncouragement from '../../components/dashboard-file-upload-encouragement';
import { useMemberStatus } from '../../lib/hooks/auth';
import DashboardUnsignedPage from '../../components/dashboard-unsigned-page';

export default function Graduation() {
  const { classes } = useStyles();
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
    <Container>
      <h1>졸업요건 현황</h1>
      <Space h={16} />
      <GradOverallStatus
        classes={classes}
        scrollIntoView={scrollIntoView}
        totalCredits={gradStatus.totalCredits}
        totalPercentage={gradStatus.totalPercentage}
        overallStatus={gradStatus.domains}
        minDomain={gradStatus.minDomain}
        minDomainPercentage={gradStatus.minDomainPercentage}
        feedbackNumbers={gradStatus.numbers}
      />
      <Space h={40} />
      <h1>영역별 세부 현황</h1>
      <Space h={16} />
      <GradSpecificDomainStatus
        classes={classes}
        specificDomainStatusArr={gradStatus.categoriesArr}
      />
      <Space h={16} />
      <h1 ref={targetRef}>영역별 피드백 모음</h1>
      <Space h={16} />
      <GradRecommend specificDomainStatusArr={gradStatus.categoriesArr} />
      <Space h={80} />
    </Container>
  );
}

const useStyles = createStyles((theme) => ({
  tableHead: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
  },
  background: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark : theme.white,
    borderBottomRightRadius: '0.5rem',
    borderBottomLeftRadius: '0.5rem',
  },
}));

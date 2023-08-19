import { Container, Space, createStyles } from '@mantine/core';
import { useScrollIntoView } from '@mantine/hooks';
import GradSpecificDomainStatus from '../../components/grad-specific-domain-status';
import GradOverallStatus from '../../components/grad-overall-status';
import GradRecommend from '../../components/grad-recommend';
import { useGraduation } from '../../lib/hooks/graduation';
import router from 'next/router';
import Loading from '../../components/loading';
import { useMemberStatus } from '../../lib/hooks/auth';
import DashboardFileUploadEncouragement from '../../components/dashboard-file-upload-encouragement';
import React from 'react';

export default function Graduation() {
  const { classes } = useStyles();

  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
    offset: 60,
  });
  const { isMember, error: notAuthenticated } = useMemberStatus();
  const { isLoading, isError, error, status, isInitialLoading, isFetching } = useGraduation();

  if (notAuthenticated) {
    // @ts-ignore
    router.push(`/dashboard/error?status=${error.message}`);
  }

  if (isLoading || isFetching || isInitialLoading) {
    return <Loading content="졸업요건 데이터 로딩중..." />;
  } else {
    if (!isMember) {
      return <DashboardFileUploadEncouragement />;
    }

    return (
      <Container>
        <h1>졸업요건 현황</h1>
        <Space h={16} />
        <GradOverallStatus
          classes={classes}
          scrollIntoView={scrollIntoView}
          totalCredits={status.totalCredits}
          totalPercentage={status.totalPercentage}
          overallStatus={status.domains}
          minDomain={status.minDomain}
          minDomainPercentage={status.minDomainPercentage}
          feedbackNumbers={status.numbers}
        />
        <Space h={40} />
        <h1>영역별 세부 현황</h1>
        <Space h={16} />
        <GradSpecificDomainStatus
          classes={classes}
          specificDomainStatusArr={status.categoriesArr}
        />
        <Space h={16} />
        <h1 ref={targetRef}>영역별 피드백 모음</h1>
        <Space h={16} />
        <GradRecommend specificDomainStatusArr={status.categoriesArr} />
        <Space h={80} />
      </Container>
    );
  }
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

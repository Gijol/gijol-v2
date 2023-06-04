import { Container, Space, createStyles } from '@mantine/core';
import { useScrollIntoView } from '@mantine/hooks';
import GradSpecificDomainStatus from '../../components/GradSpecificDomainStatus';
import GradOverallStatus from '../../components/GradOverallStatus';
import GradRecommend from '../../components/GradRecommend';
import { useGraduation } from '../../lib/hooks/graduation';
import router from 'next/router';
import React from 'react';
import Loading from '../../components/Loading';

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

export default function Graduation() {
  const { classes } = useStyles();

  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
    offset: 60,
  });
  const { isLoading, isError, error, status } = useGraduation();
  if (isLoading) {
    return <Loading content="졸업요건 데이터 로딩중..." />;
  }
  if (isError) {
    // @ts-ignore
    router.push(`/dashboard/error?status=${error.message}`);
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
      <GradSpecificDomainStatus classes={classes} specificDomainStatusArr={status.categoriesArr} />
      <Space h={16} />
      <h1 ref={targetRef}>영역별 피드백 모음</h1>
      <Space h={16} />
      <GradRecommend specificDomainStatusArr={status.categoriesArr} />
      <Space h={80} />
    </Container>
  );
}

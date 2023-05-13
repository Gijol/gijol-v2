import { Container, Space, createStyles } from '@mantine/core';

import { useScrollIntoView } from '@mantine/hooks';
import GradSpecificDomainStatus from '../../components/GradSpecificDomainStatus';
import GradOverallStatus from '../../components/GradOverallStatus';
import GradRecommend from '../../components/GradRecommend';
import useGraduation from '../../lib/hooks/graduation';
import { useUserStatus } from '../../lib/hooks/auth';
import router from 'next/router';

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
  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
    offset: 60,
  });
  const { classes } = useStyles();
  const isMember = useUserStatus();
  const status = useGraduation();
  if (!isMember) {
    router.push('/login/signup');
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

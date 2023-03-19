import { useRecoilState, useRecoilValue } from 'recoil';
import { gradStatus } from '../../lib/atoms/gradStatus';
import { Container, Progress, Space, Badge, createStyles } from '@mantine/core';

import { useScrollIntoView } from '@mantine/hooks';
import GradSpecificDomainStatus from '../../components/GradSpecificDomainStatus';
import GradOverallStatus from '../../components/GradOverallStatus';
import GradRecommend from '../../components/GradRecommend';
import { getFeedbackNumbers, getOverallStatus } from '../../lib/utils/grad';
import { GradStatusType } from '../../lib/types/grad';
import { useEffect } from 'react';
import { GetServerSideProps } from 'next';

const useStyles = createStyles((theme) => ({
  tableHead: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
  },
  background: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark : theme.white,
  },
}));

export default function Result() {
  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
    offset: 60,
  });
  const { classes } = useStyles();
  const status = useRecoilValue(gradStatus);

  const categoriesArr = [
    { domain: '언어와 기초', status: status?.graduationCategory.languageBasic },
    { domain: '기초과학', status: status?.graduationCategory.scienceBasic },
    { domain: '전공', status: status?.graduationCategory.major },
    { domain: '부전공', status: status?.graduationCategory.minor },
    { domain: '인문사회', status: status?.graduationCategory.humanities },
    { domain: '연구 및 기타', status: status?.graduationCategory.etcMandatory },
    { domain: '자유학점', status: status?.graduationCategory.otherUncheckedClass },
  ];

  const {
    totalCredits,
    totalPercentage,
    minDomain,
    minDomainPercentage,
    overall: domains,
  } = getOverallStatus(status as GradStatusType);

  const numbers = getFeedbackNumbers(status as GradStatusType);

  useEffect(() => {
    console.log(status);
  }, [status]);

  console.log(status);
  return (
    <Container>
      <h1>졸업요건 현황</h1>
      <Space h={16} />
      <GradOverallStatus
        classes={classes}
        scrollIntoView={scrollIntoView}
        totalCredits={totalCredits}
        totalPercentage={totalPercentage}
        overallStatus={domains}
        minDomain={minDomain}
        minDomainPercentage={minDomainPercentage}
        feedbackNumbers={numbers}
      />
      <Space h={40} />
      <h1>영역별 세부 현황</h1>
      <Space h={16} />
      <GradSpecificDomainStatus classes={classes} specificDomainStatusArr={categoriesArr} />
      <Space h={16} />
      <h1 ref={targetRef}>영역별 피드백 모음</h1>
      <Space h={16} />
      <GradRecommend specificDomainStatusArr={categoriesArr} />
      <Space h={80} />
    </Container>
  );
}

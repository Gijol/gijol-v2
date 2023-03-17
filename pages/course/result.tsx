import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { gradStatus } from '../../lib/atoms/gradStatus';
import {
  Accordion,
  Container,
  Group,
  Paper,
  Progress,
  Space,
  Text,
  Badge,
  RingProgress,
  Table,
  ScrollArea,
  createStyles,
  Alert,
  Grid,
  ThemeIcon,
  Button,
  Tabs,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconCircleCheck,
  IconPresentationAnalytics,
  IconReportAnalytics,
  IconBolt,
} from '@tabler/icons-react';
import { useScrollIntoView } from '@mantine/hooks';
import GradSpecificDomainStatus from '../../components/GradSpecificDomainStatus';
import GradOverallStatus from '../../components/GradOverallStatus';
import GradRecommend from '../../components/GradRecommend';

const useStyles = createStyles((theme) => ({
  tableHead: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
  },
  background: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark : theme.white,
  },
}));

export default function Result() {
  const status = useRecoilValue(gradStatus);
  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
    offset: 60,
  });

  const { classes } = useStyles();

  useEffect(() => {
    console.log(status);
  }, [status]);

  const domains = [
    { percentage: 80, satisfied: false, name: '언어와 기초' },
    { percentage: 100, satisfied: true, name: '기초과학' },
    { percentage: 60, satisfied: false, name: '인문사회' },
    { percentage: 60, satisfied: false, name: '전공' },
    { percentage: 80, satisfied: false, name: '부전공' },
    { percentage: 40, satisfied: false, name: '연구 및 기타' },
    { percentage: 80, satisfied: false, name: '자유학점' },
  ];

  const elements = [
    { position: 6, mass: 12.011, symbol: 'C', name: 'Carbon' },
    { position: 7, mass: 14.007, symbol: 'N', name: 'Nitrogen' },
    { position: 39, mass: 88.906, symbol: 'Y', name: 'Yttrium' },
    { position: 56, mass: 137.33, symbol: 'Ba', name: 'Barium' },
    { position: 58, mass: 140.12, symbol: 'Ce', name: 'Cerium' },
    { position: 6, mass: 12.011, symbol: 'C', name: 'Carbon' },
    { position: 7, mass: 14.007, symbol: 'N', name: 'Nitrogen' },
    { position: 39, mass: 88.906, symbol: 'Y', name: 'Yttrium' },
    { position: 56, mass: 137.33, symbol: 'Ba', name: 'Barium' },
    { position: 58, mass: 140.12, symbol: 'Ce', name: 'Cerium' },
    { position: 6, mass: 12.011, symbol: 'C', name: 'Carbon' },
    { position: 7, mass: 14.007, symbol: 'N', name: 'Nitrogen' },
    { position: 39, mass: 88.906, symbol: 'Y', name: 'Yttrium' },
    { position: 56, mass: 137.33, symbol: 'Ba', name: 'Barium' },
    { position: 58, mass: 140.12, symbol: 'Ce', name: 'Cerium' },
  ];

  const rows = elements.map((element, index) => (
    <tr key={index}>
      <td>{element.position}</td>
      <td>{element.name}</td>
      <td>{element.symbol}</td>
      <td>{element.mass}</td>
    </tr>
  ));

  const courseRows = domains.map((element, index) => (
    <tr key={index}>
      <td>{element.name}</td>
      <td>
        <Progress value={element.percentage} label={`${element.percentage}%`} size="xl" />
      </td>
      <td>
        <Badge color={element.satisfied ? 'green' : 'pink'}>
          {element.satisfied ? 'true' : 'false'}
        </Badge>
      </td>
    </tr>
  ));

  return (
    <Container>
      <h1>졸업요건 현황</h1>
      <GradOverallStatus
        classes={classes}
        scrollIntoView={scrollIntoView}
        courseRows={courseRows}
      />
      <Space h={40} />
      <h1>영역별 세부 현황</h1>
      <Space h={16} />
      <GradSpecificDomainStatus classes={classes} rows={rows} />
      <h1 ref={targetRef}>Gijol의 추천 목록</h1>
      <GradRecommend />
      <Space h={80} />
    </Container>
  );
}

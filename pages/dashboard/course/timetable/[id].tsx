import { useRouter } from 'next/router';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Container,
  createStyles,
  Grid,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { DayHeaderContentArg } from '@fullcalendar/core';
import TimePicker from '@components/timetable-timepicker';

import dayjs from 'dayjs';
import { useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { Controller, useForm } from 'react-hook-form';

type CourseEventType = {
  name: string;
  day_of_week: DayOfWeek | DayOfWeek[] | any;
  start_time: string;
  end_time: string;
  description?: string;
};

type DayOfWeek = '월요일' | '화요일' | '수요일' | '목요일' | '금요일';

const getDayOfWeekIdx = (dayOfWeek: DayOfWeek | DayOfWeek[]) => {
  const days = ['', '월요일', '화요일', '수요일', '목요일', '금요일', ''];
  if (Array.isArray(dayOfWeek)) return dayOfWeek.map((day) => days.indexOf(day));
  return days.indexOf(dayOfWeek);
};

const defaultEvents = [
  { title: 'event 1', start: '2024-01-10 10:00:00', end: '2024-01-10 11:30:00' },
];

export default function Page() {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const [opened, { open, close }] = useDisclosure(false);
  const [events, setEvents] = useState(defaultEvents);
  const { handleSubmit, control } = useForm<CourseEventType>({
    defaultValues: {
      name: '',
      day_of_week: ['월요일', '수요일'],
      start_time: '09:00',
      end_time: '10:30',
      description: '',
    },
  });

  // console.log(dayjs().day(2).format('YYYY-MM-DD'));

  const onSubmit = (data: CourseEventType) => {
    const { name, day_of_week, start_time, end_time, description } = data;
    const idx = getDayOfWeekIdx(day_of_week);
    if (Array.isArray(idx)) {
      idx.forEach((day) => {
        const start_str = dayjs().day(day).format('YYYY-MM-DD') + ' ' + `${start_time}:00`;
        const end_str = dayjs().day(day).format('YYYY-MM-DD') + ' ' + `${end_time}:00`;
        const newEvent = { title: name, start: start_str, end: end_str };
        console.log('newEvent : ', newEvent);
        setEvents((events) => [...events, newEvent]);
      });
    } else {
      const start_str = dayjs().day(idx).format('YYYY-MM-DD') + ' ' + `${start_time}:00`;
      const end_str = dayjs().day(idx).format('YYYY-MM-DD') + ' ' + `${end_time}:00`;
      const newEvent = { title: name, start: start_str, end: end_str };
      console.log('newEvent : ', newEvent);
      setEvents([...events, newEvent]);
    }
    console.log(data);
    close();
  };

  console.log('events : ', events);

  return (
    <Container size="lg">
      <Title order={3} mt={40} mb="lg">
        시간표 이름
      </Title>
      <Group position="right">
        <Button
          size="xs"
          mr="lg"
          variant="outline"
          onClick={open}
          leftIcon={<IconPlus size="1rem" />}
        >
          이벤트 추가하기
        </Button>
      </Group>
      <Modal
        opened={opened}
        onClose={close}
        title="이벤트 추가하기"
        centered
        styles={{ title: { fontSize: 16, fontWeight: 600 } }}
        overlayProps={{
          color: theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[2],
          opacity: 0.55,
          blur: 3,
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing="md">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextInput
                  label="강의 명"
                  placeholder="강의 명을 입력해주세요"
                  withAsterisk
                  styles={{ label: { marginBottom: 8, fontWeight: 600 } }}
                  {...field}
                />
              )}
            />

            <Box>
              <Controller
                name="day_of_week"
                control={control}
                render={({ field }) => (
                  <Checkbox.Group
                    label="강의 날짜"
                    withAsterisk
                    styles={{ label: { fontWeight: 600 } }}
                    {...field}
                  >
                    <Group mt={8}>
                      <Checkbox value="월요일" label="월요일" />
                      <Checkbox value="화요일" label="화요일" />
                      <Checkbox value="수요일" label="수요일" />
                      <Checkbox value="목요일" label="목요일" />
                      <Checkbox value="금요일" label="금요일" />
                    </Group>
                  </Checkbox.Group>
                )}
              />
            </Box>
            <Box>
              <Group grow>
                <Controller
                  name="start_time"
                  control={control}
                  render={({ field }) => <TimePicker label="시작 시간" field={field} />}
                />
                <Controller
                  name="end_time"
                  control={control}
                  render={({ field }) => <TimePicker label="종료 시간" field={field} />}
                />
              </Group>
            </Box>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  label="이벤트 설명"
                  placeholder="50자 이내로 작성해주세요"
                  maxLength={50}
                  styles={{ label: { marginBottom: 8, fontWeight: 600 } }}
                  {...field}
                />
              )}
            />

            <Group position="right">
              <Group>
                <Button variant="light" color="red" onClick={close}>
                  등록 취소
                </Button>
                <Button type="submit">강의 등록하기</Button>
              </Group>
            </Group>
          </Stack>
        </form>
      </Modal>
      <Grid my="xl">
        <Grid.Col span="auto">
          <Paper withBorder radius="lg" p="xs" className={classes.calendar_wrapper}>
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
              initialView="timeGridWeek"
              headerToolbar={false}
              allDaySlot={false}
              slotMinTime={'08:00:00'}
              slotMaxTime={'20:00:00'}
              slotDuration={'00:30:00'}
              hiddenDays={[0, 6]}
              dayHeaderContent={formatDateHeader}
              contentHeight={600}
              events={events}
            />
          </Paper>
        </Grid.Col>
        <Grid.Col span={3}>
          <Paper withBorder radius="lg" h="100%" p="xs">
            hi
          </Paper>
        </Grid.Col>
      </Grid>
      <Box mt={40} />
    </Container>
  );
}

const formatDateHeader = (date: DayHeaderContentArg) => {
  const day = date.date.getDay();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[day];
};

const useStyles = createStyles((theme) => ({
  calendar_wrapper: {
    padding: 20,
    '& .fc-timegrid-slot': {
      height: 30,
    },
    '& .fc-timegrid-axis': {
      zIndex: 1,
    },
    '& .fc-event-main': {
      margin: 0,
    },
    '& .fc td': {
      border: 'none',
      borderRight: `1px solid ${theme.colors.gray[2]}`,
    },
    '& .fc-timegrid-slot-label-cushion': {
      paddingRight: theme.spacing.xs,
      color: theme.colors.gray[6],
      fontSize: theme.fontSizes.xs,
    },
    '& .fc th': {
      border: 'none !important',
    },
    '& .fc-col-header': {
      zIndex: 0,
      overflow: 'visible',
    },
    '& .fc-scrollgrid': {
      border: 'none !important',
      overflow: 'visible', // Add this line
    },
    '& > tbody > colgroup': {
      overflow: 'visible',
    },
  },
}));

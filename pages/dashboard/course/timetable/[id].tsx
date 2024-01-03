import { useRouter } from 'next/router';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Box, createStyles } from '@mantine/core';
import { DayHeaderContentArg } from '@fullcalendar/core';

export default function Page() {
  const router = useRouter();
  const { classes } = useStyles();
  return (
    <div>
      <p>Post: {router.query.id}</p>
      <div className={classes.calendar_wrapper}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
          initialView="timeGridWeek"
          headerToolbar={false}
          allDaySlot={false}
          slotMinTime={'09:00:00'}
          slotMaxTime={'20:00:00'}
          slotDuration={'00:30:00'}
          hiddenDays={[0, 6]}
          dayHeaderContent={formatDateHeader}
          contentHeight={600}
          events={[{ title: 'event 1', start: '2024-01-03 10:00:00', end: '2024-01-03 11:30:00' }]}
        />
      </div>
      <Box mt={40} />
    </div>
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
  },
}));

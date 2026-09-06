jest.mock('uuid', () => ({ v4: () => 'test-id' }));
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AvailabilityWithPreview } from '../features/timetable/components/AvailabilityWithPreview';
import type { TimetableSpan } from '../lib/types/timetable';
const saturday: TimetableSpan = {
  nanoid: 'sat',
  sectionId: 'sat',
  type: 'scheduled',
  courseCode: 'TEST',
  week_day: 6,
  start_time: '10:00',
  end_time: '11:00',
  title: '주말 수업',
};
it('keeps a weekend class visible when empty weekends are collapsed', () => {
  const html = renderToStaticMarkup(
    React.createElement(AvailabilityWithPreview, { scheduledSpans: [saturday], previewSpans: [], hideWeekends: true }),
  );
  expect(html).toContain('주말 수업');
  expect(html).toContain('>토<');
  expect(html).not.toContain('>일<');
});
it('reveals weekends for hovered course previews as well', () => {
  const html = renderToStaticMarkup(
    React.createElement(AvailabilityWithPreview, {
      scheduledSpans: [],
      previewSpans: [{ ...saturday, type: 'preview' }],
      hideWeekends: true,
    }),
  );
  expect(html).toContain('>토<');
});

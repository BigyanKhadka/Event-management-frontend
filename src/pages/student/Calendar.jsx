// src/pages/student/Calendar.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';

import Card from '../../components/common/Card';
import { eventsApi } from '../../api/endpoints/events';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function StudentCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    eventsApi
      .getAll({ page: 1, limit: 200 }) // you can tweak
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.events)) {
          const mapped = res.data.events.map((evt) => ({
            id: evt._id,
            title: evt.title,
            start: new Date(evt.startDate),
            end: new Date(evt.endDate || evt.startDate),
            resource: evt,
          }));
          setEvents(mapped);
        } else {
          setEvents([]);
        }
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const defaultDate = useMemo(() => new Date(), []);

  const handleSelectEvent = (event) => {
    // Navigate to public event detail route
    navigate(`/events/${event.id}`);
  };

  return (
    <div className="container-app py-10">
      <div className="mb-6">
        <h1 className="page-heading text-slate-900">Event calendar</h1>
        <p className="mt-1 text-slate-600">
          See all scheduled campus events on a calendar. Click an event to view details.
        </p>
      </div>

      <Card className="shadow-soft overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white">
            <Calendar
              localizer={localizer}
              events={events}
              defaultView={Views.MONTH}
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              step={30}
              defaultDate={defaultDate}
              style={{ height: 600 }}
              onSelectEvent={handleSelectEvent}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
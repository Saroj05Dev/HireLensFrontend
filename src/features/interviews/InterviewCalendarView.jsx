import { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-custom.css';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const InterviewCalendarView = ({ interviews, onSelectInterview }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);

  // Transform interviews into calendar events
  const events = useMemo(() => {
    return interviews.map(interview => ({
      id: interview._id,
      title: `${interview.candidateId?.name || 'Unknown'} - ${interview.jobId?.title || 'Unknown Job'}`,
      start: new Date(interview.scheduledAt),
      end: new Date(new Date(interview.scheduledAt).getTime() + 60 * 60 * 1000), // 1 hour duration
      resource: interview,
    }));
  }, [interviews]);

  // Get interviews for a specific date
  const getInterviewsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return interviews.filter(interview => {
      const interviewDate = format(new Date(interview.scheduledAt), 'yyyy-MM-dd');
      return interviewDate === dateStr;
    });
  };

  const handleSelectSlot = ({ start }) => {
    const dayInterviews = getInterviewsForDate(start);
    if (dayInterviews.length > 0) {
      setSelectedDate(start);
      setShowDayModal(true);
    }
  };

  const handleSelectEvent = (event) => {
    onSelectInterview(event.resource);
  };

  const eventStyleGetter = (event) => {
    const interview = event.resource;
    const isCompleted = interview.status === 'COMPLETED';
    
    return {
      style: {
        backgroundColor: isCompleted ? '#10b981' : '#3b82f6',
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '13px',
        padding: '4px 8px',
      }
    };
  };

  const formatTime = (dateString) => {
    return format(new Date(dateString), 'h:mm a');
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4">
      {/* Calendar Legend */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap items-center gap-4">
        <span className="text-sm font-semibold text-gray-700">Legend:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-600">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600">Completed</span>
        </div>
        <div className="ml-auto text-sm text-gray-500">
          Click on a date or event to view details
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6" style={{ height: '700px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day']}
          defaultView="month"
          popup
          tooltipAccessor={(event) => `${event.title} at ${formatTime(event.start)}`}
        />
      </div>

      {/* Day Modal */}
      {showDayModal && selectedDate && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowDayModal(false)}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 w-auto md:w-[600px] max-w-full bg-white rounded-xl shadow-2xl z-50 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {getInterviewsForDate(selectedDate).length} interview(s) scheduled
                  </p>
                </div>
                <button
                  onClick={() => setShowDayModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Interviews List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {getInterviewsForDate(selectedDate).map((interview) => (
                  <div
                    key={interview._id}
                    onClick={() => {
                      onSelectInterview(interview);
                      setShowDayModal(false);
                    }}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0">
                        {getInitials(interview.candidateId?.name)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-base font-semibold text-gray-900 truncate">
                            {interview.candidateId?.name || "Unknown Candidate"}
                          </h4>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full shrink-0 ${
                            interview.status === "COMPLETED"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {interview.status}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="truncate">{interview.jobId?.title || "Unknown Job"}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{formatTime(interview.scheduledAt)}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="truncate">{interview.interviewerId?.name || "Unassigned"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InterviewCalendarView;

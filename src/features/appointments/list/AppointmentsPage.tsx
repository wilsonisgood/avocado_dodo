import { useUp } from '@/app/nav';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { Button, MonthCalendar, RecordEmpty, RecordHeader, RecordPage, SegmentedTabs, monthOf } from '@/components';
import { useAppointments } from '@/data/queries';
import { today as todayISO } from '@/data/services';
import type { Appointment, ISODate } from '@/data/types';
import { tr } from '@/i18n';
import { fmtMonthYear } from '@/i18n/format';
import { ScheduleCard } from '../ScheduleCard';
import { messages } from '../i18n';
import { cardTexts, dayHeading, defaultDay, eventDates, splitAppointments, upcomingSummary, type ListNotice, type Tab, type View } from './logic';

function ListCard({ a, today, onClick }: { a: Appointment; today: ISODate; onClick: () => void }) {
    const t = cardTexts(a, today);
    return <ScheduleCard appt={a} status={t.status} when={t.when} footer={t.footer} onClick={onClick} />;
}

/** 09-0 Upcoming · 09-1 Past · 09-2/2b/2c Calendar · 09-E0 Empty · 09-R1…R3 after delete / complete. */
export function AppointmentsPage() {
    const t = tr(messages);
    const navigate = useNavigate();
    const location = useLocation();
    const [params, setParams] = useSearchParams();
    const { data: all } = useAppointments();
    const notice = (location.state as ListNotice | null) ?? null;
    const today = todayISO();

    // Completing an appointment lands on Past (09-R3).
    useEffect(() => {
        if (notice?.notice === 'completed' && params.get('tab') !== 'past') {
            const next = new URLSearchParams(params);
            next.set('tab', 'past');
            setParams(next, { replace: true, state: location.state });
        }
    }, [notice, params, setParams, location.state]);

    const tab: Tab = params.get('tab') === 'past' ? 'past' : 'upcoming';
    const view: View = params.get('view') === 'calendar' ? 'calendar' : 'list';
    const [picked, setPicked] = useState<ISODate | null>(null);
    const [month, setMonth] = useState<ISODate | null>(null);

    const setParam = (k: string, v: string | null) => {
        const next = new URLSearchParams(params);
        if (v) next.set(k, v);
        else next.delete(k);
        setParams(next, { replace: true });
        setPicked(null);
        setMonth(null);
    };
    const leave = useUp('/home');
    const open = (a: Appointment) => navigate(`/appointments/${a.id}`);
    const add = (date?: ISODate) => navigate(date ? `/appointments/new?date=${date}` : '/appointments/new');

    const header = <RecordHeader title={t.title} onBack={leave} />;
    if (!all) return <RecordPage className="gap-4">{header}</RecordPage>;

    const { upcoming, past } = splitAppointments(all, today);
    const current = tab === 'past' ? past : upcoming;

    const controls = (
        <>
            <SegmentedTabs<Tab> options={[{ value: 'upcoming', label: t.upcoming }, { value: 'past', label: t.past }]} value={tab} onChange={(v) => setParam('tab', v === 'past' ? 'past' : null)} />
            <SegmentedTabs<View> options={[{ value: 'list', label: t.list }, { value: 'calendar', label: t.calendar }]} value={view} onChange={(v) => setParam('view', v === 'calendar' ? 'calendar' : null)} />
        </>
    );

    if (view === 'calendar') {
        const selected = picked ?? defaultDay(current, today);
        const shown = month ?? monthOf(selected);
        const day = current.filter((a) => a.date === selected);
        return (
            <RecordPage className="gap-4">
                {header}
                {controls}
                <MonthCalendar month={shown} onMonthChange={setMonth} selected={selected} onSelect={setPicked} events={eventDates(current)} />
                <p className="type-caption-strong text-text-secondary">{dayHeading(selected, day.length)}</p>
                {day.length === 0 ? (
                    <RecordEmpty title={t.nothingToday}>{t.nothingTodayBody}</RecordEmpty>
                ) : (
                    day.map((a) => <ListCard key={a.id} a={a} today={today} onClick={() => open(a)} />)
                )}
                {(day.length === 0 || tab === 'upcoming') && <Button block onClick={() => add(selected)}>{day.length === 0 ? t.addForDay : t.addAppt}</Button>}
            </RecordPage>
        );
    }

    if (tab === 'upcoming' && upcoming.length === 0) {
        return (
            <RecordPage className="gap-4">
                {header}
                {controls}
                <RecordEmpty title={t.emptyTitle}>{t.emptyBody}</RecordEmpty>
                <Button block onClick={() => add()}>{t.addFirst}</Button>
            </RecordPage>
        );
    }

    if (tab === 'upcoming') {
        return (
            <RecordPage className="gap-4">
                {header}
                {controls}
                <Button block onClick={() => add()}>{t.addAppt}</Button>
                <p className="type-caption-strong text-text-secondary">{upcomingSummary(upcoming, fmtMonthYear)}</p>
                {upcoming.map((a) => <ListCard key={a.id} a={a} today={today} onClick={() => open(a)} />)}
                <p className="type-caption-default text-text-secondary">{t.keepHere}</p>
            </RecordPage>
        );
    }

    return (
        <RecordPage className="gap-4">
            {header}
            {controls}
            <h2 className="type-heading-small text-text-primary">{t.pastTitle}</h2>
            {past.map((a) => <ListCard key={a.id} a={a} today={today} onClick={() => open(a)} />)}
            <p className="type-caption-default text-text-secondary">{t.pastNote}</p>
            <Button block variant="outline" onClick={() => add()}>{t.addAppt}</Button>
        </RecordPage>
    );
}

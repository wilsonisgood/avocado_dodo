import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { Button, MonthCalendar, RecordEmpty, RecordHeader, RecordPage, SegmentedTabs, monthOf } from '@/components';
import { useAppointments } from '@/data/queries';
import { today as todayISO } from '@/data/services';
import type { Appointment, ISODate } from '@/data/types';
import { ScheduleCard } from '../ScheduleCard';
import { cardTexts, dayHeading, defaultDay, eventDates, splitAppointments, upcomingSummary, type ListNotice, type Tab, type View } from './logic';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthName = (d: ISODate) => `${MONTHS[Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}`;

function ListCard({ a, today, onClick }: { a: Appointment; today: ISODate; onClick: () => void }) {
    const t = cardTexts(a, today);
    return <ScheduleCard appt={a} status={t.status} when={t.when} footer={t.footer} onClick={onClick} />;
}

/** 09-0 Upcoming · 09-1 Past · 09-2/2b/2c Calendar · 09-E0 Empty · 09-R1…R3 after delete / complete. */
export function AppointmentsPage() {
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
    const leave = () => {
        const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
        if (idx > 0) navigate(-1);
        else navigate('/home', { replace: true });
    };
    const open = (a: Appointment) => navigate(`/appointments/${a.id}`);
    const add = (date?: ISODate) => navigate(date ? `/appointments/new?date=${date}` : '/appointments/new');

    const header = <RecordHeader title="Health appointments" onBack={leave} />;
    if (!all) return <RecordPage className="gap-4">{header}</RecordPage>;

    const { upcoming, past } = splitAppointments(all, today);
    const current = tab === 'past' ? past : upcoming;

    const controls = (
        <>
            <SegmentedTabs<Tab> options={[{ value: 'upcoming', label: 'Upcoming' }, { value: 'past', label: 'Past' }]} value={tab} onChange={(v) => setParam('tab', v === 'past' ? 'past' : null)} />
            <SegmentedTabs<View> options={[{ value: 'list', label: 'List' }, { value: 'calendar', label: 'Calendar' }]} value={view} onChange={(v) => setParam('view', v === 'calendar' ? 'calendar' : null)} />
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
                    <RecordEmpty title="Nothing planned today">Enjoy a little breathing room, or add an appointment.</RecordEmpty>
                ) : (
                    day.map((a) => <ListCard key={a.id} a={a} today={today} onClick={() => open(a)} />)
                )}
                {(day.length === 0 || tab === 'upcoming') && <Button block onClick={() => add(selected)}>{day.length === 0 ? 'Add for this day' : '＋ Add appointment'}</Button>}
            </RecordPage>
        );
    }

    if (tab === 'upcoming' && upcoming.length === 0) {
        return (
            <RecordPage className="gap-4">
                {header}
                {controls}
                <RecordEmpty title="Make space for what's next">No upcoming appointments. Add a prenatal visit, injection, blood test or other health plan.</RecordEmpty>
                <Button block onClick={() => add()}>Add first appointment</Button>
            </RecordPage>
        );
    }

    if (tab === 'upcoming') {
        return (
            <RecordPage className="gap-4">
                {header}
                {controls}
                <Button block onClick={() => add()}>＋ Add appointment</Button>
                <p className="type-caption-strong text-text-secondary">{upcomingSummary(upcoming, monthName)}</p>
                {upcoming.map((a) => <ListCard key={a.id} a={a} today={today} onClick={() => open(a)} />)}
                <p className="type-caption-default text-text-secondary">Keep prenatal visits, injections, blood tests and other health plans here.</p>
            </RecordPage>
        );
    }

    return (
        <RecordPage className="gap-4">
            {header}
            {controls}
            <h2 className="type-heading-small text-text-primary">Past appointments</h2>
            {past.map((a) => <ListCard key={a.id} a={a} today={today} onClick={() => open(a)} />)}
            <p className="type-caption-default text-text-secondary">Past dates aren't marked complete automatically. Update the status in details.</p>
            <Button block variant="outline" onClick={() => add()}>＋ Add appointment</Button>
        </RecordPage>
    );
}

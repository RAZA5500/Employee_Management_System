export const DEPARTMENTS = ["Engineering", "Human Resources", "Marketing", "Sales", "Finance", "Operations", "IT Support", "Customer Success", "Product Management", "Design"];

export const LEAVE_TYPES = ["ANNUAL", "CASUAL", "SICK", "UNPAID"];

export const LEAVE_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

// Shared demo/test accounts. Their credentials are published in the README, so
// their name, email and password stay fixed — the API rejects any change too,
// this list only lets the UI warn before the request goes out.
export const DEMO_ACCOUNT_EMAILS = (
    import.meta.env.VITE_DEMO_ACCOUNT_EMAILS || "admin@gmail.com,employee@gmail.com"
).split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);

// Credentials of those same accounts, so the login screens can offer a one-tap
// "fill the test account for me" button.
export const DEMO_CREDENTIALS = {
    ADMIN: {
        label: "admin",
        email: import.meta.env.VITE_DEMO_ADMIN_EMAIL || "admin@gmail.com",
        password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD || "12345678",
    },
    EMPLOYEE: {
        label: "employee",
        email: import.meta.env.VITE_DEMO_EMPLOYEE_EMAIL || "employee@gmail.com",
        password: import.meta.env.VITE_DEMO_EMPLOYEE_PASSWORD || "12345678",
    },
};

export const DEMO_LOCK_MESSAGE = "Demo account — name, email and password can't be changed";

export const DEMO_DELETE_MESSAGE = "Demo account — this account can't be deleted";

export function isDemoAccount(email) {
    if (!email) return false;
    return DEMO_ACCOUNT_EMAILS.includes(email.trim().toLowerCase());
}

export const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const MS_PER_HOUR = 1000 * 60 * 60;

export function isToday(date) {
    const d = new Date(date);
    const now = new Date();
    return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
    );
}

/** "6h 45m", never "6h 60m". */
export function formatHours(hours) {
    const totalMinutes = Math.max(0, Math.round(hours * 60));
    return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
}

/**
 * Hours the employee has stepped out for. A period they have not come back
 * from yet keeps counting up to now — that time is never part of the total.
 */
export function getAwayHours(record) {
    return (record?.awayPeriods || []).reduce((hours, period) => {
        const end = period.end ? new Date(period.end).getTime() : Date.now();
        const span = end - new Date(period.start).getTime();
        return hours + Math.max(0, span) / MS_PER_HOUR;
    }, 0);
}

/** True while the employee is checked in but currently stepped out. */
export function isAway(record) {
    if (!record || record.checkOut) return false;
    return (record.awayPeriods || []).some((period) => !period.end);
}

export function getWorkingHoursDisplay(record) {
    if (record.workingHours != null) {
        return formatHours(record.workingHours);
    }
    // A day that was never checked out stops counting when the day ends — the
    // server closes it off (capped) the next time the records are read.
    if (record.checkIn && !record.checkOut && !isToday(record.date)) {
        return "Not checked out";
    }
    // Still checked in: count up live, minus whatever time they were away
    if (record.checkIn && !record.checkOut) {
        const onSite = (Date.now() - new Date(record.checkIn).getTime()) / MS_PER_HOUR;
        const worked = onSite - getAwayHours(record);
        return `${formatHours(worked)} ${isAway(record) ? "(paused)" : "(ongoing)"}`;
    }
    return "—";
}

/** Time excluded from the day's total, live while the employee is still away. */
export function getAwayHoursDisplay(record) {
    const hours = record?.checkOut ? record.awayHours || 0 : getAwayHours(record);
    return hours > 0 ? formatHours(hours) : "—";
}

export function getDayTypeDisplay(record) {
    if (record.dayType) {
        const map = {
            "Full Day": "badge-success",
            "Three Quarter Day": "bg-blue-100 text-blue-700",
            "Half Day": "badge-warning",
            "Short Day": "badge-danger",
        };
        return {
            label: record.dayType,
            className: map[record.dayType] || "bg-slate-100 text-slate-600",
        };
    }
    if (isAway(record)) {
        return { label: "Away", className: "badge-warning" };
    }
    if (record.checkIn && !record.checkOut) {
        return isToday(record.date)
            ? { label: "In Progress", className: "bg-indigo-100 text-indigo-700" }
            : { label: "Not Checked Out", className: "badge-danger" };
    }
    return { label: "—", className: "" };
}

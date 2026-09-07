import React, { useCallback, useEffect, useState } from 'react'
import { CoffeeIcon, LogInIcon, LogOutIcon, PlayIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { getAwayHoursDisplay, getDayTypeDisplay, getWorkingHoursDisplay, isAway, isToday } from '../assets/assets'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

const formatTime = (date) =>
  date ? new Date(date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "—"

const Attendance = () => {

  const { role } = useAuth()
  const isAdmin = role === "ADMIN"

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get(isAdmin ? '/attendance' : '/attendance/me')
      setRecords(data)
    } catch (err) {
      toast.error(err.message || "Failed to load attendance")
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const todayRecord = !isAdmin ? records.find((r) => isToday(r.date)) : null

  const runAction = async (path, successMessage, failureMessage) => {
    setActionLoading(true)
    try {
      await api.post(path)
      toast.success(successMessage)
      fetchRecords()
    } catch (err) {
      toast.error(err.message || failureMessage)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckIn = () =>
    runAction('/attendance/check-in', "Checked in successfully", "Failed to check in")

  const handleCheckOut = () =>
    runAction('/attendance/check-out', "Checked out successfully", "Failed to check out")

  const handleAway = () =>
    runAction('/attendance/away', "You're away — the clock is paused", "Failed to mark you away")

  const handleBack = () =>
    runAction('/attendance/back', "Welcome back — the clock is running again", "Failed to bring you back")

  const away = isAway(todayRecord)

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Attendance"
        subtitle={isAdmin ? "View attendance records for all employees" : "Track your daily check-in and check-out"}
        action={
          !isAdmin && (
            <div>
              {!todayRecord ? (
                <button
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  <LogInIcon size={16} /> Check In
                </button>
              ) : !todayRecord.checkOut ? (
                <div className="flex flex-wrap items-center gap-2">
                  {away ? (
                    <button
                      onClick={handleBack}
                      disabled={actionLoading}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                      <PlayIcon size={16} /> I'm Back
                    </button>
                  ) : (
                    <button
                      onClick={handleAway}
                      disabled={actionLoading}
                      className="btn-secondary flex items-center gap-2 disabled:opacity-50"
                      title="Pause the clock while you step out"
                    >
                      <CoffeeIcon size={16} /> Away
                    </button>
                  )}
                  <button
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                    className={`${away ? "btn-secondary" : "btn-primary"} flex items-center gap-2 disabled:opacity-50`}
                  >
                    <LogOutIcon size={16} /> Check Out
                  </button>
                </div>
              ) : (
                <span className="badge badge-success">Checked out for today</span>
              )}
            </div>
          )
        }
      />

      {away && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 animate-fade-in">
          <CoffeeIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            You're marked <span className="font-medium">away</span> since{" "}
            {formatTime(todayRecord.awayPeriods.find((period) => !period.end)?.start)} — this
            time is paused and won't count toward today's total. Hit{" "}
            <span className="font-medium">I'm Back</span> when you return.
          </p>
        </div>
      )}

      {loading ? (
        <div className="card overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                {isAdmin && <th>Employee</th>}
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Away</th>
                <th>Working Hours</th>
                <th>Day Type</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {isAdmin && <td><div className="skeleton h-4 w-28" /></td>}
                  <td><div className="skeleton h-4 w-24" /></td>
                  <td><div className="skeleton h-4 w-16" /></td>
                  <td><div className="skeleton h-4 w-16" /></td>
                  <td><div className="skeleton h-4 w-16" /></td>
                  <td><div className="skeleton h-4 w-20" /></td>
                  <td><div className="skeleton h-5 w-20 rounded-md" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : records.length === 0 ? (
        <EmptyState message="No attendance records found" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                {isAdmin && <th>Employee</th>}
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Away</th>
                <th>Working Hours</th>
                <th>Day Type</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const dayType = getDayTypeDisplay(r)
                return (
                  <tr key={r._id}>
                    {isAdmin && (
                      <td>
                        <p className="font-medium text-slate-900">
                          {r.employeeId?.firstName} {r.employeeId?.lastName}
                        </p>
                        <p className="text-xs text-slate-500">{r.employeeId?.department}</p>
                      </td>
                    )}
                    <td>{formatDate(r.date)}</td>
                    <td>{formatTime(r.checkIn)}</td>
                    <td>
                      {formatTime(r.checkOut)}
                      {r.autoCheckOut && (
                        <span
                          className="badge badge-warning ml-2"
                          title={`Never checked out — the system closed this day automatically, capped at the end of the shift`}
                        >
                          auto
                        </span>
                      )}
                    </td>
                    <td className={getAwayHoursDisplay(r) === "—" ? "" : "text-amber-700"}>
                      {getAwayHoursDisplay(r)}
                    </td>
                    <td>{getWorkingHoursDisplay(r)}</td>
                    <td>
                      {dayType.label !== "—" && (
                        <span className={`badge ${dayType.className}`}>{dayType.label}</span>
                      )}
                      {dayType.label === "—" && "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Attendance

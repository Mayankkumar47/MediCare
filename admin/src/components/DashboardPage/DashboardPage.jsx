import React, { useEffect, useMemo, useState } from "react";
import { Search, Calendar, CheckCircle, XCircle, Users, BadgeIndianRupee } from "lucide-react";
import { dashboardStyles as s } from "../../assets/dummyStyles";

import API_BASE from '../../api.js';

const safeNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

function normalizeDoctor(doc) {
  const id = doc._id || doc.id || String(Math.random()).slice(2);
  const name =
    doc.name ||
    doc.fullName ||
    `${doc.firstName || ""} ${doc.lastName || ""}`.trim() ||
    "Unknown";
  const specialization =
    doc.specialization ||
    doc.speciality ||
    (Array.isArray(doc.specializations)
      ? doc.specializations.join(", ")
      : "") ||
    "General";
  const fee = safeNumber(
    doc.fee ?? doc.fees ?? doc.consultationFee ?? doc.consultation_fee ?? 0,
    0
  );
  const image =
    doc.imageUrl ||
    doc.image ||
    doc.avatar ||
    `https://i.pravatar.cc/150?u=${id}`;

  const appointments = {
    total:
      doc.appointments?.total ??
      doc.totalAppointments ??
      doc.appointmentsTotal ??
      0,
    completed:
      doc.appointments?.completed ??
      doc.completedAppointments ??
      doc.appointmentsCompleted ??
      0,
    canceled:
      doc.appointments?.canceled ??
      doc.canceledAppointments ??
      doc.appointmentsCanceled ??
      0,
  };

  let earnings = null;
  if (doc.earnings !== undefined && doc.earnings !== null)
    earnings = safeNumber(doc.earnings, 0);
  else if (doc.revenue !== undefined && doc.revenue !== null)
    earnings = safeNumber(doc.revenue, 0);
  else if (appointments.completed && fee)
    earnings = fee * safeNumber(appointments.completed, 0);
  else earnings = 0;

  return {
    id,
    name,
    specialization,
    fee,
    image,
    appointments,
    earnings,
    raw: doc,
  };
}

export default function DashboardPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalAppointments: 0,
    completed: 0,
    canceled: 0,
    revenue: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadDoctors() {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_BASE}/api/doctors?limit=200`;
        const res = await fetch(url);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body?.message || `Failed to fetch doctors (${res.status})`
          );
        }
        const body = await res.json();
        let list = [];
        if (Array.isArray(body)) list = body;
        else if (Array.isArray(body.doctors)) list = body.doctors;
        else if (Array.isArray(body.data)) list = body.data;
        else if (Array.isArray(body.items)) list = body.items;
        else {
          const firstArray = Object.values(body).find((v) => Array.isArray(v));
          if (firstArray) list = firstArray;
        }
        const normalized = list.map((d) => normalizeDoctor(d));
        if (mounted) setDoctors(normalized);
      } catch (err) {
        console.error("Failed to load doctors:", err);
        if (mounted) {
          setError(err.message || "Failed to load doctors");
          setDoctors([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadDoctors();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadStats() {
      setStatsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/stats`);
        if (!res.ok) {
          console.warn("Stats fetch failed:", res.status);
          return;
        }
        const body = await res.json().catch(() => ({}));
        if (mounted && body.success && body.stats) {
          setStats(body.stats);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        if (mounted) setStatsLoading(false);
      }
    }
    loadStats();
    return () => {
      mounted = false;
    };
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    if (!query) return doctors;
    const q = query.trim().toLowerCase();
    const qNum = Number(q);
    return doctors.filter((d) => {
      if (d.name.toLowerCase().includes(q)) return true;
      if ((d.specialization || "").toLowerCase().includes(q)) return true;
      if (d.fee.toString().includes(q)) return true;
      if (!Number.isNaN(qNum) && d.fee <= qNum) return true;
      return false;
    });
  }, [doctors, query]);

  const INITIAL_COUNT = 8;
  const visibleDoctors = showAll
    ? filteredDoctors
    : filteredDoctors.slice(0, INITIAL_COUNT);

  return (
    <div className={s.pageContainer}>
      <div className={s.maxWidthContainer}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className={s.headerTitle}>Dashboard Overview</h1>
            <p className={s.headerSubtitle}>Real-time hospital statistics, doctor performance metrics, and clinical revenue tracking.</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className={s.statsGrid}>
          <div className={s.statCard}>
            <div className={s.statCardContent}>
              <div className={s.statIconContainer}>
                <Users className="text-emerald-600 w-6 h-6" />
              </div>
              <div>
                <p className={s.statLabel}>Total Doctors</p>
                <h3 className={s.statValue}>{statsLoading ? "..." : stats.totalDoctors}</h3>
              </div>
            </div>
          </div>

          <div className={s.statCard}>
            <div className={s.statCardContent}>
              <div className={s.statIconContainer}>
                <Calendar className="text-blue-500 w-6 h-6" />
              </div>
              <div>
                <p className={s.statLabel}>Total Appointments</p>
                <h3 className={s.statValue}>{statsLoading ? "..." : stats.totalAppointments}</h3>
              </div>
            </div>
          </div>

          <div className={s.statCard}>
            <div className={s.statCardContent}>
              <div className={s.statIconContainer}>
                <CheckCircle className="text-emerald-500 w-6 h-6" />
              </div>
              <div>
                <p className={s.statLabel}>Completed</p>
                <h3 className={s.statValue}>{statsLoading ? "..." : stats.completed}</h3>
              </div>
            </div>
          </div>

          <div className={s.statCard}>
            <div className={s.statCardContent}>
              <div className={s.statIconContainer}>
                <XCircle className="text-rose-500 w-6 h-6" />
              </div>
              <div>
                <p className={s.statLabel}>Cancelled</p>
                <h3 className={s.statValue}>{statsLoading ? "..." : stats.canceled}</h3>
              </div>
            </div>
          </div>

          <div className={s.statCard}>
            <div className={s.statCardContent}>
              <div className={s.statIconContainer}>
                <BadgeIndianRupee className="text-amber-500 w-6 h-6" />
              </div>
              <div>
                <p className={s.statLabel}>Total Earnings</p>
                <h3 className={s.statValue}>₹ {statsLoading ? "..." : stats.revenue.toLocaleString()}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 bg-white p-4 rounded-2xl border border-green-50 shadow-sm">
          <label className={s.searchLabel}>Search Doctors</label>
          <div className={s.searchContainer}>
            <div className={s.searchInputContainer}>
              <Search className={s.searchIcon} />
              <input
                type="text"
                placeholder="Search by doctor name, specialty, fee..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={s.searchInput}
              />
            </div>
            {query && (
              <button onClick={() => setQuery("")} className={s.clearButton}>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Doctors Table */}
        <div className={s.tableContainer}>
          <div className={s.tableHeader}>
            <h3 className={s.tableTitle}>Doctor Performance</h3>
            <span className={s.tableCount}>
              Showing {visibleDoctors.length} of {filteredDoctors.length} doctors
            </span>
          </div>

          {loading && (
            <div className="p-8 text-center text-slate-500">
              Loading doctor statistics...
            </div>
          )}

          {error && (
            <div className={s.errorContainer}>
              Error loading doctor statistics: {error}
            </div>
          )}

          {!loading && !error && filteredDoctors.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              No doctors found matching query.
            </div>
          )}

          {/* Desktop Table View */}
          {!loading && !error && filteredDoctors.length > 0 && (
            <div className={s.tableWrapper}>
              <table className={s.table}>
                <thead className={s.tableHead}>
                  <tr>
                    <th className={s.tableHeaderCell}>Doctor</th>
                    <th className={s.tableHeaderCell}>Specialization</th>
                    <th className={s.tableHeaderCell}>Fee</th>
                    <th className={s.tableHeaderCell}>Appointments</th>
                    <th className={s.tableHeaderCell}>Completed</th>
                    <th className={s.tableHeaderCell}>Canceled</th>
                    <th className={s.tableHeaderCell}>Total Earnings</th>
                  </tr>
                </thead>
                <tbody className={s.tableBody}>
                  {visibleDoctors.map((d, idx) => (
                    <tr
                      key={d.id}
                      className={s.tableRow + " " + 
                        (idx % 2 === 0 ? s.tableRowEven : s.tableRowOdd)}
                    >
                      <td className={s.tableCell + " " + s.tableCellFlex}>
                        <div className={s.verticalLine} />
                        <img
                          src={d.image}
                          alt={d.name}
                          className={s.doctorImage}
                        />
                        <div>
                          <div className={s.doctorName}>
                            {d.name}
                          </div>
                          <div className={s.doctorId}>
                            ID: {d.id}
                          </div>
                        </div>
                      </td>

                      <td className={s.tableCell + " " + s.doctorSpecialization}>
                        {d.specialization}
                      </td>

                      <td className={s.tableCell + " " + s.feeText}>
                        ₹ {d.fee}
                      </td>

                      <td className={s.tableCell + " " + s.appointmentsText}>
                        {d.appointments.total}
                      </td>

                      <td className={s.tableCell + " " + s.completedText}>
                        {d.appointments.completed}
                      </td>

                      <td className={s.tableCell + " " + s.canceledText}>
                        {d.appointments.canceled}
                      </td>

                      <td className={s.tableCell + " " + s.earningsText}>
                        ₹ {d.earnings.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile Grid View */}
          {!loading && !error && filteredDoctors.length > 0 && (
            <div className={s.mobileDoctorContainer}>
              <div className={s.mobileDoctorGrid}>
                {visibleDoctors.map((d) => (
                  <div key={d.id} className={s.mobileDoctorCard}>
                    <div className={s.mobileDoctorHeader}>
                      <div className="flex items-center gap-3">
                        <img src={d.image} alt={d.name} className={s.mobileDoctorImage} />
                        <div>
                          <h4 className={s.mobileDoctorName}>{d.name}</h4>
                          <p className={s.mobileDoctorSpecialization}>{d.specialization}</p>
                        </div>
                      </div>
                      <span className={s.mobileDoctorFee}>₹ {d.fee}</span>
                    </div>

                    <div className={s.mobileStatsGrid}>
                      <div>
                        <span className={s.mobileStatLabel}>Bookings</span>
                        <p className={s.mobileStatValue}>{d.appointments.total}</p>
                      </div>
                      <div>
                        <span className={s.mobileStatLabel}>Done</span>
                        <p className={`${s.mobileStatValue} text-emerald-600`}>{d.appointments.completed}</p>
                      </div>
                      <div>
                        <span className={s.mobileStatLabel}>Canceled</span>
                        <p className={`${s.mobileStatValue} text-rose-500`}>{d.appointments.canceled}</p>
                      </div>
                    </div>

                    <div className={s.mobileEarningsContainer}>
                      <span>Earnings:</span>
                      <span className="font-semibold text-slate-800">₹ {d.earnings.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show More Button */}
          {filteredDoctors.length > visibleDoctors.length && (
            <div className={s.showMoreContainer}>
              <button
                onClick={() => setShowAll(true)}
                className={s.showMoreButton}
              >
                Show More Doctors
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
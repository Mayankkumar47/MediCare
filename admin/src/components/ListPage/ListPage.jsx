import React, { useState, useEffect, useMemo } from "react";
import { Search, Trash, ChevronDown, Calendar, Users, Star, GraduationCap, MapPin, Briefcase } from "lucide-react";
import { doctorListStyles, keyframesStyles } from "../../assets/dummyStyles";

import API_BASE from '../../api.js';

function formatDateISO(iso) {
  if (!iso || typeof iso !== "string") return iso;
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = String(Number(d));
  const month = monthNames[dateObj.getMonth()] || "";
  return `${day} ${month} ${y}`;
}

function normalizeToDateString(d) {
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString().split("T")[0];
}

function buildScheduleMap(schedule) {
  const map = {};
  if (!schedule || typeof schedule !== "object") return map;
  Object.entries(schedule).forEach(([k, v]) => {
    const nd = normalizeToDateString(k) || String(k);
    map[nd] = Array.isArray(v) ? v.slice() : [];
  });
  return map;
}

function getSortedScheduleDates(scheduleLike) {
  let keys = [];
  if (Array.isArray(scheduleLike)) {
    keys = scheduleLike.map(normalizeToDateString).filter(Boolean);
  } else if (scheduleLike && typeof scheduleLike === "object") {
    keys = Object.keys(scheduleLike).map(normalizeToDateString).filter(Boolean);
  }

  keys = Array.from(new Set(keys));
  const parsed = keys.map((ds) => ({ ds, date: new Date(ds) }));
  const dateVal = (d) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());

  const today = new Date();
  const todayVal = dateVal(today);

  const past = parsed
    .filter((p) => dateVal(p.date) < todayVal)
    .sort((a, b) => dateVal(b.date) - dateVal(a.date));

  const future = parsed
    .filter((p) => dateVal(p.date) >= todayVal)
    .sort((a, b) => dateVal(a.date) - dateVal(b.date));

  return [...past, ...future].map((p) => p.ds);
}

export default function ListPage() {
  const [doctors, setDoctors] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);

  const [isMobileScreen, setIsMobileScreen] = useState(false);
  useEffect(() => {
    function onResize() {
      if (typeof window === "undefined") return;
      setIsMobileScreen(window.innerWidth < 640);
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  async function fetchDoctors() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/doctors`);
      const body = await res.json().catch(() => null);

      if (res.ok && body && body.success) {
        const list = Array.isArray(body.data)
          ? body.data
          : Array.isArray(body.doctors)
          ? body.doctors
          : [];
        const normalized = list.map((d) => {
          const scheduleMap = buildScheduleMap(d.schedule || {});
          return {
            ...d,
            schedule: scheduleMap,
          };
        });
        setDoctors(normalized);
      } else {
        console.error("Failed to fetch doctors", { status: res.status, body });
        setDoctors([]);
      }
    } catch (err) {
      console.error("Network error fetching doctors", err);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = doctors;
    if (filterStatus === "available") {
      list = list.filter(
        (d) => (d.availability || "").toString().toLowerCase() === "available"
      );
    } else if (filterStatus === "unavailable") {
      list = list.filter(
        (d) => (d.availability || "").toString().toLowerCase() !== "available"
      );
    }
    if (!q) return list;
    return list.filter((d) => {
      return (
        (d.name || "").toLowerCase().includes(q) ||
        (d.specialization || "").toLowerCase().includes(q)
      );
    });
  }, [doctors, query, filterStatus]);

  const displayed = useMemo(() => {
    if (showAll) return filtered;
    return filtered.slice(0, 6);
  }, [filtered, showAll]);

  function toggle(id) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  async function removeDoctor(id) {
    const doc = doctors.find((d) => (d._id || d.id) === id);
    if (!doc) return;
    const ok = window.confirm(`Delete ${doc.name}? This cannot be undone.`);
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/api/doctors/${id}`, {
        method: "DELETE",
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        alert(body?.message || "Failed to delete");
        return;
      }
      setDoctors((prev) => prev.filter((p) => (p._id || p.id) !== id));
      if (expanded === id) setExpanded(null);
    } catch (err) {
      console.error("delete error", err);
      alert("Network error deleting doctor");
    }
  }

  function applyStatusFilter(status) {
    setFilterStatus((prev) => (prev === status ? "all" : status));
    setExpanded(null);
    setShowAll(false);
  }

  return (
    <div className={doctorListStyles.container}>
      <style>{keyframesStyles}</style>

      {/* Header */}
      <div className={doctorListStyles.headerContainer}>
        <div className={doctorListStyles.headerTopSection}>
          <div className={doctorListStyles.headerIconContainer}>
            <div className={doctorListStyles.headerIcon}>
              <Users className={doctorListStyles.headerIconSvg} />
            </div>
            <div>
              <h1 className={doctorListStyles.headerTitle}>All Doctors Register</h1>
              <p className={doctorListStyles.headerSubtitle}>Directory of medical practitioners and schedule calendars.</p>
            </div>
          </div>

          <div className={doctorListStyles.headerSearchContainer}>
            <div className={doctorListStyles.searchBox}>
              <Search className={doctorListStyles.searchIcon} size={18} />
              <input
                type="text"
                placeholder="Search by doctor name or speciality..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={doctorListStyles.searchInput}
              />
            </div>
            {query && (
              <button onClick={() => setQuery("")} className={doctorListStyles.clearButton}>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter buttons */}
        <div className={doctorListStyles.filterContainer}>
          <button
            onClick={() => applyStatusFilter("available")}
            className={doctorListStyles.filterButton(filterStatus === "available", "emerald")}
          >
            Available Only
          </button>
          <button
            onClick={() => applyStatusFilter("unavailable")}
            className={doctorListStyles.filterButton(filterStatus === "unavailable", "red")}
          >
            Unavailable Only
          </button>
        </div>
      </div>

      {loading && (
        <div className={doctorListStyles.loadingContainer}>
          <p>Loading clinical practitioners list...</p>
        </div>
      )}

      {!loading && displayed.length === 0 && (
        <div className={doctorListStyles.noResultsContainer}>
          <p>No doctors register match your criteria.</p>
        </div>
      )}

      {/* Doctors Grid */}
      <div className={doctorListStyles.gridContainer}>
        {displayed.map((doc) => {
          const id = doc._id || doc.id;
          const isOpen = expanded === id;
          const isAvailable = (doc.availability || "").toLowerCase() === "available";
          const scheduleMap = doc.schedule || {};
          const sortedDates = getSortedScheduleDates(scheduleMap);

          return (
            <article key={id} className={doctorListStyles.article}>
              <div className={doctorListStyles.articleContent}>
                <img
                  src={doc.imageUrl || "https://i.pravatar.cc/150?u=" + id}
                  alt={doc.name}
                  className={doc.imageUrl ? doctorListStyles.doctorImage : `${doctorListStyles.doctorImage} border-slate-300`}
                />

                <div className={doctorListStyles.doctorInfoContainer}>
                  <div className={doctorListStyles.doctorHeader}>
                    <div>
                      <h3 className={doctorListStyles.doctorName}>
                        {doc.name}
                        <span className={doctorListStyles.availabilityBadge(isAvailable)}>
                          <span className={doctorListStyles.availabilityDot(isAvailable)} />
                          {doc.availability}
                        </span>
                      </h3>
                      <p className={doctorListStyles.doctorDetails}>
                        {doc.specialization} • {doc.experience}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <div className={doctorListStyles.ratingContainer}>
                        <span className={doctorListStyles.rating}>
                          <Star className="text-amber-500 fill-amber-500" size={14} />
                          {doc.rating}
                        </span>
                      </div>
                      <button
                        onClick={() => toggle(id)}
                        className={doctorListStyles.toggleButton(isOpen)}
                        aria-expanded={isOpen}
                        aria-label="Toggle details view"
                      >
                        <ChevronDown size={18} className="text-emerald-700" />
                      </button>
                    </div>
                  </div>

                  <div className={doctorListStyles.statsContainer}>
                    <div className="flex items-center justify-between w-full">
                      <div className={doctorListStyles.feesValue}>
                        <span className={doctorListStyles.feesLabel}>Fee:</span>
                        <span>₹ {doc.fee}</span>
                      </div>
                      <button
                        onClick={() => removeDoctor(id)}
                        className={doctorListStyles.deleteButton}
                      >
                        <Trash size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expandable Schedule & About */}
              <div
                className={doctorListStyles.expandableContent}
                style={{
                  maxHeight: isOpen ? (isMobileScreen ? 450 : 600) : 0,
                  transition:
                    "max-height 420ms cubic-bezier(.2,.9,.2,1), padding 220ms ease",
                  paddingTop: isOpen ? 16 : 0,
                  paddingBottom: isOpen ? 16 : 0,
                }}
              >
                {isOpen && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border-t border-emerald-100 bg-white">
                    <div className={doctorListStyles.aboutSection + " md:col-span-2"}>
                      <h4 className={doctorListStyles.aboutHeading}>
                        <Briefcase size={16} className="inline mr-2 text-emerald-600" />
                        About Doctor
                      </h4>
                      <p className={doctorListStyles.aboutText}>{doc.about || "No biography provided."}</p>

                      <div className="mt-4">
                        <div className={doctorListStyles.qualificationsHeading}>
                          <GraduationCap size={16} className="inline mr-2 text-emerald-600" />
                          Qualifications & Education
                        </div>
                        <div className={doctorListStyles.qualificationsText}>
                          {doc.qualifications || "Not specified."}
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className={doctorListStyles.scheduleHeading}>
                          <Calendar size={16} className="inline mr-2 text-emerald-600" />
                          Availability Schedule
                        </div>
                        {sortedDates.length === 0 ? (
                          <p className="text-xs text-slate-400 mt-1">No schedule slots configured.</p>
                        ) : (
                          <div className="mt-2 space-y-3 max-h-44 overflow-y-auto pr-1">
                            {sortedDates.map((date) => {
                              const slots = scheduleMap[date] || [];
                              return (
                                <div key={date} className="border-b border-slate-50 pb-2">
                                  <div className={doctorListStyles.scheduleDate}>
                                    {formatDateISO(date)}
                                  </div>
                                  <div className="mt-1 flex flex-wrap gap-1.5">
                                    {slots.map((s, i) => (
                                      <span
                                        key={i}
                                        className={doctorListStyles.scheduleSlot}
                                      >
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <aside className={doctorListStyles.statsSidebar + " md:col-span-1 border-l border-slate-100 pl-4"}>
                      <div className="space-y-4">
                        <div>
                          <div className={doctorListStyles.statsItemHeading}>Success Rate</div>
                          <div className="text-xl font-semibold text-emerald-600">{doc.success || "98%"}</div>
                        </div>
                        <div>
                          <div className={doctorListStyles.statsItemHeading}>Patients Managed</div>
                          <div className="text-xl font-semibold text-slate-700">{doc.patients || "100+"}</div>
                        </div>
                        <div>
                          <div className={doctorListStyles.statsItemHeading}>Clinical Room</div>
                          <div className={doctorListStyles.locationValue}>
                            <MapPin size={14} className="inline mr-1 text-slate-400" />
                            {doc.location || "Main Clinic"}
                          </div>
                        </div>
                      </div>
                    </aside>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Show more button */}
      {filtered.length > displayed.length && (
        <div className={doctorListStyles.showMoreContainer}>
          <button
            onClick={() => setShowAll(true)}
            className={doctorListStyles.showMoreButton}
          >
            Show All Doctors ({filtered.length})
          </button>
        </div>
      )}
    </div>
  );
}
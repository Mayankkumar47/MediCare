import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Calendar, AlertCircle, Award, ChevronDown } from 'lucide-react';
import { doctorsPageStyles } from '../../assets/dummyStyles';

import API_BASE from '../../api.js';

const DoctorsPage = () => {
  const [allDoctors, setAllDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/doctors`);
        const json = await res.json().catch(() => null);

        if (!res.ok) {
          const msg =
            (json && json.message) || `Failed to load doctors (${res.status})`;
          if (mounted) {
            setError(msg);
            setAllDoctors([]);
            setLoading(false);
          }
          return;
        }

        const items = (json && (json.data || json)) || [];
        const normalized = (Array.isArray(items) ? items : []).map((d) => {
          const id = d._id || d.id;
          const image =
            d.imageUrl || d.image || d.imageSmall || d.imageSrc || "";
          let available = true;
          if (typeof d.availability === "string") {
            available = d.availability.toLowerCase() === "available";
          } else if (typeof d.available === "boolean") {
            available = d.available;
          } else if (typeof d.availability === "boolean") {
            available = d.availability;
          } else {
            available = d.availability === "Available" || d.available === true;
          }
          return {
            id,
            name: d.name || "Unknown",
            specialization: d.specialization || "",
            image,
            experience:
              (d.experience ?? d.experience === 0) ? String(d.experience) : "—",
            fee: d.fee ?? d.price ?? 0,
            available,
            raw: d,
          };
        });

        if (mounted) {
          setAllDoctors(normalized);
          setError("");
        }
      } catch (err) {
        console.error("load doctors error:", err);
        if (mounted) {
          setError("Network error while loading doctors.");
          setAllDoctors([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredDoctors = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return allDoctors;
    return allDoctors.filter(
      (doctor) =>
        (doctor.name || "").toLowerCase().includes(q) ||
        (doctor.specialization || "").toLowerCase().includes(q),
    );
  }, [allDoctors, searchTerm]);

  const displayedDoctors = showAll
    ? filteredDoctors
    : filteredDoctors.slice(0, 8);

  const retry = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/doctors`);
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError((json && json.message) || `Failed to load (${res.status})`);
        setAllDoctors([]);
        return;
      }
      const items = (json && (json.data || json)) || [];
      const normalized = (Array.isArray(items) ? items : []).map((d) => {
        const id = d._id || d.id;
        const image = d.imageUrl || d.image || "";
        let available = true;
        if (typeof d.availability === "string") {
          available = d.availability.toLowerCase() === "available";
        } else if (typeof d.available === "boolean") {
          available = d.available;
        } else {
          available = d.availability === "Available" || d.available === true;
        }
        return {
          id,
          name: d.name || "Unknown",
          specialization: d.specialization || "",
          image,
          experience: d.experience ?? "—",
          fee: d.fee ?? d.price ?? 0,
          available,
          raw: d,
        };
      });
      setAllDoctors(normalized);
      setError("");
    } catch (e) {
      console.error(e);
      setError("Network error while loading doctors.");
      setAllDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={doctorsPageStyles.mainContainer}>
      <div className={doctorsPageStyles.backgroundShape1} />
      <div className={doctorsPageStyles.backgroundShape2} />

      <div className={doctorsPageStyles.wrapper}>
        {/* Header */}
        <div className={doctorsPageStyles.headerContainer}>
          <h1 className={doctorsPageStyles.headerTitle}>Meet Our Expert Doctors</h1>
          <p className={doctorsPageStyles.headerSubtitle}>
            Search and book appointments with verified medical professionals.
          </p>
        </div>

        {/* Search */}
        <div className={doctorsPageStyles.searchContainer}>
          <div className={doctorsPageStyles.searchWrapper}>
            <Search className={doctorsPageStyles.searchIcon} />
            <input
              type="text"
              placeholder="Search doctor by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={doctorsPageStyles.searchInput}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className={doctorsPageStyles.clearButton}>
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className={doctorsPageStyles.skeletonGrid}>
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className={doctorsPageStyles.skeletonCard}>
                <div className={doctorsPageStyles.skeletonImage} />
                <div className={doctorsPageStyles.skeletonName} />
                <div className={doctorsPageStyles.skeletonSpecialization} />
                <div className={doctorsPageStyles.skeletonButton} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={doctorsPageStyles.errorContainer}>
            <p className={doctorsPageStyles.errorText}>{error}</p>
            <button onClick={retry} className={doctorsPageStyles.retryButton}>
              Retry Loading
            </button>
          </div>
        ) : (
          <>
            {/* Doctors Grid */}
            <div className={doctorsPageStyles.doctorsGrid}>
              {displayedDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className={`${doctorsPageStyles.doctorCard} ${
                    !doctor.available ? doctorsPageStyles.doctorCardUnavailable : ""
                  }`}
                >
                  {doctor.available ? (
                    <Link
                      to={`/doctors/${doctor.id}`}
                      state={{ doctor: doctor.raw || doctor }}
                      className={doctorsPageStyles.focusRing}
                    >
                      <div className={doctorsPageStyles.imageContainer}>
                        <img
                          src={doctor.image || "/placeholder-doctor.jpg"}
                          alt={doctor.name}
                          loading="lazy"
                          className={doctorsPageStyles.doctorImage}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/placeholder-doctor.jpg";
                          }}
                        />
                      </div>
                    </Link>
                  ) : (
                    <div
                      className={`${doctorsPageStyles.imageContainer} ${doctorsPageStyles.imageContainerUnavailable}`}
                    >
                      <img
                        src={doctor.image || "/placeholder-doctor.jpg"}
                        alt={doctor.name}
                        loading="lazy"
                        className={doctorsPageStyles.doctorImageUnavailable}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/placeholder-doctor.jpg";
                        }}
                      />
                    </div>
                  )}

                  <h3 className={doctorsPageStyles.doctorName}>{doctor.name}</h3>
                  <p className={doctorsPageStyles.doctorSpecialization}>{doctor.specialization}</p>

                  <div className={doctorsPageStyles.experienceBadge}>
                    <Award className={doctorsPageStyles.experienceIcon} />
                    <span>{doctor.experience} Yrs Experience</span>
                  </div>

                  <div className="w-full mt-2">
                    {doctor.available ? (
                      <Link
                        to={`/doctors/${doctor.id}`}
                        state={{ doctor: doctor.raw || doctor }}
                        className={doctorsPageStyles.bookButton}
                      >
                        <Calendar className={doctorsPageStyles.bookButtonIcon} />
                        Book Appointment
                      </Link>
                    ) : (
                      <button disabled className={doctorsPageStyles.notAvailableButton}>
                        <AlertCircle className={doctorsPageStyles.notAvailableIcon} />
                        Not Available
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredDoctors.length === 0 && (
              <div className={doctorsPageStyles.noResults}>
                No doctors found matching your search.
              </div>
            )}

            {/* Show More */}
            {filteredDoctors.length > 8 && !showAll && (
              <div className={doctorsPageStyles.showMoreContainer}>
                <button
                  onClick={() => setShowAll(true)}
                  className={doctorsPageStyles.showMoreButton}
                >
                  <ChevronDown className={doctorsPageStyles.showMoreIcon} />
                  Show More
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.9s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.9s ease-out both; }
        .animate-slide-up { animation: slide-up 0.8s ease-out; }

        @media (max-width: 420px) {
          .max-w-7xl { padding-left: 10px; padding-right: 10px; }
        }

        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}} />
    </div>
  );
};

export default DoctorsPage;

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Award, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { homeDoctorsStyles } from '../../assets/dummyStyles';

import API_BASE from '../../api.js';

const HomeDoctors = ({ previewCount = 4, showHeader = true, title, subtitle }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const normalize = (d) => {
    const id = d._id || d.id;
    const image = d.imageUrl || d.image || d.imageSmall || d.imageSrc || "";
    const available =
      (typeof d.availability === "string"
        ? d.availability.toLowerCase() === "available"
        : typeof d.available === "boolean"
          ? d.available
          : d.availability === true) || d.availability === "Available";
    return {
      id,
      name: d.name || "Unknown",
      specialization: d.specialization || "",
      image,
      experience: d.experience || d.experience === 0 ? String(d.experience) : "—",
      fee: d.fee ?? d.price ?? 0,
      available,
      raw: d,
    };
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${API_BASE}/api/doctors`, { signal: controller.signal });
      clearTimeout(timeout);
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setError((json && json.message) || `Server error (${res.status})`);
        setDoctors([]);
      } else {
        const items = (json && (json.data || json)) || [];
        setDoctors((Array.isArray(items) ? items : []).map(normalize));
        setError("");
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError("Request timed out. Server may be starting up.");
      } else {
        setError("Could not connect to server.");
      }
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, retryCount]);

  const preview = doctors.slice(0, previewCount);

  return (
    <section className={homeDoctorsStyles.section}>
      <div className={homeDoctorsStyles.container}>
        {/* Header */}
        {showHeader && (
          <div className={homeDoctorsStyles.header}>
            <h2 className={homeDoctorsStyles.title}>
              {title ? (
                title
              ) : (
                <>Meet Our <span className={homeDoctorsStyles.titleSpan}>Top Doctors</span></>
              )}
            </h2>
            <p className={homeDoctorsStyles.subtitle}>
              {subtitle || "Book appointments with our top-rated specialists and highly experienced medical practitioners."}
            </p>
          </div>
        )}

        {/* Error banner - subtle, non-blocking */}
        {error && !loading && doctors.length === 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '10px',
            padding: '10px 16px', marginBottom: '16px', fontSize: '13px', color: '#7b6000'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>Doctors section is temporarily unavailable — the server may be starting up.</span>
            <button
              onClick={() => setRetryCount(c => c + 1)}
              style={{
                marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px',
                background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px',
                padding: '4px 10px', cursor: 'pointer', fontWeight: 600, fontSize: '12px'
              }}
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className={homeDoctorsStyles.skeletonGrid}>
            {Array.from({ length: previewCount }).map((_, idx) => (
              <div key={idx} className={homeDoctorsStyles.skeletonCard}>
                <div className={homeDoctorsStyles.skeletonImage} />
                <div className={homeDoctorsStyles.skeletonText1} />
                <div className={homeDoctorsStyles.skeletonText2} />
                <div className={homeDoctorsStyles.skeletonButton} />
              </div>
            ))}
          </div>
        ) : (
          /* Doctors Grid */
          <div className={homeDoctorsStyles.doctorsGrid}>
            {preview.map((doctor) => (
              <article key={doctor.id} className={homeDoctorsStyles.article}>
                {/* Image Section */}
                {doctor.available ? (
                  <Link
                    to={`/doctors/${doctor.id}`}
                    state={{ doctor: doctor.raw || doctor }}
                    className={homeDoctorsStyles.imageContainerAvailable}
                  >
                    <img
                      src={doctor.image || "/placeholder-doctor.jpg"}
                      alt={doctor.name}
                      loading="lazy"
                      className={homeDoctorsStyles.image}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/placeholder-doctor.jpg";
                      }}
                    />
                  </Link>
                ) : (
                  <div className={homeDoctorsStyles.imageContainerUnavailable}>
                    <img
                      src={doctor.image || "/placeholder-doctor.jpg"}
                      alt={doctor.name}
                      loading="lazy"
                      className={homeDoctorsStyles.image}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/placeholder-doctor.jpg";
                      }}
                    />
                    <span className={homeDoctorsStyles.unavailableBadge}>Unavailable</span>
                  </div>
                )}

                {/* Info Section */}
                <div className={homeDoctorsStyles.cardBody}>
                  <h3 className={homeDoctorsStyles.doctorName}>{doctor.name}</h3>
                  <p className={homeDoctorsStyles.specialization}>{doctor.specialization}</p>

                  <div className={homeDoctorsStyles.experienceContainer}>
                    <div className={homeDoctorsStyles.experienceBadge}>
                      <Award className="w-3.5 h-3.5" />
                      <span>{doctor.experience} Yrs Exp</span>
                    </div>
                    <span className="font-semibold text-emerald-700">₹{doctor.fee}</span>
                  </div>

                  <div className={homeDoctorsStyles.buttonContainer}>
                    {doctor.available ? (
                      <Link
                        to={`/doctors/${doctor.id}`}
                        state={{ doctor: doctor.raw || doctor }}
                        className={homeDoctorsStyles.buttonAvailable}
                      >
                        <Calendar className="w-4 h-4" />
                        Book Now
                      </Link>
                    ) : (
                      <button disabled className={homeDoctorsStyles.buttonUnavailable}>
                        <AlertCircle className="w-4 h-4" />
                        Not Available
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {previewCount && doctors.length > previewCount && (
          <div className="flex justify-center mt-10">
            <Link
              to="/doctors"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold shadow-md transition-all duration-300 hover:shadow-lg"
            >
              Find All Doctors &rarr;
            </Link>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: homeDoctorsStyles.customCSS }} />
    </section>
  );
};

export default HomeDoctors;

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronsRight, MousePointer2Off, AlertCircle, RefreshCw } from 'lucide-react';
import { servicePageStyles, serviceCardStyles } from '../../assets/dummyStyles';

const PlaceholderImg = "/placeholder-service.jpg";
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const ServiceCard = ({ service }) => {
  const hasSrcSet =
    !!service.imageSrcSet ||
    (!!service.imageSmall && !!service.imageMedium && !!service.imageLarge);

  const src = service.imageUrl || service.image || service.imageSmall || "";
  const srcSet =
    service.imageSrcSet ||
    (service.imageSmall || service.image
      ? `${service.imageSmall || src} 480w, ${
          service.imageMedium || src
        } 768w, ${service.imageLarge || src} 1200w`
      : null);

  const name = service.name || "Service";

  return (
    <div className={serviceCardStyles.card}>
      <div className={serviceCardStyles.imageContainer} aria-hidden="true">
        {hasSrcSet ? (
          <picture className={serviceCardStyles.picture}>
            {service.imageWebp && (
              <source srcSet={service.imageWebp} type="image/webp" />
            )}
            {service.imageSrcSet ? (
              <img
                src={src || PlaceholderImg}
                srcSet={service.imageSrcSet}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                alt={name}
                loading="lazy"
                decoding="async"
                className={serviceCardStyles.responsiveImage}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = PlaceholderImg;
                }}
              />
            ) : (
              <img
                src={src || PlaceholderImg}
                srcSet={srcSet || undefined}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                alt={name}
                loading="lazy"
                decoding="async"
                className={serviceCardStyles.responsiveImage}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = PlaceholderImg;
                }}
              />
            )}
          </picture>
        ) : (
          <img
            src={src || PlaceholderImg}
            alt={name}
            loading="lazy"
            decoding="async"
            className={serviceCardStyles.fallbackImage}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = PlaceholderImg;
            }}
          />
        )}
      </div>

      <div className={serviceCardStyles.content}>
        <h3 className={serviceCardStyles.serviceName}>{name}</h3>

        <div className={serviceCardStyles.buttonContainer}>
          {service.available ? (
            <Link
              to={`/services/${service.id}`}
              state={{ service: service.raw || service }}
              className={serviceCardStyles.buttonAvailable}
              aria-label={`Book ${name}`}
            >
              <ChevronsRight className="w-5 h-5" aria-hidden="true" />
              Book Now
            </Link>
          ) : (
            <button
              disabled
              className={serviceCardStyles.buttonUnavailable}
              aria-label={`${name} not available`}
            >
              <MousePointer2Off className="w-5 h-5" aria-hidden="true" />
              Not Available
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ServicePage = ({ previewCount, showHeader = true, title, subtitle }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${API_BASE}/api/services`, { signal: controller.signal });
      clearTimeout(timeout);
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setError((json && json.message) || `Server error (${res.status})`);
        setServices([]);
      } else {
        const items = (json && (json.data || json)) || [];
        const normalized = (Array.isArray(items) ? items : []).map((s) => {
          const id = s._id || s.id;
          const image = s.imageUrl || s.image || s.imageSmall || "";
          const available =
            typeof s.available === "boolean"
              ? s.available
              : typeof s.availability === "string"
                ? s.availability.toLowerCase() === "available"
                : s.availability === "Available" || s.available === true;

          return {
            id,
            name: s.name || "Service",
            shortDescription: s.shortDescription || s.about || "",
            image,
            imageSmall: s.imageSmall || null,
            imageMedium: s.imageMedium || null,
            imageLarge: s.imageLarge || null,
            imageSrcSet: s.imageSrcSet || null,
            imageWebp: s.imageWebp || null,
            price: s.price ?? s.fee ?? 0,
            available,
            raw: s,
          };
        });
        setServices(normalized);
        setError("");
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError("Request timed out. Server may be starting up.");
      } else {
        setError("Could not connect to server.");
      }
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices, retryCount]);

  const shown = previewCount ? services.slice(0, previewCount) : services;

  return (
    <div className={servicePageStyles.pageContainer}>
      <div className={servicePageStyles.maxWidthContainer}>
        {/* Header */}
        {showHeader && (
          <div className={servicePageStyles.header}>
            <h1 className={servicePageStyles.title}>{title || "Medical Checkups & Labs"}</h1>
            <p className={servicePageStyles.subtitle}>
              {subtitle || "Explore our specialized diagnostic services and preventative care checkup packages."}
            </p>
          </div>
        )}

        {/* Loading / Error / Results */}
        {loading ? (
          <div className={servicePageStyles.skeletonGrid}>
            {Array.from({ length: previewCount || 8 }).map((_, idx) => (
              <div key={idx} className={servicePageStyles.skeletonCard}>
                <div className={servicePageStyles.skeletonImage} />
                <div className={servicePageStyles.skeletonText1} />
                <div className={servicePageStyles.skeletonText2} />
                <div className={servicePageStyles.skeletonButton} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '10px',
            padding: '14px 18px', margin: '16px 0', fontSize: '13px', color: '#7b6000'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>Services are temporarily unavailable — the server may be starting up.</span>
            <button
              onClick={() => setRetryCount(c => c + 1)}
              style={{
                marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px',
                background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px',
                padding: '5px 12px', cursor: 'pointer', fontWeight: 600, fontSize: '12px', whiteSpace: 'nowrap'
              }}
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        ) : (
          <>
            <div className={servicePageStyles.servicesGrid}>
              {shown.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            {previewCount && services.length > previewCount && (
              <div className="flex justify-center mt-8">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold shadow-md transition-all duration-300 hover:shadow-lg"
                >
                  View All Services &rarr;
                </Link>
              </div>
            )}

            {shown.length === 0 && (
              <div className={servicePageStyles.emptyState}>
                No medical services are currently available.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ServicePage;
export { ServiceCard };
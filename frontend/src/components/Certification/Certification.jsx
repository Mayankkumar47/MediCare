import React from 'react';
import C1 from "../../assets/C1.png";
import C2 from "../../assets/C2.png";
import C3 from "../../assets/C3.png";
import C4 from "../../assets/C4.svg";
import C5 from "../../assets/C5.png";
import C6 from "../../assets/C6.png";
import C7 from "../../assets/C7.svg";
import { certificationStyles } from '../../assets/dummyStyles';

const certifications = [
  { id: 1, name: "Medical Commission", image: C1, type: "international" },
  { id: 2, name: "Government Approved", image: C2, type: "government" },
  { id: 3, name: "NABH Accredited", image: C3, alt: "NABH Accreditation", type: "healthcare" },
  { id: 4, name: "Medical Council", image: C4, type: "government" },
  { id: 5, name: "Quality Healthcare", image: C5, alt: "Quality Healthcare", type: "healthcare" },
  { id: 6, name: "Paramedical Council", image: C6, alt: "Patient Safety", type: "healthcare" },
  { id: 7, name: "Ministry of Health", image: C7, alt: "Ministry of Health", type: "government" }
];

const duplicatedCertifications = [...certifications, ...certifications, ...certifications];

const Certification = () => {
  return (
    <section className={certificationStyles.container}>
      {/* Background decorations */}
      <div className={certificationStyles.backgroundGrid}>
        <div className={certificationStyles.topLine} />
        <div className={certificationStyles.gridContainer}>
          <div className={certificationStyles.grid}>
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className={certificationStyles.gridCell} />
            ))}
          </div>
        </div>
      </div>

      <div className={certificationStyles.contentWrapper}>
        {/* Section Header */}
        <div className={certificationStyles.headingContainer}>
          <div className={certificationStyles.headingInner}>
            <div className={certificationStyles.leftLine} />
            <h2 className={certificationStyles.title}>
              <span className={certificationStyles.titleText}>Accreditation & Partners</span>
            </h2>
            <div className={certificationStyles.rightLine} />
          </div>
          <p className={certificationStyles.subtitle}>
            Our medical facilities and doctors are certified by national and international healthcare bodies to ensure safety and quality care.
          </p>

          <div className={certificationStyles.badgeContainer}>
            <div className={certificationStyles.badgeDot} />
            <span className={certificationStyles.badgeText}>100% Verified Certifications</span>
          </div>
        </div>

        {/* Marquee Logos Carousel */}
        <div className={certificationStyles.logosContainer}>
          <div className={certificationStyles.logosInner}>
            <div className={certificationStyles.logosFlexContainer}>
              <div className={certificationStyles.logosMarquee}>
                {duplicatedCertifications.map((cert, index) => (
                  <div key={`${cert.id}-${index}`} className={certificationStyles.logoItem}>
                    <img
                      src={cert.image}
                      alt={cert.alt || cert.name}
                      className={certificationStyles.logoImage}
                    />
                    <span className={certificationStyles.logoText}>{cert.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: certificationStyles.animationStyles }} />
    </section>
  );
};

export default Certification;
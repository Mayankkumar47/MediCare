import React from "react";
import logo from "../../assets/logo.png";
import { heroStyles as s } from "../../assets/dummyStyles";

export default function Hero({ isDoctor = false }) {
  const heading = isDoctor ? "Welcome to Your Doctor Portal" : "MediCare Administrative Control Center";
  const description = isDoctor 
    ? "Access your patient records, manage appointments, and review medical reports securely from your dashboard."
    : "Manage hospital operations, doctors, staff, patient records, and system settings from a centralized control panel.";

  return (
    <div className={s.decorativeBg.container}>
      <div className={s.decorativeBg.blurBackground}>
        <div className={s.decorativeBg.blurShape}></div>
      </div>

      <div className={s.contentBox}>
        <div className={s.logoContainer}>
          <img src={logo} alt="MediCare Logo" className={s.logo} />
        </div>

        <h1 className={s.heading}>{heading}</h1>
        <p className={s.description}>{description}</p>

        <div className={s.infoCards.container}>
          <div className={s.infoCards.card}>
            <h4 className={s.infoCards.cardTitle}>Real-time Bookings</h4>
            <p className={s.infoCards.cardText}>Track calendar slots, reschedule conflicts, and handle cancel requests instantly.</p>
          </div>

          <div className={s.infoCards.card}>
            <h4 className={s.infoCards.cardTitle}>Department Metrics</h4>
            <p className={s.infoCards.cardText}>Review statistics across general consulting, cardiology, pediatrics, and more.</p>
          </div>

          <div className={s.infoCards.card}>
            <h4 className={s.infoCards.cardTitle}>Secure Patient Data</h4>
            <p className={s.infoCards.cardText}>All medical reports and profiles are encrypted and accessible only to authorized staff.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useRef, useState, useEffect, useCallback, useLayoutEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, UserPlus, Users, Calendar, Grid, PlusSquare, List, Menu, X, LogOut } from "lucide-react";
import { navbarStyles as ns } from "../../assets/dummyStyles";
import logo from "../../assets/logo.png";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const navInnerRef = useRef(null);
  const indicatorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const moveIndicator = useCallback(() => {
    const container = navInnerRef.current;
    const ind = indicatorRef.current;
    if (!container || !ind) return;

    const active = container.querySelector(".nav-item.active");
    if (!active) {
      ind.style.opacity = "0";
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();

    const left = activeRect.left - containerRect.left + container.scrollLeft;
    const width = activeRect.width;

    ind.style.transform = `translateX(${left}px)`;
    ind.style.width = `${width}px`;
    ind.style.opacity = "1";
  }, []);

  useLayoutEffect(() => {
    moveIndicator();
    const t = setTimeout(() => {
      moveIndicator();
    }, 120);
    return () => clearTimeout(t);
  }, [location.pathname, moveIndicator]);

  useEffect(() => {
    const container = navInnerRef.current;
    if (!container) return;

    const onScroll = () => {
      moveIndicator();
    };
    container.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      moveIndicator();
    });
    ro.observe(container);
    if (container.parentElement) ro.observe(container.parentElement);

    window.addEventListener("resize", moveIndicator);

    moveIndicator();

    return () => {
      container.removeEventListener("scroll", onScroll);
      ro.disconnect();
      window.removeEventListener("resize", moveIndicator);
    };
  }, [moveIndicator]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const CenterNavItem = ({ to, label, icon }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`nav-item ${ns.centerNavItemBase} ${
          isActive ? `active ${ns.centerNavItemActive}` : ns.centerNavItemInactive
        }`}
      >
        <span className="flex items-center gap-1.5 font-medium">
          {icon}
          {label}
        </span>
      </Link>
    );
  };

  const MobileItem = ({ to, label, icon, onClick }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`${ns.mobileItemBase} ${
          isActive ? ns.mobileItemActive : ns.mobileItemInactive
        }`}
      >
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <header className={ns.header + " border-b border-emerald-100 bg-white"}>
      <div className={ns.navContainer}>
        <div className={ns.flexContainer}>
          {/* Logo */}
          <Link to="/" className={ns.logoContainer}>
            <img src={logo} alt="Medicare Logo" className={ns.logoImage} />
            <div>
              <span className={ns.logoLink}>MediCare Admin</span>
              <span className={ns.logoSubtext}>Control Center</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className={ns.centerNavContainer}>
            <div className={ns.glowEffect}>
              <div className={ns.centerNavInner}>
                <div
                  ref={navInnerRef}
                  tabIndex={0}
                  className={ns.centerNavScrollContainer}
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  <CenterNavItem
                    to="/h"
                    label="Dashboard"
                    icon={<Home size={16} />}
                  />
                  <CenterNavItem
                    to="/add"
                    label="Add Doctor"
                    icon={<UserPlus size={16} />}
                  />
                  <CenterNavItem
                    to="/list"
                    label="List Doctors"
                    icon={<Users size={16} />}
                  />
                  <CenterNavItem
                    to="/appointments"
                    label="Appointments"
                    icon={<Calendar size={16} />}
                  />
                  <CenterNavItem
                    to="/service-dashboard"
                    label="Service Stats"
                    icon={<Grid size={16} />}
                  />
                  <CenterNavItem
                    to="/add-service"
                    label="Add Service"
                    icon={<PlusSquare size={16} />}
                  />
                  <CenterNavItem
                    to="/list-service"
                    label="List Services"
                    icon={<List size={16} />}
                  />
                  <CenterNavItem
                    to="/service-appointments"
                    label="Service Bookings"
                    icon={<Calendar size={16} />}
                  />
                  
                  {/* Sliding Indicator */}
                  <div ref={indicatorRef} className={ns.indicator} />
                </div>
              </div>
            </div>
          </nav>

          {/* Exit / Return */}
          <div className={ns.rightContainer}>
            <button
              onClick={() => {
                // Return to main client site
                window.location.href = "http://localhost:5173";
              }}
              className={ns.signOutButton}
            >
              <LogOut size={16} /> Exit Panel
            </button>

            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setOpen(!open)}
              className={ns.mobileMenuButton}
              aria-label="Toggle Navigation Menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay & Drawer */}
        {open && (
          <>
            <div className={ns.mobileOverlay} onClick={() => setOpen(false)} />
            <div className={ns.mobileMenuContainer}>
              <div className={ns.mobileMenuInner}>
                <MobileItem
                  to="/h"
                  label="Dashboard"
                  icon={<Home size={16} />}
                  onClick={() => setOpen(false)}
                />
                <MobileItem
                  to="/add"
                  label="Add Doctor"
                  icon={<UserPlus size={16} />}
                  onClick={() => setOpen(false)}
                />
                <MobileItem
                  to="/list"
                  label="List Doctors"
                  icon={<Users size={16} />}
                  onClick={() => setOpen(false)}
                />
                <MobileItem
                  to="/appointments"
                  label="Appointments"
                  icon={<Calendar size={16} />}
                  onClick={() => setOpen(false)}
                />
                <MobileItem
                  to="/service-dashboard"
                  label="Service Dashboard"
                  icon={<Grid size={16} />}
                  onClick={() => setOpen(false)}
                />
                <MobileItem
                  to="/add-service"
                  label="Add Service"
                  icon={<PlusSquare size={16} />}
                  onClick={() => setOpen(false)}
                />
                <MobileItem
                  to="/list-service"
                  label="List Services"
                  icon={<List size={16} />}
                  onClick={() => setOpen(false)}
                />
                <MobileItem
                  to="/service-appointments"
                  label="Service Appointments"
                  icon={<Calendar size={16} />}
                  onClick={() => setOpen(false)}
                />
                <div className={ns.mobileAuthContainer}>
                  <button
                    onClick={() => {
                      window.location.href = "http://localhost:5173";
                    }}
                    className={ns.mobileSignOutButton}
                  >
                    Exit Panel
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

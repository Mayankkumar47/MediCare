import React, { useRef, useState, useEffect } from "react";
import { navbarStyles } from "../../assets/dummyStyles";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useClerk, UserButton, useAuth } from "@clerk/clerk-react";
import { Menu, X, LogIn, ShieldAlert, Award } from "lucide-react";
import logo from "../../assets/logo.png";

const STORAGE_KEY = "doctorToken_v1";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { isSignedIn } = useAuth();
  
  const [isDoctorLoggedIn, setIsDoctorLoggedIn] = useState(() => {
    try {
      return Boolean(localStorage.getItem(STORAGE_KEY));
    } catch {
      return false;
    }
  });

  const location = useLocation();
  const navigate = useNavigate();
  const clerk = useClerk();

  // Scroll header visibility effect
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNavbar(false); // Hide on scroll down
      } else {
        setShowNavbar(true); // Show on scroll up
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Listen to doctor storage changes
  useEffect(() => {
    const checkAuth = () => {
      setIsDoctorLoggedIn(Boolean(localStorage.getItem(STORAGE_KEY)));
    };
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Doctors", href: "/doctors" },
    { label: "Services", href: "/services" },
    { label: "Appointments", href: "/appointments" },
    { label: "Contact", href: "/contact" },
  ];

  const handleLoginClick = () => {
    clerk.openSignIn({
      afterSignInUrl: "/",
    });
  };

  const checkIsActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleDoctorPortalRedirect = () => {
    // Navigate to doctor admin login or decode token if exists
    const token = localStorage.getItem(STORAGE_KEY);
    if (token) {
      // Decode simple doctor ID from JWT if possible, or direct to login to be safe.
      // Alternatively, let's redirect to doctor-admin dashboard.
      // We will parse doctorId from token payload if possible:
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const docId = payload.id || payload._id || payload.doctorId;
        if (docId) {
          navigate(`/doctor-admin/${docId}`);
          return;
        }
      } catch (e) {
        console.warn("Could not decode doctor ID from token:", e);
      }
    }
    navigate("/doctor-admin/login");
  };

  return (
    <>
      <nav
        className={`${navbarStyles.navbarContainer} ${
          showNavbar ? navbarStyles.navbarVisible : navbarStyles.navbarHidden
        }`}
      >
        <div className={navbarStyles.contentWrapper}>
          <div className={navbarStyles.flexContainer}>
            
            {/* Logo Link */}
            <Link to="/" className={navbarStyles.logoLink}>
              <div className={navbarStyles.logoContainer}>
                <div className={navbarStyles.logoImageWrapper}>
                  <img
                    src={logo}
                    alt="MediCare Logo"
                    className={navbarStyles.logoImage}
                  />
                </div>
              </div>
              <div className={navbarStyles.logoTextContainer}>
                <h1 className={navbarStyles.logoTitle}>MediCare</h1>
                <p className={navbarStyles.logoSubtitle}>HealthCare Solutions</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className={navbarStyles.desktopNav}>
              <div className={navbarStyles.navItemsContainer}>
                {navItems.map((item) => {
                  const active = checkIsActive(item.href);
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      className={`${navbarStyles.navItem} ${
                        active ? navbarStyles.navItemActive : navbarStyles.navItemInactive
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Side Buttons */}
            <div className={navbarStyles.rightContainer}>
              {/* Doctor Portal Access */}
              <button 
                onClick={handleDoctorPortalRedirect} 
                className={navbarStyles.doctorAdminButton}
              >
                <ShieldAlert className={navbarStyles.doctorAdminIcon} />
                <span className={navbarStyles.doctorAdminText}>
                  {isDoctorLoggedIn ? "Doctor Portal" : "Doctor Login"}
                </span>
              </button>

              {/* User Authentication Sign In / Profile */}
              {isSignedIn ? (
                <div className="flex items-center gap-2">
                  <UserButton afterSignOutUrl="/" />
                </div>
              ) : (
                <button onClick={handleLoginClick} className={navbarStyles.loginButton}>
                  <LogIn className={navbarStyles.loginIcon} />
                  <span>Login / Register</span>
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={navbarStyles.mobileToggle}
                aria-label="Toggle Menu"
              >
                {isOpen ? (
                  <X className={navbarStyles.toggleIcon} />
                ) : (
                  <Menu className={navbarStyles.toggleIcon} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Border Gradient */}
        <div className={navbarStyles.navbarBorder} />

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className={navbarStyles.mobileMenu}>
            {navItems.map((item) => {
              const active = checkIsActive(item.href);
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`${navbarStyles.mobileMenuItem} ${
                    active ? navbarStyles.mobileMenuItemActive : navbarStyles.mobileMenuItemInactive
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Mobile Actions */}
            <div className="pt-4 border-t border-emerald-100 flex flex-col gap-2 px-4">
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleDoctorPortalRedirect();
                }}
                className={navbarStyles.mobileDoctorAdminButton}
              >
                <ShieldAlert size={16} />
                <span>{isDoctorLoggedIn ? "Doctor Dashboard" : "Doctor Portal"}</span>
              </button>

              {!isSignedIn && (
                <div className={navbarStyles.mobileLoginContainer}>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLoginClick();
                    }}
                    className={navbarStyles.mobileLoginButton}
                  >
                    <LogIn size={16} />
                    <span>Login / Register</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <style dangerouslySetInnerHTML={{ __html: navbarStyles.animationStyles }} />
    </>
  );
};

export default Navbar;

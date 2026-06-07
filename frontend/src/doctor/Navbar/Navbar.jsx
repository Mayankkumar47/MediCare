import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Home, Calendar, Edit, LogOut, Menu, X } from 'lucide-react';
import { navbarStylesDr } from '../../assets/dummyStyles';
import logo from '../../assets/logo.png';

const STORAGE_KEY = "doctorToken_v1";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const doctorId = useMemo(() => {
    if (params?.id) return params.id;
    const m = location.pathname.match(/\/doctor-admin\/([^/]+)/);
    if (m) return m[1];
    return null;
  }, [params, location.pathname]);

  const basePath = doctorId
    ? `/doctor-admin/${doctorId}`
    : "/doctor-admin/login";

  const navItems = [
    { name: "Dashboard", to: `${basePath}`, Icon: Home },
    { name: "Appointments", to: `${basePath}/appointments`, Icon: Calendar },
    { name: "Edit Profile", to: `${basePath}/profile/edit`, Icon: Edit },
  ];

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(
      new StorageEvent("storage", { key: STORAGE_KEY, newValue: null }),
    );
    navigate("/");
  };

  const checkIsActive = (path) => {
    if (path === basePath) {
      return location.pathname === basePath;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <div className={navbarStylesDr.navContainer}>
        {/* Left Brand */}
        <div className={navbarStylesDr.leftBrand}>
          <div className={navbarStylesDr.logoContainer}>
            <img src={logo} alt="Logo" className={navbarStylesDr.logoImage} />
          </div>
          <div className={navbarStylesDr.brandTextContainer}>
            <h1 className={navbarStylesDr.brandTitle}>MediCare</h1>
            <p className={navbarStylesDr.brandSubtitle}>Doctor Portal</p>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className={navbarStylesDr.desktopMenu}>
          <div className={navbarStylesDr.desktopMenuItems}>
            {navItems.map((item) => {
              const active = checkIsActive(item.to);
              return (
                <Link
                  key={item.name}
                  to={item.to}
                  className={`${navbarStylesDr.baseLink} ${
                    active ? navbarStylesDr.activeLink : navbarStylesDr.inactiveLink
                  }`}
                >
                  <div className={navbarStylesDr.linkContent}>
                    <item.Icon className={navbarStylesDr.linkIcon} size={16} />
                    <span className={navbarStylesDr.linkText}>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className={navbarStylesDr.rightActions}>
          <button onClick={handleLogout} className={navbarStylesDr.logoutButtonDesktop}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>

          {/* Hamburger Menu Toggles */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`${navbarStylesDr.hamburgerButtonMd} ${navbarStylesDr.hamburgerButtonLg}`}
          >
            {isOpen ? <X size={24} className="text-emerald-700" /> : <Menu size={24} className="text-emerald-700" />}
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Menu */}
      <div className={navbarStylesDr.mobileMenuContainer(isOpen)}>
        <div className={navbarStylesDr.mobileMenuContent}>
          {navItems.map((item) => {
            const active = checkIsActive(item.to);
            return (
              <Link
                key={item.name}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={`${navbarStylesDr.mobileBaseLink} ${
                  active ? navbarStylesDr.mobileActiveLink : navbarStylesDr.mobileInactiveLink
                }`}
              >
                <item.Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className={navbarStylesDr.mobileLogoutButton}
          >
            <div className={navbarStylesDr.mobileLogoutContent}>
              <LogOut size={18} />
              <span>Logout</span>
            </div>
          </button>
        </div>
      </div>

      {/* Spacer */}
      <div className={navbarStylesDr.spacer} />
    </>
  );
};

export default Navbar;
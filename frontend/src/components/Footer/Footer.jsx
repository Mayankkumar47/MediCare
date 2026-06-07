import React from 'react';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Send, 
  Stethoscope, 
  Activity, 
  MapPin, 
  Phone, 
  Mail 
} from 'lucide-react';
import { footerStyles } from '../../assets/dummyStyles';
import logo from '../../assets/logo.png';

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Doctors", href: "/doctors" },
  { name: "Services", href: "/services" },
  { name: "Contact", href: "/contact" },
  { name: "Appointments", href: "/appointments" },
];

const services = [
  { name: "Blood Pressure Check", href: "/services" },
  { name: "Blood Sugar Test", href: "/services" },
  { name: "Full Blood Count", href: "/services" },
  { name: "X-Ray Scan", href: "/services" },
  { name: "Blood Sugar Test", href: "/services" },
];

const socialLinks = [
  {
    Icon: Facebook,
    color: footerStyles.facebookColor,
    name: "Facebook",
    href: "https://www.facebook.com/people/Hexagon-Digital-Services/61567156598660/",
  },
  {
    Icon: Twitter,
    color: footerStyles.twitterColor,
    name: "Twitter",
    href: "https://www.linkedin.com/company/hexagondigtial-services/",
  },
  {
    Icon: Instagram,
    color: footerStyles.instagramColor,
    name: "Instagram",
    href: "http://instagram.com/hexagondigitalservices?igsh=MWp2NG1oNTlibWVnZA%3D%3D",
  },
  {
    Icon: Linkedin,
    color: footerStyles.linkedinColor,
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/hexagondigtial-services/",
  },
  {
    Icon: Youtube,
    color: footerStyles.youtubeColor,
    name: "YouTube",
    href: "https://youtube.com/@hexagondigitalservices?si=lxEFYNCP42t6AoDJ",
  },
];

const Footer = () => {
  return (
    <footer className={footerStyles.footerContainer}>
      {/* Floating background icons */}
      <div className={footerStyles.floatingIcon1}>
        <Stethoscope className={footerStyles.stethoscopeIcon} />
      </div>
      <div className={footerStyles.floatingIcon2}>
        <Activity className={footerStyles.activityIcon} />
      </div>

      <div className={footerStyles.mainContent}>
        <div className={footerStyles.gridContainer}>
          {/* Company section */}
          <div className={footerStyles.companySection}>
            <div className={footerStyles.logoContainer}>
              <div className={footerStyles.logoWrapper}>
                <div className={footerStyles.logoImageContainer}>
                  <img src={logo} alt="Logo" className={footerStyles.logoImage} />
                </div>
              </div>
              <div>
                <h2 className={footerStyles.companyName}>MediCare</h2>
                <p className={footerStyles.companyTagline}>Healthcare Solutions</p>
              </div>
            </div>
            <p className={footerStyles.companyDescription}>
              Providing world-class healthcare with care, compassion, and professional excellence.
            </p>
            <div className={footerStyles.contactContainer}>
              <div className={footerStyles.contactItem}>
                <div className={footerStyles.contactIconWrapper}>
                  <MapPin className={footerStyles.contactIcon} />
                </div>
                <span className={footerStyles.contactText}>Gomti Nagar, Lucknow, UP</span>
              </div>
              <div className={footerStyles.contactItem}>
                <div className={footerStyles.contactIconWrapper}>
                  <Phone className={footerStyles.contactIcon} />
                </div>
                <span className={footerStyles.contactText}>+91 8299431275</span>
              </div>
              <div className={footerStyles.contactItem}>
                <div className={footerStyles.contactIconWrapper}>
                  <Mail className={footerStyles.contactIcon} />
                </div>
                <span className={footerStyles.contactText}>info@hexagon.digital</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className={footerStyles.linksSection}>
            <h3 className={footerStyles.sectionTitle}>Quick Links</h3>
            <ul className={footerStyles.linksList}>
              {quickLinks.map((link) => (
                <li key={link.name} className={footerStyles.linkItem}>
                  <a href={link.href} className={footerStyles.quickLink}>
                    <div className={footerStyles.quickLinkIconWrapper}>
                      <Activity className={footerStyles.quickLinkIcon} />
                    </div>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div className={footerStyles.linksSection}>
            <h3 className={footerStyles.sectionTitle}>Our Services</h3>
            <ul className={footerStyles.linksList}>
              {services.map((svc, i) => (
                <li key={i} className={footerStyles.linkItem}>
                  <a href={svc.href} className={footerStyles.serviceLink}>
                    <div className={footerStyles.serviceIcon} />
                    {svc.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div className={footerStyles.newsletterSection}>
            <h3 className={footerStyles.newsletterTitle}>Stay Connected</h3>
            <p className={footerStyles.newsletterDescription}>
              Subscribe for health tips, medical updates, and wellness insights delivered to your inbox.
            </p>

            <div className={footerStyles.newsletterForm}>
              {/* Mobile newsletter */}
              <div className={footerStyles.mobileNewsletterContainer}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={footerStyles.emailInput}
                />
                <button className={footerStyles.mobileSubscribeButton}>
                  <Send className={footerStyles.mobileButtonIcon} />
                  Subscribe
                </button>
              </div>

              {/* Desktop newsletter */}
              <div className={footerStyles.desktopNewsletterContainer}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={footerStyles.desktopEmailInput}
                />
                <button className={footerStyles.desktopSubscribeButton}>
                  <Send className={footerStyles.desktopButtonIcon} />
                  <span className={footerStyles.desktopButtonText}>Subscribe</span>
                </button>
              </div>

              {/* Social icons */}
              <div className={footerStyles.socialContainer}>
                {socialLinks.map(({ Icon, color, name, href }, index) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={footerStyles.socialLink}
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    <div className={footerStyles.socialIconBackground} />
                    <Icon className={`${footerStyles.socialIcon} ${color}`} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright section */}
        <div className={footerStyles.bottomSection}>
          <p className={footerStyles.copyright}>
            &copy; {new Date().getFullYear()} MediCare. All rights reserved.
          </p>
          <p className={footerStyles.designerText}>
            Designed with ♥ by{' '}
            <a 
              href="https://hexagondigitalservices.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={footerStyles.designerLink}
            >
              Hexagon Digital Services
            </a>
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: footerStyles.animationStyles }} />
    </footer>
  );
};

export default Footer;

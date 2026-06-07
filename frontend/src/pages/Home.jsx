import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, 
  Star, 
  HeartPulse, 
  ShieldCheck, 
  Video, 
  Activity, 
  Calendar, 
  PhoneCall 
} from 'lucide-react';
import { bannerStyles } from '../assets/dummyStyles';
import BannerImg from '../assets/BannerImg.png';
import Certification from '../components/Certification/Certification';
import ServicePage from '../components/ServicePage/ServicePage';
import HomeDoctors from '../components/HomeDoctors/HomeDoctors';
import Testimonial from '../components/Testimonial/Testimonial';

const Home = () => {
  return (
    <div className="overflow-hidden">
      {/* Premium Hero Banner Section */}
      <section className={bannerStyles.bannerContainer}>
        <div className={bannerStyles.mainContainer}>
          {/* Animated Border Effects */}
          <div className={bannerStyles.borderOutline}>
            <div className={bannerStyles.outerAnimatedBand} />
            <div className={bannerStyles.innerWhiteBorder} />
          </div>

          <div className={bannerStyles.contentContainer}>
            <div className={bannerStyles.flexContainer}>
              
              {/* Left Text Content */}
              <div className={bannerStyles.leftContent}>
                <div className={bannerStyles.headerBadgeContainer}>
                  <div className={bannerStyles.stethoscopeContainer}>
                    <div className={bannerStyles.stethoscopeInner}>
                      <Stethoscope className={bannerStyles.stethoscopeIcon} />
                    </div>
                  </div>
                  <div>
                    <h2 className={bannerStyles.titleContainer}>
                      <span className={bannerStyles.titleGradient}>MediCare Solutions</span>
                    </h2>
                    <div className={bannerStyles.starsContainer}>
                      <div className={bannerStyles.starsInner}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={bannerStyles.starIcon} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-2 font-medium">Trusted by 10k+ Patients</span>
                    </div>
                  </div>
                </div>

                <h1 className={bannerStyles.title}>
                  Your Health, <br />
                  <span className={bannerStyles.titleGradient}>Our Absolute Priority</span>
                </h1>
                <p className={bannerStyles.tagline}>
                  Consult with expert doctors and book verified diagnostic lab tests online <span className={bannerStyles.taglineHighlight}>anytime, anywhere</span>.
                </p>

                {/* Features Grid */}
                <div className={bannerStyles.featuresGrid}>
                  <div className={`${bannerStyles.featureItem} ${bannerStyles.featureBorderGreen}`}>
                    <HeartPulse className={bannerStyles.featureIcon} />
                    <span className={bannerStyles.featureText}>Verified Doctors</span>
                  </div>
                  <div className={`${bannerStyles.featureItem} ${bannerStyles.featureBorderGreen}`}>
                    <ShieldCheck className={bannerStyles.featureIcon} />
                    <span className={bannerStyles.featureText}>Safe Lab Reports</span>
                  </div>
                  <div className={`${bannerStyles.featureItem} ${bannerStyles.featureBorderGreen}`}>
                    <Video className={bannerStyles.featureIcon} />
                    <span className={bannerStyles.featureText}>Video Consultation</span>
                  </div>
                  <div className={`${bannerStyles.featureItem} ${bannerStyles.featureBorderGreen}`}>
                    <Activity className={bannerStyles.featureIcon} />
                    <span className={bannerStyles.featureText}>24/7 Care Services</span>
                  </div>
                </div>

                {/* CTA Action Buttons */}
                <div className={bannerStyles.ctaButtonsContainer}>
                  <Link to="/doctors" className={bannerStyles.bookButton}>
                    <div className={bannerStyles.bookButtonOverlay} />
                    <span className={bannerStyles.bookButtonContent}>
                      <Calendar className={bannerStyles.bookButtonIcon} />
                      Book Doctor Appointment
                    </span>
                  </Link>

                  <a href="tel:+918299431275" className={bannerStyles.emergencyButton}>
                    <span className={bannerStyles.emergencyButtonContent}>
                      <PhoneCall className={bannerStyles.emergencyButtonIcon} />
                      Emergency Call
                    </span>
                  </a>
                </div>
              </div>

              {/* Right Illustration Section */}
              <div className={bannerStyles.rightImageSection}>
                <div className={bannerStyles.imageContainer}>
                  <div className={bannerStyles.imageFrame}>
                    <img 
                      src={BannerImg} 
                      alt="Healthcare professional illustration" 
                      className={bannerStyles.image}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Certification Scrolling Marquee */}
      <Certification />

      {/* Services Showcase Preview */}
      <div className="py-8 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold text-emerald-900">Lab Tests & Services</h2>
          <Link to="/services" className="text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1 text-sm">
            View All Services &rarr;
          </Link>
        </div>
        <ServicePage previewCount={4} />
      </div>

      {/* Top Doctors Showcase Preview */}
      <div className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold text-emerald-900">Featured Specialists</h2>
          <Link to="/doctors" className="text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1 text-sm">
            Find All Doctors &rarr;
          </Link>
        </div>
        <HomeDoctors previewCount={4} />
      </div>

      {/* Testimonials */}
      <Testimonial />
    </div>
  );
};

export default Home;

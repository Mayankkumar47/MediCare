import React, { useRef, useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { testimonialStyles } from '../../assets/dummyStyles';

const testimonials = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    role: "Cardiologist",
    rating: 5,
    text: "The appointment booking system is incredibly efficient. It saves me valuable time and helps me focus on patient care.",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
    type: "doctor",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Patient",
    rating: 5,
    text: "Scheduling appointments has never been easier. The interface is intuitive and reminders are very helpful!",
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
    type: "patient",
  },
  {
    id: 3,
    name: "Dr. Robert Martinez",
    role: "Pediatrician",
    rating: 4,
    text: "This platform has streamlined our clinic operations significantly. Patient management is much more organized.",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
    type: "doctor",
  },
  {
    id: 4,
    name: "Emily Williams",
    role: "Patient",
    rating: 5,
    text: "Booking appointments online 24/7 is a game-changer. The confirmation system gives me peace of mind.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    type: "patient",
  },
  {
    id: 5,
    name: "Dr. Amanda Lee",
    role: "Dermatologist",
    rating: 5,
    text: "Excellent platform for managing appointments. Automated reminders reduce no-shows dramatically.",
    image: "https://images.unsplash.com/photo-1594824813573-246434e33963?auto=format&fit=crop&w=400&q=80",
    type: "doctor",
  },
  {
    id: 6,
    name: "David Thompson",
    role: "Patient",
    rating: 5,
    text: "The wait time has reduced significantly since using this platform. Very convenient and user-friendly!",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    type: "patient",
  },
];

const Testimonial = () => {
  const scrollRefLeft = useRef(null);
  const scrollRefRight = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const leftTestimonials = testimonials.filter((t) => t.type === "doctor");
  const rightTestimonials = testimonials.filter((t) => t.type === "patient");

  // Duplicate the arrays for continuous scrolling
  const leftTestimonialsDuplicated = [...leftTestimonials, ...leftTestimonials, ...leftTestimonials];
  const rightTestimonialsDuplicated = [...rightTestimonials, ...rightTestimonials, ...rightTestimonials];

  useEffect(() => {
    const scrollLeft = scrollRefLeft.current;
    const scrollRight = scrollRefRight.current;
    if (!scrollLeft || !scrollRight) return;

    let scrollSpeed = 0.5; // animation speed
    let rafId;

    const smoothScroll = () => {
      if (!isPaused) {
        scrollLeft.scrollTop += scrollSpeed;
        scrollRight.scrollTop -= scrollSpeed;

        // seamless infinite loop
        if (scrollLeft.scrollTop >= scrollLeft.scrollHeight / 3) {
          scrollLeft.scrollTop = 0;
        }
        if (scrollRight.scrollTop <= 0) {
          scrollRight.scrollTop = scrollRight.scrollHeight / 3;
        }
      }
      rafId = requestAnimationFrame(smoothScroll);
    };

    rafId = requestAnimationFrame(smoothScroll);
    return () => cancelAnimationFrame(rafId);
  }, [isPaused]);

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={
          i < rating
            ? testimonialStyles.activeStar
            : testimonialStyles.inactiveStar
        }
      >
        <Star className={testimonialStyles.star} fill="currentColor" />
      </span>
    ));

  const TestimonialCard = ({ testimonial, direction }) => (
    <div
      className={`${testimonialStyles.testimonialCard} ${
        direction === "left"
          ? testimonialStyles.leftCardBorder
          : testimonialStyles.rightCardBorder
      }`}
    >
      <div className={testimonialStyles.cardContent}>
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className={testimonialStyles.avatar}
        />
        <div className={testimonialStyles.textContainer}>
          <div className={testimonialStyles.nameRoleContainer}>
            <div>
              <h4
                className={`${testimonialStyles.name} ${
                  direction === "left"
                    ? testimonialStyles.leftName
                    : testimonialStyles.rightName
                }`}
              >
                {testimonial.name}
              </h4>
              <p className={testimonialStyles.role}>{testimonial.role}</p>
            </div>
            <div className={testimonialStyles.starsContainer}>
              {renderStars(testimonial.rating)}
            </div>
          </div>

          <p className={testimonialStyles.quote}>"{testimonial.text}"</p>

          {/* Stars on small screens beneath text */}
          <div className={testimonialStyles.mobileStarsContainer}>
            {renderStars(testimonial.rating)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className={testimonialStyles.container}>
      <div className={testimonialStyles.headerContainer}>
        <h2 className={testimonialStyles.title}>What Our Community Says</h2>
        <p className={testimonialStyles.subtitle}>
          Hear from our trusted medical professionals and satisfied patients about their experiences with MediCare.
        </p>
      </div>

      <div 
        className={testimonialStyles.grid}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left Column - Doctors */}
        <div className={`${testimonialStyles.columnContainer} ${testimonialStyles.leftColumnBorder}`}>
          <div className={`${testimonialStyles.columnHeader} ${testimonialStyles.leftColumnHeader}`}>
            Doctor Feedback
          </div>
          <div ref={scrollRefLeft} className={testimonialStyles.scrollContainer}>
            {leftTestimonialsDuplicated.map((t, i) => (
              <TestimonialCard key={`left-${t.id}-${i}`} testimonial={t} direction="left" />
            ))}
          </div>
        </div>

        {/* Right Column - Patients */}
        <div className={`${testimonialStyles.columnContainer} ${testimonialStyles.rightColumnBorder}`}>
          <div className={`${testimonialStyles.columnHeader} ${testimonialStyles.rightColumnHeader}`}>
            Patient Feedback
          </div>
          <div ref={scrollRefRight} className={testimonialStyles.scrollContainer}>
            {rightTestimonialsDuplicated.map((t, i) => (
              <TestimonialCard key={`right-${t.id}-${i}`} testimonial={t} direction="right" />
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: testimonialStyles.animationStyles }} />
    </section>
  );
};

export default Testimonial;
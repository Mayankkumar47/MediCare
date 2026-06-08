import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, User, Building, Briefcase } from 'lucide-react';
import { contactPageStyles } from '../../assets/dummyStyles';

const ContactPage = () => {
  const initial = {
    name: "",
    email: "",
    phone: "",
    department: "",
    service: "",
    message: "",
  };

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const departments = [
    "General Physician",
    "Cardiology",
    "Orthopedics",
    "Dermatology",
    "Pediatrics",
    "Gynecology",
  ];

  const servicesMapping = {
    "General Physician": [
      "General Consultation",
      "Adult Checkup",
      "Vaccination",
      "Health Screening",
    ],
    Cardiology: [
      "ECG",
      "Echocardiography",
      "Stress Test",
      "Heart Consultation",
    ],
    Orthopedics: ["Fracture Care", "Joint Pain Consultation", "Physiotherapy"],
    Dermatology: ["Skin Consultation", "Allergy Test", "Acne Treatment"],
    Pediatrics: ["Child Checkup", "Vaccination (Child)", "Growth Monitoring"],
    Gynecology: ["Antenatal Care", "Pap Smear", "Ultrasound"],
  };

  const genericServices = [
    "General Consultation",
    "ECG",
    "Blood Test",
    "X-Ray",
    "Ultrasound",
    "Physiotherapy",
    "Vaccination",
  ];

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(form.phone))
      e.phone = "Phone number must be exactly 10 digits";

    if (!form.department && !form.service) {
      e.department = "Please choose a department or service";
      e.service = "Please choose a department or service";
    }

    if (!form.message.trim()) e.message = "Please write a short message";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "department") {
      setForm((prev) => ({ ...prev, department: value, service: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => ({ ...prev, [name]: undefined }));

    if (name === "department" || name === "service") {
      setErrors((prev) => {
        const copy = { ...prev };
        if (
          (name === "department" && value) ||
          (name === "service" && value) ||
          form.department ||
          form.service
        ) {
          delete copy.department;
          delete copy.service;
        }
        return copy;
      });
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const text = `*Contact Request*\nName: ${form.name}\nEmail: ${
      form.email
    }\nPhone: ${form.phone}\nDepartment: ${
      form.department || "N/A"
    }\nService: ${form.service || "N/A"}\nMessage: ${form.message}`;

    const url = `https://wa.me/8299431275?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");

    setForm(initial);
    setErrors({});
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  }

  const availableServices = form.department
    ? servicesMapping[form.department] || []
    : genericServices;

  return (
    <div className={contactPageStyles.pageContainer}>
      <div className={contactPageStyles.bgAccent1} />
      <div className={contactPageStyles.bgAccent2} />

      <div className={contactPageStyles.gridContainer}>
        {/* Contact Form */}
        <div className={contactPageStyles.formContainer}>
          <h2 className={contactPageStyles.formTitle}>Get In Touch</h2>
          <p className={contactPageStyles.formSubtitle}>
            Send us a message and we will redirect you to connect on WhatsApp.
          </p>

          <form onSubmit={handleSubmit} className={contactPageStyles.formSpace}>
            <div>
              <label className={contactPageStyles.label}>
                <User size={16} /> Full Name
              </label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={contactPageStyles.input}
              />
              {errors.name && <p className={contactPageStyles.error}>{errors.name}</p>}
            </div>

            <div>
              <label className={contactPageStyles.label}>
                <Mail size={16} /> Email Address
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={contactPageStyles.input}
              />
              {errors.email && <p className={contactPageStyles.error}>{errors.email}</p>}
            </div>

            {/* Phone & Department Grid */}
            <div className={contactPageStyles.formGrid}>
              <div>
                <label className={contactPageStyles.label}>
                  <Phone size={16} /> Phone
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="1234567890"
                  className={contactPageStyles.input}
                  maxLength="10"
                />
                {errors.phone && <p className={contactPageStyles.error}>{errors.phone}</p>}
              </div>

              <div>
                <label className={contactPageStyles.label}>
                  <Building size={16} /> Department
                </label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className={contactPageStyles.input}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {errors.department && <p className={contactPageStyles.error}>{errors.department}</p>}
              </div>
            </div>

            {/* Service Selection */}
            <div>
              <label className={contactPageStyles.label}>
                <Briefcase size={16} /> Service Required
              </label>
              <select
                name="service"
                value={form.service}
                onChange={handleChange}
                className={contactPageStyles.input}
              >
                <option value="">Select Service</option>
                {availableServices.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.service && <p className={contactPageStyles.error}>{errors.service}</p>}
            </div>

            {/* Message Area */}
            <div>
              <label className={contactPageStyles.label}>
                <MessageSquare size={16} /> Your Message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us briefly how we can assist you..."
                rows="4"
                className={contactPageStyles.textarea}
              />
              {errors.message && <p className={contactPageStyles.error}>{errors.message}</p>}
            </div>

            {/* Action Buttons */}
            <div className={contactPageStyles.buttonContainer}>
              <button type="submit" className={contactPageStyles.button}>
                <Send size={16} />
                Send via WhatsApp
              </button>
              {sent && <span className={contactPageStyles.sentMessage}>Opening WhatsApp dispatch...</span>}
            </div>
          </form>
        </div>

        {/* Info & Map Column */}
        <div className={contactPageStyles.infoContainer}>
          {/* Info Card */}
          <div className={contactPageStyles.infoCard}>
            <h3 className={`${contactPageStyles.infoTitle} text-emerald-800`}>Contact Details</h3>
            <p className={`${contactPageStyles.infoText} text-emerald-700 italic`}>
              Feel free to visit our clinic or reach out via phone or email.
            </p>

            <div className={contactPageStyles.infoItem}>
              <MapPin className="text-emerald-600 w-5 h-5" />
              <span>Gomti Nagar, Lucknow, Uttar Pradesh</span>
            </div>
            <div className={contactPageStyles.infoItem}>
              <Phone className="text-emerald-600 w-5 h-5" />
              <span>+91 8299431275</span>
            </div>
            <div className={contactPageStyles.infoItem}>
              <Mail className="text-emerald-600 w-5 h-5" />
              <span>support@medicare.health</span>
            </div>
          </div>

          {/* Map */}
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.460792853461!2d80.98709187529213!3d26.870382662861033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399be2ae3cea2421%3A0x6c0de12e8a77818f!2sGomti%20Nagar%2C%20Lucknow%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1731769000000!5m2!1sen!2sin"
            className={contactPageStyles.map}
            title="Gomti Nagar Map"
            loading="lazy"
            allowFullScreen
          ></iframe>

          {/* Operating Hours */}
          <div className={contactPageStyles.hoursContainer}>
            <h3 className={`${contactPageStyles.hoursTitle} text-emerald-800 flex items-center gap-2`}>
              <Clock size={18} /> Working Hours
            </h3>
            <p className={contactPageStyles.hoursText}>
              Monday - Saturday: <strong>9:00 AM - 8:00 PM</strong>
            </p>
            <p className={contactPageStyles.hoursText}>
              Sunday: <strong>Emergency Consultations Only</strong>
            </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: contactPageStyles.animationKeyframes }} />
    </div>
  );
};

export default ContactPage;
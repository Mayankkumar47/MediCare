import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, Plus, Trash2, Image as ImageIcon, CheckCircle, XCircle } from "lucide-react";
import { addServiceStyles } from "../../assets/dummyStyles";

import API_BASE from '../../api.js';

export default function AddService() {
  const { id: serviceId } = useParams();
  const navigate = useNavigate();

  const fileRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [hasExistingImage, setHasExistingImage] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);

  const [serviceName, setServiceName] = useState("");
  const [about, setAbout] = useState("");
  const [price, setPrice] = useState("");
  const [availability, setAvailability] = useState("available");

  const [instructions, setInstructions] = useState([""]);
  const [slots, setSlots] = useState([]);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDate = today.getDate();

  const years = Array.from({ length: 5 }).map((_, i) => currentYear + i);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const hours = Array.from({ length: 12 }).map((_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const minutes = Array.from({ length: 12 }).map((_, i) =>
    String(i * 5).padStart(2, "0")
  );
  const ampm = ["AM", "PM"];

  const [slotDay, setSlotDay] = useState(String(currentDate));
  const [slotMonth, setSlotMonth] = useState(String(currentMonth));
  const [slotYear, setSlotYear] = useState(String(currentYear));
  const [slotHour, setSlotHour] = useState("11");
  const [slotMinute, setSlotMinute] = useState("00");
  const [slotAmPm, setSlotAmPm] = useState("AM");

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  const selectedYearNum = Number(slotYear);
  const selectedMonthNum = Number(slotMonth);
  const daysInSelectedMonth = new Date(
    selectedYearNum,
    selectedMonthNum + 1,
    0
  ).getDate();
  const days = Array.from({ length: daysInSelectedMonth }).map((_, i) =>
    String(i + 1)
  );

  useEffect(() => {
    if (Number(slotDay) > daysInSelectedMonth) {
      setSlotDay(String(daysInSelectedMonth));
    }
  }, [slotMonth, slotYear, daysInSelectedMonth]); 

  useEffect(() => {
    let mounted = true;
    async function loadService() {
      if (!serviceId) return;
      try {
        const res = await fetch(`${API_BASE}/api/services/${serviceId}`);
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          console.warn("Failed to fetch service:", res.status, txt);
          showToast(
            "error",
            "Load failed",
            "Could not load service for editing."
          );
          return;
        }
        const payload = await res.json().catch(() => null);
        const data = payload?.data || payload;
        if (!data) return;
        if (!mounted) return;

        setServiceName(data.name || "");
        setAbout(data.about || data.description || "");
        setPrice(data.price != null ? String(data.price) : "");
        setAvailability(data.available ? "available" : "unavailable");
        setInstructions(
          Array.isArray(data.instructions) && data.instructions.length
            ? data.instructions
            : [""]
        );
        
        // Normalize slots from map or array
        let flatSlots = [];
        if (data.slots && typeof data.slots === "object" && !Array.isArray(data.slots)) {
          // It's a map: YYYY-MM-DD -> [timeStr, ...]
          Object.entries(data.slots).forEach(([dateStr, times]) => {
            if (!Array.isArray(times)) return;
            // Parse dateStr to Day Mon Year
            const parts = dateStr.split("-");
            if (parts.length === 3) {
              const [y, mm, dd] = parts;
              const mIdx = Number(mm) - 1;
              const mon = months[mIdx] || "Jan";
              const day = String(Number(dd));
              times.forEach(t => {
                flatSlots.push(`${day.padStart(2, "0")} ${mon} ${y} • ${t}`);
              });
            } else {
              times.forEach(t => flatSlots.push(t));
            }
          });
        } else if (Array.isArray(data.slots)) {
          flatSlots = data.slots;
        }
        setSlots(flatSlots);
        
        if (data.imageUrl) {
          setImagePreview(data.imageUrl);
          setHasExistingImage(true);
          setRemoveImage(false);
        } else {
          setImagePreview(null);
          setHasExistingImage(false);
        }
      } catch (err) {
        console.error("loadService error:", err);
        showToast("error", "Network error", "Could not load service.");
      }
    }
    loadService();
    return () => {
      mounted = false;
    };
  }, [serviceId]);

  function handleImageChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (imagePreview && imagePreview.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(imagePreview);
      } catch (err) {}
    }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
    setRemoveImage(false);
    setHasExistingImage(false);
  }

  function addInstruction() {
    setInstructions((s) => [...s, ""]);
  }
  function updateInstruction(i, v) {
    setInstructions((s) => s.map((x, idx) => (idx === i ? v : x)));
  }
  function removeInstruction(i) {
    setInstructions((s) => s.filter((_, idx) => idx !== i));
  }

  function resetForm() {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(imagePreview);
      } catch (err) {}
    }
    setImagePreview(null);
    setImageFile(null);
    setHasExistingImage(false);
    setRemoveImage(false);
    setServiceName("");
    setAbout("");
    setPrice("");
    setAvailability("available");
    setInstructions([""]);
    setSlots([]);
    setErrors({});
  }

  function showToast(type, title, message) {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 3500);
  }

  function selectedDateTime() {
    const d = Number(slotDay);
    const m = Number(slotMonth);
    const y = Number(slotYear);
    let h = Number(slotHour);
    const mm = Number(slotMinute);
    const ap = slotAmPm;

    if (ap === "AM") {
      if (h === 12) h = 0;
    } else {
      if (h !== 12) h = h + 12;
    }

    return new Date(y, m, d, h, mm, 0, 0);
  }

  function isSelectedDateTimeInPast() {
    const sel = selectedDateTime();
    return sel.getTime() <= Date.now();
  }

  function addSlot() {
    const m = months[Number(slotMonth)];
    const d = String(slotDay).padStart(2, "0");
    const y = slotYear;
    const h = String(slotHour).padStart(2, "0");
    const mm = slotMinute;
    const ap = slotAmPm;
    const formatted = `${d} ${m} ${y} • ${h}:${mm} ${ap}`;

    if (slots.includes(formatted)) {
      showToast(
        "error",
        "Duplicate Slot",
        "This time slot has already been added. Please select a different time."
      );
      return;
    }

    if (isSelectedDateTimeInPast()) {
      showToast(
        "error",
        "Past Time",
        "You cannot add a time slot in the past. Please select a future date/time."
      );
      setErrors((e) => ({ ...e, slots: true }));
      return;
    }

    setSlots((s) => [...s, formatted]);
    setErrors((e) => ({ ...e, slots: false }));
    showToast("success", "Slot Added", `Time slot added: ${formatted}`);
  }

  function removeSlot(i) {
    const removedSlot = slots[i];
    setSlots((s) => s.filter((_, idx) => idx !== i));
    showToast("info", "Slot Removed", `Removed: ${removedSlot}`);
  }

  function validate() {
    const newErrors = {};
    if (!imageFile && !hasExistingImage) newErrors.image = true;
    if (!serviceName.trim()) newErrors.serviceName = true;
    if (!about.trim()) newErrors.about = true;
    if (!String(price).trim()) newErrors.price = true;
    if (!instructions.some((ins) => ins.trim())) newErrors.instructions = true;
    if (!slots.length) newErrors.slots = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) {
      showToast(
        "error",
        "Missing Fields",
        "Please fill all required fields before submitting."
      );
      return;
    }

    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("name", serviceName);
      fd.append("about", about);
      const numericPrice = String(price).replace(/[^\d.-]/g, "");
      fd.append("price", numericPrice === "" ? "0" : numericPrice);
      fd.append("availability", availability);
      fd.append("instructions", JSON.stringify(instructions.filter(i => i.trim())));
      fd.append("slots", JSON.stringify(slots));

      if (imageFile) {
        fd.append("image", imageFile);
      } else if (removeImage) {
        fd.append("removeImage", "true");
      }

      const url = serviceId
        ? `${API_BASE}/api/services/${serviceId}`
        : `${API_BASE}/api/services`;
      const method = serviceId ? "PUT" : "POST";

      const res = await fetch(url, { method, body: fd });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = data?.message || `Server error (${res?.status || "?"})`;
        showToast("error", "Save Failed", msg);
        setSubmitting(false);
        return;
      }

      showToast(
        "success",
        serviceId ? "Service Updated" : "Service Added",
        `${serviceName} saved successfully.`
      );

      if (!serviceId) {
        resetForm();
        if (fileRef.current) fileRef.current.value = null;
      } else {
        setTimeout(() => {
          navigate("/list-service");
        }, 1000);
      }
    } catch (err) {
      console.error("service submit error:", err);
      showToast("error", "Network error", "Could not reach server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={addServiceStyles.container.main}>
      <div className={addServiceStyles.container.form}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-emerald-50 pb-5 mb-6 gap-4">
          <div>
            <h2 className={addServiceStyles.header.title}>
              {serviceId ? "Edit Medical Service" : "Add Medical Service"}
            </h2>
            <p className={addServiceStyles.header.subtitle}>
              Configure diagnostic packages, tests, instructions, and schedule slots.
            </p>
          </div>
          <div className={addServiceStyles.headerActions}>
            <button
              type="button"
              onClick={() => navigate("/list-service")}
              className={addServiceStyles.buttons.reset}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={addServiceStyles.buttons.submit}
            >
              {submitting ? "Saving..." : "Save Service"}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Image Upload */}
          <div className="col-span-1 space-y-4">
            <label className={addServiceStyles.labels.standard}>Service Photo</label>
            <div className={addServiceStyles.imageUpload.container(errors.image)}>
              {imagePreview ? (
                <div className={addServiceStyles.imageUpload.preview}>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className={`${addServiceStyles.imageUpload.preview} ${addServiceStyles.imageUpload.placeholder}`}>
                  <ImageIcon size={48} />
                  <span className="text-xs text-gray-400 mt-2">No photo selected</span>
                </div>
              )}
              
              <div className="flex gap-2 w-full mt-2">
                <label className={addServiceStyles.buttons.uploadImage + " cursor-pointer"}>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  Choose Image
                </label>
                
                {(imagePreview || hasExistingImage) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (imagePreview && imagePreview.startsWith("blob:")) {
                        try {
                          URL.revokeObjectURL(imagePreview);
                        } catch (err) {}
                      }
                      setImagePreview(null);
                      setImageFile(null);
                      if (hasExistingImage) {
                        setRemoveImage(true);
                        setHasExistingImage(false);
                      }
                      if (fileRef.current) fileRef.current.value = null;
                    }}
                    className={addServiceStyles.buttons.removeImage}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Fields */}
          <div className="lg:col-span-2 space-y-6">
            <div className={addServiceStyles.grids.formFields}>
              <div>
                <label className={addServiceStyles.labels.standard}>Service name</label>
                <input
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. Full Body Health Checkup"
                  className={addServiceStyles.formFields.input(errors.serviceName)}
                />
              </div>

              <div>
                <label className={addServiceStyles.labels.standard}>Price (INR)</label>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="₹ 999"
                  className={addServiceStyles.formFields.input(errors.price)}
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={addServiceStyles.labels.standard}>Short Summary / Description</label>
                <input
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="e.g. Complete body diagnostics and checkups"
                  className={addServiceStyles.formFields.input(errors.about)}
                />
              </div>

              <div>
                <label className={addServiceStyles.labels.standard}>Availability</label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className={addServiceStyles.formFields.select}
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>

            {/* Instructions */}
            <div className="border-t border-emerald-50/50 pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className={addServiceStyles.labels.standard}>Instructions (point wise)</label>
                <button
                  type="button"
                  onClick={addInstruction}
                  className={addServiceStyles.buttons.addInstruction}
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              <div className={addServiceStyles.instructions.container(errors.instructions)}>
                {instructions.map((ins, idx) => (
                  <div key={idx} className={addServiceStyles.instructions.item}>
                    <div className={addServiceStyles.icon.number}>{idx + 1}.</div>
                    <input
                      value={ins}
                      onChange={(e) => updateInstruction(idx, e.target.value)}
                      placeholder={`e.g. Fast for 12 hours before test`}
                      className={addServiceStyles.instructions.input}
                    />
                    {instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInstruction(idx)}
                        className={addServiceStyles.instructions.removeButton}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Slots and Schedule */}
            <div className={addServiceStyles.slots.container(errors.slots)}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-emerald-700 font-medium font-serif">
                  <Calendar className="w-5 h-5" /> Schedule Slots
                </div>
                <div className="text-xs text-gray-500">
                  {slots.length} slot{slots.length !== 1 ? "s" : ""} added
                </div>
              </div>

              <div className={addServiceStyles.grids.timeGrid}>
                <div>
                  <label className={addServiceStyles.labels.small}>Day</label>
                  <select
                    value={slotDay}
                    onChange={(e) => setSlotDay(e.target.value)}
                    className={addServiceStyles.formFields.smallSelect}
                  >
                    {days.map((d) => {
                      const dNum = Number(d);
                      const disabled =
                        Number(slotYear) === currentYear &&
                        Number(slotMonth) === currentMonth &&
                        dNum < currentDate;
                      return (
                        <option key={d} value={d} disabled={disabled}>
                          {d}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className={addServiceStyles.labels.small}>Month</label>
                  <select
                    value={slotMonth}
                    onChange={(e) => setSlotMonth(e.target.value)}
                    className={addServiceStyles.formFields.smallSelect}
                  >
                    {months.map((m, idx) => {
                      const disabled =
                        Number(slotYear) === currentYear && idx < currentMonth;
                      return (
                        <option key={m} value={String(idx)} disabled={disabled}>
                          {m}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className={addServiceStyles.labels.small}>Year</label>
                  <select
                    value={slotYear}
                    onChange={(e) => setSlotYear(e.target.value)}
                    className={addServiceStyles.formFields.smallSelect}
                  >
                    {years.map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={addServiceStyles.grids.timeSubGrid}>
                  <div>
                    <label className={addServiceStyles.labels.small}>Hour</label>
                    <select
                      value={slotHour}
                      onChange={(e) => setSlotHour(e.target.value)}
                      className={addServiceStyles.formFields.timeSelect}
                    >
                      {hours.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={addServiceStyles.labels.small}>Min</label>
                    <select
                      value={slotMinute}
                      onChange={(e) => setSlotMinute(e.target.value)}
                      className={addServiceStyles.formFields.timeSelect}
                    >
                      {minutes.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={addServiceStyles.labels.small}>AM/PM</label>
                    <select
                      value={slotAmPm}
                      onChange={(e) => setSlotAmPm(e.target.value)}
                      className={addServiceStyles.formFields.ampmSelect}
                    >
                      {ampm.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <button
                  type="button"
                  onClick={addSlot}
                  className={addServiceStyles.buttons.addSlot + " cursor-pointer"}
                >
                  <Plus className="w-4 h-4" /> Add Time Slot
                </button>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-2">Slots Grid</div>
                <div className={addServiceStyles.grids.slotsGrid}>
                  {slots.length === 0 ? (
                    <div className="text-sm text-gray-400 italic px-2 py-4">
                      No schedule slots added.
                    </div>
                  ) : (
                    slots.map((s, idx) => (
                      <div key={s} className={addServiceStyles.slots.slotItem}>
                        <div className="flex items-center gap-2 min-w-0">
                          <Clock className={addServiceStyles.icon.clock} />
                          <div className={addServiceStyles.slots.slotText}>{s}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSlot(idx)}
                          className={addServiceStyles.buttons.slotRemove + " cursor-pointer"}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={addServiceStyles.toast.container}>
          <div className={`${addServiceStyles.toast.toastBase} ${
            toast.type === "error"
              ? addServiceStyles.toast.toastError
              : toast.type === "info"
              ? addServiceStyles.toast.toastInfo
              : addServiceStyles.toast.toastSuccess
          }`}>
            <div className={addServiceStyles.toast.iconContainer(toast.type)}>
              {toast.type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
            </div>
            <div className="flex-1">
              <div className={addServiceStyles.toast.title}>{toast.title}</div>
              <div className={addServiceStyles.toast.message}>{toast.message}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

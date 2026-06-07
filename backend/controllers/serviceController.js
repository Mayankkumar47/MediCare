import Service from "../models/Service.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

const parseJsonArrayField = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === "string") {
    try {
      const parsed = JSON.parse(field);
      if (Array.isArray(parsed)) return parsed;
      return typeof parsed === "string" ? [parsed] : [];
    } catch {
      return field
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
};

function normalizeSlotsToMap(slotStrings = []) {
  const map = {};
  slotStrings.forEach((raw) => {
    // Expected format: "20 Jan 2026 • 10:00 AM" or similar
    const m = raw.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\s*•\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!m) {
      // Try YYYY-MM-DD • HH:MM AM/PM format
      const m2 = raw.match(/^(\d{4})-(\d{2})-(\d{2})\s*•\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (m2) {
        const [, year, mm, dd, hour, minute, ampm] = m2;
        const dateKey = `${year}-${mm}-${dd}`;
        const timeStr = `${String(Number(hour)).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${ampm.toUpperCase()}`;
        map[dateKey] = map[dateKey] || [];
        map[dateKey].push(timeStr);
        return;
      }
      map["unspecified"] = map["unspecified"] || [];
      map["unspecified"].push(raw);
      return;
    }
    const [, day, monShort, year, hour, minute, ampm] = m;
    const monthIdx = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      .findIndex(x => x.toLowerCase() === monShort.toLowerCase());
    const mm = String(monthIdx !== -1 ? monthIdx + 1 : 1).padStart(2, "0");
    const dd = String(Number(day)).padStart(2, "0");
    const dateKey = `${year}-${mm}-${dd}`; // YYYY-MM-DD
    const timeStr = `${String(Number(hour)).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${ampm.toUpperCase()}`;
    map[dateKey] = map[dateKey] || [];
    map[dateKey].push(timeStr);
  });
  return map;
}

const sanitizePrice = (v) => Number(String(v ?? "0").replace(/[^\d.-]/g, "")) || 0;
const parseAvailability = (v) => {
  if (typeof v === "boolean") return v;
  const s = String(v ?? "available").toLowerCase();
  return s === "available" || s === "true" || s === "yes";
};

// Get all services
export const getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    // Normalize response objects
    const normalized = services.map(s => {
      const obj = s.toObject();
      obj.id = s._id;
      return obj;
    });
    return res.json({ success: true, data: normalized, services: normalized });
  } catch (err) {
    console.error("getServices error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get Service By ID
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    const obj = service.toObject();
    obj.id = service._id;
    return res.json({ success: true, data: obj });
  } catch (err) {
    console.error("getServiceById error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create Service
export const createService = async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.name) {
      return res.status(400).json({ success: false, message: "Service name is required" });
    }

    const instructions = parseJsonArrayField(b.instructions);
    const rawSlots = parseJsonArrayField(b.slots);
    const slots = normalizeSlotsToMap(rawSlots);
    const numericPrice = sanitizePrice(b.price);
    const available = parseAvailability(b.availability);

    let imageUrl = null;
    let imagePublicId = null;
    if (req.file) {
      const up = await uploadToCloudinary(req.file.path, "services");
      imageUrl = up?.secure_url || null;
      imagePublicId = up?.public_id || null;
    }

    const service = new Service({
      name: b.name,
      about: b.about || "",
      shortDescription: b.shortDescription || "",
      price: numericPrice,
      available,
      imageUrl,
      imagePublicId,
      instructions,
      slots,
      dates: Object.keys(slots).filter(d => d !== "unspecified"),
    });

    await service.save();

    const obj = service.toObject();
    obj.id = service._id;
    return res.status(201).json({ success: true, data: obj });
  } catch (err) {
    console.error("createService error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update Service
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const b = req.body || {};

    const existing = await Service.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    const updateData = {};
    if (b.name !== undefined) updateData.name = b.name;
    if (b.about !== undefined) updateData.about = b.about;
    if (b.shortDescription !== undefined) updateData.shortDescription = b.shortDescription;
    if (b.price !== undefined) updateData.price = sanitizePrice(b.price);
    if (b.availability !== undefined) updateData.available = parseAvailability(b.availability);
    if (b.instructions !== undefined) updateData.instructions = parseJsonArrayField(b.instructions);
    
    if (b.slots !== undefined) {
      const slots = normalizeSlotsToMap(parseJsonArrayField(b.slots));
      updateData.slots = slots;
      updateData.dates = Object.keys(slots).filter(d => d !== "unspecified");
    }

    if (req.file) {
      const up = await uploadToCloudinary(req.file.path, "services");
      if (up?.secure_url) {
        updateData.imageUrl = up.secure_url;
        updateData.imagePublicId = up.public_id || null;
        if (existing.imagePublicId) {
          await deleteFromCloudinary(existing.imagePublicId).catch(err => {
            console.warn("deleteFromCloudinary warning:", err.message);
          });
        }
      }
    } else if (b.imageUrl) {
      updateData.imageUrl = b.imageUrl;
    }

    const updated = await Service.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    const obj = updated.toObject();
    obj.id = updated._id;
    return res.json({ success: true, data: obj });
  } catch (err) {
    console.error("updateService error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete Service
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    if (service.imagePublicId) {
      await deleteFromCloudinary(service.imagePublicId);
    }

    await Service.findByIdAndDelete(id);
    return res.json({ success: true, message: "Service deleted successfully" });
  } catch (err) {
    console.error("deleteService error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
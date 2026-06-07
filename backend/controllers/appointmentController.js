import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Stripe from "stripe";
import { createPayPalOrder, capturePayPalOrder } from "../config/paypal.js";

const stripeKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeKey ? new Stripe(stripeKey) : null;

const safeNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const buildFrontendBase = (req) => {
  if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL.replace(/\/$/, "");
  const origin = req.get("origin") || req.get("referer");
  if (origin) return origin.replace(/\/$/, "");
  const host = req.get("host");
  if (host) return `${req.protocol || "http"}://${host}`.replace(/\/$/, "");
  return "http://localhost:5173";
};

function resolveClerkUserId(req) {
  try {
    // Resolve user from token info or fallback headers
    const auth = req.auth || {};
    const fromReq = auth?.userId || auth?.user_id || auth?.user?.id || req.user?.id || null;
    if (fromReq) return fromReq;
    
    // Look at request headers
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      // If mock token or simple payload, parse it
      if (token.startsWith("mock_user_")) {
        return token;
      }
      // Decode JWT payload without verification (in development, fallback if no verification key)
      const decoded = jwt.decode(token);
      if (decoded && decoded.sub) return decoded.sub;
    }
    
    // Fallback: check query parameter
    if (req.query.createdBy) return req.query.createdBy;
    if (req.body.createdBy) return req.body.createdBy;
    return "guest_user";
  } catch (e) {
    return "guest_user";
  }
}

// Get Appointments
export const getAppointments = async (req, res) => {
  try {
    const { doctorId, mobile, status, search = "", limit: limitRaw = 50, page: pageRaw = 1, patientClerkId, createdBy } = req.query;
    const limit = Math.min(200, Math.max(1, parseInt(limitRaw, 10) || 50));
    const page = Math.max(1, parseInt(pageRaw, 10) || 1);
    const skip = (page - 1) * limit;

    const filter = {};
    if (doctorId) filter.doctorId = doctorId;
    if (mobile) filter.mobile = mobile;
    if (status) filter.status = status;
    if (patientClerkId) filter.createdBy = patientClerkId;
    if (createdBy) filter.createdBy = createdBy;
    if (search) {
      const re = new RegExp(search, "i");
      filter.$or = [{ patientName: re }, { mobile: re }, { notes: re }];
    }

    const appointments = await Appointment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Appointment.countDocuments(filter);

    return res.json({ success: true, appointments, data: appointments, meta: { total, page, limit } });
  } catch (err) {
    console.error("getAppointments error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create Appointment
export const createAppointment = async (req, res) => {
  try {
    const body = req.body || {};
    const {
      doctorId,
      patientName,
      mobile,
      age = "",
      gender = "",
      date,
      time,
      fee,
      fees,
      notes = "",
      email,
      paymentMethod,
      owner: ownerFromBody = null,
      doctorName: doctorNameFromBody,
      speciality: specialityFromBody,
      doctorImageUrl: doctorImageUrlFromBody,
      doctorImagePublicId: doctorImagePublicIdFromBody,
    } = body;

    if (!doctorId || !patientName || !mobile || !date || !time) {
      return res.status(400).json({ success: false, message: "Missing required booking details" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const clerkUserId = resolveClerkUserId(req);
    const numericFee = safeNumber(fee ?? fees ?? doctor.fee ?? 0);

    let resolvedOwner = ownerFromBody || doctor.owner || null;
    if (!resolvedOwner) resolvedOwner = doctorId;

    const doctorName = (doctor.name && String(doctor.name).trim()) || (doctorNameFromBody && String(doctorNameFromBody).trim()) || "";
    const speciality =
      (doctor.specialization && String(doctor.specialization).trim()) ||
      (doctor.speciality && String(doctor.speciality).trim()) ||
      (specialityFromBody && String(specialityFromBody).trim()) ||
      "";

    const doctorImageUrl =
      (doctor.imageUrl && String(doctor.imageUrl).trim()) ||
      (doctor.image && String(doctor.image).trim()) ||
      (doctorImageUrlFromBody && String(doctorImageUrlFromBody).trim()) ||
      "";

    const doctorImagePublicId =
      (doctor.imagePublicId && String(doctor.imagePublicId).trim()) ||
      (doctorImagePublicIdFromBody && String(doctorImagePublicIdFromBody).trim()) ||
      "";

    const doctorImage = { url: doctorImageUrl, publicId: doctorImagePublicId };

    const base = {
      doctorId: String(doctor._id || doctorId),
      doctorName,
      speciality,
      doctorImage,
      patientName: String(patientName).trim(),
      mobile: String(mobile).trim(),
      age: age ? Number(age) : undefined,
      gender: gender ? String(gender) : "",
      date: String(date),
      time: String(time),
      fees: numericFee,
      status: "Pending",
      payment: { method: paymentMethod === "Online" ? "Online" : "Cash", status: "Pending", amount: numericFee },
      notes: notes || "",
      createdBy: clerkUserId,
      owner: resolvedOwner,
      sessionId: null,
    };

    // Free appointment
    if (numericFee === 0) {
      const created = await Appointment.create({
        ...base,
        status: "Confirmed",
        payment: { method: base.payment.method, status: "Paid", amount: 0 },
        paidAt: new Date(),
      });
      return res.status(201).json({ success: true, appointment: created, checkoutUrl: null });
    }

    // Cash payment
    if (paymentMethod === "Cash") {
      const created = await Appointment.create({
        ...base,
        status: "Pending",
        payment: { method: "Cash", status: "Pending", amount: numericFee },
      });
      return res.status(201).json({ success: true, appointment: created, checkoutUrl: null });
    }

    // Online: PayPal or Stripe Checkout Flow
    const frontBase = buildFrontendBase(req);

    // 1. Try PayPal Checkout first if configured
    if (process.env.PAYPAL_CLIENT_ID) {
      // PayPal appends ?token=ORDER_ID&PayerID=PAYER_ID to return_url automatically
      const paypalSuccessUrl = `${frontBase}/appointment/success`;
      const paypalCancelUrl = `${frontBase}/appointment/cancel`;
      try {
        const paypalOrder = await createPayPalOrder(numericFee, paypalSuccessUrl, paypalCancelUrl);
        if (paypalOrder && paypalOrder.orderId && paypalOrder.checkoutUrl) {
          const created = await Appointment.create({
            ...base,
            sessionId: paypalOrder.orderId,
            payment: { ...base.payment, providerId: paypalOrder.orderId, method: "Online" },
            status: "Pending",
          });
          return res.status(201).json({ success: true, appointment: created, checkoutUrl: paypalOrder.checkoutUrl });
        }
      } catch (err) {
        console.error("PayPal order creation error:", err);
      }
    }

    // 2. Try Stripe Checkout
    if (stripe) {
      const successUrl = `${frontBase}/appointment/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${frontBase}/appointment/cancel`;
      let session;
      try {
        session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          customer_email: email || undefined,
          line_items: [
            {
              price_data: {
                currency: "inr",
                product_data: { name: `Appointment - ${String(patientName).slice(0, 40)}` },
                unit_amount: Math.round(numericFee * 100),
              },
              quantity: 1,
            },
          ],
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            doctorId: String(doctorId),
            doctorName: doctorName || "",
            speciality: speciality || "",
            patientName: base.patientName,
            mobile: base.mobile,
            clerkUserId: clerkUserId || "",
          },
        });

        const created = await Appointment.create({
          ...base,
          sessionId: session.id,
          payment: { ...base.payment, providerId: session.payment_intent || null },
          status: "Pending",
        });
        return res.status(201).json({ success: true, appointment: created, checkoutUrl: session.url || null });
      } catch (stripeErr) {
        console.error("Stripe create session error:", stripeErr);
      }
    }

    // 3. Fallback to mock checkout url if neither Stripe nor PayPal is configured
    const mockSessionId = `mock_session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const created = await Appointment.create({
      ...base,
      sessionId: mockSessionId,
      payment: { ...base.payment, providerId: "mock_provider_id" },
      status: "Pending",
    });
    const mockCheckoutUrl = `${frontBase}/appointment/success?session_id=${mockSessionId}`;
    return res.status(201).json({ success: true, appointment: created, checkoutUrl: mockCheckoutUrl });
  } catch (err) {
    console.error("createAppointment unexpected:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Confirm Stripe / PayPal / Mock Payment
export const confirmPayment = async (req, res) => {
  try {
    const { session_id } = req.body || req.query || {};
    if (!session_id) {
      return res.status(400).json({ success: false, message: "session_id is required" });
    }

    let appt;
    
    // 1. Mock Payment Check
    if (session_id.startsWith("mock_session_")) {
      appt = await Appointment.findOneAndUpdate(
        { sessionId: session_id },
        {
          "payment.status": "Paid",
          "payment.providerId": "mock_completed_transaction",
          status: "Confirmed",
          paidAt: new Date(),
        },
        { new: true }
      );
    } 
    // 2. PayPal Payment Check
    else if (process.env.PAYPAL_CLIENT_ID && !session_id.startsWith("cs_")) {
      try {
        const captureResult = await capturePayPalOrder(session_id);
        if (captureResult && captureResult.success) {
          appt = await Appointment.findOneAndUpdate(
            { sessionId: session_id },
            {
              "payment.status": "Paid",
              "payment.providerId": captureResult.transactionId,
              status: "Confirmed",
              paidAt: new Date(),
            },
            { new: true }
          );
        }
      } catch (err) {
        console.error("PayPal capture execution error:", err);
      }
    }

    // 3. Stripe Payment Check
    if (!appt && stripe) {
      try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session && (session.payment_status === "paid" || session.status === "complete")) {
          appt = await Appointment.findOneAndUpdate(
            { sessionId: session_id },
            {
              "payment.status": "Paid",
              "payment.providerId": session.payment_intent || null,
              status: "Confirmed",
              paidAt: new Date(),
            },
            { new: true }
          );
        }
      } catch (err) {
        console.error("Stripe retrieve session error:", err);
      }
    }

    // fallback: try match via metadata (doctorId + mobile + patientName)
    if (!appt && stripe) {
      try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        const meta = session?.metadata || {};
        if (meta.doctorId && meta.mobile && meta.patientName) {
          appt = await Appointment.findOneAndUpdate(
            {
              doctorId: meta.doctorId,
              mobile: meta.mobile,
              patientName: meta.patientName,
              fees: Math.round((session.amount_total || 0) / 100) || undefined,
            },
            {
              "payment.status": "Paid",
              "payment.providerId": session.payment_intent || null,
              status: "Confirmed",
              paidAt: new Date(),
              sessionId: session_id,
            },
            { new: true }
          );
        }
      } catch (e) {
        console.warn("Session retrieve failed in metadata match fallback:", e);
      }
    }

    if (!appt) {
      return res.status(404).json({ success: false, message: "Appointment not found for this payment session" });
    }

    return res.json({ success: true, data: appt, appointment: appt });
  } catch (err) {
    console.error("confirmPayment error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update Appointment (Reschedule / cancel / complete)
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const appt = await Appointment.findById(id);
    if (!appt) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    const terminal = appt.status === "Completed" || appt.status === "Canceled";
    if (terminal && body.status && body.status !== appt.status) {
      return res.status(400).json({ success: false, message: "Cannot change status of a completed/canceled appointment" });
    }

    const update = {};
    if (body.status) update.status = body.status;
    if (body.notes !== undefined) update.notes = body.notes;

    if (body.date && body.time) {
      if (appt.status === "Completed" || appt.status === "Canceled") {
        return res.status(400).json({ success: false, message: "Cannot reschedule completed/canceled appointment" });
      }
      update.date = body.date;
      update.time = body.time;
      update.status = "Rescheduled";
      update.rescheduledTo = { date: body.date, time: body.time };
    }

    const updatedAppt = await Appointment.findByIdAndUpdate(id, { $set: update }, { new: true });
    return res.json({ success: true, appointment: updatedAppt, data: updatedAppt });
  } catch (err) {
    console.error("updateAppointment error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get Appointments by User Profile (Clerk id)
export const getMyAppointments = async (req, res) => {
  try {
    const clerkUserId = resolveClerkUserId(req);
    const appointments = await Appointment.find({ createdBy: clerkUserId }).sort({ date: -1, time: -1 });
    return res.json({ success: true, appointments, data: appointments });
  } catch (err) {
    console.error("getMyAppointments error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get Appointments by Doctor ID (Doctor view)
export const getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { mobile, status, search = "", limit: limitRaw = 50, page: pageRaw = 1 } = req.query;
    const limit = Math.min(200, Math.max(1, parseInt(limitRaw, 10) || 50));
    const page = Math.max(1, parseInt(pageRaw, 10) || 1);
    const skip = (page - 1) * limit;

    const filter = { doctorId };
    if (mobile) filter.mobile = mobile;
    if (status) filter.status = status;
    if (search) {
      const re = new RegExp(search, "i");
      filter.$or = [{ patientName: re }, { mobile: re }, { notes: re }];
    }

    const appointments = await Appointment.find(filter)
      .sort({ date: -1, time: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Appointment.countDocuments(filter);
    return res.json({ success: true, appointments, data: appointments, meta: { total, page, limit } });
  } catch (err) {
    console.error("getAppointmentsByDoctor error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get General Appointment Stats (Admin Dashboard)
export const getStats = async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const completed = await Appointment.countDocuments({ status: "Completed" });
    const canceled = await Appointment.countDocuments({ status: "Canceled" });

    const paidAgg = await Appointment.aggregate([
      { $match: { "payment.status": "Paid" } }, 
      { $group: { _id: null, total: { $sum: "$fees" } } }
    ]);
    const revenue = (paidAgg[0] && paidAgg[0].total) || 0;

    return res.json({
      success: true,
      stats: {
        totalDoctors,
        totalAppointments,
        completed,
        canceled,
        revenue
      }
    });
  } catch (err) {
    console.error("getStats error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

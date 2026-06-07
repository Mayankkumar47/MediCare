import express from "express";
import multer from "multer";
import fs from "fs";

// Controllers
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  loginDoctor
} from "../controllers/doctorController.js";

import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from "../controllers/serviceController.js";

import {
  getAppointments,
  getMyAppointments,
  getAppointmentsByDoctor,
  createAppointment,
  updateAppointment,
  confirmPayment,
  getStats
} from "../controllers/appointmentController.js";

import {
  getServiceAppointments,
  getMyServiceAppointments,
  createServiceAppointment,
  updateServiceAppointment,
  cancelServiceAppointment,
  confirmServicePayment,
  getServiceAppointmentStats
} from "../controllers/serviceAppointmentController.js";

const router = express.Router();

// Ensure local upload folder exists
const tempUploadDir = "./uploads";
if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir, { recursive: true });
}

// Multer middleware setup
const upload = multer({ dest: "uploads/" });

// Doctor Routes
router.get("/doctors", getDoctors);
router.get("/doctors/:id", getDoctorById);
router.post("/doctors", upload.single("image"), createDoctor);
router.put("/doctors/:id", upload.single("image"), updateDoctor);
router.delete("/doctors/:id", deleteDoctor);
router.post("/doctors/login", loginDoctor);

// Service Routes
router.get("/services", getServices);
router.get("/services/:id", getServiceById);
router.post("/services", upload.single("image"), createService);
router.put("/services/:id", upload.single("image"), updateService);
router.delete("/services/:id", deleteService);

// Doctor Appointment Routes
router.get("/appointments", getAppointments);
router.get("/appointments/me", getMyAppointments);
router.get("/appointments/doctor/:doctorId", getAppointmentsByDoctor);
router.post("/appointments", createAppointment);
router.put("/appointments/:id", updateAppointment);
router.post("/appointments/confirm-payment", confirmPayment);
router.get("/stats", getStats);

// Service Appointment Routes
router.get("/service-appointments", getServiceAppointments);
router.get("/service-appointments/me", getMyServiceAppointments);
router.post("/service-appointments", createServiceAppointment);
router.put("/service-appointments/:id", updateServiceAppointment);
router.delete("/service-appointments/:id", cancelServiceAppointment);
router.post("/service-appointments/confirm-payment", confirmServicePayment);
router.get("/service-appointments/stats", getServiceAppointmentStats);

export default router;

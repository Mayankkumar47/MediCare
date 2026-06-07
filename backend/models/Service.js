import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    about: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    price: { type: Number, default: 0 },
    available: { type: Boolean, default: true },
    imageUrl: { type: String, default: null },
    imagePublicId: { type: String, default: null },
    dates: { type: [String], default: [] },
    slots: { type: mongoose.Schema.Types.Mixed, default: {} },
    instructions: { type: [String], default: [] },
    totalAppointments: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    canceled: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Service = mongoose.models.Service || mongoose.model("Service", serviceSchema);
export default Service;
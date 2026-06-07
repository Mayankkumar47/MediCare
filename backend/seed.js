import mongoose from "mongoose";
import dotenv from "dotenv";
import Doctor from "./models/Doctor.js";
import Service from "./models/Service.js";
import Appointment from "./models/Appointment.js";
import ServiceAppointment from "./models/serviceAppointment.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://mayankkumar25281_db_user:AqgdMVKjNsU23z9b@ac-22hyoqb-shard-00-00.3kt5kbt.mongodb.net:27017,ac-22hyoqb-shard-00-01.3kt5kbt.mongodb.net:27017,ac-22hyoqb-shard-00-02.3kt5kbt.mongodb.net:27017/medicare?ssl=true&replicaSet=atlas-l0shc2-shard-0&authSource=admin";

const doctorsData = [
  {
    name: "Dr. Aarav Sharma",
    email: "aarav.sharma@medicare.com",
    password: "password123",
    specialization: "Cardiologist",
    imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop",
    experience: "12 Years",
    qualifications: "MD - Cardiology, MBBS",
    location: "New Delhi",
    about: "Dr. Aarav Sharma is a leading cardiologist dedicated to cardiac wellness, preventative care, and coronary treatments.",
    fee: 1200,
    availability: "Available",
    schedule: {
      "Monday": ["09:00", "10:00", "11:00"],
      "Wednesday": ["14:00", "15:00"],
      "Friday": ["09:00", "11:00"]
    },
    success: "99%",
    patients: "3400+",
    rating: 4.9
  },
  {
    name: "Dr. Meera Patel",
    email: "meera.patel@medicare.com",
    password: "password123",
    specialization: "Dermatologist",
    imageUrl: "http://localhost:4000/uploads/meera.png",
    experience: "8 Years",
    qualifications: "MD - Dermatology, DNB",
    location: "Mumbai",
    about: "Dr. Meera Patel specializes in clinical dermatology, laser skin therapies, and cosmetic dermatology.",
    fee: 800,
    availability: "Available",
    schedule: {
      "Tuesday": ["10:00", "11:00", "12:00"],
      "Thursday": ["10:00", "11:00"]
    },
    success: "97%",
    patients: "2100+",
    rating: 4.8
  },
  {
    name: "Dr. Vikram Malhotra",
    email: "vikram.malhotra@medicare.com",
    password: "password123",
    specialization: "Orthopedist",
    imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=600&auto=format&fit=crop",
    experience: "15 Years",
    qualifications: "MS - Orthopaedics, M.Ch",
    location: "Bangalore",
    about: "Dr. Vikram Malhotra is an expert in joint replacements, sports injuries, and complex arthroscopic procedures.",
    fee: 1500,
    availability: "Available",
    schedule: {
      "Monday": ["14:00", "15:00", "16:00"],
      "Saturday": ["09:00", "10:00", "11:00"]
    },
    success: "98%",
    patients: "4500+",
    rating: 4.9
  },
  {
    name: "Dr. Ananya Reddy",
    email: "ananya.reddy@medicare.com",
    password: "password123",
    specialization: "Pediatrician",
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=600&auto=format&fit=crop",
    experience: "10 Years",
    qualifications: "MD - Pediatrics, DCH",
    location: "Hyderabad",
    about: "Dr. Ananya Reddy provides compassionate pediatric and neonatal care, specialized childhood immunizations, and developmental tracking.",
    fee: 900,
    availability: "Available",
    schedule: {
      "Wednesday": ["10:00", "11:00", "12:00"],
      "Friday": ["14:00", "15:00", "16:00"]
    },
    success: "99%",
    patients: "2800+",
    rating: 4.8
  },
  {
    name: "Dr. Rohan Das",
    email: "rohan.das@medicare.com",
    password: "password123",
    specialization: "Neurologist",
    imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=600&auto=format&fit=crop",
    experience: "14 Years",
    qualifications: "DM - Neurology, MD",
    location: "Kolkata",
    about: "Dr. Rohan Das is highly skilled in treating neuromuscular disorders, stroke rehabilitation, and chronic migraine management.",
    fee: 1800,
    availability: "Available",
    schedule: {
      "Tuesday": ["14:00", "15:00", "16:00"],
      "Thursday": ["14:00", "15:00"]
    },
    success: "96%",
    patients: "3100+",
    rating: 4.7
  },
  {
    name: "Dr. Sneha Sen",
    email: "sneha.sen@medicare.com",
    password: "password123",
    specialization: "Gynecologist",
    imageUrl: "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?q=80&w=600&auto=format&fit=crop",
    experience: "11 Years",
    qualifications: "MS - OBGYN, DGO",
    location: "Pune",
    about: "Dr. Sneha Sen offers comprehensive prenatal care, laparoscopic gynecologic surgeries, and endocrine consults.",
    fee: 1000,
    availability: "Available",
    schedule: {
      "Monday": ["10:00", "11:00"],
      "Wednesday": ["10:00", "11:00"],
      "Friday": ["10:00", "11:00"]
    },
    success: "98%",
    patients: "2900+",
    rating: 4.9
  },
  {
    name: "Dr. Aditya Verma",
    email: "aditya.verma@medicare.com",
    password: "password123",
    specialization: "General Physician",
    imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=600&auto=format&fit=crop",
    experience: "9 Years",
    qualifications: "MD - General Medicine, MBBS",
    location: "Chennai",
    about: "Dr. Aditya Verma treats chronic lifestyle disorders, hypertension, diabetes, and acute systemic infections.",
    fee: 700,
    availability: "Available",
    schedule: {
      "Tuesday": ["09:00", "10:00", "11:00"],
      "Thursday": ["09:00", "10:00", "11:00"]
    },
    success: "95%",
    patients: "3800+",
    rating: 4.6
  }
];

const servicesData = [
  {
    name: "Complete Blood Count (CBC)",
    shortDescription: "Checks major blood cell types for general health tracking.",
    about: "A Complete Blood Count measures red blood cells, white blood cells, and platelets. Crucial for diagnosing anemia, infections, and other blood disorders.",
    price: 350,
    available: true,
    imageUrl: "http://localhost:4000/uploads/cbc.png",
    dates: ["2026-06-08", "2026-06-09", "2026-06-10"],
    slots: {
      "2026-06-08": ["09:00", "10:00", "11:00"],
      "2026-06-09": ["09:00", "10:00"],
      "2026-06-10": ["10:00", "11:00"]
    },
    instructions: ["Fasting is not required", "Stay hydrated", "Avoid strenuous physical activity before sample collection"]
  },
  {
    name: "Lipid Profile Check",
    shortDescription: "Measures total cholesterol, LDL, HDL, and triglycerides.",
    about: "Evaluates cardiovascular health and detects risk factors for stroke and coronary artery diseases.",
    price: 600,
    available: true,
    imageUrl: "http://localhost:4000/uploads/lipid.png",
    dates: ["2026-06-08", "2026-06-09"],
    slots: {
      "2026-06-08": ["08:00", "09:00"],
      "2026-06-09": ["08:00", "09:00"]
    },
    instructions: ["Requires 10-12 hours overnight fasting", "Water is permitted during fasting", "Inform lab team of any medications you take"]
  },
  {
    name: "Thyroid Profile (T3, T4, TSH)",
    shortDescription: "Screens for hyperthyroidism and hypothyroidism.",
    about: "Measures thyroid gland functioning to regulate metabolic rates, heart rates, and body temperature.",
    price: 550,
    available: true,
    imageUrl: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=600&auto=format&fit=crop",
    dates: ["2026-06-08", "2026-06-09", "2026-06-10"],
    slots: {
      "2026-06-08": ["09:00", "10:00"],
      "2026-06-09": ["09:00", "10:00"],
      "2026-06-10": ["09:00", "10:00"]
    },
    instructions: ["Early morning sample is preferred", "Fasting is not mandatory"]
  },
  {
    name: "Kidney Function Test (KFT)",
    shortDescription: "Evaluates urea, creatinine, uric acid, and electrolytes.",
    about: "Assesses how efficiently your kidneys are filtering metabolic waste products from the blood stream.",
    price: 750,
    available: true,
    imageUrl: "http://localhost:4000/uploads/kft.png",
    dates: ["2026-06-08", "2026-06-09"],
    slots: {
      "2026-06-08": ["10:00", "11:00"],
      "2026-06-09": ["10:00", "11:00"]
    },
    instructions: ["Fasting not required", "Inform the technician if you are on vitamin supplements"]
  },
  {
    name: "Liver Function Test (LFT)",
    shortDescription: "Tests bilirubin, SGOT, SGPT, and protein levels.",
    about: "Identifies hepatic inflammation, liver enzyme elevations, and potential blockages in the biliary system.",
    price: 700,
    available: true,
    imageUrl: "http://localhost:4000/uploads/lft.png",
    dates: ["2026-06-08", "2026-06-09", "2026-06-10"],
    slots: {
      "2026-06-08": ["09:00", "10:00"],
      "2026-06-09": ["09:00", "10:00"],
      "2026-06-10": ["09:00", "10:00"]
    },
    instructions: ["Fasting is recommended for accurate triglyceride-linked enzymes", "Avoid alcohol 24 hours prior"]
  },
  {
    name: "Diabetes Screening (HbA1c)",
    shortDescription: "Measures 3-month average blood glucose levels.",
    about: "Used for screening, diagnosing, and monitoring therapeutic control of diabetes mellitus.",
    price: 450,
    available: true,
    imageUrl: "https://images.unsplash.com/photo-1508962914676-134849a727f0?q=80&w=600&auto=format&fit=crop",
    dates: ["2026-06-08", "2026-06-09"],
    slots: {
      "2026-06-08": ["08:00", "09:00", "10:00"],
      "2026-06-09": ["08:00", "09:00"]
    },
    instructions: ["Fasting is not required for HbA1c", "Can be done at any time of the day"]
  },
  {
    name: "Cardiac Health Package",
    shortDescription: "ECG, Lipid Profile, and Cardiac Biomarkers check.",
    about: "A preventative health panel targeting hypertension, lipid anomalies, and electrical cardiac anomalies.",
    price: 2500,
    available: true,
    imageUrl: "http://localhost:4000/uploads/cardiac.png",
    dates: ["2026-06-08", "2026-06-09"],
    slots: {
      "2026-06-08": ["08:00", "10:00"],
      "2026-06-09": ["08:00", "10:00"]
    },
    instructions: ["Fasting of 10-12 hours is mandatory", "Wear comfortable loose clothing for ECG"]
  },
  {
    name: "Vitamin D & B12 Panel",
    shortDescription: "Assesses bone health and neural functioning markers.",
    about: "Verifies micronutrient levels essential for skeletal density, immune system regulation, and red blood cell production.",
    price: 1200,
    available: true,
    imageUrl: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?q=80&w=600&auto=format&fit=crop",
    dates: ["2026-06-08", "2026-06-09"],
    slots: {
      "2026-06-08": ["09:00", "10:00"],
      "2026-06-09": ["09:00", "10:00"]
    },
    instructions: ["Requires morning fasting for baseline accuracy"]
  },
  {
    name: "Full Body Wellness Checkup",
    shortDescription: "Comprehensive 60+ parameters screen for overall vitality.",
    about: "Our flagship diagnostic package testing liver, kidney, blood count, sugar, vitamins, and cardiac lipids in a single draw.",
    price: 3500,
    available: true,
    imageUrl: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=600&auto=format&fit=crop",
    dates: ["2026-06-08", "2026-06-09", "2026-06-10"],
    slots: {
      "2026-06-08": ["08:00", "09:00", "10:00"],
      "2026-06-09": ["08:00", "09:00"],
      "2026-06-10": ["08:00", "09:00"]
    },
    instructions: ["Strictly 12 hours fasting required", "First morning urine sample might be collected"]
  },
  {
    name: "COVID-19 Antibody Test",
    shortDescription: "Detects IgG/IgM antibodies against SARS-CoV-2.",
    about: "Evaluates post-vaccination or post-recovery immune response levels.",
    price: 900,
    available: true,
    imageUrl: "http://localhost:4000/uploads/covid.png",
    dates: ["2026-06-08", "2026-06-09"],
    slots: {
      "2026-06-08": ["11:00", "12:00"],
      "2026-06-09": ["11:00", "12:00"]
    },
    instructions: ["Fasting is not required", "Carry immunization or doctor prescription if applicable"]
  }
];

async function seed() {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(MONGO_URI);
    console.log("Database connected successfully!");

    // Clear existing data
    console.log("Clearing existing collections...");
    await Doctor.deleteMany({});
    await Service.deleteMany({});
    await Appointment.deleteMany({});
    await ServiceAppointment.deleteMany({});

    // Seed Doctors
    console.log("Seeding doctors...");
    const createdDoctors = [];
    for (const doc of doctorsData) {
      const created = await Doctor.create(doc);
      createdDoctors.push(created);
    }
    console.log(`Seeded ${createdDoctors.length} doctors.`);

    // Seed Services
    console.log("Seeding services...");
    const createdServices = [];
    for (const svc of servicesData) {
      const created = await Service.create(svc);
      createdServices.push(created);
    }
    console.log(`Seeded ${createdServices.length} services.`);

    // Sample Appointments
    console.log("Seeding sample appointments...");
    const mockClerkId = "user_2hY9V1xT4yZ6KlmOpQrStUvWxYz";

    const docAppointments = [
      {
        patientName: "Mayank Kumar",
        mobile: "9876543210",
        age: 24,
        gender: "Male",
        doctorId: createdDoctors[0]._id,
        doctorName: createdDoctors[0].name,
        speciality: createdDoctors[0].specialization,
        doctorImage: { url: createdDoctors[0].imageUrl, publicId: "" },
        date: "2026-06-08",
        time: "10:00",
        fees: createdDoctors[0].fee,
        status: "Confirmed",
        payment: {
          method: "Online",
          status: "Paid",
          amount: createdDoctors[0].fee,
          providerId: "pay_mock123",
          meta: {}
        },
        createdBy: mockClerkId
      },
      {
        patientName: "Priya Sharma",
        mobile: "8765432109",
        age: 30,
        gender: "Female",
        doctorId: createdDoctors[1]._id,
        doctorName: createdDoctors[1].name,
        speciality: createdDoctors[1].specialization,
        doctorImage: { url: createdDoctors[1].imageUrl, publicId: "" },
        date: "2026-06-09",
        time: "11:00",
        fees: createdDoctors[1].fee,
        status: "Pending",
        payment: {
          method: "Cash",
          status: "Pending",
          amount: createdDoctors[1].fee,
          providerId: "",
          meta: {}
        },
        createdBy: mockClerkId
      },
      {
        patientName: "Ramesh Nair",
        mobile: "7654321098",
        age: 55,
        gender: "Male",
        doctorId: createdDoctors[2]._id,
        doctorName: createdDoctors[2].name,
        speciality: createdDoctors[2].specialization,
        doctorImage: { url: createdDoctors[2].imageUrl, publicId: "" },
        date: "2026-06-08",
        time: "14:00",
        fees: createdDoctors[2].fee,
        status: "Completed",
        payment: {
          method: "Online",
          status: "Paid",
          amount: createdDoctors[2].fee,
          providerId: "pay_mock456",
          meta: {}
        },
        createdBy: "user_mock456"
      },
      {
        patientName: "Sunita Verma",
        mobile: "6543210987",
        age: 42,
        gender: "Female",
        doctorId: createdDoctors[3]._id,
        doctorName: createdDoctors[3].name,
        speciality: createdDoctors[3].specialization,
        doctorImage: { url: createdDoctors[3].imageUrl, publicId: "" },
        date: "2026-06-09",
        time: "15:00",
        fees: createdDoctors[3].fee,
        status: "Canceled",
        payment: {
          method: "Online",
          status: "Refunded",
          amount: createdDoctors[3].fee,
          providerId: "pay_mock789",
          meta: {}
        },
        createdBy: mockClerkId
      },
      {
        patientName: "Kabir Malhotra",
        mobile: "9988776655",
        age: 28,
        gender: "Male",
        doctorId: createdDoctors[0]._id,
        doctorName: createdDoctors[0].name,
        speciality: createdDoctors[0].specialization,
        doctorImage: { url: createdDoctors[0].imageUrl, publicId: "" },
        date: "2026-06-08",
        time: "11:00",
        fees: createdDoctors[0].fee,
        status: "Confirmed",
        payment: {
          method: "Cash",
          status: "Pending",
          amount: createdDoctors[0].fee,
          providerId: "",
          meta: {}
        },
        createdBy: mockClerkId
      }
    ];

    const svcAppointments = [
      {
        patientName: "Amit Singh",
        mobile: "9812345678",
        age: 35,
        gender: "Male",
        serviceId: createdServices[0]._id,
        serviceName: createdServices[0].name,
        serviceImage: { url: createdServices[0].imageUrl, publicId: "" },
        fees: createdServices[0].price,
        date: "2026-06-08",
        hour: 9,
        minute: 0,
        ampm: "AM",
        status: "Confirmed",
        payment: {
          method: "Online",
          status: "Paid",
          amount: createdServices[0].price,
          providerId: "pay_svc123",
          sessionId: "sess_svc123",
          meta: {}
        },
        createdBy: mockClerkId
      },
      {
        patientName: "Neelam Kulkarni",
        mobile: "9823456789",
        age: 29,
        gender: "Female",
        serviceId: createdServices[1]._id,
        serviceName: createdServices[1].name,
        serviceImage: { url: createdServices[1].imageUrl, publicId: "" },
        fees: createdServices[1].price,
        date: "2026-06-08",
        hour: 8,
        minute: 0,
        ampm: "AM",
        status: "Pending",
        payment: {
          method: "Cash",
          status: "Pending",
          amount: createdServices[1].price,
          providerId: "",
          sessionId: "",
          meta: {}
        },
        createdBy: mockClerkId
      },
      {
        patientName: "Gaurav Sen",
        mobile: "9834567890",
        age: 62,
        gender: "Male",
        serviceId: createdServices[8]._id,
        serviceName: createdServices[8].name,
        serviceImage: { url: createdServices[8].imageUrl, publicId: "" },
        fees: createdServices[8].price,
        date: "2026-06-09",
        hour: 9,
        minute: 0,
        ampm: "AM",
        status: "Confirmed",
        payment: {
          method: "Online",
          status: "Paid",
          amount: createdServices[8].price,
          providerId: "pay_svc456",
          sessionId: "sess_svc456",
          meta: {}
        },
        createdBy: "user_mock456"
      }
    ];

    for (const app of docAppointments) {
      await Appointment.create(app);
    }

    for (const app of svcAppointments) {
      await ServiceAppointment.create(app);
    }

    console.log("Seeded sample appointments successfully!");
    console.log("Database seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("Error Seeding Database:", error);
    process.exit(1);
  }
}

seed();

import mongoose from "mongoose";

const admissionRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
  },
  patientName: {
    type: String,
  },
  opNo: {
    type: String,
  },
  dischargeDate: {
    type: Date,
  },
  admittedDate: {
    type: Date,
  },
  roomNo: {
    type: String,
  },
});
export const AdmissionRecord = mongoose.model(
  "AdmissionRecord",
  admissionRecordSchema
);

const patientSchema = new mongoose.Schema(
  {
    englishName: {
      type: String,
      required: true,
    },
    arabicName: {
      type: String,
      required: true,
    },

    cardType: {
      type: String,
      required: true,
    },

    phoneNo: {
      type: String,
      required: true,
    },
    emailId: {
      type: String,
      required: true,
    },

    patientFileNo: {
      type: String,
    },
    dob: {
      type: Date,
      required: true,
    },
    idCard: {
      type: String,
    },
    fileStatus: {
      type: String,
    },
    gender: {
      type: String,
      required: true,
    },
    marritalStatus: {
      type: String,
      required: true,
    },

    job: {
      type: String,
    },
    nationality: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    area: {
      type: String,
    },
    recognizer: {
      type: String,
      required: true,
    },

    profileImage: {
      type: String,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    patientFileNo: {
      type: String,
    },

    visitedDoctors: [
      {
        doctorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Doctor",
        },
        doctorName: String,
        visitedDate: Date,
        reason: String,
        visitType: String,
        branch: {
          type: String,
        },
        prescriptionId: String,
      },
    ],
  },

  { timestamps: true }
);

patientSchema.pre("save", async function (next) {
  if (!this.opNo) {
    const lastVendor = await mongoose
      .model("Patient")
      .findOne({}, {}, { sort: { createdAt: -1 } });

    let nextId = "OPNO001";
    if (lastVendor && lastVendor.opNo) {
      const lastNumber = parseInt(lastVendor.opNo.replace("OPNO", ""), 10);
      nextId = `OPNO${String(lastNumber + 1).padStart(3, "0")}`;
    }
    this.opNo = nextId;
  }
  if (!this.patientFileNo) {
    const lastVendor = await mongoose
      .model("Patient")
      .findOne({}, {}, { sort: { createdAt: -1 } });

    let nextNo = "00O001";
    if (lastVendor && lastVendor.patientFileNo) {
      const lastNumber = parseInt(lastVendor.patientFileNo, 10);
      nextNo = `${String(lastNumber + 1).padStart(3, "0")}`;
    }
    this.patientFileNo = nextNo;
  }
  next();
});

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;

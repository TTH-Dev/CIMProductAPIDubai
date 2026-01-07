import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  },
  startTime: String,
  endTime: String,
});

const doctorSchema = new mongoose.Schema(
  {
    doctorImage: { type: String, required: false },
    doctorLicienceId: { type: String, required: true },
    organizationId: { type: String, required: true },
    doctorName: { type: String, required: true },
    phoneNo: { type: Number, required: true },
    address: { type: String, required: true },
    department: { type: String, required: true },
    roomNo: { type: String, required: true },
    dateOfJoining: { type: Date, required: true },
    doctorId: { type: String, unique: true },
    emailId: { type: String, required: true },
    bloodGroup: { type: String },
    dateOfBirth: { type: Date },
    specialist: { type: String, required: true },
    color: {
      type: String,
      unique: true,
    },
    shift: {
      type: [shiftSchema],
      default: [],
    },
    slotStatus: [
      {
        slotDate: Date,
        time: String,
        status: String,
      },
    ],
    durationOfConsulting: { type: String },
    customizeTime: { type: Number },
    availabilityDays: { type: [String] },
    feesType: [{}],
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
  },
  { timestamps: true }
);

doctorSchema.pre("save", async function (next) {
  if (!this.doctorId) {
    const lastVendor = await mongoose
      .model("Doctor")
      .findOne({}, {}, { sort: { createdAt: -1 } });

    let nextId = "DOC001";
    if (lastVendor && lastVendor.doctorId) {
      const lastNumber = parseInt(lastVendor.doctorId.replace("DOC", ""), 10);
      nextId = `DOC${String(lastNumber + 1).padStart(3, "0")}`;
    }
    this.doctorId = nextId;
  }

  if (!this.color) {
    let color;
    const usedColors = new Set(
      (await mongoose.model("Doctor").find({}, "color")).map((doc) => doc.color)
    );
    do {
      color =
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0");
    } while (usedColors.has(color));
    this.color = color;
  }

  next();
});

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;

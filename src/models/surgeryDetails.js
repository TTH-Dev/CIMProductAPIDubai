import mongoose from "mongoose";

const vitalChartSchema = new mongoose.Schema({
  weight: Number,
  bpSystolic: Number,
  bpDiastolic: Number,
  hr: Number,
  spo2: Number,
  temperature: Number,
  grbs: Number,
  notes: String,
  time:String,
  date:Date,
  mark:Boolean,
  doctorCheck:Boolean,
  recordedAt: {
    type: Date,
    default: Date.now,
  },
});

const dietSchema = new mongoose.Schema({
  date: Date,
  time: String,
  foodType: String,
});

const patchSchema = new mongoose.Schema({
  date: Date,
  time: String,
  removed: {
    type: Boolean,
    default: false,
  },
});

const postCareSchema = new mongoose.Schema({
  date: Date,
  time: String,
  name: String,
});


const nurseActivitySchema = new mongoose.Schema({
  vitalChart: [vitalChartSchema],
  diet: [dietSchema],
  patch: [patchSchema],
  postCare: [postCareSchema],
});

const medicineTimingSchema = new mongoose.Schema({
  dose: String,
  given: Boolean,
});

const medicineActivitySchema = new mongoose.Schema({
  date: Date,
  name: String,
  mrg: medicineTimingSchema,
  aft: medicineTimingSchema,
  eve: medicineTimingSchema,
  ngt: medicineTimingSchema,
  instruction: String,
});

const dischargeNoteSchema = new mongoose.Schema({
  name: String,
  surgeryName: String,
  surgeryDate: Date,
  surgeonName: String,
  patientName: String,
  dischargeDate: Date,
  dischargeTime: String,
  patientSignature: String,
  surgeonSignature: String,
  representativeName: String,
  representativeSignature: String,
  representativeDateTime: Date,
  witnessName: String,
  witnessSignature: String,
  witnessDateTime: Date,
});

const sterilizationSchema = new mongoose.Schema({
  tempPressure: String,
  loadingTime: String,
  holdingTime: String,
  uploadingTime: String,
  operatorName: String,
  otTechnicianName: String,
});

const surgeryDetailsSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    surgertData: {
      surgeon: {
        type: String,
      },
      anesthetist: {
        type: String,
      },
      coSurgeon: {
        type: String,
      },
      nursingStaff: {
        type: String,
      },
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    blockRoomInTime: {
      type: String,
    },
    otOutTime: {
      type: String,
    },
    inTime: {
      type: String,
    },
    outTime: {
      type: String,
    },
    surgeryDetails: [
      {
        surgeryName: {
          type: String,
        },
        surgeryType: {
          type: String,
        },
        categories: {
          type: String,
        },
        amount: {
          type: Number,
        },
        discount: {
          type: Number,
        },
        totalAmount: {
          type: Number,
        },
      },
    ],

    subTotal: {
      type: Number,
    },
    discount: {
      type: Number,
    },
    total: {
      type: Number,
    },

    surgeryDetailsRight: [
      {
        surgeryName: {
          type: String,
        },
        surgeryType: {
          type: String,
        },
        categories: {
          type: String,
        },
        amount: {
          type: Number,
        },
        discount: {
          type: Number,
        },
        totalAmount: {
          type: Number,
        },
      },
    ],
    subTotalRight: {
      type: Number,
    },
    discountRight: {
      type: Number,
    },
    totalRight: {
      type: Number,
    },
    surgeryDetailsPost: [
      {
        surgeryName: {
          type: String,
        },
        surgeryType: {
          type: String,
        },
        categories: {
          type: String,
        },
        amount: {
          type: Number,
        },
        discount: {
          type: Number,
        },
        totalAmount: {
          type: Number,
        },
      },
    ],
    subTotalPost: {
      type: Number,
    },
    discountPost: {
      type: Number,
    },
    totalPost: {
      type: Number,
    },

    surgeryPDF: {
      type: String,
    },
    surgeryName: {
      type: String,
    },
    surgeryDate: {
      type: Date,
    },
    surgeryTime: {
      type: String,
    },
    otActivity: {
      otNotes: String,
    },
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Billing",
    },
    doctorActivity: { complaint: String },
    nurseActivity: nurseActivitySchema,
    medicineActivity: [medicineActivitySchema],
    dischargeNote: dischargeNoteSchema,
    sterilization: [sterilizationSchema],
    fallrickAssement:{
      total:{
        type:Number
      },
  date: {
    type:Date
  },
  historyofFalling:{
    scale:{
      type:Boolean,
      default:false
    },
    scoring:{
      type:Number
    }
  },
   secondaryDiagnosis:{
    scale:{
      type:Boolean,
      default:false
    },
    scoring:{
      type:Number
    }
  },
  ambulanceAid:{
      scoring:{
      type:Number
    }
  } ,
  IVHeparinlock:{
    scale:{
      type:Boolean,
      default:false
    },
    scoring:{
      type:Number
    }
  },
    Gait:{
      scoring:{
      type:Number
    }
  } ,
    Mentalstatus :{
      scoring:{
      type:Number
    }
  
    }
  }
  },
  { timestamps: true }
);

const SurgeryDetails = mongoose.model("SurgeryDetails", surgeryDetailsSchema);
export default SurgeryDetails;

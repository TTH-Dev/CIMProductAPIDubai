import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import Prescription from "../models/Prescription.js";
import PrescribeBilling from "../models/prescribeBilling.js";
import Patient from "../models/patient.js";
import PharmacyProduct from "../models/PharmacyProduct.js";
import NurseStation from "../models/nursingStation.js";
import Doctor from "../models/Doctor.js";
import mongoose from "mongoose";

export const createPrescription = catchAsync(async (req, res, next) => {
  const {
    patientId,
    enteredDate,
    medicine,
    nurseStationData,
    description,
    admitNow,
    followUpCheckup,
    prescriptionFor,
    organizationId,
    branch
  } = req.body;

  if (!patientId) {
    return next(new AppError("Patient ID is missing", 404));
  }

  const patient = await Patient.findById(patientId).populate("outPatientId");

  const opNo = patient.opNo;

  const preData = {
    patientId,
    enteredDate,
    medicine,
    nurseStationData,
    description,
    admitNow,
    followUpCheckup,
    prescriptionFor,
    organizationId,
    branch
  };

  const ids = medicine.map((m) => m.medicineId);

  const billDetailsFromDB = await Promise.all(
    ids.map((id) => PharmacyProduct.findById(id))
  );

  const billData = medicine.map((m, index) => {
    const dbData = billDetailsFromDB[index];

    return {
      medicineName: dbData.name,
      medicineType: dbData.medicineType,
      quantity: m.quantity,
      quantityType: m.quantityType,
      taxAmount: m.taxAmount || 0,
      tax: dbData.salesTax1,
      amount: dbData.MRP,
      discount: 0,
      totalAmount: dbData.MRP,
    };
  });

  const prescription = await Prescription.create(preData);

  const nurseData = {
    prescriptionId: prescription._id,
    patientId,
    enteredDate,
    opNo,
    medicine: nurseStationData,
    description,
    admitNow,
    followUpCheckup,
    prescriptionFor,
    organizationId,
    branch
  };

  let nurseStation

  if(nurseStationData[0].medicineType){

 nurseStation = await NurseStation.create(nurseData);
  }



  const data = {
    patientId,
    UHID: patient.UHID,
    patientName: patient.PatientName,
    visitType: patient.visitType,
    status: "Unpaid",
    billDetails: billData,
    prescriptionId: prescription._id,
    prescriptionFor,
    organizationId,
    followUpCheckup,
    medicine,
    doctorId: patient.doctorId,
    branch
  
  };

  const prescribeBilling = await PrescribeBilling.create(data);

    if(prescribeBilling){

  let dd = await Patient.findOne({ _id: patientId });


if (dd.visitedDoctors.length) {
 
  
  const lastIndex = dd.visitedDoctors.length - 1;
  const ff = dd.visitedDoctors[lastIndex];

  const jk = { ...ff.toObject?.() || ff, prescriptionId: prescribeBilling._id };

  dd.visitedDoctors[lastIndex] = jk;
} else {
  dd.visitedDoctors = [{ prescriptionId: prescribeBilling._id }];
}
await dd.save();



  }

  res.status(200).json({
    status: "Success",
    data: { prescription, prescribeBilling, nurseStation },
  });
});

export const getAllPrescriptions = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;


  let filter = {};

  if (!req.query.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  } else {
    filter.organizationId = req.query.organizationId;
  }

    if (req.query.branch) {
    filter.branch = req.query.branch;
  }

  if (req.query.patientId) {
    filter.patientId = req.query.patientId;
  }
  if (req.query.prescriptionFor) {
    filter.prescriptionFor = req.query.prescriptionFor;
  }
 const inputDate = new Date(req.query.date);
const startOfDay = new Date(inputDate);
startOfDay.setHours(0, 0, 0, 0);

const endOfDay = new Date(inputDate);
endOfDay.setHours(23, 59, 59, 999);

if(req.query.date){
filter.enteredDate = { $gte: startOfDay, $lt: endOfDay };
}

  const features = new APIFeatures(
    Prescription.find(filter)
      .populate("patientId")
      .populate({ path: "medicine.medicineId" }),
    req.query
  )
    .limitFields()
    .sort()
    .paginate();

  const prescriptions = await features.query;
  const totalRecords = await Prescription.countDocuments(filter);
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "Success",
    totalPages,
    currentPage: page,
    result: prescriptions.length,
    data: { prescriptions },
  });
});

export const getAllNurseSations = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  let filter = {};

  if (!req.query.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  } else {
    filter.organizationId = req.query.organizationId;
  }

    if (req.query.branch) {
    filter.branch = req.query.branch;
  }

  if (req.query.patientId) {
    filter.patientId = req.query.patientId;
  }

  if (req.query.prescriptionFor) {
    filter.prescriptionFor = req.query.prescriptionFor;
  }

  if (req.query.date) {
    const date = new Date(req.query.date);
    filter.enteredDate = {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999)),
    };
  }
  const features = new APIFeatures(
    NurseStation.find(filter)
      .populate("patientId")
      .populate({ path: "medicine.medicineId" }),
    req.query
  )
    .limitFields()
    .sort()
    .paginate();

  const nurseStation = await features.query;
  const totalRecords = await NurseStation.countDocuments(filter);
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "Success",
    totalPages,
    currentPage: page,
    result: nurseStation.length,
    data: { nurseStation },
  });
});

export const getPrescriptionById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const prescription = await Prescription.findById(id);
  if (!prescription) {
    return next(new AppError("Prescription not found", 404));
  }

  res.status(200).json({
    status: "Success",
    data: { prescription },
  });
});

export const getNurseStaionsById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const nurseStation = await NurseStation.findById(id);
  if (!nurseStation) {
    return next(new AppError("nurseStation not found", 404));
  }

  res.status(200).json({
    status: "Success",
    data: { nurseStation },
  });
});

export const updatePrescription = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const updatedPrescription = await Prescription.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedPrescription) {
    return next(new AppError("Prescription not found", 404));
  }

  res.status(200).json({
    status: "Success",
    data: { updatedPrescription },
  });
});

export const updateNurseStation = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const updatedNurseStation = await NurseStation.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedNurseStation) {
    return next(new AppError("Prescription not found", 404));
  }

  res.status(200).json({
    status: "Success",
    data: { updatedNurseStation },
  });
});
export const deletePrescription = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedPrescription = await Prescription.findByIdAndDelete(id);
  if (!deletedPrescription) {
    return next(new AppError("Prescription not found", 404));
  }

  res.status(204).json({
    status: "Success",
    data: null,
  });
});

export const updatePrescriptionData = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    patientId,
    enteredDate,
    medicine,
    description,
    admitNow,
    followUpCheckup,
  } = req.body;

  if (!patientId || !medicine || !enteredDate) {
    return next(new AppError("Required fields are missing", 400));
  }

  const updatedPrescription = await Prescription.findByIdAndUpdate(
    id,
    {
      patientId,
      enteredDate,
      medicine,
      description,
      admitNow,
      followUpCheckup,
    },
    { new: true, runValidators: true }
  );

  const updatedNursingStation = await NurseStation.findOneAndUpdate(
    { prescriptionId: id },
    {
      patientId,
      enteredDate,
      medicine,
      description,
      admitNow,
      followUpCheckup,
    },
    { new: true, runValidators: true }
  );

  const ids = medicine.map((m) => m.medicineId);
  const billDetailsFromDB = await Promise.all(
    ids.map((id) => PharmacyProduct.findById(id))
  );

  const billDetails = medicine.map((m, index) => {
    const dbData = billDetailsFromDB[index];
    return {
      medicineName: dbData.name,
      medicineType: dbData.medicineType,
      medicineId: dbData._id,
      quantity: m.quantity,
      quantityType: m.quantityType,
      taxAmount: m.taxAmount || 0,
      tax: dbData.salesTax1,
      amount: dbData.MRP,
      discount: 0,
      totalAmount: dbData.MRP,
    };
  });

  const subTotal = billDetails.reduce((acc, val) => acc + val.amount, 0);

  const updatedPrescribeBilling = await PrescribeBilling.findOneAndUpdate(
    { prescriptionId: id },
    {
      billDetails,
      subTotal,
      billAmount: subTotal,
      total: subTotal,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "Success",
    data: {
      updatedPrescription,
      updatedPrescribeBilling,
      updatedNursingStation,
    },
  });
});

export const getAllPrescriptionsBilling = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  let filter = {};

  if (!req.query.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  } else {
    filter.organizationId = req.query.organizationId;
  }

   if (req.query.branch) {
    filter.branch = req.query.branch;
  }

  if (req.query.patientId) {
    filter.patientId = req.query.patientId;
  }
  if (req.query.prescriptionFor) {
    filter.prescriptionFor = req.query.prescriptionFor;
  }



  if (req.query.date) {
    const date = new Date(req.query.date);
    filter.createdAt = {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999)),
    };
  }
  const features = new APIFeatures(
    PrescribeBilling.find(filter)
      .populate("doctorId")
      .populate("prescriptionId")
      .populate("organizationId")
      .populate({
        path: "patientId",
        populate: [{ path: "doctorId" }, { path: "organizationId" }],
      }),
    req.query
  )
    .limitFields()
    .sort()
    .paginate();

  const prescriptions = await features.query;
  const totalRecords = await PrescribeBilling.countDocuments(filter);
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "Success",
    totalPages,
    currentPage: page,
    result: prescriptions.length,
    data: { prescriptions },
  });
});


export const prescBillget=catchAsync(async(req,res)=>{
  const limit = parseInt(req.query.limit) || 10;
const page = parseInt(req.query.page) || 1;

const matchStage = {
  organizationId: new mongoose.Types.ObjectId(req.query.organizationId)
};

if (req.query.branch) matchStage.branch = req.query.branch;
if (req.query.patientId) matchStage.patientId = new mongoose.Types.ObjectId(req.query.patientId);
if (req.query.prescriptionFor) matchStage.prescriptionFor = req.query.prescriptionFor;

if (req.query.date) {
  const date = new Date(req.query.date);
  matchStage.createdAt = {
    $gte: new Date(date.setHours(0, 0, 0, 0)),
    $lt: new Date(date.setHours(23, 59, 59, 999)),
  };
}

const pipeline = [
  { $match: matchStage },
  {
    $lookup: {
      from: "patients",
      localField: "patientId",
      foreignField: "_id",
      as: "patient",
    },
  },
  { $unwind: "$patient" },
];

// Only apply this if `emrStatus` is in query
if (req.query.emrStatus) {
pipeline.push({
  $match: {
    "patient.emrStatus": { $regex: `^${req.query.emrStatus}$`, $options: "i" },
  },
});

}

pipeline.push({
    $facet: {
      data: [
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ],
      totalCount: [
        { $count: "count" },
      ],
    },
  });

  const result = await PrescribeBilling.aggregate(pipeline);
  const prescriptions = result[0]?.data || [];
  const totalRecords = result[0]?.totalCount[0]?.count || 0;
  const totalPages = Math.ceil(totalRecords / limit);
res.status(200).json({
  status: "Success",
  result: prescriptions.length,
  data: { prescriptions },totalPages
});

})

export const prescBillgetMain=catchAsync(async(req,res)=>{
  const limit = parseInt(req.query.limit) || 10;
const page = parseInt(req.query.page) || 1;

const matchStage = {
  organizationId: new mongoose.Types.ObjectId(req.query.organizationId)
};

if (req.query.branch) matchStage.branch = req.query.branch;
if (req.query.patientId) matchStage.patientId = new mongoose.Types.ObjectId(req.query.patientId);
if (req.query.prescriptionFor) matchStage.prescriptionFor = req.query.prescriptionFor;

if (req.query.date) {
  const date = new Date(req.query.date);
  matchStage.createdAt = {
    $gte: new Date(date.setHours(0, 0, 0, 0)),
    $lt: new Date(date.setHours(23, 59, 59, 999)),
  };
}

const pipeline = [
  { $match: matchStage },
   {
    $lookup: {
      from: "organizations",
      localField: "organizationId",
      foreignField: "_id",
      as: "organization"
    }
  },
 { $unwind: { path: "$organization", preserveNullAndEmptyArrays: true } },
   {
    $lookup: {
      from: "doctors",
      localField: "doctorId",
      foreignField: "_id",
      as: "doctor"
    }
  },
 { $unwind: { path: "$doctor" } },
  {
    $lookup: {
      from: "patients",
      localField: "patientId",
      foreignField: "_id",
      as: "patient",
    },
  },
  { $unwind: "$patient" },
];

// Only apply this if `emrStatus` is in query
if (req.query.emrStatus) {
pipeline.push({
  $match: {
    "patient.emrStatus": { $regex: `^${req.query.emrStatus}$`, $options: "i" },
  },
});

}

pipeline.push({
    $facet: {
      data: [
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ],
      totalCount: [
        { $count: "count" },
      ],
    },
  });

  const result = await PrescribeBilling.aggregate(pipeline)
  console.log(result,"kl")
  const prescriptions = result[0]?.data || [];
  const totalRecords = result[0]?.totalCount[0]?.count || 0;
  const totalPages = Math.ceil(totalRecords / limit);
res.status(200).json({
  status: "Success",
  result: prescriptions.length,
  data: { prescriptions },totalPages
});

})

export const createPastOcularHistory = catchAsync(async (req, res, next) => {

  const { patientId } = req.body;

  if (!patientId) {
    return next(new AppError("Patient ID is missing", 400));
  }
  if (!req.body.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  }

  const pastOcularHistory = await PrescribeBilling.create(req.body);



  res.status(201).json({
    status: "Success",
    data: { pastOcularHistory },
  });
});

export const editPrescribeBilling = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const billing = await PrescribeBilling.findById(id);
  if (!billing) {
    return next(new AppError("Prescribe Billing not found", 404));
  }

  const updatableFields = [
    "UHID",
    "patientName",
    "patientType",
    "status",
    "subTotal",
    "discount",
    "taxAmount",
    "total",
    "paymentMode",
    "amount",
    "pendingAmount",
    "insuranceDetails",
    "prescriptionFor",
  ];

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      billing[field] = req.body[field];
    }
  });

  if (Array.isArray(req.body.billDetails)) {
    billing.billDetails = req.body.billDetails;

    for (const item of req.body.billDetails) {
      if (item.medicineId && item.quantity) {
        await PharmacyProduct.findByIdAndUpdate(
          item.medicineId,
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
        
      }
    }

    const subTotal = billing.billDetails.reduce(
      (sum, item) => sum + (item.totalAmount || 0),
      0
    );
    billing.subTotal = subTotal;
    billing.total =
      subTotal + (billing.taxAmount || 0) - (billing.discount || 0);
  }

  if (req.body.paymentDate) {
    billing.paymentDate = new Date(req.body.paymentDate);
  }

  const updatedBilling = await billing.save();

  res.status(200).json({
    status: "Success",
    message: "Prescribe Billing updated successfully",
    data: updatedBilling,
  });
});

export const getPrescriptionBillingById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const prescriptionBilling = await PrescribeBilling.findById(id).populate({
    path: "patientId",
    populate: {
      path: "doctorId",
    },
  });

  if (!prescriptionBilling) {
    return next(new AppError("Prescription not found", 404));
  }

  res.status(200).json({
    status: "Success",
    data: { prescriptionBilling },
  });
});

export const addPrescribeBillingPdf = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (req.files) {
    if (req.files.prescribePDF) {
      req.body.prescribePDF = req.files?.prescribePDF[0].filename;
    }
  }
  const billing = await PrescribeBilling.findByIdAndUpdate(
    id,
    { prescribePDF: req.body.prescribePDF },
    { new: true }
  );

  if (!billing) {
    return res
      .status(404)
      .json({ message: "PrescribeBilling record not found." });
  }
  res.status(200).json({
    message: "Prescribe Billing updated successfully",
    data: updatedBilling,
  });
});





export const updateMedicine = async (req, res) => {
  try {
    const { prescriptionId,medicineId } = req.params;
    const { quantity, medicineProdId } = req.body;

    const press=await Prescription.findOne({_id:prescriptionId})
    if (!press) {
      return res.status(404).json({ message: "Prescription not found" });
    }
    const updatedPrescription = await Prescription.findOneAndUpdate(
      { _id: prescriptionId, "medicine._id": medicineId },
      {
        $set: {
          // "medicine.$.quantity": quantity,
          "medicine.$.medicineId": medicineProdId,
        },
      },
      { new: true }
    );

    if (!updatedPrescription) {
      return res.status(404).json({ message: "Prescription or medicine not found" });
    }

    res.status(200).json({
      message: "Medicine updated successfully",
      data: updatedPrescription,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

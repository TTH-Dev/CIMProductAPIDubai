import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import Billing from "../models/billing.js";
import Patient from "../models/patient.js";
import OutPatient from "../models/outPatient.js";
import Appointment from "../models/appointment.js";
import PrescribeTest from "../models/PrescribeTest.js";
import SurgeryDetails from "../models/surgeryDetails.js";
import Doctor from "../models/Doctor.js";
import Treatment from "../models/treatment.js";
import Organization from "../models/oraganization.js";
import sendEmailClient from "../utils/clientEmail.js"

export const createBilling = catchAsync(async (req, res, next) => {
  const { patientId } = req.body;

  if (!patientId) {
    return next(new AppError("PatientId Is Required", 404));
  }
  const patient = await Patient.findById(patientId);

  const billStatus = "Generated";
  req.body.UHID = patient.UHID;
  req.body.patientType = patient.patientType;
  req.body.patientName = patient.PatientName;
  const billing = await Billing.create(req.body);

  if (req.body.apStatus) {
    const id = patient.appointmentId;
    await Appointment.findByIdAndUpdate(
      id,
      { billStatus: billStatus, status: req.body.apStatus },
      { new: true, runValidators: true }
    );
  }

  if (req.body.opStatus) {
    const id = patient.outPatientId;
    await OutPatient.findByIdAndUpdate(
      id,
      { billStatus: billStatus, status: req.body.opStatus },
      { new: true, runValidators: true }
    );
  }

  const sdId = patient.surgeryDetailsId;
  const sd = await SurgeryDetails.findByIdAndUpdate(
    sdId,
    { billId: billing._id },
    { new: true, runValidators: true }
  );

  res.status(201).json({
    status: "Success",
    data: { billing },
  });
});

export const createCompleteBilling = catchAsync(async (req, res, next) => {
  const { patientId } = req.body;

  if (!patientId) {
    return next(new AppError("Patient ID is missing", 404));
  }

  if (!req.body.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  }

  const patient = await Patient.findById(req.body.patientId);

  const doctor = await Doctor.findOne(patient.doctorId);

  const gg = doctor.feesType.filter((val) => val.type === patient.visitType);

  const doctorAmount = 0;

  const subTotal = 0;

  const data = {
    patientId: req.body.patientId,
    UHID: patient.UHID,
    patientName: patient.PatientName,
    visitType: patient.visitType,
    status: "unpaid",
    billDetails: [],
    subTotal: subTotal,
    billAmount: subTotal,
    total: subTotal,
    suggestBy: "doctor",
    organizationId: patient.organizationId,
    branch: patient.branch,
    doctorName: doctor.doctorName,
    doctorCharge: doctorAmount,
  };

  const prescribeBillingTest = await Billing.create(data);

  res.status(200).json({
    status: "Success",
    data: { prescribeBillingTest },
  });
});

export const getAllBillings = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  if (!req.query.organizationId) {
    return next(new AppError("organizationId is required in query", 400));
  }

  let filter = {};

  if (req.query.branch) {
    filter.branch = req.query.branch;
  }

  if (req.query.organizationId) {
    filter.organizationId = req.query.organizationId;
  }

  const features = new APIFeatures(
    Billing.find(filter).populate({
      path: "patientId",
      populate: {
        path: "doctorId",
        model: "Doctor",
      },
    }),
    req.query
  )
    .filter()
    .limitFields()
    .sort()
    .paginate();

  const billings = await features.query;
  const totalRecords = await Billing.countDocuments(filter);
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "Success",
    totalPages,
    currentPage: page,
    result: billings.length,
    data: { billings },
  });
});

export const getBillingById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const billing = await Billing.findById(id)
    .populate("organizationId")
    .populate({
      path: "prescribeTestId",
      populate: {
        path: "testId",
        model: "Test",
      },
    })
    .populate({
      path: "patientId",
      populate: {
        path: "doctorId",
        model: "Doctor",
      },
    });
  if (!billing) {
    return next(new AppError("Billing record not found", 404));
  }

  res.status(200).json({
    status: "Success",
    data: { billing },
  });
});

// export const updateBilling = catchAsync(async (req, res, next) => {
//   const { id } = req.params;

//     const billing = await Billing.findById(id);
//   if (!billing) {
//     return next(new AppError("Billing record not found", 404));
//   }

//   const updatedBilling = await Billing.findByIdAndUpdate(id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (req.body.status === "paid") {
//     const patientId = updatedBilling.patientId;
//     const patient = await Patient.findByIdAndUpdate(patientId, {
//       billStatus: "paid",
//     });
//   }

//   const prtId = updatedBilling.prescribeTestId || "";

//   let prdaatta;

//   if (prtId) {
//     prdaatta = await PrescribeTest.findByIdAndUpdate(prtId, {
//       billStatus: "Paid",
//     });
//   }

//   if (!updatedBilling) {
//     return next(new AppError("Billing record not found", 404));
//   }

//   res.status(200).json({
//     status: "Success",
//     data: { updatedBilling, prdaatta },
//   });
// });

export const updateBilling = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Fetch existing billing record
  const billing = await Billing.findById(id);
  if (!billing) {
    return next(new AppError("Billing record not found", 404));
  }

  // If treatmentDetail is being updated, calculate amounts
  if (req.body.treatmentDetail && req.body.treatmentDetail.length > 0) {
    const treatments = await Treatment.find({
      _id: { $in: req.body.treatmentDetail },
    });

    // Build new billDetails for treatments
    const treatmentBillDetails = treatments.map((t) => ({
      categories: "Treatment",
      serviceName: t.treatmentName,
      quantity: 1,
      unitPrice: t.price,
      amount: t.price,
      tax: 0,
      discount: 0,
      totalAmount: t.price,
    }));

    // Merge with existing billDetails (optional: replace instead of merge)
    billing.billDetails = [
      ...(billing.billDetails || []),
      ...treatmentBillDetails,
    ];

    // Update totals
    const subTotal = billing.billDetails.reduce(
      (acc, item) => acc + (item.amount || 0),
      0
    );
    const taxAmount = billing.billDetails.reduce(
      (acc, item) => acc + (item.tax || 0),
      0
    );
    const discount = billing.billDetails.reduce(
      (acc, item) => acc + (item.discount || 0),
      0
    );
    const total = subTotal + taxAmount - discount;

    billing.subTotal = subTotal;
    billing.taxAmount = taxAmount;
    billing.discount = discount;
    billing.total = total;
    billing.billAmount = total;

    billing.treatmentDetail = req.body.treatmentDetail;
  }

  // Update status or other fields
  if (req.body.status) {
    billing.status = req.body.status;
    if (req.body.status === "paid") {
      await Patient.findByIdAndUpdate(billing.patientId, {
        billStatus: "paid",
      });
      if (billing.prescribeTestId) {
        await PrescribeTest.findByIdAndUpdate(billing.prescribeTestId, {
          billStatus: "Paid",
        });
      }
    }
  }

  await billing.save();

  res.status(200).json({
    status: "Success",
    data: billing,
  });
});

export const deleteBilling = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedBilling = await Billing.findByIdAndDelete(id);
  if (!deletedBilling) {
    return next(new AppError("Billing record not found", 404));
  }

  res.status(204).json({
    status: "Success",
    data: null,
  });
});

export const filterBilling = catchAsync(async (req, res, next) => {
  const filter = {};

  const {
    UHID,
    status,
    billFor,
    phoneNo,
    patientName,
    date,
    limit = 10,
    page = 1,
    organizationId,
    branch,
  } = req.query;

  if (!organizationId) {
    return next(new AppError("OrgID not present!", 400));
  }

  if (UHID) filter.UHID = UHID;
  if (status) filter.status = status;
  if (billFor) filter.billFor = billFor;
  if (phoneNo) filter.phoneNo = phoneNo;
  if (branch) filter.branch = branch;
  if (patientName) {
    filter.patientName = { $regex: patientName, $options: "i" };
  }
  if (organizationId) filter.organizationId = organizationId;
  if (date) {
    const parsedDate = new Date(date);
    filter.createdAt = {
      $gte: new Date(parsedDate.setHours(0, 0, 0, 0)),
      $lt: new Date(parsedDate.setHours(23, 59, 59, 999)),
    };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const features = new APIFeatures(
    Billing.find(filter).populate({
      path: "patientId",
      populate: {
        path: "outPatientId",
      },
    }),
    req.query
  )
    .limitFields()
    .sort()
    .paginate();

  const billings = await features.query;
  const totalBills = await Billing.countDocuments(filter);
  const totalPages = Math.ceil(totalBills / limit);

  res.status(200).json({
    status: "Success",
    totalPages,
    currentPage: parseInt(page),
    result: billings.length,
    data: { billings },
  });
});

export const getByIdPatient = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.query.patientId) {
    filter.patientId = req.query.patientId;
  }

  if (req.query.date) {
    const parsedDate = new Date(req.query.date);
    filter.createdAt = {
      $gte: new Date(parsedDate.setHours(0, 0, 0, 0)),
      $lt: new Date(parsedDate.setHours(23, 59, 59, 999)),
    };
  }

  const data = await Billing.find(filter);

  res.status(200).json({
    message: "Success",
    data,
  });
});

export const billtoMail = catchAsync(async (req, res, next) => {
  if (
    !req.query.orgId ||
    !req.query.patientName ||
    !req.query.orgName ||
    !req.query.patientEmail
  ) {
    return next(
      new AppError(
        "OrgId , patient name , org name or patient email is missing in query!",
        404
      )
    );
  }
 const filePath =
    req.files && req.files.file ? req.files.file[0].path : null;
    
      if (!filePath) {
    return next(new AppError("No PDF file uploaded!", 400));
  }

    const organizationData = await Organization.findOne({
    _id: req.query.orgId,
  });

  

  const smtpData = {
    smtpuserId: organizationData.smtpuserId,
    smtpPass: organizationData.smtpPass,
    smtpUserEmail: organizationData.smtpUserEmail,
  };

  await sendEmailClient(smtpData, {
    to: req.query.patientEmail,
    subject: "Consult bill",
    text: `
Hi ${req.query.patientName} ,

Your consultation bill is attached below.

Thank You,
${organizationData.hospitalName}
    `,
    attachments: [
      {
        filename: "consult-bill.pdf",
        path: filePath,
      },
    ],
  });
  res.status(200).json({
    message: "Mail sent successfully",
  });
});

export const precstoMail = catchAsync(async (req, res, next) => {
  if (
    !req.query.orgId ||
    !req.query.patientName ||
    !req.query.patientEmail
  ) {
    return next(
      new AppError(
        "OrgId , patient name , org name or patient email is missing in query!",
        404
      )
    );
  }
 const filePath =
    req.files && req.files.file ? req.files.file[0].path : null;
    
      if (!filePath) {
    return next(new AppError("No PDF file uploaded!", 400));
  }

    const organizationData = await Organization.findOne({
    _id: req.query.orgId,
  });

  

  const smtpData = {
    smtpuserId: organizationData.smtpuserId,
    smtpPass: organizationData.smtpPass,
    smtpUserEmail: organizationData.smtpUserEmail,
  };

  await sendEmailClient(smtpData, {
    to: req.query.patientEmail,
    subject: "Prescription",
    text: `
Hi ${req.query.patientName} ,

Your prescription is attached below.

Thank You,
${organizationData.hospitalName}
    `,
    attachments: [
      {
        filename: "prescription.pdf",
        path: filePath,
      },
    ],
  });
  res.status(200).json({
    message: "Mail sent successfully",
  });
});

export const pharmaBilltoMail = catchAsync(async (req, res, next) => {
  if (
    !req.query.orgId ||
    !req.query.patientName ||
    !req.query.patientEmail
  ) {
    return next(
      new AppError(
        "OrgId , patient name  or patient email is missing in query!",
        404
      )
    );
  }
 const filePath =
    req.files && req.files.file ? req.files.file[0].path : null;
    
      if (!filePath) {
    return next(new AppError("No PDF file uploaded!", 400));
  }

    const organizationData = await Organization.findOne({
    _id: req.query.orgId,
  });

  

  const smtpData = {
    smtpuserId: organizationData.smtpuserId,
    smtpPass: organizationData.smtpPass,
    smtpUserEmail: organizationData.smtpUserEmail,
  };

  await sendEmailClient(smtpData, {
    to: req.query.patientEmail,
    subject: "Pharmacy Bill",
    text: `
Hi ${req.query.patientName} ,

Your pharmacy bill is attached below.

Thank You,
${organizationData.hospitalName}
    `,
    attachments: [
      {
        filename: "prescription.pdf",
        path: filePath,
      },
    ],
  });
  res.status(200).json({
    message: "Mail sent successfully",
  });
});


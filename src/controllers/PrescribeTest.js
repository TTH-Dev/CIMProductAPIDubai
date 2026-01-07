import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import PrescribeTest from "../models/PrescribeTest.js";
import Patient from "../models/patient.js";
import Test from "../models/test.js";
import Billing from "../models/billing.js";
import LapReport from "../models/LapReport.js";
import Biometrys from "../models/biometry.js";
import Doctor from "../models/Doctor.js";
import Organization from "../models/oraganization.js";
import sendEmailClient from "../utils/clientEmail.js"

export const createPrescribeTest = catchAsync(async (req, res, next) => {
  const { patientId, suggestBy } = req.body;
  const ids = req.body.testId;

  if (!patientId) {
    return next(new AppError("Patient ID is missing", 404));
  }
  if (!req.body.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  }

  const prdata = {
    patientId: patientId,
    enteredDate: req.body.enteredDate,
    testId: req.body.testId,
    suggestBy: suggestBy || "doctor",
    organizationId: req.body.organizationId,
    branch:req.body.branch
  };

  const billDetails = await Promise.all(ids.map((val) => Test.findById(val)));

  const billData = billDetails.map((val) => {
    return {
      serviceName: val.testName,
      quantity: 1,
      amount: val.price,
      discount: 0,
      totalAmount: val.price,
    };
  });

  const prescribeTest = await PrescribeTest.create(prdata);

  const patient = await Patient.findById(req.body.patientId);

  const doctor=await Doctor.findOne(patient.doctorId)

  const gg=doctor.feesType.filter((val)=>val.type===patient.visitType)

  const doctorAmount=gg[0].amount||0

  const subTotal = billData.reduce((acc, val) => acc + val.amount, 0);
  


  const data = {
    patientId: req.body.patientId,
    UHID: patient.UHID,
    patientName: patient.PatientName,
    visitType: patient.visitType,
    status: "unpaid",
    billDetails: billData,
    prescribeTestId: prescribeTest._id,
    subTotal: subTotal+doctorAmount,
    billAmount: subTotal+doctorAmount,
    total: subTotal+doctorAmount,
    suggestBy: suggestBy || "doctor",
    organizationId: patient.organizationId,
    branch:patient.branch,
    doctorName:doctor.doctorName,
    doctorCharge:doctorAmount,
    
  };

  const prescribeBillingTest = await Billing.create(data);

    if (patient.email) {
      const organizationData = await Organization.findOne({
        _id: patient.organizationId,
      });
  
      const smtpData = {
        smtpuserId: organizationData.smtpuserId,
        smtpPass: organizationData.smtpPass,
        smtpUserEmail: organizationData.smtpUserEmail,
      };
  
      await sendEmailClient(smtpData, {
        to: patient.email,
        subject: "Lab Test",
        text: `
Hi ${patient.PatientName} ,
  
Dr. ${doctor.doctorName} has recommended you to take the following test(s):

${billData.map((val) => `• ${val.serviceName}`).join("\n")}  

Thank You,
${organizationData.hospitalName}
      `,
      });
    }

  res.status(200).json({
    status: "Success",
    data: { prescribeTest, prescribeBillingTest },
  });
});

export const getAllPrescribeTests = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  let filter = {};

  if (req.query.id) {
    filter.organizationId = req.query.id;
  } else {
    return next(new AppError("Organization id required!", 400));
  }

  if(req.query.branch){
    filter.branch=req.query.branch
  }

  if (req.query.patientId) {
    filter.patientId = req.query.patientId;
  }

  if (req.query.date) {
    const date = new Date(req.query.date);
    filter.enteredDate = {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999)),
    };
  }

  const features = new APIFeatures(
    PrescribeTest.find(filter)
      .populate("testId")
      .populate("lapReportId")
      .populate({
        path: "patientId",
        populate: [
          { path: "appointmentId" },
          { path: "outPatientId" },
          { path: "doctorId" },
        ],
      }),
    req.query
  )
    .limitFields()
    .sort()
    .paginate();

  const prescribeTests = await features.query;
  const totalRecords = await PrescribeTest.countDocuments(filter);
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "Success",
    totalPages,
    currentPage: page,
    result: prescribeTests.length,
    data: { prescribeTests },
  });
});

export const getPrescribeTestById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const prescribeTest = await PrescribeTest.findById(id).populate("testId").populate("organizationId");
  if (!prescribeTest) {
    return next(new AppError("Prescribe test not found", 404));
  }

  res.status(200).json({
    status: "Success",
    data: { prescribeTest },
  });
});

export const updatePrescribeTest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { patientId, testId, enteredDate } = req.body;

  if (!patientId || !testId || !enteredDate) {
    return next(
      new AppError("Patient ID, Test IDs and Entered Date are required", 400)
    );
  }
  const updatedPrescribeTest = await PrescribeTest.findByIdAndUpdate(
    id,
    { testId },
    { new: true, runValidators: true }
  );

  const testDocs = await Promise.all(testId.map((id) => Test.findById(id)));
  const billDetails = testDocs.map((test) => ({
    serviceName: test.testName,
    quantity: 1,
    amount: test.price,
    discount: 0,
    totalAmount: test.price,
  }));

  const subTotal = billDetails.reduce((acc, val) => acc + val.amount, 0);

  const data = {
    billDetails: billDetails,
    subTotal: subTotal,
    billAmount: subTotal,
    total: subTotal,
  };

  const updatedPrescribeBillingTest = await Billing.findOneAndUpdate(
    { prescribeTestId: id },
    data,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "Success",
    data: {
      updatedPrescribeTest,
      updatedPrescribeBillingTest,
    },
  });
});

export const deletePrescribeTest = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedPrescribeTest = await PrescribeTest.findByIdAndDelete(id);
  if (!deletedPrescribeTest) {
    return next(new AppError("Prescribe test not found", 404));
  }

  res.status(204).json({
    status: "Success",
    data: null,
  });
});

export const CreateLapReport = catchAsync(async (req, res, next) => {
  const { patientId, prid } = req.body;

  if (!patientId) {
    return next(new AppError("patientId is Required", 404));
  }
  if (!req.query.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  }

  if (req.files) {
    if (req.files.lapReportPdf) {
      req.body.lapReportPdf = req.files?.lapReportPdf[0].filename;
    }
  }

  const presData = await PrescribeTest.findById(prid);

  const data = {
    patientId: patientId,
    enteredDate: Date.now(),
    testData: req.body.testData,
    testStartTime: req.body.testStartTime,
    testEndTime: req.body.testEndTime,
    testId: presData.testId,
    organizationId: req.query.organizationId,
    branch:req.query.branch
  };
  const lapreport = await LapReport.create(data);

  const presCribeTest = await PrescribeTest.findByIdAndUpdate(
    prid,
    { $set: { status: "Completed", lapReportId: lapreport._id } },
    { new: true }
  );

  res.status(201).json({
    status: "Success",
    data: lapreport,
  });
});

export const getAllLapReports = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  let filter = {};

  if (!req.query.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  } else {
    filter.organizationId = req.query.organizationId;
  }

  if (req.query.patientId) {
    filter.patientId = req.query.patientId;
  }

    if (req.query.branch) {
    filter.branch = req.query.branch;
  }

  if (req.query.date) {
    const date = new Date(req.query.date);
    filter.enteredDate = {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999)),
    };
  }

  const features = new APIFeatures(
    LapReport.find(filter).populate("testId").populate("patientId"),
    req.query
  )
    .limitFields()
    .sort()
    .paginate();

  const lapReports = await features.query;
  const totalRecords = await LapReport.countDocuments(filter);
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "Success",
    totalPages,
    currentPage: page,
    result: lapReports.length,
    data: { lapReports },
  });
});

export const getLapReportById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const lapReports = await LapReport.findById(id)
    .populate("testId")
    .populate("patientId").populate("organizationId");

  if (!lapReports) {
    return res
      .status(404)
      .json({ message: "PrescribelapReports record not found." });
  }

  res.status(200).json({
    status: "Success",
    message: " lapReports updated successfully",
    data: lapReports,
  });
});

export const addLapReportPdf = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (req.files) {
    if (req.files.lapReportPdf) {
      req.body.lapReportPdf = req.files?.lapReportPdf[0].filename;
    }
  }
  const updatedlapReports = await LapReport.findByIdAndUpdate(
    id,
    { lapReportPdf: req.body.lapReportPdf },
    { new: true }
  );

  if (!updatedlapReports) {
    return res
      .status(404)
      .json({ message: "PrescribelapReports record not found." });
  }

  res.status(200).json({
    status: "Success",
    message: " lapReports updated successfully",
    data: updatedlapReports,
  });
});

export const getAllReports = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  let filter = {};

  if (!req.query.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  } else {
    filter.organizationId = req.query.organizationId;
  }

  if (req.query.patientId) {
    filter.patientId = req.query.patientId;
  }

    if (req.query.branch) {
    filter.branch = req.query.branch;
  }

  if (req.query.date) {
    const date = new Date(req.query.date);
    filter.enteredDate = {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999)),
    };
  }

  const [lapReportsRaw, biometryRaw] = await Promise.all([
    LapReport.find(filter).populate("testId patientId"),
    Biometrys.find(filter).populate("patientId"),
  ]);

  const lapReports = lapReportsRaw.map((item) => ({
    id: item._id,
    createdAt: item.enteredDate,
    type: "LapReport",
    lapReportPdf: item.lapReportPdf,
  }));

  const bioMetry = biometryRaw.map((item) => ({
    id: item._id,
    createdAt: item.enteredDate,
    type: "BiometryReport",
    biometryWorkSheet: item.biometryWorkSheet,
  }));
  const mergedReports = [...lapReports, ...bioMetry];

  const sorted = mergedReports.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const start = (page - 1) * limit;
  const paginated = sorted.slice(start, start + limit);
  const totalRecords = sorted.length;
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "Success",
    totalPages,
    currentPage: page,
    result: paginated.length,
    data: paginated,
  });
});

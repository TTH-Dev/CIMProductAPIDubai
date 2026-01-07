import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import Patient from "../models/patient.js";
import OutPatient from "../models/outPatient.js";
import Appointment from "../models/appointment.js";
import Doctor from "../models/Doctor.js";
import moment from "moment";
import TestedBy from "../models/testedBy.js";
import Subadmin from "../models/subAdmin.js";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import mongoose from "mongoose";
import { io } from "../../server.js";
import Notify from "../models/notification.js";
import Organization from "../models/oraganization.js";
import sendEmailClient from "../utils/clientEmail.js";

export const createPatient = catchAsync(async (req, res, next) => {
  const { patientData } = req.body;
  const patientDetails = JSON.parse(patientData);

  if (!patientDetails.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  }

  if (req.files) {
    if (req.files?.patientImage) {
      patientDetails.patientImage = req.files?.patientImage[0].filename;
    }
  }

  const patient = await Patient.create(patientDetails);

  res.status(200).json({
    status: "Success",
    message: "Patient Created",
    data: {
      patient,
    },
  });
});

export const createappPatient = catchAsync(async (req, res, next) => {
  const {
 englishName,
    arabicName,
    cardType,
    phoneNo,
    emailId,
    doctorId,
    patientFileNo,
    dob,
    idCard,
    fileStatus,
    gender,
    marritalStatus,
    visitType,
    job,
    nationality,
    city,
    area,
    recognizer,
    reasonOfVisit,
    isInsurance,
    organizationId,
    branch,
    insuranceCode,
    insuranceName,
    contractingCode,
    policyNo,
    insuranceType,
    insuranceClass,
    endDate,
    insuranceCard,
    patientDeduct,
    deductPerVisit,
    approvalLimit,
    visitDate,
    visitTime,
  } = req.body;

  let patient = await Patient.findOne({ phoneNo, englishName, arabicName });

  if (!patient) {
    let data = {
      englishName,
      arabicName,
      cardType,
      phoneNo,
      emailId,
      patientFileNo,
      dob,
      idCard,
      fileStatus,
      gender,
      marritalStatus,
      job,
      nationality,
      city,
      area,
      recognizer,
      profileImage,
      organizationId,
      branch,
    };
    if (req.files) {
      if (req.files?.profileImage) {
        data.profileImage = req.files?.profileImage[0].filename;
      }
    }

    patient = await Patient.create(data);
  }

  const doctor = await Doctor.findById(doctorId);

  if (!doctor) return next(new AppError("Doctor not found", 404));

  const todayStart = moment().startOf("day").toDate();
  const todayEnd = moment().endOf("day").toDate();

  const todayTokenCount = await Appointment.countDocuments({
    organizationId,
    createdAt: { $gte: todayStart, $lte: todayEnd },
  });

  const tokenNo = todayTokenCount + 1;

  let opData = {
    englishName,
    arabicName,
    cardType,
    phoneNo,
    emailId,
    doctorId: doctor._id,
    patientFileNo,
    dob,
    idCard,
    fileStatus,
    gender,
    marritalStatus,
    visitType,
    job,
    nationality,
    city,
    area,
    recognizer,
    reasonOfVisit,
    isInsurance,
    organizationId,
    tokenNo,
    patientId: patient._id,
    branch,
    insuranceCode,
    insuranceName,
    contractingCode,
    policyNo,
    insuranceType,
    insuranceClass,
    endDate,
    insuranceCard,
    patientDeduct,
    deductPerVisit,
    approvalLimit,
    visitDate,
    visitTime,
  };

  if (req.files) {
    if (req.files?.document) {
      opData.document = req.files?.document[0].filename;
    }
  }
  const subAdmin = await Subadmin.findOne({ email: doctor.emailId });
  const newOutPatient = await Appointment.create(opData);
  const notifyData = {
    message: `${newOutPatient.patientName} added to your AP list!`,
    reciever: subAdmin._id,
  };
  await Notify.create(notifyData);
  io.to(`user-${subAdmin._id}`).emit("newOpPatient", notifyData);

  if (emailId) {
    const organizationData = await Organization.findOne({
      _id: organizationId,
    });

    const smtpData = {
      smtpuserId: organizationData.smtpuserId,
      smtpPass: organizationData.smtpPass,
      smtpUserEmail: organizationData.smtpUserEmail,
    };

    await sendEmailClient(smtpData, {
      to: emailId,
      subject: "Patient Register/AP",
      text: `
Hi ${PatientName} ,

Your appointment with Dr.${doctor.doctorName} is booked successfully.
Date : ${visitDate},
Time : ${visitTime}

Thank You,
${organizationData.hospitalName}
    `,
    });
  }

  res.status(201).json({
    status: "success",
    message: "Appoinment patient record created successfully",
    data: {
      patient: patientUpdate,
      appointment: newOutPatient,
    },
  });
});

export const createOutPatient = catchAsync(async (req, res, next) => {
  const {
    englishName,
    arabicName,
    cardType,
    phoneNo,
    emailId,
    doctorId,
    patientFileNo,
    dob,
    idCard,
    fileStatus,
    gender,
    marritalStatus,
    visitType,
    job,
    nationality,
    city,
    area,
    recognizer,
    reasonOfVisit,
    document,
    isInsurance,
    opId,
    organizationId,
    branch,
    insuranceCode,
    insuranceName,
    contractingCode,
    policyNo,
    insuranceType,
    insuranceClass,
    endDate,
    insuranceCard,
    patientDeduct,
    deductPerVisit,
    approvalLimit,
  } = req.body;

  let patient = await Patient.findOne({ phoneNo, englishName, arabicName });

  if (!patient) {
    let data = {
      englishName,
      arabicName,
      cardType,
      phoneNo,
      emailId,
      patientFileNo,
      dob,
      idCard,
      fileStatus,
      gender,
      marritalStatus,
      job,
      nationality,
      city,
      area,
      recognizer,
      profileImage,
      organizationId,
      branch,
    };
    if (req.files) {
      if (req.files?.profileImage) {
        data.profileImage = req.files?.profileImage[0].filename;
      }
    }

    patient = await Patient.create(data);
  }

  const doctor = await Doctor.findById(doctorId);

  if (!doctor) return next(new AppError("Doctor not found", 404));
  const timeSlot = req.body.timeSlot;
  const todayStart = moment().startOf("day").toDate();
  const todayEnd = moment().endOf("day").toDate();
  const queryCount = {
    organizationId,
    createdAt: { $gte: todayStart, $lte: todayEnd },
  };

  if (branch) {
    queryCount.branch = branch;
  }
  const todayTokenCount = await OutPatient.countDocuments(queryCount);

  const tokenNo = todayTokenCount + 1;

  let opData = {
    englishName,
    arabicName,
    cardType,
    phoneNo,
    emailId,
    doctorId: doctor._id,
    patientFileNo: patient.patientFileNo,
    dob,
    idCard,
    fileStatus,
    gender,
    marritalStatus,
    visitType,
    job,
    nationality,
    city,
    area,
    recognizer,
    reasonOfVisit,
    document,
    isInsurance,
    opId,
    organizationId,
    tokenNo: tokenNo,
    patientId: patient._id,
    timeSlot,
    branch,
    insuranceType,
    insuranceCode,
    insuranceName,
    contractingCode,
    policyNo,
    insuranceType,
    insuranceClass,
    endDate,
    insuranceCard,
    patientDeduct,
    deductPerVisit,
    approvalLimit,
  };

  if (req.files) {
    if (req.files?.document) {
      opData.document = req.files?.document[0].filename;
    }
  }

  const subAdmin = await Subadmin.findOne({ email: doctor.emailId });
  const newOutPatient = await OutPatient.create(opData);
  const notifyData = {
    message: `${newOutPatient.englishName} added to your OP list!`,
    reciever: subAdmin._id,
  };
  await Notify.create(notifyData);
  io.to(`user-${subAdmin._id}`).emit("newOpPatient", notifyData);

  if (emailId) {
    const organizationData = await Organization.findOne({
      _id: organizationId,
    });

    const smtpData = {
      smtpuserId: organizationData.smtpuserId,
      smtpPass: organizationData.smtpPass,
      smtpUserEmail: organizationData.smtpUserEmail,
    };

    await sendEmailClient(smtpData, {
      to: emailId,
      subject: "Patient Register/OP",
      text: `
Hi ${patient.englishName} ,

Your booking with Dr.${doctor.doctorName} is done.

Thank You,
${organizationData.hospitalName}
    `,
    });
  }

  res.status(201).json({
    status: "success",
    message: "Outpatient record created successfully",
    data: {
      patient: patientUpdate,
      outPatient: newOutPatient,
    },
  });
});

export const getAllPatients = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.query.organizationId) {
    filter.organizationId = req.query.organizationId;
  } else {
    return next(new AppError("organizationId is required!", 400));
  }

  if (req.query.branch) {
    filter.branch = req.query.branch;
  }

  if (req.query.englishName) {
    filter.englishName = {
      $regex: req.query.englishName,
      $options: "i",
    };
  }

  if (req.query.arabicName) {
    filter.arabicName = {
      $regex: req.query.arabicName,
      $options: "i",
    };
  }

  const totalDocs = await Patient.countDocuments(filter);

  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const patientData = await Patient.find(filter).limit(limit).skip(skip);

  res.status(200).json({
    status: "success",
    results: patientData.length,
    totalPages: Math.ceil(totalDocs / limit),
    data: {
      patientData,
    },
  });
});

export const getPatient = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const patient = await Patient.findById(id)
    .populate("organizationId")
    .populate("branch");

  if (!patient) {
    return next(new AppError("No Patient found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      patient,
    },
  });
});

export const updatePatient = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const patient = await Patient.findById(id);

  if (!patient) {
    return next(new AppError("No Patient found with that ID", 404));
  }

  if (req.files?.attachments) {
    const attachments = req.files.attachments.map((file) => file.filename);

    await Patient.findByIdAndUpdate(
      id,
      {
        $push: {
          attachments: {
            attachment: attachments,
            enteredDate: new Date(),
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        updatedPatient: attachments,
      },
    });
  }

  const updatedPatient = await Patient.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedPatient) {
    return next(new AppError("No Patient found with that ID", 404));
  }

  if (type === "OutPatient") {
    await OutPatient.findOneAndUpdate({ patientId: id }, req.body, {
      new: true,
    });
  } else {
    await Appointment.findOneAndUpdate({ patientId: id }, req.body, {
      new: true,
    });
  }
  const doctor = await Doctor.findOne({ _id: patient.doctorId });
  const meg = `${doctor.doctorName} has added a fresh prescription for processing.`;
  const notifyData = {
    message: meg,
  };
  await Notify.create(notifyData);

  io.to("patientPharmacy").emit("patientPharmacy", notifyData);
  res.status(200).json({
    status: "success",
    data: {
      updatedPatient: updatedPatient,
    },
  });
});

export const updateOpIp = catchAsync(async (req, res, next) => {
  const { id, updatedData } = req.body;

  const patient = await Patient.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  });

  if (!patient) {
    return next(new AppError("No Patient found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      patient,
    },
  });
});

export const deletePatient = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const patient = await Patient.findByIdAndDelete(id);
  if (!patient) {
    return next(new AppError("No Patient found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Patient Deleted Successfully",
  });
});

export const updateMultiplePatientFields = async (req, res) => {
  const { patientId, updates } = req.body;

  try {
    if (!patientId || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const updateQuery = {};
    updates.forEach((update) => {
      const { fieldPath, value } = update;
      if (fieldPath && value !== undefined) {
        updateQuery[fieldPath] = value;
      }
    });

    const updatedPatient = await Patient.findOneAndUpdate(
      { _id: patientId },
      { $set: updateQuery },
      { new: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    return res.status(200).json(updatedPatient);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating fields" });
  }
};

export const filterPatient = catchAsync(async (req, res, next) => {
  let matchStage = {};

  if (req.query.id) {
    matchStage.organizationId = req.query.id;
  } else {
    return next(new AppError("organizationId is required!", 400));
  }

  if (req.query.branch) {
    matchStage.branch = new mongoose.Types.ObjectId(req.query.branch);
  }
  if (req.query.patientName) {
    matchStage.PatientName = req.query.patientName;
  }

  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const patients = await Patient.find(matchStage)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalDocs = await Patient.countDocuments(matchStage);

  res.status(200).json({
    status: "Success",
    totalPages: Math.ceil(totalDocs / limit),
    result: patients.length,
    data: { patients },
  });
});

export const filterPatientDrp = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.query.organizationId) {
    filter.organizationId = req.query.organizationId;
  } else {
    return next(new AppError("organizationId is required!", 400));
  }

  if (req.query.branch) {
    filter.branch = req.query.branch;
  }

  if (req.query.doctorName) {
    filter.doctorName = { $regex: req.query.doctorName, $options: "i" };
  }
  if (req.query.patientType) {
    filter.patientType = req.query.patientType;
  }
  if (req.query.doctorId) {
    filter.doctorId = req.query.doctorId;
  }
  if (req.query.UHIDId) {
    filter.UHIDId = req.query.UHIDId;
  }
  if (req.query.opId) {
    filter.opId = req.query.opId;
  }
  if (req.query.phoneNo) {
    filter.phoneNo = req.query.phoneNo;
  }
  if (req.query.patientType) {
    filter.patientType = req.query.patientType;
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.date) {
    const date = new Date(req.query.date);

    filter.joiningDate = {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999)),
    };
  }

  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const features = new APIFeatures(
    OutPatient.find(filter).populate("patientId"),
    req.query
  )
    .limitFields()
    .sort()
    .paginate();

  const patient = await features.query;

  const totalProducts = await OutPatient.countDocuments(filter);
  const totalPages = Math.ceil(totalProducts / limit);

  res.status(200).json({
    status: "Success",
    totalPages: totalPages,
    currentPage: page,
    result: patient.length,
    data: { patients: patient.reverse() },
  });
});

export const filterOutPatient = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.query.organizationId) {
    filter.organizationId = req.query.organizationId;
  } else {
    return next(new AppError("organizationId is required!", 400));
  }

  if (req.query.branch) {
    filter.branch = req.query.branch;
  }

  if (req.query.doctorName) {
    filter.doctorName = { $regex: req.query.doctorName, $options: "i" };
  }
  if (req.query.patientType) {
    filter.patientType = req.query.patientType;
  }
  if (req.query.doctorId) {
    filter.doctorId = req.query.doctorId;
  }
  if (req.query.UHIDId) {
    filter.UHIDId = req.query.UHIDId;
  }
  if (req.query.opId) {
    filter.opId = req.query.opId;
  }
  if (req.query.phoneNo) {
    filter.phoneNo = req.query.phoneNo;
  }
  if (req.query.patientType) {
    filter.patientType = req.query.patientType;
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.date) {
    const date = new Date(req.query.date);

    filter.joiningDate = {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999)),
    };
  }

  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const features = new APIFeatures(
    OutPatient.find(filter).populate("patientId"),
    req.query
  )
    .limitFields()
    .sort()
    .paginate();

  const patient = await features.query;

  const totalProducts = await OutPatient.countDocuments(filter);
  const totalPages = Math.ceil(totalProducts / limit);

  res.status(200).json({
    status: "Success",
    totalPages: totalPages,
    currentPage: page,
    result: patient.length,
    data: { patients: patient.reverse() },
  });
});

// export const filterOutPatientsAndAppointments = catchAsync(
//   async (req, res, next) => {
//     let commonFilter = {};

//     if (req.query.organizationId) {
//       commonFilter.organizationId = req.query.organizationId;
//     } else {
//       return next(new AppError("organizationId is required!", 400));
//     }

//     if (req.query.branch) {
//       commonFilter.branch = req.query.branch;
//     }

//     if (req.query.doctorId) {
//       commonFilter.doctorId = req.query.doctorId;
//     }

//     if (req.query.nurseEMR) {
//       commonFilter.nurseEMR = req.query.nurseEMR;
//     }

//     if (req.query.doctorName) {
//       commonFilter.doctorName = { $regex: req.query.doctorName, $options: "i" };
//     }

//     if (req.query.phoneNo) {
//       commonFilter.phoneNo = req.query.phoneNo;
//     }

//     if (req.query.UHID) {
//       commonFilter.UHID = req.query.UHID;
//     }

//     if (req.query.status) {
//       commonFilter.status = req.query.status;
//     }

//     if (req.query.billStatus) {
//       commonFilter.billStatus = req.query.billStatus;
//     }

//     if (req.query.emrStatus) {
//       commonFilter.emrStatus = req.query.emrStatus;
//     }

//     if (req.query.date) {
//       const date = new Date(req.query.date);
//       commonFilter.createdAt = {
//         $gte: new Date(date.setHours(0, 0, 0, 0)),
//         $lt: new Date(date.setHours(23, 59, 59, 999)),
//       };

//     }

//     if (req.query.queueStatus) {
//       const statusValues = req.query.queueStatus.split(",");
//       commonFilter.queueStatus = { $in: statusValues };
//     }

//     let filter = { ...commonFilter };

//     if (req.query.isCancelled !== undefined) {
//       filter.isCancelled = req.query.isCancelled === "true";
//     }

//     if (req.query.date) {
//       const date = new Date(req.query.date);

//       filter.appointmentDate = {
//         $gte: new Date(date.setHours(0, 0, 0, 0)),
//         $lt: new Date(date.setHours(23, 59, 59, 999)),
//       };
//     }

//     console.log(filter, "filter");

//     const [outPatients, appointments] = await Promise.all([
//       OutPatient.find(commonFilter)
//         .populate({ path: "patientId", model: "Patient" })
//         .populate("doctorId")
//         .lean(),
//       Appointment.find(filter)
//         .populate("patientId")
//         .populate("doctorId")
//         .lean(),
//     ]);

//     const formattedAppointments = appointments.map((appt) => ({
//       ...appt,
//       sortTime: parseTimeSlot(appt.timeSlot),
//       type: "Appointment",
//     }));

//     const formattedOutPatients = outPatients.map((op) => ({
//       ...op,
//       sortTime: parseTimeSlot(op.timeSlot),
//       type: "OutPatient",
//     }));
//     let mergedData;
//     if (req.query.type === "outPatient") {
//       mergedData = [...formattedOutPatients];
//     } else if (req.query.type === "apointmentPatient") {
//       mergedData = [...formattedAppointments];
//     } else {
//       mergedData = [...formattedAppointments, ...formattedOutPatients];
//     }

//     mergedData.sort((a, b) => a.sortTime - b.sortTime);

//     const page = parseInt(req.query.page);
//     const limit = parseInt(req.query.limit);
//     const paginationEnabled = req.query.page && req.query.limit;

//     let paginatedData = mergedData;
//     if (paginationEnabled) {
//       const skip = (page - 1) * limit;
//       paginatedData = mergedData.slice(skip, skip + limit);
//     }

//     res.status(200).json({
//       status: "Success",
//       totalRecords: mergedData.length,
//       totalPages: paginationEnabled ? Math.ceil(mergedData.length / limit) : 1,
//       currentPage: paginationEnabled ? page : 1,
//       data: paginatedData,
//     });
//   }
// );

export const filterOutPatientsAndAppointments = catchAsync(
  async (req, res, next) => {
    let commonFilter = {};

    if (!req.query.organizationId) {
      return next(new AppError("organizationId is required!", 400));
    }
    commonFilter.organizationId = req.query.organizationId;

    if (req.query.branch) commonFilter.branch = req.query.branch;
    if (req.query.doctorId) commonFilter.doctorId = req.query.doctorId;
    if (req.query.nurseEMR) commonFilter.nurseEMR = req.query.nurseEMR;
    if (req.query.doctorName)
      commonFilter.doctorName = { $regex: req.query.doctorName, $options: "i" };
    if (req.query.phoneNo) commonFilter.phoneNo = req.query.phoneNo;
    if (req.query.status) commonFilter.status = req.query.status;
    if (req.query.billStatus) commonFilter.billStatus = req.query.billStatus;
    if (req.query.emrStatus) commonFilter.emrStatus = req.query.emrStatus;
    if (req.query.queueStatus)
      commonFilter.queueStatus = { $in: req.query.queueStatus.split(",") };

    let appointmentFilter = { ...commonFilter };

    if (req.query.isCancelled !== undefined) {
      const isCancelled = req.query.isCancelled === "true";

      appointmentFilter.isCancelled = isCancelled;
    }

    if (req.query.date) {
      const date = new Date(req.query.date);
      commonFilter.createdAt = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      };

      const date2 = new Date(req.query.date);
      appointmentFilter.visitDate = {
        $gte: new Date(date2.setHours(0, 0, 0, 0)),
        $lt: new Date(date2.setHours(23, 59, 59, 999)),
      };
    }

    const [outPatients, appointments] = await Promise.all([
      OutPatient.find(commonFilter)
        .populate({ path: "patientId", model: "Patient" })
        .populate("doctorId")
        .lean(),
      Appointment.find(appointmentFilter)
        .populate("patientId")
        .populate("doctorId")
        .lean(),
    ]);

    const formattedAppointments = appointments.map((appt) => ({
      ...appt,
      sortTime: parseTimeSlot(appt.visitTime),
      type: "Appointment",
    }));

    const formattedOutPatients = outPatients.map((op) => ({
      ...op,
      sortTime: parseTimeSlot(op.timeSlot),
      type: "OutPatient",
    }));

    let mergedData;
    if (req.query.type === "outPatient") {
      mergedData = formattedOutPatients;
    } else if (req.query.type === "apointmentPatient") {
      mergedData = formattedAppointments;
    } else {
      mergedData = [...formattedAppointments, ...formattedOutPatients];
    }

    mergedData.sort((a, b) => a.sortTime - b.sortTime);

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const paginationEnabled = req.query.page && req.query.limit;

    let paginatedData = mergedData;
    if (paginationEnabled) {
      const skip = (page - 1) * limit;
      paginatedData = mergedData.slice(skip, skip + limit);
    }

    res.status(200).json({
      status: "Success",
      totalRecords: mergedData.length,
      totalPages: paginationEnabled ? Math.ceil(mergedData.length / limit) : 1,
      currentPage: paginationEnabled ? page : 1,
      data: paginatedData,
    });
  }
);

export const filterEmr = catchAsync(async (req, res, next) => {
  let commonFilter = {};
  if (req.query.organizationId) {
    commonFilter.organizationId = req.query.organizationId;
  } else {
    return next(new AppError("organizationId is required!", 400));
  }

  if (req.query.branch) {
    commonFilter.branch = req.query.branch;
  }
  if (req.query.doctorName) {
    commonFilter.doctorName = { $regex: req.query.doctorName, $options: "i" };
  }
  if (req.query.phoneNo) {
    commonFilter.phoneNo = req.query.phoneNo;
  }

  if (req.query.status) {
    commonFilter.status = req.query.status;
  }
  if (req.query.billStatus) {
    commonFilter.billStatus = req.query.billStatus;
  }
  if (req.query.date) {
    const date = new Date(req.query.date);
    commonFilter.createdAt = {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999)),
    };
  }

  const outPatients = await OutPatient.find({ ...commonFilter })
    .populate({ path: "patientId", model: "Patient" })
    .lean();
  const appointments = await Appointment.find({ ...commonFilter })
    .populate("patientId")
    .lean();

  const formattedAppointments = appointments.map((appt) => ({
    ...appt,
    sortTime: parseTimeSlot(appt.timeSlot),
    type: "Appointment",
  }));

  const formattedOutPatients = outPatients.map((op) => ({
    ...op,
    sortTime: parseTimeSlot(op.timeSlot),
    type: "OutPatient",
  }));

  let mergedData = [...formattedAppointments, ...formattedOutPatients]
    .filter((item) => item?.patientId?.optoStatus === "completed")
    .sort((a, b) => a.sortTime - b.sortTime);

  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedData = mergedData.slice(startIndex, endIndex);

  const totalRecords = mergedData.length;
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "Success",
    totalPages,
    currentPage: page,
    totalRecords,
    result: paginatedData.length,
    data: paginatedData,
  });
});

export const getOpPatient = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const patient = await OutPatient.findById(id)
    .populate("doctorId")
    .populate("patientId");

  if (!patient) {
    return next(new AppError("No Patient found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      patient,
    },
  });
});

export const DeleteOpPatient = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const patient = await OutPatient.findByIdAndDelete(id);

  if (!patient) {
    return next(new AppError("No Patient found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

function parseTimeSlot(timeSlot) {
  return moment(timeSlot, "hh:mm A").valueOf();
}

export const getSortedPatientAndAppointments = catchAsync(
  async (req, res, next) => {
    let commonFilter = {};
    if (req.query.organizationId) {
      commonFilter.organizationId = req.query.organizationId;
    } else {
      return next(new AppError("organizationId is required!", 400));
    }

    if (req.query.branch) {
      commonFilter.branch = req.query.branch;
    }

    if (req.query.doctorName) {
      commonFilter.doctorName = { $regex: req.query.doctorName, $options: "i" };
    }
    if (req.query.phoneNo) {
      commonFilter.phoneNo = req.query.phoneNo;
    }
    if (req.query.patientType) {
      commonFilter.patientType = req.query.patientType;
    }

    if (req.query.status) {
      commonFilter.status = req.query.status;
    }

    if (req.query.date) {
      const date = new Date(req.query.date);
      commonFilter.createdAt = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      };
    }

    const outPatients = await OutPatient.find({ ...commonFilter })
      .populate("patientId")
      .lean();
    const appointments = await Appointment.find({ ...commonFilter })
      .populate("patientId")
      .lean();

    let filteredOutPatients = outPatients;
    let filteredAppointments = appointments;

    if (req.query.billStatus) {
      filteredOutPatients = filteredOutPatients.filter(
        (item) => item.patientId?.billStatus === req.query.billStatus
      );
      filteredAppointments = filteredAppointments.filter(
        (item) => item.patientId?.billStatus === req.query.billStatus
      );
    }

    const formattedAppointments = filteredAppointments.map((appt) => ({
      ...appt,
      sortTime: parseTimeSlot(appt.visitTime),
      type: "Appointment",
    }));

    const formattedOutPatients = filteredOutPatients.map((op) => ({
      ...op,
      sortTime: parseTimeSlot(op.timeSlot),
      type: "OutPatient",
    }));

    const mergedData = [...formattedAppointments, ...formattedOutPatients].sort(
      (a, b) => a.sortTime - b.sortTime
    );

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedData = mergedData.slice(startIndex, endIndex);
    const totalRecords = mergedData.length;
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
      status: "Success",
      totalPages,
      currentPage: page,
      totalRecords,
      result: paginatedData.length,
      data: { mergedData: paginatedData, outPatients, appointments },
    });
  }
);

export const getNonGenBilling = catchAsync(async (req, res, next) => {
  let commonFilter = {};
  if (req.query.organizationId) {
    commonFilter.organizationId = req.query.organizationId;
  } else {
    return next(new AppError("organizationId is required!", 400));
  }

  if (req.query.branch) {
    commonFilter.branch = req.query.branch;
  }

  if (req.query.doctorName) {
    commonFilter.doctorName = { $regex: req.query.doctorName, $options: "i" };
  }
  if (req.query.phoneNo) {
    commonFilter.phoneNo = req.query.phoneNo;
  }
  if (req.query.patientType) {
    commonFilter.patientType = req.query.patientType;
  }

  if (req.query.status) {
    commonFilter.status = req.query.status;
  }
  if (req.query.billStatus) {
    commonFilter.billStatus = req.query.billStatus;
  }
  if (req.query.date) {
    const date = new Date(req.query.date);
    commonFilter.createdAt = {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999)),
    };
  }

  const outPatients = await OutPatient.find({ ...commonFilter })
    .populate("patientId")
    .lean();
  const appointments = await Appointment.find({ ...commonFilter })
    .populate("patientId")
    .lean();

  const formattedAppointments = appointments.map((appt) => ({
    ...appt,
    sortTime: parseTimeSlot(appt.visitTime),
    type: "Appointment",
  }));

  const formattedOutPatients = outPatients.map((op) => ({
    ...op,
    sortTime: parseTimeSlot(op.timeSlot),
    type: "OutPatient",
  }));

  let mergedData = [...formattedAppointments, ...formattedOutPatients].sort(
    (a, b) => a.sortTime - b.sortTime
  );

  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedData = mergedData.slice(startIndex, endIndex);

  const totalRecords = mergedData.length;
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "Success",
    totalPages,
    currentPage: page,
    totalRecords,
    result: paginatedData.length,
    data: { mergedData: paginatedData },
  });
});

export const addTestedBy = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { testedBy } = req.body;

  const opPatient = await OutPatient.findById(id);

  const apPatient=await Appointment.findById(id)

  if(!opPatient && !apPatient){
    return next(new AppError("No patient found!",404))
  }

  const updatedPatient = await Patient.findByIdAndUpdate(
    id,
    {
      testedBy: testedBy,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  const testedByArrray = await TestedBy.create({
    testedBy: testedBy,
    organizationId: patient.organizationId,
  });

  res.status(200).json({
    status: "success",
    data: {
      testedByArrray,
      updatedPatient,
    },
  });
});

export const chaneOpStatusOrAPstatus = catchAsync(async (req, res, next) => {
  const { status, id } = req.body;

  let final;
  const patient = await OutPatient.findById(id);
  if (!patient) {
    appointmentPatient = await Appointment.findById(id);
    if (!appointmentPatient) {
      return next(new AppError("No Patient found with that ID", 404));
    }
  }
  if (patient) {
    final = await Patient.findByIdAndUpdate(
      id,
      { status: status },
      { new: true, runValidators: true }
    );
  } else {
    final = await Patient.findByIdAndUpdate(
      id,
      { status: status },
      { new: true, runValidators: true }
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      patient: final,
    },
  });
});

export const getAllTestedBy = catchAsync(async (req, res, next) => {
  if (!req.query.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  }
  let filter = {};
  if (req.query.organizationId) {
    filter.organizationId = req.query.organizationId;
  }
  if (req.query.branch) {
    filter.branch = req.query.branch;
  }
  const testedByDoc = await TestedBy.find(filter).distinct("testedBy");

  if (!testedByDoc) {
    return next(new AppError("No testedBy data found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      testedBy: testedByDoc,
    },
  });
});

export const filteremrPatient = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.query.doctorName) {
    filter.doctorName = { $regex: req.query.doctorName, $options: "i" };
  }
  if (req.query.patientStatus) {
    filter.patientStatus = req.query.patientStatus;
  }
  if (req.query.patientType) {
    filter.patientType = req.query.patientType;
  }
  if (req.query.doctorId) {
    filter.doctorId = req.query.doctorId;
  }
  if (req.query.suggestGlass) {
    filter.suggestGlass = req.query.suggestGlass;
  }
  if (req.query.UHIDId) {
    filter.UHIDId = { $regex: req.query.UHIDId, $options: "i" };
  }
  if (req.query.phoneNo) {
    filter.phoneNo = { $regex: req.query.phoneNo, $options: "i" };
  }
  if (req.query.OpId) {
    filter.OpId = req.query.OpId;
  }
  if (req.query.date) {
    const date = new Date(req.query.date);

    filter.createdAt = {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999)),
    };
  }
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const features = new APIFeatures(Patient.find(filter), req.query)
    .limitFields()
    .sort()
    .paginate();

  const patient = await features.query;

  const totalProducts = await Patient.countDocuments(filter);
  const totalPages = Math.ceil(totalProducts / limit);

  res.status(200).json({
    status: "Success",
    totalPages: totalPages,
    page: page,
    result: patient.length,
    data: { patients: patient.reverse() },
  });
});

export const getAllDmmenu = catchAsync(async (req, res, next) => {
  if (!req.query.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  }
  let filter = {};
  if (req.query.organizationId) {
    filter.organizationId = req.query.organizationId;
  }
  if (req.query.branch) {
    filter.branch = req.query.branch;
  }
  const uhids = await Patient.find(filter).distinct("UHIDId");
  const phoneNos = await Patient.find(filter).distinct("phoneNo");

  res.status(200).json({
    status: "success",
    data: {
      uhids: uhids,
      phoneNos: phoneNos,
    },
  });
});

export const filterPatientAttachment = catchAsync(async (req, res, next) => {
  const { patientId } = req.query;

  if (!req.query.date) {
    const patient = await Patient.findOne({ _id: patientId });
    const filteredAttachments = patient.attachments;

    res.status(200).json({
      status: "Success",
      result: filteredAttachments.length,
      data: { attachments: filteredAttachments },
    });
  }

  const targetDate = new Date(req.query.date);
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

  const patient = await Patient.findOne({ _id: patientId });

  if (!patient) {
    return next(new AppError("Patient not found", 404));
  }

  const filteredAttachments = patient.attachments.filter((att) => {
    const attDate = new Date(att.enteredDate);
    return attDate >= startOfDay && attDate <= endOfDay;
  });

  res.status(200).json({
    status: "Success",
    result: filteredAttachments.length,
    data: { attachments: filteredAttachments },
  });
});

export const replaceAttachment = catchAsync(async (req, res, next) => {
  const { attachmetName, attachmentId, patientId } = req.body;

  const patient = await Patient.findById(patientId);
  if (!patient) {
    return next(new AppError("No Patient found with that ID", 404));
  }

  const newFile = req.files?.attachments?.[0]?.filename;
  if (!newFile) {
    return next(new AppError("No new file uploaded", 400));
  }

  const updated = await Patient.findOneAndUpdate(
    { _id: patientId, "attachments._id": attachmentId },
    {
      $set: {
        "attachments.$.attachment": newFile,
      },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: {
      updatedPatient: updated,
    },
  });
});

export const getPatientStats = catchAsync(async (req, res, next) => {
  if (!req.query.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  }

  let filter = {};
  if (req.query.organizationId) {
    filter.organizationId = req.query.organizationId;
  }
  if (req.query.branch) {
    filter.branch = req.query.branch;
  }

  const totalPatients = await Patient.countDocuments(filter);

  const totalOP = await Patient.countDocuments({
    ...filter,
    patientStatus: "OutPatient",
  });

  const totalAppointments = await Patient.countDocuments({
    ...filter,
    patientStatus: "Appointment",
  });

  res.status(200).json({
    status: "Success",
    data: {
      totalPatients,
      totalOP,
      totalAppointments,
    },
  });
});

export const siteAppBooking = catchAsync(async (req, res, next) => {
  const {
    patientName,
    email,
    phoneNo,
    patientType,
    doctorId,
    reason,
    areaLocation,
    status,
    timeSlot,
    visitType,
    source,
    organizationId,
    branch,
  } = req.body;

  let patient = await Patient.findOne({ phoneNo });

  if (!patient) {
    patient = await Patient.create({
      PatientName: patientName,
      phoneNo,
      email,
      patientType: patientType,
      patientStatus: "Appointment",
      areaLocation,
      doctorId: doctorId,
      organizationId: organizationId,
      branch: branch,
    });
  }

  const doctor = await Doctor.findById(doctorId);

  const isSlotTaken = doctor.slotStatus.some(
    (slot) =>
      slot.time === timeSlot &&
      new Date(slot.slotDate).toDateString() === new Date().toDateString() &&
      slot.status === "Booked"
  );

  if (isSlotTaken) {
    return next(new AppError("This time slot is already booked", 409));
  }

  const AppointmentData = {
    patientName: patient.PatientName,
    phoneNo: phoneNo,
    UHID: patient.UHIDId,
    patientId: patient._id,
    doctorName: doctor.doctorName,
    doctorId: doctorId,
    doctorRoomNo: doctor.roomNo,
    patientType: patientType,
    status: status,
    source: source,
    reason: reason,
    timeSlot: timeSlot,
    visitType: visitType,
    organizationId: organizationId,
    branch: branch,
  };

  const appointment = await Appointment.create(AppointmentData);

  const date = Date.now();

  const slotStatus = {
    slotDate: date,
    time: timeSlot,
    status: "Booked",
  };

  const slotUpdate = await Doctor.findByIdAndUpdate(
    doctorId,
    { $push: { slotStatus: slotStatus } },
    { new: true, runValidators: true }
  );

  const patientUpdate = await Patient.findByIdAndUpdate(
    patient._id,
    {
      appointmentId: appointment._id,
      visitType: visitType,
      doctorId: doctorId,
      patientType: patientType,
      $push: {
        visitDates: new Date(),
      },
      patientStatus: "Appointment",
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "Success",
    message: "Appointment Created",
    data: {
      appointment,
      slotUpdate,
    },
  });
});

export const updateOutpatient = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { doctorId, timeSlot, patientId } = req.body;

  const doctor = await Doctor.findById(doctorId);

  const OutPatientData = {
    doctorName: doctor.doctorName,
    doctorId: doctorId,
    timeSlot: timeSlot,
  };

  const outPatient = await OutPatient.findByIdAndUpdate(id, OutPatientData, {
    new: true,
    runValidators: true,
  });

  const patientData = {
    doctorName: doctor.doctorName,
    doctorId: doctorId,
  };

  const patientDoc = await Patient.findById(patientId);

  if (patientDoc && patientDoc.visitedDoctors.length > 0) {
    const lastIndex = patientDoc.visitedDoctors.length - 1;
    patientDoc.visitedDoctors[lastIndex].doctorId = doctorId;
    patientDoc.visitedDoctors[lastIndex].doctorName = doctor.doctorName;

    await patientDoc.save();
  }

  const patient = await Patient.findByIdAndUpdate(
    patientId,
    patientData,
    {},
    {
      new: true,
      runValidators: true,
    }
  );

  if (!outPatient) {
    return next(new AppError("No OutPatient found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      outPatient,
      patient,
      patientDoc,
    },
  });
});

export const addIpdata = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const { ipData, patientStatus } = req.body;

  const patient = await Patient.findById(id);

  if (!patient) {
    return next(new AppError("No Patient found with that ID", 404));
  }

  const updatedPatient = await Patient.findByIdAndUpdate(
    id,
    { ipData: ipData, patientStatus: patientStatus || "Inpatient" },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedPatient) {
    return next(new AppError("No Patient found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      updatedPatient: updatedPatient,
    },
  });
});

export const filterPInPatient = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  let matchStage = {};

  if (req.query.PatientName) {
    matchStage.PatientName = { $regex: req.query.PatientName, $options: "i" };
  }
  if (req.query.patientStatus) {
    matchStage.patientStatus = req.query.patientStatus;
  }
  if (req.query.patientType) {
    matchStage.patientType = req.query.patientType;
  }
  if (req.query.opNo) {
    matchStage.opNo = req.query.opNo;
  }

  const isNewIp = req.query.newIp === "true";
  const isPatientManagement = req.query.patientManagement === "true";

  if (!isNewIp && !isPatientManagement) {
    return res.status(400).json({
      status: "Fail",
      message:
        "Please provide either 'newIp=true' or 'patientManagement=true' as query params.",
    });
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "surgerydetails",
        localField: "surgeryDetailsId",
        foreignField: "_id",
        as: "surgeryDetails",
      },
    },
    { $unwind: { path: "$surgeryDetails", preserveNullAndEmptyArrays: true } },
  ];

  if (req.query.surgeryDate) {
    const rawDate = new Date(req.query.surgeryDate);
    const start = new Date(rawDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(rawDate);
    end.setHours(23, 59, 59, 999);

    const dateMatch = {
      "surgeryDetails.surgeryDate": {
        $gte: start,
        $lt: end,
      },
    };

    if (req.query.surgeryName) {
      dateMatch["surgeryDetails.surgeryName"] = {
        $regex: req.query.surgeryName,
        $options: "i",
      };
    }

    pipeline.push({ $match: dateMatch });
  }

  // Projections
  if (isNewIp) {
    pipeline.push({
      $project: {
        opNo: 1,
        PatientName: 1,
        surgeryName: "$surgeryDetails.surgeryName",
        operationDate: "$surgeryDetails.surgeryDate",
      },
    });
  }

  if (isPatientManagement) {
    pipeline.push({
      $project: {
        opNo: 1,
        PatientName: 1,
        admitDate: 1,
        billStatus: 1,
        surgeryName: "$surgeryDetails.surgeryName",
        surgeryDate: "$surgeryDetails.surgeryDate",
        billAmount: "$surgeryDetails.total",
      },
    });
  }

  pipeline.push(
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit }
  );

  const patient = await Patient.aggregate(pipeline);

  const countPipeline = pipeline.slice(0, pipeline.length - 3); // Remove sort, skip, limit
  countPipeline.push({ $count: "total" });

  const countResult = await Patient.aggregate(countPipeline);
  const totalProducts = countResult[0]?.total || 0;
  const totalPages = Math.ceil(totalProducts / limit);

  res.status(200).json({
    status: "Success",
    totalPages,
    result: patient.length,
    data: { patient },
  });
});

export const getPatientsWithSurgeryTwoDaysAgo = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  let matchStage = {};

  if (req.query.doctorName) {
    matchStage.doctorName = { $regex: req.query.doctorName, $options: "i" };
  }
  if (req.query.patientStatus) {
    matchStage.patientStatus = req.query.patientStatus;
  }
  if (req.query.patientType) {
    matchStage.patientType = req.query.patientType;
  }
  if (req.query.opNo) {
    matchStage.opNo = req.query.opNo;
  }

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  twoDaysAgo.setHours(0, 0, 0, 0);

  const nextDay = new Date(twoDaysAgo);
  nextDay.setDate(nextDay.getDate() + 1);
  nextDay.setHours(0, 0, 0, 0);

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "surgerydetails",
        localField: "surgeryDetailsId",
        foreignField: "_id",
        as: "surgeryDetails",
      },
    },
    { $unwind: { path: "$surgeryDetails", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        opNo: 1,
        PatientName: 1,
        billStatus: 1,
        emrCompleteDate: 1,
        surgeryDate: "$surgeryDetails.surgeryDate",
      },
    },
  ];

  pipeline.push(
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit }
  );

  const patient = await Patient.aggregate(pipeline);

  const filteredPatients = patient.filter((val) => val.surgeryDate);

  const countPipeline = pipeline.slice(0, pipeline.length - 3);
  countPipeline.push({ $count: "total" });

  const totalProducts = filteredPatients.length;
  const totalPages = Math.ceil(totalProducts / limit);

  res.status(200).json({
    status: "Success",
    totalPages,
    result: filteredPatients.length,
    data: { patient: filteredPatients },
  });
});

export const getTPAPatients = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.query.patientType) {
    filter.patientType = req.query.patientType;
  }

  const features = new APIFeatures(Patient.find(filter), req.query)
    .limitFields()
    .filter()
    .sort();

  const patients = await features.query;

  res.status(200).json({
    status: "success",
    results: patients.length,
    data: {
      patients,
    },
  });
});

export const getPatientsWithSurgeryManagement = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  let matchStage = {};

  if (req.query.doctorName) {
    matchStage.doctorName = { $regex: req.query.doctorName, $options: "i" };
  }
  if (req.query.patientStatus) {
    matchStage.patientStatus = req.query.patientStatus;
  }
  if (req.query.patientType) {
    matchStage.patientType = req.query.patientType;
  }
  if (req.query.opNo) {
    matchStage.opNo = req.query.opNo;
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "surgerydetails",
        localField: "surgeryDetailsId",
        foreignField: "_id",
        as: "surgeryDetails",
      },
    },
    { $unwind: { path: "$surgeryDetails", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        opNo: 1,
        PatientName: 1,
        billStatus: 1,
        emrCompleteDate: 1,
        surgeryDate: "$surgeryDetails.surgeryDate",
        surgeonName: "$surgeryDetails.surgertData.surgeon",
        status: "$surgeryDetails.status",
      },
    },
  ];

  const allPatients = await Patient.aggregate(pipeline);

  // Filter out those without surgeryDate
  const filteredPatients = allPatients.filter((val) => val.surgeryDate);

  // Filter by today's date
  const today = new Date().toISOString().slice(0, 10);
  const finalPatients = filteredPatients.filter((item) => {
    const surgeryDateStr = new Date(item.surgeryDate)
      .toISOString()
      .slice(0, 10);
    return surgeryDateStr === today;
  });

  // Apply pagination to finalPatients
  const paginatedPatients = finalPatients.slice(skip, skip + limit);
  const totalProducts = finalPatients.length;
  const totalPages = Math.ceil(totalProducts / limit);

  res.status(200).json({
    status: "Success",
    totalPages,
    currentPage: page,
    result: paginatedPatients.length,
    data: { patient: paginatedPatients },
  });
});

export const getAllPatientData = catchAsync(async (req, res, next) => {
  if (!req.query.id) {
    return next(new AppError("ORGID required !", 400));
  }

  let filter = {};

  if (req.query.id) {
    filter.organizationId = req.query.id;
  }

  if (req.query.phoneNo) {
    filter.phoneNo = req.query.phoneNo;
  }

  if (req.query.branch) {
    filter.branch = req.query.branch;
  }

  const data = await Patient.find(filter)
    .populate("outPatientId")
    .populate("appointmentId");

  res.status(200).json({
    message: "Success",
    data,
  });
});

export const getHomeData = catchAsync(async (req, res, next) => {
  const { id, period } = req.query;

  if (!id) {
    return next(new AppError("ORGID required!", 400));
  }

  let filter = {};
  if (id) {
    filter.organizationId = id;
  }
  if (req.query.branch) {
    filter.branch = req.query.branch;
  }

  if (period) {
    const today = new Date();
    let start;
    let end;

    switch (period) {
      case "today":
        start = startOfDay(today);
        end = endOfDay(today);
        break;
      case "this-week":
        start = startOfWeek(today, { weekStartsOn: 1 });
        end = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case "this-month":
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case "this-year":
        start = startOfYear(today);
        end = endOfYear(today);
        break;
      default:
        return next(new AppError("Invalid period value!", 400));
    }

    filter.createdAt = { $gte: start, $lte: end };
  }

  const appCount = await Appointment.countDocuments(filter);
  const outPaitent = await OutPatient.countDocuments(filter);
  const totalPatient = await Patient.countDocuments({ organizationId: id });
  const newPatient = await Patient.countDocuments(filter);

  res.status(200).json({
    message: "Success",
    appCount,
    outPaitent,
    totalPatient,
    newPatient,
  });
});

export const updateQueueList = catchAsync(async (req, res, next) => {
  if (!req.query.id || !req.query.type) {
    return next(new AppError("Id or type missing!", 401));
  }
  let data;
  if (req.query.type === "Appointment") {
    data = await Appointment.findByIdAndUpdate(req.query.id, req.body, {
      new: true,
      runValidators: true,
    });
  } else {
    data = await OutPatient.findByIdAndUpdate(req.query.id, req.body, {
      new: true,
      runValidators: true,
    });
  }

  res.status(200).json({
    message: "Success",
    data,
  });
});

export const getOPAPPatientById = catchAsync(async (req, res, next) => {
  if (!req.query.id) {
    return next(new AppError("Id required!", 400));
  }

  let data = await OutPatient.findById(req.query.id);

  if (!data) {
    data = await Appointment.findById(req.query.id);
  }

  res.status(200).json({
    message: "Success",
    data,
  });
});

export const updateOPAPById = catchAsync(async (req, res, next) => {
  if (!req.query.id) {
    return next(new AppError("Id required!", 400));
  }

  let data = await OutPatient.findByIdAndUpdate(req.query.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!data) {
    data = await Appointment.findByIdAndUpdate(req.query.id, req.body, {
      new: true,
      runValidators: true,
    });
  }

  res.status(200).json({
    message: "Success",
    data,
  });
});

export const filterPatientName = catchAsync(async (req, res, next) => {
  if (!req.query.orgId) {
    return next(new AppError("orgId is missing!", 400));
  }

  let filter = {};
  if (req.query.orgId) {
    filter.organizationId = req.query.orgId;
  }
  const data = await Patient.aggregate([
    { $match: filter },
    {
      $project: {
        _id: 0,
        label: "$PatientName",
        value: "$PatientName",
      },
    },
  ]);

  res.status(200).json({
    message: "Suceess",
    data,
  });
});

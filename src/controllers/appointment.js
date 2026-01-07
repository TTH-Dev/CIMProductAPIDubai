import Appointment from "../models/appointment.js";
import Doctor from "../models/Doctor.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import Patient from "../models/patient.js";
import OutPatient from "../models/outPatient.js";
import Subadmin from "../models/subAdmin.js";
import moment from "moment";
import dayjs from "dayjs";
import Notify from "../models/notification.js";
import { io } from "../../server.js";

export const createAppointment = catchAsync(async (req, res, next) => {
  const { patientId, phoneNo, doctorId, visitType } = req.body;

  if (!phoneNo) {
    return next(new AppError("PhoneNo is Required.", 404));
  }

  const patient = await Patient.findById(patientId);

  if (!patient) {
    return next(new AppError("Register a Patient First", 404));
  }

  const doctor = await Doctor.findById(doctorId);

  const AppointmentData = {
    patientName: patient.PatientName,
    phoneNo: phoneNo,
    patientId: patientId,
    UHID: patient.UHIDId,
    doctorName: doctor.doctorName,
    doctorId: doctorId,
    doctorRoomNo: doctor.roomNo,
    patientType: req.body.patientType,
    status: req.body.status,
    reason: req.body.reason,
    timeSlot: req.body.timeSlot,
    organizationId: req.body.organizationId,
    visitType: visitType,
    branch: req.body.branch,
  };

  const appointment = await Appointment.create(AppointmentData);

  const date = Date.now();
  const slotStatus = {
    slotDate: date,
    time: req.body.timeSlot,
    status: "Booked",
  };

  const consellors = await Subadmin.find({ emloyeeType: "Counsellor" });
  if (!consellors.length)
    return next(new AppError("No counsellors found", 404));
  const totalOutPatients = await OutPatient.countDocuments();
  const consellorIndex = totalOutPatients % consellors.length;
  const assignedCounsellor = consellors[consellorIndex];

  const slotUpdate = await Doctor.findByIdAndUpdate(
    doctorId,
    { $push: { slotStatus: slotStatus } },
    { new: true, runValidators: true }
  );
  const patientUpdate = await Patient.findByIdAndUpdate(
    patientId,
    {
      appointmentId: appointment._id,
      visitType: visitType,
      patientStatus: "Appointment",
      patientType: patient.patientType,
      doctorId: doctorId,
      counsellor: assignedCounsellor._id,
      $push: {
        visitDates: new Date(),
        visitedDoctors: {
          doctorId: doctor._id,
          doctorName: doctor.doctorName,
          visitedDate: new Date(),
          visitType,
          branch: patient.branch,
          patientType: patient.patientType,
        },
      },
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "Success",
    message: "Appointment Created",
    data: {
      appointment,
      patientUpdate,
    },
  });
});

export const getAllAppointments = catchAsync(async (req, res, next) => {
  if (!req.query.organizationId) {
    return next(new AppError("organizationId is required in query", 400));
  }

  let filter = {};

  if (req.query.organizationId) {
    filter.organizationId = req.query.organizationId;
  }

  if (req.query.branch) {
    filter.branch = req.query.branch;
  }

  const features = new APIFeatures(Appointment.find(filter), req.query)
    .limitFields()
    .filter()
    .sort();

  const appointmentData = await features.query;

  const appointment = appointmentData.reverse();

  res.status(200).json({
    status: "success",
    results: appointment.length,
    data: {
      appointment,
    },
  });
});

export const getAppointment = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const appointment = await Appointment.findById(id).populate("patientId");

  if (!appointment) {
    return next(new AppError("No appointment found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      appointment,
    },
  });
});

export const updateAppointment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { patientId, appointmentDate, appointmentTime } = req.body;

  const appointment = await Appointment.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!appointment) {
    next(new AppError("No appoinment found!", 401));
  }

  const patient = await Patient.findOne(patientId);
  if (!patient) {
    return next(new AppError("No patient found!", 404));
  }

  const lastIndex = patient.visitedDoctors.length - 1;

  if (lastIndex >= 0) {
    const onlyDate = dayjs(appointmentDate).format("YYYY-MM-DD");
    const combinedDateTime = dayjs(
      `${onlyDate} ${appointmentTime}`,
      "YYYY-MM-DD hh:mm A"
    ).toDate();

    if (isNaN(combinedDateTime.getTime())) {
      return next(new AppError("Invalid date/time format", 400));
    }

    patient.visitedDoctors[lastIndex].visitedDate = combinedDateTime;

    await patient.save();
  }

  const doctor = await Doctor.findOne({ _id: appointment.doctorId });

  const subAdmin = await Subadmin.findOne({ email: doctor.emailId });

  const meg = `Appointment rescheduled by ${appointment.patientName}.`;
  const notifyData = {
    message: meg,
    reciever: subAdmin._id,
  };
  await Notify.create(notifyData);

  io.to(`user-${subAdmin._id}`).emit("newupdateApPatient", notifyData);

  res.status(200).json({
    status: "success",
    data: {
      appointment,
      patient,
    },
  });
});

export const updateQueue = catchAsync(async (req, res, next) => {
  const id = req.query.id;
  const organizationId = req.query.organizationId;

  if (!organizationId || !id) {
    return next(new AppError("OrgId or Id required!", 400));
  }

  const todayStart = moment().startOf("day").toDate();
  const todayEnd = moment().endOf("day").toDate();

  // Fetch the appointment
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  // Only proceed if status is 'waiting' and tokenNo is not set
  if (req.body.queueStatus === "waiting" && !appointment.tokenNo) {
    const appointmentTime = moment(appointment.timeSlot, "hh:mm A");

    // Get all OutPatients for today
    const todayOpPatients = await OutPatient.find({
      organizationId,
      createdAt: { $gte: todayStart, $lte: todayEnd },
    }).sort({ tokenNo: 1 });

    let newTokenNo = 1;

    // Find latest OP whose timeSlot < appointment time
    const previousOp = [...todayOpPatients]
      .reverse()
      .find((op) => moment(op.timeSlot, "hh:mm A").isBefore(appointmentTime));

    if (previousOp) {
      newTokenNo = previousOp.tokenNo + 1;
    }

    // Shift tokenNos for existing OPs from that point onward
    const toShift = todayOpPatients.filter((op) => op.tokenNo >= newTokenNo);

    for (const op of toShift) {
      await OutPatient.findByIdAndUpdate(op._id, {
        tokenNo: op.tokenNo + 1,
      });
    }

    // Set tokenNo to appointment
    appointment.tokenNo = newTokenNo;
  }

  // Update remaining appointment fields
  Object.assign(appointment, req.body);
  await appointment.save();

  const doctor = await Doctor.findOne({ _id: appointment.doctorId });

  const subAdmin = await Subadmin.findOne({ email: doctor.emailId });

  const meg =
    appointment.queueStatus === "waiting"
      ? `${appointment.patientName} is ${appointment.queueStatus}!`
      : `${appointment.patientName} got ${appointment.queueStatus}!`;
  const notifyData = {
    message: meg,
    reciever: subAdmin._id,
  };
  await Notify.create(notifyData);

  io.to(`user-${subAdmin._id}`).emit("newupdateApPatient", notifyData);

  res.status(200).json({
    message: "Success",
    data: appointment,
  });
});

export const updateAppData = catchAsync(async (req, res, next) => {
  if (!req.query.id) {
    return next(new AppError("Id missing!", 401));
  }

  const app = await Appointment.findByIdAndUpdate(
    req.query.id,
    { ...req.body, cancelDate: Date.now() },
    {
      new: true,
      runValidators: true,
    }
  );

  const doctor = await Doctor.findOne({ _id: app.doctorId });

  const subAdmin = await Subadmin.findOne({ email: doctor.emailId });

  const meg = `${app.patientName} cancelled the appointment.`;
  const notifyData = {
    message: meg,
    reciever: subAdmin._id,
  };
  await Notify.create(notifyData);

  io.to(`user-${subAdmin._id}`).emit("newupdateApPatient", notifyData);

  res.status(200).json({
    message: "Success",
    app,
  });
});

export const updateShift = catchAsync(async (req, res, next) => {
  const { docatorName, appointmentId, updatedData } = req.body;

  const appointment = await Appointment.findOneAndUpdate(
    { appointmentName: docatorName, appointmentId: appointmentId },
    updatedData,
    { new: true, runValidators: true }
  );

  if (!appointment) {
    return next(new AppError("No Appointment found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      appointment,
    },
  });
});

export const deleteAppointment = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const appointment = await Appointment.findByIdAndDelete(id);

  if (!appointment) {
    return next(new AppError("No Appointment found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    message: "Appointment Deleted Successfully",
  });
});

export const filterAppointment = catchAsync(async (req, res, next) => {
  let filter = {};
  if (!req.query.organizationId) {
    return next(new AppError("OrgId missing!", 400));
  }
  if (req.query.doctorName) {
    filter.doctorName = { $regex: req.query.doctorName, $options: "i" };
  }

  if (req.query.specialist) {
    filter.specialist = req.query.specialist;
  }

  if (req.query.doctorId) {
    filter.doctorId = req.query.doctorId;
  }
  if (req.query.phoneNo) {
    filter.phoneNo = req.query.phoneNo;
  }
  if (req.query.appointmentNo) {
    filter.appointmentNo = req.query.appointmentNo;
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.availableDay) {
    filter.shift = { $elemMatch: { day: req.query.availableDay } };
  }

  if (req.query.organizationId) {
    filter.organizationId = req.query.organizationId;
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

  const features = new APIFeatures(Appointment.find(filter), req.query)
    .limitFields()
    .sort()
    .paginate();

  const appointment = await features.query;

  const totalProducts = await Appointment.countDocuments(filter);
  const totalPages = Math.ceil(totalProducts / limit);

  res.status(200).json({
    status: "Success",
    totalPages: totalPages,
    result: appointment.length,
    data: { appointments: appointment.reverse() },
  });
});

export const doctorCalender = catchAsync(async (req, res, next) => {
  let filter = {};
  if (!req.query.organizationId) {
    return next(new AppError("OrgId missing!", 400));
  }

  if (req.query.doctorId) {
    filter.doctorId = req.query.doctorId;
  }

  if (req.query.organizationId) {
    filter.organizationId = req.query.organizationId;
  }

  if (req.query.date) {
    const date = new Date(req.query.date);

    filter.createdAt = {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999)),
    };
  }

  if (req.query.startDate && req.query.endDate) {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    filter.createdAt = {
      $gte: new Date(startDate.setHours(0, 0, 0, 0)),
      $lte: new Date(endDate.setHours(23, 59, 59, 999)),
    };
  }

  const appointment = await Appointment.find(filter).sort(-1);

  res.status(200).json({
    status: "Success",
    result: appointment.length,
    data: { appointments: appointment },
  });
});

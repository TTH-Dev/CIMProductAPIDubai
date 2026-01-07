import Doctor from "../models/Doctor.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import Appointment from "../models/appointment.js";
import OutPatient from "../models/outPatient.js";
import moment from "moment";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";
import Billing from "../models/billing.js";
import mongoose from "mongoose";

export const createDoctor = catchAsync(async (req, res, next) => {
  const { doctorName, phoneNo } = req.body;

  if (!doctorName || !phoneNo) {
    return next(new AppError("Doctor name and phoneNo is Required.", 404));
  }

  if (req.files) {
    if (req.files.doctorImage) {
      req.body.doctorImage = req.files?.doctorImage[0].filename;
    }
  }

  const DoctorDatad = {
    doctorName: doctorName,
    phoneNo: phoneNo,
    department: req.body.department,
    roomNo: req.body.roomNo,
    dateOfJoining: req.body.dateOfJoining,
    address: req.body.address,
    emailId: req.body.emailId,
    bloodGroup: req.body.bloodGroup,
    dateOfBirth: req.body.dateOfBirth,
    specialist: req.body.specialist,
    doctorImage: req.file?.filename || null,
    organizationId: req.body.organizationId,
    shift: JSON.parse(req.body.shift),
    doctorLicienceId: req.body.doctorLicienceId,
    customizeTime: req.body.customizeTime,
    feesType: JSON.parse(req.body.feesType),
  };

  let DoctorData;

  if (req.body.branch) {
    DoctorData = { ...DoctorDatad, branch: req.body.branch };
  } else {
    DoctorData = { ...DoctorDatad };
  }

  const doctor = await Doctor.create(DoctorData);

  res.status(200).json({
    status: "Success",
    message: "Doctor Created",
    data: {
      doctor,
    },
  });
});

export const getAllDoctors = catchAsync(async (req, res, next) => {
  if (!req.query.organizationId) {
    return next(new AppError("organizationId is required in query", 400));
  }

  let filter = {};

  if (req.query.organizationId) {
    filter.organizationId = req.query.organizationId;
  }

  if (req.query.branchId) {
    filter.branch = req.query.branchId;
  }

  const features = new APIFeatures(Doctor.find(filter), req.query)
    .limitFields()
    .filter()
    .sort()
    .paginate();

  const doctor = await features.query;

  res.status(200).json({
    status: "success",
    results: doctor.length,
    data: {
      doctor,
    },
  });
});

export const getDoctor = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const doctor = await Doctor.findById(id);

  if (!doctor) {
    return next(new AppError("No doctor found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      doctor,
    },
  });
});

export const updateDoctor = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const doctor = await Doctor.findById(id);
  if (!doctor) {
    return next(new AppError("No Doctor found with that ID", 404));
  }

  if (req.file) {
    req.body.doctorImage = req.file.filename;
  }

  if (req.body.dateOfJoining) {
    req.body.dateOfJoining = new Date(req.body.dateOfJoining);
  }

  if (req.body.dateOfBirth) {
    req.body.dateOfBirth = new Date(req.body.dateOfBirth);
  }

  if (req.body.shift && typeof req.body.shift === "string") {
    try {
      req.body.shift = JSON.parse(req.body.shift);
    } catch (err) {
      return next(new AppError("Invalid JSON in 'shift' field", 400));
    }
  }

  if (req.body.feesType && typeof req.body.feesType === "string") {
    try {
      req.body.feesType = JSON.parse(req.body.feesType);
    } catch (err) {
      return next(new AppError("Invalid JSON in 'feesType' field", 400));
    }
  }

  const updatedDoctor = await Doctor.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      doctor: updatedDoctor,
    },
  });
});

export const updateShift = catchAsync(async (req, res, next) => {
  const { docatorName, doctorId, updatedData } = req.body;

  const doctor = await Doctor.findOneAndUpdate(
    { doctorName: docatorName, doctorId: doctorId },
    updatedData,
    { new: true, runValidators: true }
  );

  if (!doctor) {
    return next(new AppError("No Doctor found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      doctor,
    },
  });
});

export const deleteDoctor = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const doctor = await Doctor.findByIdAndDelete(id);

  if (!doctor) {
    return next(new AppError("No banner found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    message: "Doctor Deleted Successfully",
  });
});

export const filterDoctor = catchAsync(async (req, res, next) => {
  let filter = {};

  let startOfDay, endOfDay;

  if (req.query.doctorName) {
    filter.doctorName = { $regex: req.query.doctorName, $options: "i" };
  }
  if (req.query.specialist) {
    filter.specialist = req.query.specialist;
  }
  if (req.query.phoneNo) {
    filter.phoneNo = req.query.phoneNo;
  }
  if (req.query.availableDay) {
    filter.shift = { $elemMatch: { day: req.query.availableDay } };
  }

  if (req.query.organizationId) {
    filter.organizationId = req.query.organizationId;
  }

  if (req.query.branchId) {
    filter.branch = req.query.branchId;
  }

  if (req.query.slotDate) {
    startOfDay = new Date(req.query.slotDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    endOfDay = new Date(req.query.slotDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    filter["slotStatus"] = {
      $elemMatch: {
        slotDate: { $gte: startOfDay, $lte: endOfDay },
      },
    };
  }

  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;
  const features = new APIFeatures(
    Doctor.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    req.query
  );

  const doctors = await features.query;

  let finalDoctors = doctors;

  if (req.query.slotDate) {
    finalDoctors = doctors
      .map((doc) => {
        return {
          ...doc.toObject(),
          slotStatus: doc.slotStatus.filter((slot) => {
            const slotDate = new Date(slot.slotDate);
            return slotDate >= startOfDay && slotDate <= endOfDay;
          }),
        };
      })
      .filter((doc) => doc.slotStatus.length > 0);
  }

  const totalRecords = await Doctor.countDocuments(filter);
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "Success",
    totalPages: totalPages,
    result: totalRecords.length,
    currentPage: page,
    data: { doctors: finalDoctors },
  });
});

export const filterDoctorSlot = catchAsync(async (req, res, next) => {
  let filter = {};

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = daysOfWeek[new Date().getDay()];
  if (today) {
    filter.shift = { $elemMatch: { day: today } };
  }

  let startOfDay, endOfDay;
  let filterBySlotDate = false;

  if (req.query.slotDate) {
    filterBySlotDate = true;
    startOfDay = new Date(req.query.slotDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    endOfDay = new Date(req.query.slotDate);
    endOfDay.setUTCHours(23, 59, 59, 999);
  }

  if (req.query.branchId) {
    filter.branch = req.query.branchId;
  }

  if (req.query.orgId) {
    filter.organizationId = req.query.orgId;
  }

  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const features = new APIFeatures(Doctor.find(filter), req.query)
    .limitFields()
    .sort()
    .paginate();

  const doctors = await features.query;

  let finalDoctors = doctors;

  if (filterBySlotDate) {
    finalDoctors = doctors.map((doc) => {
      const filteredSlots = doc.slotStatus.filter((slot) => {
        const slotDate = new Date(slot.slotDate);
        return slotDate >= startOfDay && slotDate <= endOfDay;
      });
      return {
        ...doc.toObject(),
        slotStatus: filteredSlots.length > 0 ? filteredSlots : [],
      };
    });
  }

  const totalDoctors = finalDoctors.length;
  const totalPages = Math.ceil(totalDoctors / limit);

  res.status(200).json({
    status: "Success",
    totalPages: totalPages,
    result: totalDoctors,
    data: { doctors: finalDoctors },
  });
});

export const getDoctorDMenu = catchAsync(async (req, res, next) => {
  if (!req.query.id) {
    return next(new AppError("organizationId is required in query", 400));
  }

  const filter = {};

  if (req.query.id) {
    filter.organizationId = req.query.id;
  }

  if (req.query.branchId) {
    filter.branch = req.query.branchId;
  }

  const date = req.query.date;

  if (date) {
    const dayOfWeek = moment(date, "YYYY-MM-DD").format("dddd");

    filter["shift.day"] = dayOfWeek;
  }

  const doctor = await Doctor.find(filter);

  const dmMenu = doctor.map((val, index) => {
    return {
      value: val._id,
      label: `${val.doctorName} ( Room No - ${val.roomNo})`,
    };
  });

  res.status(200).json({
    status: "Success",
    data: {
      dmMenu,
      doctor,
    },
  });
});

export const getAllDoctorAvailability = catchAsync(async (req, res, next) => {
  const today = new Date().toLocaleString("en-US", { weekday: "long" });
  if (!req.query.id) {
    return next(new AppError("organizationId is required in query", 400));
  }

  const filter = {
    organizationId: req.query.id,
  };
  if (req.query.branchId) {
    filter.branch = req.query.branchId;
  }
  const doctors = await Doctor.find(filter);

  const availableDoctors = doctors.filter((doc) =>
    doc.shift?.some((shift) => shift.day === today)
  );

  res.status(200).json({
    status: "Success",
    data: availableDoctors,
  });
});

export const getDoctorOverview = catchAsync(async (req, res, next) => {
  const orgId = req.query.id;
  const dateQuery = req.query.date;
  const email = req.query.email;

  if (!orgId) {
    return next(new AppError("id is required in query", 400));
  }

  if (!email) {
    return next(new AppError("Email is required in query", 400));
  }

  const doctor = await Doctor.findOne({ emailId: email });

  if (!doctor) {
    return next(new AppError("Doctor not found", 400));
  }

  let commonFilter = {
    doctorId: doctor._id,
    organizationId: orgId,
  };

  if (req.query.branch) {
    commonFilter.branch = req.query.branch;
  }

  if (req.query.nurseEMR) {
    commonFilter.nurseEMR = req.query.nurseEMR;
  }

  if (req.query.doctorName) {
    commonFilter.doctorName = { $regex: req.query.doctorName, $options: "i" };
  }

  if (req.query.phoneNo) {
    commonFilter.phoneNo = req.query.phoneNo;
  }

  if (req.query.UHID) {
    commonFilter.UHID = req.query.UHID;
  }

  if (req.query.status) {
    commonFilter.status = req.query.status;
  }

  if (req.query.billStatus) {
    commonFilter.billStatus = req.query.billStatus;
  }

  if (req.query.emrStatus) {
    const emrStatusValues = req.query.emrStatus.split(",");
    commonFilter.emrStatus = { $in: emrStatusValues };
  }

 // Date filtering logic
if (req.query.filterType) {
  const now = moment();
  let startDate, endDate;

  switch (req.query.filterType.toLowerCase()) {
    case "today":
      startDate = now.startOf("day");
      endDate = now.endOf("day");
      break;

    case "thisweek":
      startDate = now.startOf("week");
      endDate = now.endOf("week");
      break;

    case "thismonth":
      startDate = now.startOf("month");
      endDate = now.endOf("month");
      break;

    case "thisyear":
      startDate = now.startOf("year");
      endDate = now.endOf("year");
      break;

    default:
      return next(new AppError("Invalid filterType. Use today, thisWeek, thisMonth, or thisYear.", 400));
  }

  commonFilter.createdAt = {
    $gte: startDate.toDate(),
    $lt: endDate.toDate(),
  };
}

// fallback to date query if provided
else if (req.query.date) {
  const date = new Date(req.query.date);
  commonFilter.createdAt = {
    $gte: new Date(date.setHours(0, 0, 0, 0)),
    $lt: new Date(date.setHours(23, 59, 59, 999)),
  };
}

  if (req.query.queueStatus) {
    const statusValues = req.query.queueStatus.split(",");
    commonFilter.queueStatus = { $in: statusValues };
  }

  let safeHours = 0;

  if (dateQuery) {
    const today = moment(dateQuery).format("dddd");
    const todayShift = doctor.shift.find((shift) => shift.day === today);

    if (todayShift) {
      const start = moment(todayShift.startTime, "hh:mm A");
      const end = moment(todayShift.endTime, "hh:mm A");

      if (end.isBefore(start)) {
        end.add(1, "day");
      }

      const duration = moment.duration(end.diff(start));
      const hours = duration.asHours();
      safeHours = Math.max(0, Math.min(hours, 24));

      const date = new Date(dateQuery);
      commonFilter.createdAt = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      };
    } else {
      return res.status(200).json({
        status: "Success",
        availableHours: 0,
        message: "Doctor is not available today",
      });
    }
  } else {
    // If date not provided, consider full week's availability
    // safeHours = 24;
    const today = moment().format("dddd");
    const todayShift = doctor.shift.find((shift) => shift.day === today);

    if (todayShift) {
      const start = moment(todayShift.startTime, "hh:mm A");
      const end = moment(todayShift.endTime, "hh:mm A");

      if (end.isBefore(start)) {
        end.add(1, "day");
      }

      const duration = moment.duration(end.diff(start));
      const hours = duration.asHours();
      safeHours = Math.max(0, Math.min(hours, 24));

      const date = new Date();
      commonFilter.createdAt = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      };
    } else {
      return res.status(200).json({
        status: "Success",
        availableHours: 0,
        message: "Doctor is not available today",
      });
    }
  }

  const outPatients = await OutPatient.find({ ...commonFilter })
    .populate({ path: "patientId", model: "Patient" })
    .lean();

  const appointments = await Appointment.find({ ...commonFilter })
    .populate("patientId")
    .lean();

  const formattedAppointments = appointments.map((appt) => ({
    ...appt,
    type: "Appointment",
  }));

  const formattedOutPatients = outPatients.map((op) => ({
    ...op,
    type: "OutPatient",
  }));

  const mergedData = [...formattedAppointments, ...formattedOutPatients];
  const totalRecords = mergedData.length;

  // Billing logic
  const drId = doctor._id;
  const billings = await Billing.find().populate({
    path: "patientId",
    select: "doctorId",
  });

  const filteredBillings = billings.filter((bill) =>
    bill?.patientId?.doctorId?.equals(drId)
  );

  const totalAmount = filteredBillings.reduce(
    (total, acc) => total + acc.billAmount,
    0
  );

  res.status(200).json({
    status: "Success",
    totalRecords,
    data: mergedData,
    appointments: formattedAppointments.length,
    outPatients: formattedOutPatients.length,
    availHours: safeHours,
    notAvailHours: 24 - safeHours,
    doctorId: doctor._id,
    totalAmount,
  });
});

export const getHomeRevenue = catchAsync(async (req, res, next) => {
  const { id, doctorId, months = 6 } = req.query;

  if (!id) return next(new AppError("OrgId missing", 400));

  const orgId = id;

  const doctorFilter = doctorId !== "all-doctor" ? { doctorId } : {};

  const filter = {
    organizationId: orgId,
    ...doctorFilter,
    createdAt: {
      $gte: startOfMonth(subMonths(new Date(), Number(months) - 1)),
      $lte: endOfMonth(new Date()),
    },
  };

  const outPatients = await OutPatient.find(filter)
    .populate("doctorId", "feesType amount")
    .lean();

  const appointments = await Appointment.find(filter)
    .populate("doctorId", "feesType amount")
    .lean();

  const combined = [...outPatients, ...appointments];

  const monthlyRevenueMap = new Map();

  combined.forEach((entry) => {
    const monthKey = new Date(entry.createdAt).toISOString().slice(0, 7);
    const doctor = entry.doctorId.feesType;

    if (!doctor || doctor.amount == null) return;

    let amount = 0;

    doctor.forEach((val) => {
      if (val.type === entry.visitType) {
        amount = val.amount;
      } else {
        amount = 0;
      }
    });

    if (!monthlyRevenueMap.has(monthKey)) {
      monthlyRevenueMap.set(monthKey, 0);
    }
    monthlyRevenueMap.set(monthKey, monthlyRevenueMap.get(monthKey) + amount);
  });

  // Step 4: Prepare final response sorted by month
  const sortedRevenue = Array.from(monthlyRevenueMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount }));

  res.status(200).json({
    status: "success",
    data: sortedRevenue,
  });
});

export const getSpecialist = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.query.orgId) {
    filter.organizationId = req.query.orgId;
  }

  if (req.query.branch) {
    filter.branch = new mongoose.Types.ObjectId(req.query.branch);
  }

  const data = await Doctor.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$specialist",
      },
    },
    {
      $project: {
        _id: 0,
        label: "$_id",
        value: "$_id",
      },
    },
  ]);

  res.status(200).json({
    message: "Success",
    data,
  });
});

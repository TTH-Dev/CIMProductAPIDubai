import Appointment from "../models/appointment.js";
import Doctor from "../models/Doctor.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from '../utils/AppError.js';
import APIFeatures from "../utils/ApiFeatures.js";
import Patient from "../models/patient.js";



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
    };

    const appointment = await Appointment.create(AppointmentData);

    const date = Date.now();
    const slotStatus = {
        slotDate: date,
        time: req.body.timeSlot,
        status: "Booked"
    };

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
            patientType: patient.patientType,
            doctorId: doctorId,
        },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        status: "Success",
        message: "Appointment Created",
        data: {
            appointment,
            patientUpdate
        },
    });
});


export const getAllAppointments = catchAsync(async (req, res, next) => {

    const features = new APIFeatures(Appointment.find(), req.query)
        .limitFields()
        .filter()
        .sort();

    const appointmentData = (await features.query);

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

    const appointment = await Appointment.findById(id);

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
    const { doctorId } = req.body;

    if (req.files) {

        if (req.files.appointmentImage) {
            req.body.appointmentImage = req.files.appointmentImage[0].filename;
        }
    }

    const doctor = await Doctor.findById(doctorId);

    const AppointmentData = {
        doctorName: doctor.doctorName,
        doctorId: doctorId,
    };

    const appointment = await Appointment.findByIdAndUpdate(
        id,
        AppointmentData,
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

export const updateShift = catchAsync(async (req, res, next) => {
    const { docatorName, appointmentId, updatedData } = req.body;

    const appointment = await Appointment.findOneAndUpdate({ appointmentName: docatorName, appointmentId: appointmentId },
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
        return next(new AppError("No banner found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        message: "Appointment Deleted Successfully"
    });
});


export const filterAppointment = catchAsync(async (req, res, next) => {

    let filter = {};

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




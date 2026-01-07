import catchAsync from "../utils/catchAsync.js";
import AppError from '../utils/AppError.js';
import APIFeatures from "../utils/ApiFeatures.js";
import Attachments from "../models/attachment.js";

export const createattachments = catchAsync(async (req, res, next) => {
  const { patientId, notes, doctorId } = req.body;

  if (!patientId) {
    return next(new AppError("Patient ID is missing", 400));
  }

  const newAttachment = await Attachments.create({
    patientId,
    attachments: req.file?.filename || null,
    notes,
    doctorId,
    enteredDate: new Date(),
  });

  

  res.status(200).json({
    status: "Success",
    data: {
       newAttachment,
    },
  });
});


export const getAllattachments = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    let filter = {};

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

    const features = new APIFeatures(Attachments.find(filter).populate("doctorId"), req.query)
        .limitFields()
        .sort()
        .paginate();

    const attachments = await features.query;

    const totalRecords = await Attachments.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        result: attachments.length,
        data: { attachments },
    });
});


export const getAttachmentById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const attachments = await Attachments.findById(id);

    if (!attachments) {
        return next(new AppError("Chief complaint not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { attachments },
    });
});

export const updateAttachments= catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const updatedAttachments = await Attachments.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    });

    if (!updatedAttachments) {
        return next(new AppError("Chief complaint not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { updatedAttachments }
    });
});

export const deleteAttachment = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const deletedAttachment = await Attachments.findByIdAndDelete(id);

    if (!deletedAttachment) {
        return next(new AppError("Chief complaint not found", 404));
    }

    res.status(204).json({
        status: "Success",
        data: null
    });
});

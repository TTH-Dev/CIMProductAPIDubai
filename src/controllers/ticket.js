import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import Ticket from "../models/ticket.js";

export const createTicket = catchAsync(async (req, res, next) => {
  if (req.body.attachment) {
    req.body.attachment = req.files.attachment[0].filename;
  }

  const data = await Ticket.create(req.body);

  res.status(200).json({
    message: "Ticket created successfully!",
    data,
  });
});

export const getAllTicket = catchAsync(async (req, res, next) => {
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;

  const data = await Ticket.find().limit(limit).skip(skip);
  const totalRecords = await Ticket.countDocuments();
  const totalPages = Math.ceil(totalRecords / limit);
  res.status(200).json({
    message: "Success",
    data,
    totalPages,
  });
});

export const getTicketById = catchAsync(async (req, res, next) => {
  if (!req.query.ticketId) {
    return next(new AppError("Ticket ID is missing", 404));
  }

  const data = await Ticket.findOne({ _id: req.query.ticketId });

  res.status(200).json({
    message: "Success",
    data,
  });
});

export const updateTicketById = catchAsync(async (req, res, next) => {
  if (!req.query.ticketId) {
    return next(new AppError("Ticket ID is missing", 404));
  }

  const data = await Ticket.findByIdAndUpdate(req.query.ticketId, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    message: "Success",
    data,
  });
});

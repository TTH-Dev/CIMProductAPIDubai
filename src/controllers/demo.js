import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import Demo from "../models/Demo.js";
import sendEmail from "../utils/email.js";

export const createdemo = catchAsync(async (req, res, next) => {
  const requiredFields = [
    "organizatioName",
    "organizatioType",
    "contactPerson",
    "contactPersonPhNo",
    "contactPersonEmail",
  ];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      return next(new AppError(`${field} is required`, 400));
    }
  }

  const demo = await Demo.create(req.body);

  const message = "Thanks for your request we will call back you soon!.";
  await sendEmail({
    from: process.env.SMTP_USER,
    to: req.body.contactPersonEmail,
    subject: "Demo Booked",
    text: message,
  });

  res.status(200).json({
    status: "Success",
    data: { demo },
  });
});

export const getAlldemo = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  let filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if(req.query.orgName){
    filter.organizatioName=req.query.orgName
  }

  if(req.query.plan){
    filter.plan=req.query.plan
  }

  if (req.query.date) {
    const date = new Date(req.query.date);
    filter.createdAt = {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999)),
    };
  }

  const features = new APIFeatures(Demo.find(filter), req.query)
    .limitFields()
    .sort({ createdAt: -1 })
    .paginate();

  const demo = await features.query;
  const totalRecords = await Demo.countDocuments(filter);
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "Success",
    totalPages,
    currentPage: page,
    result: demo.length,
    data: { demo },
  });
});

export const editdemo = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  const getDemo = await Demo.findById(req.query.id);
  if (!getDemo) {
    return next(new AppError("Demo not found", 404));
  }
  const demo = await Demo.findByIdAndUpdate(
    req.query.id,
    { status },
    { new: true, runValidators: true }
  );

  if (status === "completed") {
    const message = `
    Greeting.

    Your demo with us got completed.Thank You!
    
    Best regards,
    Team NextgenMed
    `;
    await sendEmail({
      from: process.env.SMTP_USER,
      to: getDemo.emailId,
      subject: "Demo Status",
      text: message,
    });
  }

  res.status(200).json({
    status: "Success",
    data: { demo },
  });
});

export const demoById = catchAsync(async (req, res, next) => {
  if (!req.query.id) {
    return next(new AppError("Id in query is required!", 400));
  }
  const data = await Demo.findById(req.query.id);

  res.status(200).json({
    message: "Success",
    data,
  });
});

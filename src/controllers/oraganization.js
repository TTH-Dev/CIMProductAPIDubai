import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import Organization from "../models/oraganization.js";
import Admin from "../models/admin.js";
import sendEmail from "../utils/email.js";
import crypto from "crypto";
import dayjs from "dayjs";
import { encrypt } from "../utils/crypto.js";


export const createOrganization = catchAsync(async (req, res, next) => {
  const {
    hospitalName,
    hospitalType,
    hospitalId,
    hospitalAddress,
    adminName,
    email,
    planName,
    planPeriod,
    amount,
    autoRepeat,
    loginCount,
    branch,
    trail,
    country,
    type,
    planMonths,
    smtpPass,
    smtpUserEmail,
    smtpuserId,
  } = req.body;


   const passSmtp = encrypt(smtpPass);

   

  const organization = await Organization.create({
    hospitalName,
    hospitalType,
    branch,
    hospitalId,
    hospitalAddress,
    planName,
    planPeriod,
    amount,
    trail,
    country,
    type,
    planMonths,
    autoRepeat,
    loginCount,
    smtpPass:passSmtp,
    smtpUserEmail,
    smtpuserId,
    pastHistory: [
      {
        lastPaymentDate: Date.now(),
        planName,
        type,
        amount,
        dueDate: new Date(
          new Date().setMonth(new Date().getMonth() + Number(planPeriod))
        ),
      },
    ],
  });

  const plainPassword = crypto.randomBytes(4).toString("hex");

  let adminData;

  try {
    if (organization.branch > 0) {
      adminData = await Admin.create({
        adminName,
        email,
        organizationId: organization._id,
        password: plainPassword,
        isBranchSuperAdmin: true,
      });
    } else {
      adminData = await Admin.create({
        adminName,
        email,
        organizationId: organization._id,
        password: plainPassword,
      });
    }

    const orgLink = "https://dashboard.nextgenmed.in";

    const branchLink = "https://branch.nextgenmed.in";

    const message =
      organization.branch > 0
        ? `
        Hi ,

        Account created successfully!.
        Your login creds Email:${email},Password:${plainPassword}.
        Login through ${branchLink}
        
        Thank You,
        NextGenMed.
        `
        : `
        Hi ,

        Account created successfully!.
        Your login creds Email:${email},Password:${plainPassword}.
        Login through ${orgLink}

        Thank You,
        NextGenMed.
        `;

    await sendEmail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Account Created",
      text: message,
    });

    return res.status(200).json({
      message: "Success",
      adminData,
      organization,
    });
  } catch (err) {
    console.error("Admin creation error:", err);

    await Organization.findByIdAndDelete(organization._id);

    return res.status(400).json({
      status: "fail",
      message: "Failed to create Admin",
      error: err.message,
    });
  }
});

export const getAllOrganizations = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const filter = {};
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.paymentStatus) {
    filter.paymentStatus = req.query.paymentStatus;
  }
  if (req.query.trail) {
    filter.trail = req.query.trail === "true" ? true : false;
  }
  if (req.query.date) {
    const endDate = dayjs(req.query.date).endOf("day").toDate();
    const startDate = dayjs(req.query.date).startOf("day").toDate();

    filter.paymentDate = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  const skip = (page - 1) * limit;

  const features = new APIFeatures(
    Organization.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    req.query
  );

  const organizations = await features.query;

  // Total count based on filter
  const totalRecords = await Organization.countDocuments(filter);

  const totalData = await Organization.find(filter);

  const totalAmount = totalData.reduce((acc, item) => acc + item.amount, 0);

  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "success",
    totalPages,
    currentPage: page,
    result: organizations.length,
    data: { organizations },
    totalRecords,
    totalAmount,
  });
});

export const getDueOrganizations = catchAsync(async (req, res, next) => {
  const today = new Date();
  const fiveDaysLater = new Date();
  fiveDaysLater.setDate(today.getDate() + 5);

  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const matchFilter = {
    planStartDate: { $ne: null },
  };

  if (req.query.status) {
    matchFilter.status = req.query.status;
  }

  if (req.query.paymentStatus) {
    matchFilter.paymentStatus = req.query.paymentStatus;
  }

  const aggregatePipeline = [
    {
      $addFields: {
        planEndDate: {
          $dateAdd: {
            startDate: "$planStartDate",
            unit: "month",
            amount: "$planPeriod",
          },
        },
      },
    },
    {
      $match: {
        ...matchFilter,
        planEndDate: {
          $lte: fiveDaysLater,
        },
      },
    },
    { $sort: { planEndDate: 1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const organizations = await Organization.aggregate(aggregatePipeline);

  // Total count for pagination
  const countPipeline = [
    {
      $addFields: {
        planEndDate: {
          $dateAdd: {
            startDate: "$planStartDate",
            unit: "month",
            amount: "$planPeriod",
          },
        },
      },
    },
    {
      $match: {
        ...matchFilter,
        planEndDate: {
          $gte: today,
          $lte: fiveDaysLater,
        },
      },
    },
    { $count: "total" },
  ];

  const countResult = await Organization.aggregate(countPipeline);
  const totalRecords = countResult[0]?.total || 0;
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "success",
    currentPage: page,
    totalPages,
    result: organizations.length,
    data: { organizations },
  });
});

export const getOrganizationById = catchAsync(async (req, res, next) => {
  const organization = await Organization.findById(req.params.id);
  const adminData = await Admin.findOne({ organizationId: req.params.id });

  if (!organization || !adminData) {
    return next(new AppError("Organization not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { organization, adminData },
  });
});

export const updateOrganization = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const updateData = { ...req.body };

  if (req.files) {
    if (req.files.organizationLogo) {
      updateData.organizationLogo = req.files.organizationLogo[0].filename;
    }

    if (req.files.form16Signature) {
      updateData.form16Signature = req.files.form16Signature[0].filename;
    }

    if (req.files.salaryStampSignature) {
      updateData.salaryStampSignature =
        req.files.salaryStampSignature[0].filename;
    }
  }

  const updatedOrganization = await Organization.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedOrganization) {
    return next(new AppError("Organization not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { updatedOrganization },
  });
});

export const deleteOrganization = catchAsync(async (req, res, next) => {
  const deletedOrganization = await Organization.findByIdAndDelete(
    req.params.id
  );

  if (!deletedOrganization) {
    return next(new AppError("Organization not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});


export const contatUsapi=catchAsync(async(req,res,next)=>{
  if(!req.body.email){
    return next(new AppError("Email required!",404))
  }

  await sendEmail({
    to:req.body.email,
    subject:"Contact-Us",
    text:`
Hi ${req.body.name}

We have recieved your message and we will get back to you soon.

Thank You,
NextGenMed Team.
    `
  })

    await sendEmail({
    to:"info@nextgenmed.in",
    subject:"Contact-Us",
    text:`
Hi Admin ,

${req.body.name} has contacted you regarding ${req.body.message}.

Organization Name : ${req.body.orgName} 

Phone Number : ${req.body.phoneNo}

Thank You,
NextGenMed Team.
    `
  })

  res.status(200).json({
    message:"Mail sent successfully!"
  })

})

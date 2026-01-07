import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import SurgeryDetails from "../models/surgeryDetails.js";
import Patient from "../models/patient.js";
import Ward from "../models/ward.js";
import Product from "../models/products.js";
import Surgery from "../models/surgery.js";

export const createSurgeryDetails = catchAsync(async (req, res, next) => {
  const { patientId } = req.body;

  const entry = await SurgeryDetails.create(req.body);
  let data = {};
  if (entry.surgeryDetails && Array.isArray(entry.surgeryDetails)) {
    const bedSurgery = entry.surgeryDetails.find(
      (detail) => detail.surgeryType === "Bed"
    );

    if (bedSurgery) {
      data.wardType = bedSurgery.categories;
    }
  }

  const patient = await Patient.findByIdAndUpdate(
    patientId,
    {
      surgeryDetailsId: entry._id,
      patientStatus: "Patient",
      bedManagement: data,
      cousellingStatus: "completed",
    },
    { new: true, runValidators: true }
  );
  res.status(201).json({
    status: "success",
    message: "Surgery details created successfully",
    data: { entry, patient },
  });
});

export const getAllSurgeryDetails = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const { createdAt, patientId } = req.query;

  const query = {};
  if (createdAt) {
    const date = new Date(createdAt);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    query.createdAt = { $gte: date, $lt: nextDay };
  }
  if (patientId) query.patientId = patientId;

  const features = new APIFeatures(
    SurgeryDetails.find(query).populate("patientId"),
    req.query
  )
    .sort()
    .limitFields()
    .paginate();

  const entries = await features.query;
  const totalRecords = await SurgeryDetails.countDocuments(query);
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "success",
    totalPages,
    currentPage: page,
    results: entries.length,
    data: { entries },
  });
});

export const getSurgeryDetails = catchAsync(async (req, res, next) => {
  const entry = await SurgeryDetails.findById(req.params.id).populate(
    "patientId"
  );

  if (!entry)
    return next(new AppError("No surgery record found with that ID", 404));

  res.status(200).json({
    status: "success",
    data: { entry },
  });
});

export const updateSurgeryDetails = catchAsync(async (req, res, next) => {
  const sdData = await SurgeryDetails.findById(req.params.id);
  
 if (req.body.nurseActivity) {
  req.body.nurseActivity = {
    ...(sdData.nurseActivity?.toObject?.() || {}),
    ...req.body.nurseActivity,
    diet: req.body.nurseActivity.diet ?? sdData.nurseActivity?.diet ?? [],
    vitalChart: req.body.nurseActivity.vitalChart ?? sdData.nurseActivity?.vitalChart ?? [],
    patch: req.body.nurseActivity.patch ?? sdData.nurseActivity?.patch ?? [],
    postCare: req.body.nurseActivity.postCare ?? sdData.nurseActivity?.postCare ?? [],
  };
}
 if (req.body.fallrickAssement) {
    req.body.fallrickAssement = {
      ...(sdData.fallrickAssement?.toObject?.() || {}),
      ...req.body.fallrickAssement,
      historyofFalling: req.body.fallrickAssement.historyofFalling ?? sdData.fallrickAssement?.historyofFalling ?? {},
      secondaryDiagnosis: req.body.fallrickAssement.secondaryDiagnosis ?? sdData.fallrickAssement?.secondaryDiagnosis ?? {},
      ambulanceAid: req.body.fallrickAssement.ambulanceAid ?? sdData.fallrickAssement?.ambulanceAid ?? {},
      IVHeparinlock: req.body.fallrickAssement.IVHeparinlock ?? sdData.fallrickAssement?.IVHeparinlock ?? {},
      Gait: req.body.fallrickAssement.Gait ?? sdData.fallrickAssement?.Gait ?? {},
      Mentalstatus: req.body.fallrickAssement.Mentalstatus ?? sdData.fallrickAssement?.Mentalstatus ?? {},
      total: req.body.fallrickAssement.total ?? sdData.fallrickAssement?.total ?? 0,
    };
  }


  const updated = await SurgeryDetails.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updated)
    return next(new AppError("No surgery record found with that ID", 404));

  res.status(200).json({
    status: "success",
    message: "Surgery details updated successfully",
    data: { updated },
  });
});

export const updateSurgeryBillDetails = catchAsync(async (req, res, next) => {
  const surgeryDetails = await SurgeryDetails.findById(req.params.id);
  if (!surgeryDetails)
    return next(new AppError("No surgery record found with that ID", 404));

  const pushData = {};
  const setData = {};

  for (const key in req.body) {
    if (Array.isArray(req.body[key])) {
      pushData[key] = { $each: req.body[key] };
    } else {
      setData[key] = req.body[key];
    }
  }

  const updated = await SurgeryDetails.findByIdAndUpdate(
    req.params.id,
    {
      ...(Object.keys(pushData).length > 0 && { $push: pushData }),
      ...(Object.keys(setData).length > 0 && { $set: setData }),
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    message: "Surgery details updated successfully",
    data: { updated },
  });
});

export const deleteSurgeryDetails = catchAsync(async (req, res, next) => {
  const deleted = await SurgeryDetails.findByIdAndDelete(req.params.id);
  if (!deleted)
    return next(new AppError("No surgery record found with that ID", 404));

  res.status(204).json({
    status: "success",
    message: "Surgery details deleted successfully",
  });
});

export const filterSurgeryDetails = catchAsync(async (req, res, next) => {
  let data = {
    iolNames: [],
  };

  const iolList = await Surgery.aggregate([
    { $unwind: "$type" },
    {
      $project: {
        tierName: "$name",
        iolName: "$type.iol",
        amount: "$type.amount",
      },
    },
  ]);

  data.iolNames = iolList;

  const wardPricing = await Ward.find();

  const da = Array.from(
    new Map(
      wardPricing.map((val) => [
        val.wardType,
        {
          Type: val.wardType,
          amount: val.amount,
        },
      ])
    ).values()
  );

  data.bed = da;

  data.products = await Product.find({}, { _id: 1, productName: 1, mrp: 1 });

  res.status(200).json({
    status: "Success",
    data: {
      iolNames: data.iolNames,
      bed: data.bed,
      products: data.products,
    },
  });
});

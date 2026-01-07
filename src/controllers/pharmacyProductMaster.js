import pharmacyProductMaster from "../models/PharmacyProductmaster.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import xlsx from "xlsx";

export const createPharmacyproductMaster = catchAsync(
  async (req, res, next) => {
    const data = await pharmacyProductMaster.create(req.body);

    res.status(201).json({
      status: "success",
      message: "pharmacyProductMaster created successfully",
      data: data,
    });
  }
);

export const uploadPharmacyproductMasterExcel = catchAsync(
  async (req, res, next) => {
    if (!req.file) return next(new AppError("No file uploaded", 400));

    // Read from buffer (since memoryStorage)
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!data.length) return next(new AppError("Excel file is empty", 400));

    const tasksToInsert = data.map((row) => ({
      name: row.name,
      medicineType: row.type || "",
      unit: row.unit || "",
      hsnCode: row.hsnCode || null,
    }));

    const product = await pharmacyProductMaster.insertMany(tasksToInsert);

    res.status(200).json({
      message: "Success",
      count: product.length,
      product,
    });
  }
);

export const getAllParmacyMaster = catchAsync(async (req, res, next) => {
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;
  let filter={}
  if(req.query.name){
    filter.name=req.query.name
  }
  if(req.query.type){
    filter.medicineType=req.query.type
  }
  
  const data = await pharmacyProductMaster.find(filter).limit(limit).skip(skip);

  const totalDocuments = await pharmacyProductMaster.countDocuments();
  const totalPages = Math.ceil(totalDocuments / limit);
  res.status(200).json({
    status: "success",
    page,
    limit,
    totalDocuments,
    totalPages,
    count: data.length,
    data,
  });
});

export const getPharmaMasterById = catchAsync(async (req, res, next) => {
  if (!req.query.id) {
    return next(new AppError("Need Id in query", 400));
  }
  const data = await pharmacyProductMaster.findOne({ _id: req.query.id });

  res.status(200).json({
    message: "success",
    data,
  });
});


export const getPharmaMasterDrop = catchAsync(async (req, res, next) => {
  const data = await pharmacyProductMaster.aggregate([
    {
      $facet: {
        names: [
          { $group: { _id: "$name" } },
          { $project: { _id: 0, label: "$_id",value: "$_id" } }
        ],
        medicineTypes: [
          { $group: { _id: "$medicineType" } },
          { $project: { _id: 0, label: "$_id",value: "$_id" } }
        ]
      }
    }
  ]);

  res.status(200).json({
    message: "success",
    name: data[0].names,
    medicineType: data[0].medicineTypes
  });
});


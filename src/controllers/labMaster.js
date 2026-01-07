import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import xlsx from "xlsx";
import labMaster from "../models/LabMasters.js";

export const createLabMaster = catchAsync(
  async (req, res, next) => {
    const data = await labMaster.create(req.body);

    res.status(201).json({
      status: "success",
      message: "Lab Master created successfully",
      data: data,
    });
  }
);

export const getAllLabMaster=catchAsync(async(req,res,next)=>{
      const limit = req.query.limit || 10;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;
  let filter={}
  if(req.query.name){
    filter.testName=req.query.name
  }
  if(req.query.sampleType){
    filter.sampleType=req.query.sampleType
  }
    const data=await labMaster.find(filter).limit(limit).skip(skip)

      const totalDocuments = await labMaster.countDocuments();
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
})




export const getLabMasterDrop = catchAsync(async (req, res, next) => {
  const data = await labMaster.aggregate([
    {
      $facet: {
        names: [
          { $group: { _id: "$testName" } },
          { $project: { _id: 0, label: "$_id",value: "$_id" } }
        ],
        sampleType: [
          { $group: { _id: "$sampleType" } },
          { $project: { _id: 0, label: "$_id",value: "$_id" } }
        ]
      }
    }
  ]);

  res.status(200).json({
    message: "success",
    name: data[0].names,
    medicineType: data[0].sampleType
  });
});

export const getLabMasterById=catchAsync(async(req,res,next)=>{
    if(!req.query.id){
        return next(new AppError("Need ID in query"),400)
    }
    const data=await labMaster.findOne({_id:req.query.id})

    res.status(200).json({
        message:"Success",
        data
    })
})


import catchAsync from "../utils/catchAsync.js";
import TrailFormSchema from "../models/trail.js";
import AppError from "../utils/AppError.js";

export const createTrail = catchAsync(async (req, res, next) => {
  const data = await TrailFormSchema.create(req.body);
  res.status(201).json({
    status: "success",
    message: "Trail created successfully",
    data,
  });
});

export const getAllTrail = catchAsync(async (req, res) => {
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;
  const totalDocuments = await TrailFormSchema.countDocuments();

  let filter={}

  if(req.query.status){
    filter.approveStatus=req.query.status
  }

  if(req.query.orgName){
    filter.organizationName=req.query.orgName
  }

  const data = await TrailFormSchema.find(filter)
    .limit(limit)
    .skip(skip)
    .sort({ createAt: -1 });
  const totalPages = Math.ceil(totalDocuments / limit);

  res.status(200).json({
    status: "success",
    data,
    totalPages,
    currentPage: page,
    totalDocuments
  });
});

export const getTrailById=catchAsync(async(req,res,next)=>{
    if(!req.query.id){
        return next(new AppError("Id required in query",400))
    }
    const data=await TrailFormSchema.findOne({_id:req.query.id})

    res.status(200).json({
        message:"Success",
        data
    })
})


export const updateTrailById=catchAsync(async(req,res,next)=>{
    if(!req.query.id){
        return next(new AppError("Id missing in query!",400))
    }
    const data=await TrailFormSchema.findByIdAndUpdate(req.query.id,req.body,{
        runValidators:true,
        new:true
    })

    res.status(200).json({
        message:"Updated Successfully!",
        data
    })
})

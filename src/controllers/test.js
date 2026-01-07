import Test from "../models/test.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import mongoose from "mongoose";

export const createTest = catchAsync(async (req, res, next) => {
    const test = await Test.create(req.body);
    res.status(201).json({
        status: "success",
        message: "Test created successfully",
        data: { test },
    });
});

export const getAllTests = catchAsync(async (req, res, next) => {
    const id=req.query.id

    let filter={}

    if(req.query.id){
        filter.organizationId=req.query.id
    }

    
    if(req.query.branch){
        filter.branch=req.query.branch
    }

    const features = new APIFeatures(Test.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const tests = await features.query;

    res.status(200).json({
        status: "success",
        results: tests.length,
        data: { tests },
    });
});

export const getTest = catchAsync(async (req, res, next) => {
    const test = await Test.findById(req.params.id);
    if (!test) {
        return next(new AppError("No test found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: { test },
    });
});

export const updateTest = catchAsync(async (req, res, next) => {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!test) {
        return next(new AppError("No test found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Test updated successfully",
        data: { test },
    });
});

export const dmMenuTest = catchAsync(async (req, res, next) => {
    const organizationId=req.query.id
       if (!organizationId) {
        return next(new AppError("No oRGID found with that ID", 404));
    }

  let filter={}

    if(req.query.id){
        filter.organizationId=req.query.id
    }

    
    if(req.query.branch){
        filter.branch=req.query.branch
    }
    const test = await Test.find(filter);

    if (!test) {
        return next(new AppError("No Test found with that ID", 404));
    }

    const data = test.map((val) => {
        return {
            id : val._id,
         testName :val.testName,
        }
    });
    

    res.status(200).json({
        status: "Success",
        data : {
            data
        }
    });
});
export const deleteTest = catchAsync(async (req, res, next) => {
    const test = await Test.findByIdAndDelete(req.params.id);
    if (!test) {
        return next(new AppError("No test found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        message: "Test deleted successfully",
    });
});

export const filterTests = catchAsync(async (req, res, next) => {
    let filter = {};

    if (req.query.testName) {
        filter.testName = { $regex: req.query.testName, $options: "i" };
    }
    if (req.query.sampleType) {
        filter.sampleType = req.query.sampleType;
    }
    if (req.query.status) {
        filter.status = req.query.status;
    }
      if (req.query.id) {
        filter.organizationId = req.query.id;
    }

         if (req.query.branch) {
        filter.branch = req.query.branch;
    }
    if (req.query.priceRange) {
        const [minPrice, maxPrice] = req.query.priceRange.split("-").map(Number);
    
        if (!isNaN(minPrice) && !isNaN(maxPrice)) {
            filter.price = { $gte: minPrice, $lte: maxPrice };
        }
    }

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const totalTests = await Test.countDocuments(filter);
    const totalPages = Math.ceil(totalTests / limit);

    const features = new APIFeatures(Test.find(filter), req.query)
        .sort()
        .paginate();

    const tests = await features.query;

    res.status(200).json({
        status: "success",
        totalPages: totalPages,
        currentPage: page,
        results: tests.length,
        data: { tests },
    });
});


export const deleteTestByName=catchAsync(async(req,res,next)=>{
    if(!req.query.name){
        return next(new AppError("Test Name required in query!",400))
    }
        let filter = {};

    if (req.query.orgId) {
      filter.organizationId = req.query.orgId;
    }

    if(req.query.branch){
      filter.branch=new mongoose.Types.ObjectId(req.query.branch)
    }

     if (req.query.name) {
      filter.testName = decodeURIComponent(req.query.name)
    }

    const product = await Test.findOneAndDelete(filter);
    
        res.status(200).json({
      status: "success",
      message: "Test deleted successfully",
      product
    });
})


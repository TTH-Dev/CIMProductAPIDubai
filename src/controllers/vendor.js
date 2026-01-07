import Vendor from "../models/vendor.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import mongoose from "mongoose";

export const createVendor = catchAsync(async (req, res, next) => {

    const organizationId=req.body.organizationId
    if(!organizationId){
        return next(new AppError("organizationId not found!",400))
    }

    const vendor = await Vendor.create(req.body);
    res.status(201).json({
        status: "success",
        data: { vendor }
    });
});

export const getAllVendors = catchAsync(async (req, res, next) => {

    let filter={}

    if(req.query.organizationId){
        filter.organizationId=req.query.organizationId
    }

       if(req.query.branch){
        filter.branch=req.query.branch
    }

    const features = new APIFeatures(Vendor.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const vendors = await features.query;
    res.status(200).json({
        status: "success",
        results: vendors.length,
        data: { vendors }
    });
});

export const getVendor = catchAsync(async (req, res, next) => {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return next(new AppError("Vendor not found", 404));

    res.status(200).json({
        status: "success",
        data: { vendor }
    });
});

export const updateVendor = catchAsync(async (req, res, next) => {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!vendor) return next(new AppError("Vendor not found", 404));

    res.status(200).json({
        status: "success",
        data: { vendor }
    });
});

export const dmMenuVendor = catchAsync(async (req, res, next) => {

    const organizationId=req.query.id

    if (!organizationId) {
        return next(new AppError("No ORGID found with that ID", 404));
    }
    let filter={}

    if(req.query.id){
        filter.organizationId=req.query.id
    }

      if(req.query.branch){
        filter.branch= new mongoose.Types.ObjectId(req.query.branch)
    }

    const vendor = await Vendor.find(filter);

    if (!vendor) {
        return next(new AppError("No vendor found with that ID", 404));
    }

    const data = vendor.map((val) => {
        return {
            id : val._id,
         vendorName :val.vendorName,
         vendorLocation : val.location
        }
    });

    res.status(200).json({
        status: "Success",
        data : {
            data
        }
    });
});

export const deleteVendor = catchAsync(async (req, res, next) => {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) return next(new AppError("Vendor not found", 404));

    res.status(204).json({
        status: "success",
        message: "Vendor deleted successfully"
    });
});

export const filterVendors = catchAsync(async (req, res, next) => {
    let filter = {};

    if (req.query.vendorName) filter.vendorName =req.query.vendorName;

    if (req.query.location) filter.location = req.query.location;
    if(req.query.organizationId) filter.organizationId=req.query.organizationId;
    if(req.query.branch) filter.branch=req.query.branch
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const features = new APIFeatures(Vendor.find(filter), req.query)
        .sort()
        .paginate();

    const vendors = await features.query;
    const totalVendors = await Vendor.countDocuments(filter);
    const totalPages = Math.ceil(totalVendors / limit);

    res.status(200).json({
        status: "success",
        totalPages,
        results: vendors.length,
        data: { vendors }
    });
});


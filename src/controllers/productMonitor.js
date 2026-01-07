import ProductUsageMonitor from "../models/productMonitor.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from '../utils/AppError.js';

export const createProductUsageMonitor = catchAsync(async (req, res, next) => {
    const {
        productName,
        openDate,
        closeDate,
        openTime,
        closeTime,
        reconstituteExpDate,
        lotNo,
        productExpiryDate,
        status,
        testName,
        monitoredValues,
        organizationId,branch
    } = req.body;

    const newMonitor = await ProductUsageMonitor.create({
        productName,
        openDate,
        closeDate,
        reconstituteExpDate,
        lotNo,
        productExpiryDate,
        status,
        testName,
        monitoredValues,
        openTime,
        closeTime,
        organizationId,branch
    });

    res.status(201).json({
        status: "Success",
        message: "Product Usage Monitor Created",
        data: { newMonitor }
    });
});

export const getAllProductUsageMonitors = catchAsync(async (req, res, next) => {
    const organizationId=req.query.id
    if(!organizationId){
        return next(new AppError("ORGID not found!",400))
    }
    let filter={}

    if(req.query.id){
        filter.organizationId=req.query.id
    }
    if(req.query.branch){
        filter.branch=req.query.branch
    }
    const monitors = await ProductUsageMonitor.find(filter);
    res.status(200).json({
        status: "Success",
        results: monitors.length,
        data: { monitors }
    });
});

export const getProductUsageMonitor = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const monitor = await ProductUsageMonitor.findById(id);

    if (!monitor) {
        return next(new AppError("No monitor found with that ID", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { monitor }
    });
});

export const updateProductUsageMonitor = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const updatedMonitor = await ProductUsageMonitor.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updatedMonitor) {
        return next(new AppError("No monitor found with that ID", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { updatedMonitor }
    });
});

export const deleteProductUsageMonitor = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const monitor = await ProductUsageMonitor.findByIdAndDelete(id);

    if (!monitor) {
        return next(new AppError("No monitor found with that ID", 404));
    }

    res.status(204).json({
        status: "Success",
        message: "Product Usage Monitor Deleted Successfully"
    });
});

export const filterProductUsageMonitors = catchAsync(async (req, res, next) => {
    let filter = {};

    if (req.query.productName) {
        filter.productName = { $regex: req.query.productName, $options: "i" };
    }
    if (req.query.lotNo) {
        filter.lotNo = req.query.lotNo;
    }
    if (req.query.status) {
        filter.status = req.query.status;
    }
    if (req.query.testName) {
        filter.testName = req.query.testName;
    }
       if (req.query.id) {
        filter.organizationId = req.query.id;
    }

    if(req.query.branch){
        filter.branch=req.query.branch
    }
    if (req.query.date) {
        const date = new Date(req.query.date);
        filter.createdAt = {
            $gte: new Date(date.setHours(0, 0, 0, 0)),
            $lt: new Date(date.setHours(23, 59, 59, 999)),
        };
    }

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const monitors = await ProductUsageMonitor.find(filter)
        .skip(skip)
        .limit(limit);

    const totalRecords = await ProductUsageMonitor.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        results: monitors.length,
        data: { monitors }
    });
});


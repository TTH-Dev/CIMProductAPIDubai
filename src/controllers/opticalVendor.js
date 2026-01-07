import OpticalVendor from "../models/opticalVendor.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";


export const createOpticalVendor = catchAsync(async (req, res, next) => {
    const { vendorName } = req.body;

    if (!vendorName) {
        return next(new AppError("VendorName required", 404));
    }

    const data = {
        vendorName: vendorName,
        accountNumber: req.body.accountNumber,
        address: req.body.address,
        city: req.body.city,
        pincode: req.body.pincode,
        phoneNo: req.body.phoneNo,
        contactPersonName: req.body.contactPersonName,
        emailId: req.body.emailId,
    }
    const opticalVendor = await OpticalVendor.create(data);

    res.status(200).json({
        status: "Success",
        data: {
            opticalVendor
        },
    })
});

export const getAllOpticalVendor = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    let filter = {};

    if (req.query.patientId) {
        filter.patientId = req.query.patientId;
    }

    if (req.query.date) {
        const date = new Date(req.query.date);
        filter.enteredDate = {
            $gte: new Date(date.setHours(0, 0, 0, 0)),
            $lt: new Date(date.setHours(23, 59, 59, 999)),
        };
    }

    const features = new APIFeatures(OpticalVendor.find(filter), req.query)
        .limitFields()
        .sort()
        .paginate();

    const opticalVendor = await features.query;
    const totalRecords = await OpticalVendor.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        result: opticalVendor.length,
        data: { opticalVendor },
    });
});

export const getOpticalVendorById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const opticalVendor = await OpticalVendor.findById(id);
    if (!opticalVendor) {
        return next(new AppError("Associated Complaint not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { opticalVendor },
    });
});

export const updateOpticalVendor = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const opticalVendor = await OpticalVendor.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!opticalVendor) {
        return next(new AppError("Associated Complaint not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { opticalVendor },
    });
});

export const deleteOpticalVendor = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const opticalVendor = await OpticalVendor.findByIdAndDelete(id);
    if (!opticalVendor) {
        return next(new AppError("Associated Complaint not found", 404));
    }

    res.status(204).json({
        status: "Success",
        data: null,
    });
});

export const opticalVendorDMmenu = catchAsync(async (req, res, next) => {

    const data = await OpticalVendor.distinct("vendorName");

    const dmMenu = data.map((val) => {
        return {
            label : val,
            value : val
        }
    });

    res.status(200).json({
        status : "Success",
        data : dmMenu
    });
})

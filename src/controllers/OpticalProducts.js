import OpticalProduct from "../models/OpticalProducts.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";

export const createOpticalProduct = catchAsync(async (req, res, next) => {
    const { vendorName, prodctName } = req.body;

    if (!vendorName) {
        return next(new AppError("VendorName and prodctName are required!", 404));
    }

    const data = {
        vendorName: vendorName,
        prodctName: prodctName,
        brand: req.body.brand,
        status: req.body.status,
        salesTax1: req.body.salesTax1,
        salesTax2: req.body.salesTax2,
        hsnCode: req.body.hsnCode,
        amount: req.body.amount,
        cost: req.body.cost,
    }
    const opticalproduct = await OpticalProduct.create(data);

    res.status(200).json({
        status: "Success",
        data: {
            opticalproduct
        },
    })
});

export const getAllOpticalProduct = catchAsync(async (req, res, next) => {
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

    const features = new APIFeatures(OpticalProduct.find(filter), req.query)
        .limitFields()
        .sort()
        .paginate();

    const opticalproduct = await features.query;
    const totalRecords = await OpticalProduct.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        result: opticalproduct.length,
        data: { opticalproduct },
    });
});

export const getOpticalProductById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const opticalproduct = await OpticalProduct.findById(id);
    if (!opticalproduct) {
        return next(new AppError("Associated Complaint not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { opticalproduct },
    });
});

export const updateOpticalProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const opticalproduct = await OpticalProduct.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!opticalproduct) {
        return next(new AppError("Associated Complaint not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { opticalproduct },
    });
});

export const deleteOpticalProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const opticalproduct = await OpticalProduct.findByIdAndDelete(id);
    if (!opticalproduct) {
        return next(new AppError("Associated Complaint not found", 404));
    }

    res.status(204).json({
        status: "Success",
        data: null,
    });
});

export const opticalproductDMmenu = catchAsync(async (req, res, next) => {

    const data = await OpticalProduct.distinct("vendorName");

    const dmMenu = data.map((val) => {
        return {
            label: val,
            value: val
        }
    });

    res.status(200).json({
        status: "Success",
        data: dmMenu
    });
})

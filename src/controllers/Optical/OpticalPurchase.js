import catchAsync from "../../utils/catchAsync.js";
import AppError from '../../utils/AppError.js';
import OpticalPurchase from "../../models/Optical/OpticalPurchase.js";
import OpticalProduct from "../../models/Optical/OpticalProducts.js";

export const createOpticalPurchase = catchAsync(async (req, res, next) => {
    const { vendor, products, subTotal, taxAmt, total, date, totalValue, vendorId } = req.body;

    const newOpticalPurchase = await OpticalPurchase.create({
        vendor,
        vendorId,
        products,
        subTotal,
        taxAmt,
        total,
        date,
        status: "Requested",
        totalValue
    });

    res.status(201).json({
        status: "Success",
        message: "OpticalPurchase Created",
        data: { newOpticalPurchase }
    });
});

export const getAllOpticalPurchases = catchAsync(async (req, res, next) => {
    const purchase = await OpticalPurchase.find();
    res.status(200).json({
        status: "Success",
        results: purchase.length,
        data: { purchase }
    });
});

export const getOpticalPurchase = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const item = await OpticalPurchase.findById(id);

    if (!item) {
        return next(new AppError("No item found with that ID", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { item }
    });
});

export const updateOpticalPurchase = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const updatedOpticalPurchase = await OpticalPurchase.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updatedOpticalPurchase) {
        return next(new AppError("No item found with that ID", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { updatedOpticalPurchase }
    });
});

export const deleteOpticalPurchase = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const item = await OpticalPurchase.findByIdAndDelete(id);

    if (!item) {
        return next(new AppError("No item found with that ID", 404));
    }

    res.status(204).json({
        status: "Success",
        message: "OpticalPurchase Deleted Successfully"
    });
});

export const filterOpticalPurchases = catchAsync(async (req, res, next) => {
    let filter = {};

    if (req.query.vendor) {
        filter.vendor = req.query.vendor;
    }
    if (req.query.productName) {
        filter['products.productName'] = { $regex: req.query.productName, $options: "i" };
    }
    if (req.query.status) {
        filter.status = req.query.status;
    }

    const purchase = await OpticalPurchase.find(filter);
    res.status(200).json({
        status: "Success",
        results: purchase.length,
        data: { purchase }
    });
});



export const bulkUpdateOpticalPurchase = catchAsync(async (req, res, next) => {
    const { ids, statusValue } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return next(new AppError("IDs array is required and must contain at least one ID", 400));
    }

    if (!statusValue) {
        return next(new AppError("Status value is required", 400));
    }

    const updatedOpticalPurchase = await OpticalPurchase.updateMany(
        { _id: { $in: ids } },
        { $set: { status: statusValue } },
        { new: true, runValidators: true }
    );

    if (!updatedOpticalPurchase.modifiedCount) {
        return next(new AppError("No items were updated. Check if the provided IDs exist.", 404));
    }
    const purchases = await OpticalPurchase.find({ _id: { $in: ids } });
    const products = purchases.flatMap(purchase =>
        purchase.products
    );
    for (const item of products) {
        await OpticalProduct.findByIdAndUpdate(
            item.productId,
            { $inc: { stocks: item.quantity } },
            { new: true }
        );
    }


    res.status(200).json({
        status: "Success",
        message: `${updatedOpticalPurchase.modifiedCount} purchases updated successfully.`,
    });
});

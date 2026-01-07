import catchAsync from "../utils/catchAsync.js";
import AppError from '../utils/AppError.js';
import Purchase from "../models/purchase.js";
import Product from "../models/products.js"

export const createPurchase = catchAsync(async (req, res, next) => {
    
    const { vendor, products, subTotal, taxAmt, total, date, totalValue,vendorId,organizationId,branch } = req.body;

    const newPurchase = await Purchase.create({
        vendor,
        vendorId,
        products,
        subTotal,
        taxAmt,
        total,
        date,
        totalValue,
        organizationId,branch
    });

    res.status(201).json({
        status: "Success",
        message: "Purchase Created",
        data: { newPurchase }
    });
});

export const getAllPurchases = catchAsync(async (req, res, next) => {

    if(!req.query.organizationId){
        return next(new AppError("organizationId is required!",400))

    }
    let filter={}


    if(req.query.organizationId){
        filter.organizationId=req.query.organizationId
    }

      if(req.query.branch){
        filter.branch=req.query.branch
    }

    const purchase = await Purchase.find(filter);
    res.status(200).json({
        status: "Success",
        results: purchase.length,
        data: { purchase }
    });
});

export const getPurchase = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const item = await Purchase.findById(id);

    if (!item) {
        return next(new AppError("No item found with that ID", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { item }
    });
});

export const updatePurchase = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const updatedPurchase = await Purchase.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updatedPurchase) {
        return next(new AppError("No item found with that ID", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { updatedPurchase }
    });
});

export const deletePurchase = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const item = await Purchase.findByIdAndDelete(id);

    if (!item) {
        return next(new AppError("No item found with that ID", 404));
    }

    res.status(204).json({
        status: "Success",
        message: "Purchase Deleted Successfully"
    });
});

export const filterPurchases = catchAsync(async (req, res, next) => {
    let filter = {};
    
    if (req.query.vendor) {
        filter.vendor = req.query.vendor;
    }
    if (req.query.productName) {
        filter['products.productName'] = { $regex: req.query.productName, $options: "i" };
    }
    if (req.query.purchaseNo) {
        filter.purchaseNo = req.query.purchaseNo;
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

    const purchase = await Purchase.find(filter);
    res.status(200).json({
        status: "Success",
        results: purchase.length,
        data: { purchase }
    });
});



export const bulkUpdatePurchase = catchAsync(async (req, res, next) => {
    const { ids, statusValue } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return next(new AppError("IDs array is required and must contain at least one ID", 400));
    }

    if (!statusValue) {
        return next(new AppError("Status value is required", 400));
    }

    const updatedPurchase = await Purchase.updateMany(
        { _id: { $in: ids } },
        { $set: { status: statusValue } },
        { new: true, runValidators: true }
    );

    if (!updatedPurchase.modifiedCount) {
        return next(new AppError("No items were updated. Check if the provided IDs exist.", 404));
    }

    const purchases = await Purchase.find({ _id: { $in: ids } });

    const products = purchases.flatMap(purchase =>
        purchase.products
    );

    for (const item of products) {
        await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: item.quantity } }, 
            { new: true }
        );
    }
    res.status(200).json({
        status: "Success",
        message: `${updatedPurchase.modifiedCount} purchases updated successfully.`,
        data: {
            purchases,
        }
    });
});


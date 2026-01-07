import catchAsync from "../utils/catchAsync.js";
import AppError from '../utils/AppError.js';
import PharmacyPurchase from "../models/pharmact-purchase.js";
import pharmacyProduct from "../models/PharmacyProduct.js"

export const createPharmacyPurchase = catchAsync(async (req, res, next) => {

    const newPharmacyPurchase = await PharmacyPurchase.create(req.body);

    res.status(201).json({
        status: "Success",
        message: "PharmacyPurchase Created",
        data: { newPharmacyPurchase }
    });
});

export const getAllPharmacyPurchases = catchAsync(async (req, res, next) => {
     if (!req.query.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  }

  let filter = {}


  if(req.query.organizationId){
    filter.organizationId=req.query.organizationId
  }

    if(req.query.branch){
    filter.branch=req.query.branch
  }



    const purchase = await PharmacyPurchase.find(filter);
    res.status(200).json({
        status: "Success",
        results: purchase.length,
        data: { purchase }
    });
});

export const getPharmacyPurchase = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const item = await PharmacyPurchase.findById(id);

    if (!item) {
        return next(new AppError("No item found with that ID", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { item }
    });
});

export const updatePharmacyPurchase = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const updatedPharmacyPurchase = await PharmacyPurchase.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updatedPharmacyPurchase) {
        return next(new AppError("No item found with that ID", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { updatedPharmacyPurchase }
    });
});

export const deletePharmacyPurchase = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const item = await PharmacyPurchase.findByIdAndDelete(id);

    if (!item) {
        return next(new AppError("No item found with that ID", 404));
    }

    res.status(204).json({
        status: "Success",
        message: "PharmacyPurchase Deleted Successfully"
    });
});

export const filterPharmacyPurchases = catchAsync(async (req, res, next) => {
    let filter = {};

    if(req.query.organizationId){
        filter.organizationId=req.query.organizationId
    }

        if(req.query.branch){
        filter.branch=req.query.branch
    }

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

    const purchase = await PharmacyPurchase.find(filter);
    res.status(200).json({
        status: "Success",
        results: purchase.length,
        data: { purchase }
    });
});



export const bulkUpdatePharmacyPurchase = catchAsync(async (req, res, next) => {
    const { ids, statusValue } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return next(new AppError("IDs array is required and must contain at least one ID", 400));
    }

    if (!statusValue) {
        return next(new AppError("Status value is required", 400));
    }

    const updatedPharmacyPurchase = await PharmacyPurchase.updateMany(
        { _id: { $in: ids } },  
        { $set: { status: statusValue } }, 
        { new: true, runValidators: true }
    );

    if (!updatedPharmacyPurchase.modifiedCount) {
        return next(new AppError("No items were updated. Check if the provided IDs exist.", 404));
    }
        const purchases = await PharmacyPurchase.find({ _id: { $in: ids } });
        const products = purchases.flatMap(purchase =>
            purchase.products
        );
        for (const item of products) {
            await pharmacyProduct.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: item.quantity } }, 
                { new: true }
            );
        }


    res.status(200).json({
        status: "Success",
        message: `${updatedPharmacyPurchase.modifiedCount} purchases updated successfully.`,
    });
});


export const purchaseReturn = catchAsync(async (req, res, next) => {
  const { products } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    return next(new AppError("Products array is required", 400));
  }

  for (const item of products) {
    const product = await pharmacyProduct.findById(item.productId);

    if (!product) {
      return next(new AppError(`Product with ID ${item.productId} not found`, 404));
    }

   

    await pharmacyProduct.findByIdAndUpdate(
      item.productId,
      { $inc: { stock: item.quantity } },
      { new: true }
    );
  }

  res.status(200).json({
    status: "Success",
    message: "Purchase return processed and stock updated successfully.",
  });
});


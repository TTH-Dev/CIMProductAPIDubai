import PharmacyProduct from "../models/PharmacyProduct.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import PharmacyProductList from "../models/PharmaPurchaseList.js";
import mongoose from "mongoose";

export const createPharmacyProduct = catchAsync(async (req, res, next) => {
  if (!req.body.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  }
  const product = await PharmacyProduct.create(req.body);

  res.status(201).json({
    status: "success",
    message: "Product created successfully",
    data: product,
  });
});

export const getAllPharmacyProducts = catchAsync(async (req, res, next) => {
  if (!req.query.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  }
  const limit = parseInt(req.query.limit) || 10;
  const pageSize = req.query.page || 1;
  const skip = (pageSize - 1) * limit;
  let filter = {};

  if (req.query.organizationId) {
    filter.organizationId = req.query.organizationId;
  }

  if (req.query.branch) {
    filter.branch = req.query.branch;
  }

  if (req.query.name) {
    filter.name = req.query.name;
  }

  if (req.query.type) {
    filter.medicineType = req.query.type;
  }

  if (req.query.unit) {
    filter.unit = req.query.unit;
  }

  const products = await PharmacyProduct.find(filter).skip(skip).limit(limit).sort({createdAt:-1});

  const totalProducts = await PharmacyProduct.countDocuments(filter);
  const totalPages = Math.ceil(totalProducts / limit);

  res.status(200).json({
    status: "success",
    total: totalProducts,
    totalPages,
    data: { products },
  });
});

export const getAllPharmacyProductsPO = catchAsync(async (req, res, next) => {
  if (!req.query.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  }
  let filter = {};

  if (req.query.organizationId) {
    filter.organizationId = req.query.organizationId;
  }

  if (req.query.branch) {
    filter.branch = req.query.branch;
  }
  const features = new APIFeatures(PharmacyProduct.find(filter), req.query)
    .filter()
    .limitFields()
    .sort();

  const products = await features.query;
  const totalProducts = await PharmacyProduct.countDocuments(filter);
  const uniqueMedicineTypes = await PharmacyProduct.find(filter).distinct(
    "medicineType"
  );

  res.status(200).json({
    status: "success",
    total: totalProducts,
    results: products.length,
    data: { medicineTypes: uniqueMedicineTypes },
  });
});

export const getAllPharmacyProductsType = catchAsync(async (req, res, next) => {
  if (!req.query.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  }
  let filter = {};

  if (req.query.organizationId) {
    filter.organizationId = req.query.organizationId;
  }

  if (req.query.branch) {
    filter.branch = req.query.branch;
  }
  const uniqueProductTypes = await PharmacyProduct.find({
    ...filter,
    medicineType: req.query.type,
  });

  res.status(200).json({
    status: "success",

    data: { productsTypes: uniqueProductTypes },
  });
});

export const getPharmacyProduct = catchAsync(async (req, res, next) => {
  const product = await PharmacyProduct.findById(req.params.id);

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { product },
  });
});

export const updatePharmacyProduct = catchAsync(async (req, res, next) => {
  const product = await PharmacyProduct.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Product updated successfully",
    data: { product },
  });
});

export const deletePharmacyProduct = catchAsync(async (req, res, next) => {

  const product = await PharmacyProduct.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    message: "Product deleted successfully",
  });
});

export const filterPharmacyProducts = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  let filter = {};

  if (req.query.name) filter.name = { $regex: req.query.name, $options: "i" };

  if (req.query.vendorName) {
    filter.vendorName = { $regex: req.query.vendorName, $options: "i" };
  }

  if (req.query.medicineType) {
    filter.medicineType = { $regex: req.query.medicineType, $options: "i" };
  }
  if (req.query.vendorId) {
    filter.vendorId = req.query.vendorId;
  }
  if (req.query.expiryDate) {
    filter.expiryDate = { $lte: new Date(req.query.expiryDate) };
  }

  const features = new APIFeatures(PharmacyProduct.find(filter), req.query)
    .sort()
    .limitFields()
    .paginate();

  const products = await features.query.populate("vendorId");
  const totalRecords = await PharmacyProduct.countDocuments(filter);
  const totalPages = Math.ceil(totalRecords / limit);

  res.status(200).json({
    status: "success",
    results: products.length,
    totalPages,
    currentPage: page,
    data: { products },
  });
});

export const getPharmacyProductDM = catchAsync(async (req, res, next) => {
  if (!req.query.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  }
  let filter = {};

  if (req.query.organizationId) {
    filter.organizationId = req.query.organizationId;
  }

  if (req.query.branch) {
    filter.branch = req.query.branch;
  }
  const names = await PharmacyProduct.distinct("name", filter);
  const medicineTypes = await PharmacyProduct.distinct("medicineType", filter);
  const units = await PharmacyProduct.distinct("unit", filter);

  const response = {
    names: names.map((v) => ({ label: v, value: v })),
    medicineTypes: medicineTypes.map((v) => ({ label: v, value: v })),
    units: units.map((v) => ({ label: v, value: v })),
  };

  res.status(200).json({
    status: "success",
    data: { response },
  });
});
export const getPharmacyProductVendorDM = catchAsync(async (req, res, next) => {
  if (!req.query.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  }
  let filter = {};

  if (req.query.organizationId) {
    filter.organizationId = req.query.organizationId;
  }

  if (req.query.branch) {
    filter.branch = req.query.branch;
  }
  const vendor = await PharmacyProduct.find(filter).distinct("name");

  if (!vendor) {
    return next(new AppError("No vendor found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { vendor },
  });
});
export const bulkUpdatePurchase = catchAsync(async (req, res, next) => {
  const { products, subTotal, taxAmt, totalAmount } = req.body;
  const organizationId = req.query.id;
  const branch = req.query.branch;

  if (!organizationId) {
    return next(
      new AppError("Organization ID is required in query params.", 400)
    );
  }

  if (!Array.isArray(products) || products.length === 0) {
    return next(
      new AppError("Products array is required and cannot be empty.", 400)
    );
  }

  const updatedProducts = [];
  const purchaseLogs = [];

  for (const item of products) {
    const { productId, quantity, vendorId } = item;

    if (!productId || typeof quantity !== "number" || !vendorId) {
      continue;
    }

    // 1. Update stock
    const updated = await PharmacyProduct.findByIdAndUpdate(
      productId,
      { $inc: { stock: quantity } },
      { new: true }
    );

    if (updated) {
      updatedProducts.push(updated);

      // 2. Create purchase log
      const purchaseRecord = await PharmacyProductList.create({
        organizationId,
        branch,
        vendorId,
        productId,
        totalQyt: quantity,
        totalAmount: item.rate * quantity + (item.taxAmt || 0), // Optional logic
      });

      purchaseLogs.push(purchaseRecord);
    }
  }

  res.status(200).json({
    status: "Success",
    message: `${updatedProducts.length} products stock updated and purchase logged.`,
    summary: {
      subTotal,
      taxAmt,
      totalAmount,
    },
    data: {
      updatedProducts,
      purchaseLogs,
    },
  });
});

export const bulkUpdateReturn = catchAsync(async (req, res, next) => {
  const { products, subTotal, taxAmt, totalAmount } = req.body;
  const organizationId = req.query.id;
  const branch = req.query.branch;

  if (!organizationId) {
    return next(
      new AppError("Organization ID is required in query params.", 400)
    );
  }

  if (!Array.isArray(products) || products.length === 0) {
    return next(
      new AppError("Products array is required and cannot be empty.", 400)
    );
  }

  const updatedProducts = [];
  const purchaseLogs = [];

  for (const item of products) {
    const { productId, quantity, vendorId } = item;

    if (!productId || typeof quantity !== "number" || !vendorId) {
      continue;
    }

    // 1. Update stock
    const updated = await PharmacyProduct.findByIdAndUpdate(
      productId,
      { $inc: { stock: -quantity } },
      { new: true }
    );

    if (updated) {
      updatedProducts.push(updated);

      // 2. Create purchase log
      const purchaseRecord = await PharmacyProductList.create({
        organizationId,
        vendorId,
        branch,
        productId,
        totalQyt: quantity,
        isReturn: true,
        totalAmount: item.rate * quantity + (item.taxAmt || 0),
      });

      purchaseLogs.push(purchaseRecord);
    }
  }

  res.status(200).json({
    status: "Success",
    message: `${updatedProducts.length} products stock updated and purchase logged.`,
    summary: {
      subTotal,
      taxAmt,
      totalAmount,
    },
    data: {
      updatedProducts,
      purchaseLogs,
    },
  });
});

export const getPurchaseEntry = catchAsync(async (req, res, next) => {
  const organizationId = req.query.id;
  const isReturn = req.query.isReturn;

  if (!organizationId) {
    return next(new AppError("Organization ID not found", 401));
  }

  let filter = {};

  if (req.query.date === "last10days") {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    filter.createdAt = { $gte: tenDaysAgo };
  }

  if (organizationId) {
    filter.organizationId = organizationId;
  }

  if (isReturn) {
    filter.isReturn = req.query.isReturn === "true";
  }

  if (req.query.branch) {
    filter.branch = req.query.branch;
  }

  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const [data, totalCount] = await Promise.all([
    PharmacyProductList.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("vendorId"),
    PharmacyProductList.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  res.status(200).json({
    message: "Success",
    data,
    totalCount,
    totalPages,
    currentPage: page,
    limit,
  });
});

export const deletePharmacyProductByName = catchAsync(
  async (req, res, next) => {
    let filter = {};

    if (req.query.orgId) {
      filter.organizationId = new mongoose.Types.ObjectId(req.query.orgId);
    }

    if (req.query.branch) {
      filter.branch = new mongoose.Types.ObjectId(req.query.branch);
    }

    if (req.query.name) {
      filter.name = decodeURIComponent(req.query.name);
    }

    const product = await PharmacyProduct.findOneAndDelete(filter);

    res.status(200).json({
      status: "success",
      message: "Product deleted successfully",
      product,
    });
  }
);

export const getDropdownByName = catchAsync(async (req, res, next) => {
  if (!req.query.name) {
    return next(new AppError("Name required in query!", 404));
  }

  let filter = {};

  if (req.query.name) {
    filter.name = req.query.name;
  }

  const data = await PharmacyProduct.aggregate([
    {
      $match: filter,
    },
    {
      $project: {
        label: "$quantity",
        value: "$_id",
        _id: 0,
      },
    },
  ]);

  res.status(200).json({
    message: "Success",
    data,
  });
});

export const getProductByName = catchAsync(async (req, res, next) => {
  if (!req.query.productId) {
    return next(new AppError("Product ID missing!", 404));
  }

  const data = await PharmacyProduct.findOne({ _id: req.query.productId });

  res.status(200).json({
    message: "Success",
    data,
  });
});

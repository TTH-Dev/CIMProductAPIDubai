import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/ApiFeatures.js";
import Product from "../models/products.js";

export const createProduct = catchAsync(async (req, res, next) => {
      
  const product = await Product.create(req.body);

  res.status(201).json({
    status: "Success",
    message: "Product created successfully",
    data: { product },
  });
});



export const updateInventoryProduct = catchAsync(async (req, res, next) => {
  const list = req.body; 
  
  const updatedProducts = [];

  for (const val of list) {
    const { itemCode, multiData } = val;

    const updated = await Product.findOneAndUpdate(
      { itemCode },                    
      { $push: { multiData: multiData } },  
      { new: true }                    
    );

    updatedProducts.push(updated);
  }

  res.status(200).json({
    status: "Success",
    message: "Inventory updated successfully",
    data: updatedProducts,
  });
});


export const getAllProducts = catchAsync(async (req, res, next) => {
  if (!req.query.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  }

  let filter = {};

  if (req.query.id) {
    filter.organizationId = req.query.id;
  }
  if (req.query.branch) {
    filter.branch = req.query.branch;
  }
  const features = new APIFeatures(Product.find(filter), req.query)
    .limitFields()
    .filter()
    .sort()
    .paginate();

  const products = await features.query;
  const totalProducts = await Product.countDocuments();

  res.status(200).json({
    status: "Success",
    totalRecords: totalProducts,
    results: products.length,
    data: { products },
  });
});

// 🔹 Get a single product by ID
export const getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  res.status(200).json({
    status: "Success",
    data: { product },
  });
});

// 🔹 Update a product
export const updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  res.status(200).json({
    status: "Success",
    message: "Product updated successfully",
    data: { product },
  });
});

// 🔹 Delete a product
export const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  res.status(204).json({
    status: "Success",
    message: "Product deleted successfully",
  });
});

// 🔹 Delete a product
export const dmMenuProduct = catchAsync(async (req, res, next) => {
  if (!req.query.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  }
  let filter = {};

  if (req.query.id) {
    filter.organizationId = req.query.id;
  }
  if (req.query.branch) {
    filter.branch = req.query.branch;
  }
  const product = await Product.find(filter);

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  const data = product.map((val) => {
    return {
      id: val._id,
      productName: val.productName,
      medicineType: val.medicineType,
    };
  });

  res.status(200).json({
    status: "Success",
    data: {
      data,
    },
  });
});

export const filterProducts = catchAsync(async (req, res, next) => {
  let filter = {};

  if (!req.query.organizationId) {
    return next(new AppError("organizationId is required!", 400));
  } else {
    filter.organizationId = req.query.organizationId;
  }

  if (req.query.branch) {
    filter.branch = req.query.branch;
  }

  if (req.query.productName) {
    filter.productName = { $regex: req.query.productName, $options: "i" };
  }
  if (req.query.productType) {
    filter.productType = { $regex: req.query.productType, $options: "i" };
  }

  if (req.query.slotStatus) {
    filter.slotStatus = req.query.slotStatus;
  }
  if (req.query.manufacturerName) {
    filter.manufacturerName = req.query.manufacturerName;
  }

  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const features = new APIFeatures(Product.find(filter), req.query)
    .limitFields()
    .sort()
    .paginate();

  const products = await features.query;
  const totalProducts = await Product.countDocuments(filter);
  const totalPages = Math.ceil(totalProducts / limit);

  res.status(200).json({
    status: "Success",
    totalPages,
    result: products.length,
    data: { products },
  });
});

export const FindingByVendor = catchAsync(async (req, res, next) => {
  const { vendorName } = req.body;

  if (!req.query.id) {
    return next(new AppError("organizationId is Required", 400));
  }

  if (!vendorName) {
    return next(new AppError("vendorName is Required", 400));
  }

  let filter = {};

  if (req.query.id) {
    filter.organizationId = req.query.id;
  }
  if (req.query.branch) {
    filter.branch = req.query.branch;
  }

  if (vendorName) {
    filter.manufacturerName = vendorName;
  }

  const products = await Product.find(filter);

  if (products.length === 0) {
    return next(new AppError("No products found for this vendor", 404));
  }

  res.status(200).json({
    status: "Success",
    results: products.length,
    data: { products },
  });
});

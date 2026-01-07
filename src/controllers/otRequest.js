import { OtRequired } from "../models/otRequest.js";
import catchAsync from "../utils/catchAsync.js";
import Product from "../models/products.js";
import { OtRequest } from "../models/otRequest.js";
import ProductUsage from "../models/productUsage.js"
import { OtLens } from "../models/otRequest.js";
import AppError from "../utils/AppError.js";

export const createOtRequiredProduct = async (req, res) => {
  try {
    const { productId, currentStock, minimumStock, productName, batchNo,unit } = req.body;

    let existingProduct = await OtRequired.findOne({ productId });

    if (existingProduct) {
      if (currentStock > 0) {
        existingProduct.currentStock = Number(existingProduct.currentStock) + Number(currentStock);
      } else {
        return res.status(400).json({ message: "Only positive stock additions are allowed." });
      }
      existingProduct.minimumStock = minimumStock;
      existingProduct.productName = productName;
      existingProduct.batchNo = batchNo;
      existingProduct.unit=unit
      await existingProduct.save();

      return res.status(200).json({
        message: "OT required product updated successfully",
        data: existingProduct,
      });
    } else {
      const newProduct = new OtRequired({
        productId,
        currentStock,
        minimumStock,
        productName,
        batchNo,
        unit
      });
      await newProduct.save();

      return res.status(201).json({
        message: "OT required product created successfully",
        data: newProduct,
      });
    }
  } catch (error) {
    console.error("Error creating/updating OT required product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createOtRequiredLens = async (req, res) => {
  try {
    const { brand, model, power, actualStock } = req.body;

    const newProduct = new OtLens({
      brand,
      model,
      power,
      actualStock
    });

    await newProduct.save();

    res.status(201).json({
      message: "OT required Lens created successfully",
      data: newProduct
    });
  } catch (error) {
    console.error("Error creating OT required product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllRequiredProdts = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.productName) {
    filter.productName = { $regex: req.query.productName, $options: "i" };
  }

  if (req.query.minStock) {
    filter.minimumStock = { $gte: parseInt(req.query.minStock) };
  }

  if (req.query.maxStock) {
    filter.minimumStock = { ...filter.minimumStock, $lte: parseInt(req.query.maxStock) };
  }

  const total = await OtRequired.countDocuments(filter);

  const data = await OtRequired.find(filter)
    .populate("productId")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: data.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data,
  });
});

export const getAllRequiredLens = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await OtLens.countDocuments();

  const data = await OtLens.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: data.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data,
  });
});


export const deleteOtrequestLeans=catchAsync(async(req,res)=>{
  const {id}=req.params
  const data=await OtLens.findByIdAndDelete(id)
  res.status(200).json({
    message:"Deleted Successfully!",
    data
  })
})

export const editOtlen = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { actualStock, brand, model, power } = req.body;

  const data = await OtLens.findById(id);

  if (!data) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (actualStock !== undefined) data.actualStock = actualStock;
  if (brand !== undefined) data.brand = brand;
  if (model !== undefined) data.model = model;
  if (power !== undefined) data.power = power;

  await data.save();

  res.status(200).json({
    message: "Updated Successfully!",
    data,
  });
});


export const getOtLensById=catchAsync(async(req,res)=>{
  const {id}=req.params

  const data=await OtLens.findById(id)

  res.status(200).json({
    message:"Fetch Success!",
    data
  })
}) 

export const requestOtProduct = catchAsync(async (req, res, next) => {
  const items = req.body;

  if (!Array.isArray(items)) {
    return next(new AppError("Request body must be an array", 400));
  }

  const productIds = items.map(item => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  const productMap = {};
  products.forEach(prod => {
    productMap[prod._id.toString()] = prod;
  });

  const productList = [];
  let totalQuantity = 0;

  for (const item of items) {
    const { productId, requestingStock } = item;
    const product = productMap[productId];

    if (!product) {
      return next(new AppError(`Product with ID "${productId}" not found`, 404));
    }

    const validRequestingStock = Number(requestingStock);
    if (isNaN(validRequestingStock)) {
      return next(new AppError("Requesting stock must be a number", 400));
    }

    const requiredStock = Math.max(product.minimumStock - product.stock, 0);

    productList.push({
      productId: product._id,
      productName: product.productName,
      currentStock: product.currentStock,
      requiredStock: requiredStock || 0,
      requestingStock: validRequestingStock,
    });

    totalQuantity += validRequestingStock;
  }

  const otRequest = await OtRequest.create({
    products: productList,
    totalProducts: productList.length,
    totalQuantity,
  });

  res.status(201).json({
    status: "success",
    message: "OT product request created",
    data: otRequest,
  });
});

export const approveOtProductRequests = catchAsync(async (req, res, next) => {
  const items = req.body;
  const { requestId } = req.params;

  const request = await OtRequest.findById(requestId);
  if (!request) {
    return next(new AppError("Request not found", 404));
  }

  request.products = items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    batchNo: item.batchNo,
    expiryDate: item.expiryDate,
    requestingStock: item.requestingStock,
    requiredStock: item.requiredStock,
    currentStock: item.currentStock,
  }));

  request.status = "approved";
  await request.save();

  res.status(200).json({
    status: "success",
    message: "Request approved",
    data: request,
  });
});

export const createProductUsage = async (req, res) => {
  try {
    const { productId, productName, batchNo, quantity } = req.body;

    const usage = await ProductUsage.create({
      productId,
      productName,
      batchNo,
      quantity
    });

    const reqPr = await OtRequired.findOne({ productId });

    if (!reqPr) {
      return res.status(404).json({ status: "Fail", message: "Product not found in OT Required" });
    }

    if (reqPr.currentStock < quantity) {
      return res.status(400).json({ status: "Fail", message: "Insufficient stock" });
    }

    reqPr.currentStock -= quantity;
    await reqPr.save();

    res.status(200).json({
      status: "Success",
      data: {
        reqPr,
        usage
      }
    });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
};

export const getAllRequest = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let filter = {};
  if (req.query.status) {
    filter.status = req.query.status
  }

  const total = await OtRequest.countDocuments(filter);

  const data = await OtRequest.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: data.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data,
  });
});

export const getAllRequired = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await OtRequired.countDocuments();

  const data = await OtRequired.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: data.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data,
  });
});

export const getRequestById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const reqPr = await OtRequest.findById(id);
  if (!reqPr) {
    return next(new AppError("OtRequest record not found", 404));
  }

  res.status(200).json({
    status: "Success",
    data: { reqPr },
  });
});

export const delall = catchAsync(async (req, res, next) => {

  const reqPr = await OtRequest.deleteMany();
  if (!reqPr) {
    return next(new AppError("OtRequest record not found", 404));
  }

  res.status(200).json({
    status: "Success",
    data: { reqPr },
  });
});


export const updateOtRequiredStock = catchAsync(async (req, res, next) => {
  const items = req.body;
  const { requestId } = req.params;

  if (!Array.isArray(items) || items.length === 0) {
    return next(new AppError("No product data provided", 400));
  }

  const results = [];

  for (const item of items) {
    const { productId, requestingStock = 0 } = item;

    const otRequired = await OtRequired.findOne({ productId });

    if (!otRequired) {
      results.push({ productId, status: "skipped", reason: "OtRequired entry not found" });
      continue;
    }

    otRequired.currentStock += requestingStock;
    await otRequired.save();

    results.push({ productId, status: "updated" });
  }

  const request = await OtRequest.findById(requestId);

  if (request) {
    request.status = "updated";
    request.receivedDate = Date.now;
    await request.save();
  } else {
    results.push({ requestId, status: "skipped", reason: "OtRequest not found" });
  }

  res.status(200).json({
    status: "success",
    message: "Stock updated and request marked as updated",
    data: results,
  });
});


export const updateOtRequiredAfterUsage = catchAsync(async (req, res, next) => {
  const usedItems = req.body;

  if (!Array.isArray(usedItems) || usedItems.length === 0) {
    return next(new AppError("No product usage data provided", 400));
  }

  const results = [];

  for (const item of usedItems) {
    const { productId, usedQuantity } = item;

    const quantity = parseInt(usedQuantity, 10);
    if (!productId || isNaN(quantity) || quantity <= 0) {
      results.push({ productId, status: "failed", reason: "Invalid data" });
      continue;
    }

    const otRequired = await OtRequired.findOne({ productId });

    if (!otRequired) {
      results.push({ productId, status: "failed", reason: "OtRequired entry not found" });
      continue;
    }

    if (otRequired.currentStock < quantity) {
      results.push({ productId, status: "failed", reason: "Insufficient stock" });
      continue;
    }

    otRequired.currentStock -= quantity;

    otRequired.usedStock = (otRequired.usedStock || 0) + quantity;

    await otRequired.save();

    results.push({ productId, status: "updated", remainingStock: otRequired.currentStock });
  }

  res.status(200).json({
    status: "success",
    message: "Stock deducted from OtRequired",
    data: results,
  });
});



export const deleteOtRequest=catchAsync(async(req,res)=>{
    const {delId}=req.query
    
   const data= await OtRequired.findByIdAndDelete(delId)

    res.status(200).json({
      message:"Deleted Successfully!",
      data
    })
})



export const editOtRequest = catchAsync(async (req, res) => {
  const { id } = req.params; 
  const { currentStock, minimumStock, productName, batchNo, unit } = req.body;

  const product = await OtRequired.findById(id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (currentStock !== undefined) product.currentStock = currentStock;
  if (minimumStock !== undefined) product.minimumStock = minimumStock;
  if (productName !== undefined) product.productName = productName;
  if (batchNo !== undefined) product.batchNo = batchNo;
  if (unit !== undefined) product.unit = unit;

  await product.save();

  return res.status(200).json({
    message: "OT required product edited successfully",
    data: product,
  });
});

export const getOtresquestById=catchAsync(async(req,res)=>{
  const {id}=req.params

  const data=await OtRequired.findById(id)
  if (!data) {
    return res.status(404).json({ message: "No data found" });
  }

  res.status(200).json({
    message:"Retrived successfully!",
    data
  })

})



import OpticalProduct from "../../models/Optical/OpticalProducts.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import xlsx from "xlsx";
import OpticalVendor from "../../models/Optical/opticalVendor.js";

export const createOpticalProduct = catchAsync(async (req, res, next) => {
  const { vendorName, productName, stocks } = req.body;

  if (!vendorName || !productName) {
    return next(new AppError("VendorName and productName are required!", 404));
  }
let availlableStocksStatus=""
if(req.body.type==="Frame"){
    const frames = req.body.frameStockandcolors?.frames || [];
    availlableStocksStatus=frames.length>0?"Available":"Sold"
}
else{
 availlableStocksStatus = stocks >= 1 ? "Available" : "Sold";
}
  

  const data = {
    vendorName: vendorName,
    productName: productName,
    brand: req.body.brand,
    type: req.body.type,
    status: req.body.status,
    salesTax1: req.body.salesTax1,
    salesTax2: req.body.salesTax2,
    hsnCode: req.body.hsnCode,
    amount: req.body.amount,
    barcode: req.body.barcode,
    cost: req.body.cost,
    stocks: stocks,
    availlableStocksStatus: availlableStocksStatus,
    productType: req.body.productType,
    productMaterial: req.body.productMaterial,
    frameStockandcolors: req.body.frameStockandcolors,
  };
  const opticalproduct = await OpticalProduct.create(data);

  await OpticalVendor.findOneAndUpdate(
    { vendorName },
    { $inc: { numProducts: 1 } },
    { new: true }
  );
  res.status(200).json({
    status: "Success",
    data: {
      opticalproduct,
    },
  });
});

export const getAllOpticalProduct = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  let filter = {};

  if (req.query.type) {
    filter.type = req.query.type;
  }
  if (req.query.barcode) {
    filter.barcode = { $regex: req.query.barcode, $options: "i" };
  }
  if (req.query.vendorName) {
    filter.vendorName = { $regex: req.query.vendorName, $options: "i" };
  }
  if (req.query.brand) {
    filter.brand = { $regex: req.query.brand, $options: "i" };
  }
  if (req.query.productName) {
    filter.productName = req.query.productName;
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
    return next(new AppError("OpticalProduct  not found", 404));
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
    return next(new AppError(" OpticalProduct not found", 404));
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
    return next(new AppError(" OpticalProduct not found", 404));
  }

  res.status(204).json({
    status: "Success",
    data: null,
  });
});

export const opticalproductDMmenu = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.query.type) {
    filter.type = req.query.type;
  }

  const data = await OpticalProduct.find(filter);

  const dmMenu = data.map((val) => {
    return {
      label: val.productName,
      value: val.productName,
    };
  });

  res.status(200).json({
    status: "Success",
    data: dmMenu,
  });
});

export const opticalproductByVendor = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.query.vendorName) {
    filter.vendorName = req.query.vendorName;
  }

  const data = await OpticalProduct.find(filter);

  const dmMenu = data.map((val) => {
    return {
      label: val.productName,
      value: val._id,
    };
  });

  res.status(200).json({
    status: "Success",
    data: dmMenu,
  });
});

export const importOpticalProductsFromExcel = catchAsync(
  async (req, res, next) => {
    if (!req.file) {
      return next(new AppError("No file uploaded!", 400));
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    if (!jsonData.length) {
      return next(new AppError("Excel file is empty!", 400));
    }

    let parsedFrames = JSON.parse(row.frames);



    const productsToInsert = jsonData.map((row) => {
      const stocks = Number(row.stocks || 0);
          let availlableStocksStatus=""
if(req.body.type==="Frame"){
    const frames = row.frameStockandcolors?.frames || [];
    availlableStocksStatus=frames.length>0?"Available":"Sold"
}
else{
 availlableStocksStatus = stocks >= 1 ? "Available" : "Sold";
}
      return {
        vendorName: row.vendorName,
        productName: row.productName,
        brand: row.brand,
        type: row.type,
        status: row.status,
        salesTax1: Number(row.salesTax1) || 0,
        salesTax2: Number(row.salesTax2) || 0,
        hsnCode: row.hsnCode,
        amount: Number(row.amount),
        cost: Number(row.cost),
        barcode: row.barcode,
        stocks: stocks,
        availlableStocksStatus: availlableStocksStatus,
        productType: row.productType,
        productMaterial: row.productMaterial,
        frameStockandcolors: {
          frames: parsedFrames,
        },
      };
    });

    const inserted = await OpticalProduct.insertMany(productsToInsert);
    const vendorCounts = {};
    for (const product of inserted) {
      vendorCounts[product.vendorName] =
        (vendorCounts[product.vendorName] || 0) + 1;
    }
    const vendorUpdates = Object.entries(vendorCounts).map(
      ([vendorName, count]) =>
        OpticalVendor.findOneAndUpdate(
          { vendorName },
          { $inc: { numProducts: count } },
          { new: true }
        )
    );

    await Promise.all(vendorUpdates);

    res.status(200).json({
      status: "Success",
      message: `${inserted.length} products imported successfully.`,
      data: inserted,
    });
  }
);

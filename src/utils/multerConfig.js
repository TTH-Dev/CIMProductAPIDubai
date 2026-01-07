import multer, { MulterError } from "multer";
import AppError from "./AppError.js";

import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer error handler
const throwMulterError = (err, next) => {
  // Handle Multer errors
  if (err instanceof MulterError) {
    return next(new AppError("Error Uploading file", 400));
  }
  // Handle other errors
  return next(new AppError(err.message, 400));
};

const excelstorage = multer.memoryStorage();

export const uploadExcel = multer({ excelstorage });

// Define the storage configuration for disk storage
const storageImage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, "../../public/images"));
  },
  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// Define the file filter function for image validation
const fileFilterImage = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Create the Multer middleware instance
const uploadImageMulter = multer({
  storage: storageImage,
  fileFilter: fileFilterImage,
});

// Define the route handler that uses the Multer middleware
const uploadImage = (req, res, next) => {
  uploadImageMulter.single("image")(req, res, (err) => {
    if (err) throwMulterError(err, next);
    if (!req.file) {
      if (req.method === "PATCH") return next();
      return next(new AppError("Please upload an image", 400));
    }

    // Create a unique filename
    req.file.originalname = uuidv4();
    next();
  });
};





// New Multer middleware instance for handling both image and zip
const uploadImageAndZipMulter = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Determine the destination based on the field name
      if (file.fieldname === "image") {
        cb(null, path.resolve(__dirname, "../../public/images"));
      } else if (file.fieldname === "zip") {
        cb(null, path.resolve(__dirname, "../../public/zips"));
      } else if (file.fieldname === "subimage") {
        cb(null, path.resolve(__dirname, "../../public/subimages"));
      } else {
        // Default to images if no specific handling is provided
        cb(null, path.resolve(__dirname, "../../public/images"));
      }
    },
    filename: (req, file, cb) => {
      // Generate a unique name for the file
      const uniqueName = uuidv4() + path.extname(file.originalname);
      cb(null, uniqueName);
    },
  }),
});

const uploadCustomImage = (req, res, next) => {
  uploadImageAndZipMulter.fields([
    { name: "image", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) throwMulterError(err, next);
    if (!req.files || !req.files.image) {
      if (req.method === "PATCH") return next();
      return next(new AppError("Please upload  an image", 400));
    }

    // Create unique filenames
    if (req.files.image) {
      req.files.image[0].originalname = uuidv4();
    }
    next();
  });
};
// New function to handle image and zip upload
const uploadImageAndZip = (req, res, next) => {
  uploadImageAndZipMulter.fields([
    { name: "image", maxCount: 1 },
    { name: "zip", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) throwMulterError(err, next);
    if (!req.files || !req.files.image || !req.files.zip) {
      if (req.method === "PATCH") return next();
      return next(new AppError("Please upload both an image and a zip file", 400));
    }

    // Create unique filenames
    if (req.files.image) {
      req.files.image[0].originalname = uuidv4();
    }
    if (req.files.zip) {
      req.files.zip[0].originalname = uuidv4();
    }

    next();
  });
};

const uploadImageAndZipOptional = (req, res, next) => {

  uploadImageAndZipMulter.fields([
    // { name: "image", maxCount: 1 },
    { name: "zip", maxCount: 1 },
    { name: "subimage", maxCount: 6 },

  ])(req, res, (err) => {
    if (err) throwMulterError(err, next);
    // if (req.files && req.files.image) {
    //   req.files.image[0].originalname = uuidv4();
    // }
    if (req.files && req.files.zip) {
      req.files.zip[0].originalname = uuidv4();
    }
    next();
  });
};


export const uploadCompanyImages = multer({
  storage: storageImage,
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
}).fields([
   ...Array.from({ length: 5 }).map((_, index) => ({
    name: `attachments[${index}][file]`,
    maxCount: 1
  })),
  {name:"file",maxCount:1},
  {name:"profileImage",maxCount:1},
  {name:"document",maxCount:1},
  { name: 'posteriorSegmentImage', maxCount: 1 },
  { name: 'confrontationImage', maxCount: 1 },
  { name: 'refractionSheet', maxCount: 1 },
  { name: 'lapReportPdf', maxCount: 1 },
  { name: 'prescribePDF', maxCount: 1 },
  { name: 'categoryImage', maxCount: 1 },
  { name: 'signatureDocument', maxCount: 1 },
  { name: 'productVideoImage', maxCount: 1 },
  { name: 'attachments', maxCount: 5 },
  { name: 'heroBanner', maxCount: 1 },
  { name: 'diplopiaCharting', maxCount: 1 },
  { name: 'ourWorks', maxCount: 1 },
  { name: 'checkOurPost', maxCount: 1 },
  { name: 'testimonialVideo', maxCount: 1 },
  { name: 'patientImage', maxCount: 1 },
  { name: 'organizationLogo', maxCount: 1 },
  { name: 'salaryStampSignature', maxCount: 1 },
  { name: 'form16Signature', maxCount: 1 },
  { name: 'surgeonSignatureDocument', maxCount: 1 },
  { name: 'anesthetistsSignatureDocument', maxCount: 1 },
  { name: 'nursingStaffSignatureDocument', maxCount: 1 },
  { name: 'surgeonSignature', maxCount: 1 },
  { name: 'patientSignature', maxCount: 1 },
  { name: 'witnessSignature', maxCount: 1 },
  { name: 'representativeSign', maxCount: 1 },
    { name: 'DoctorSignature', maxCount: 1 },
  { name: 'PatientSignature', maxCount: 1 },
  { name: 'GuardianSignature', maxCount: 1 },
  { name: 'WitnessSignature', maxCount: 1 },
  { name: 'form', maxCount: 1 },
  {name:"attachment",maxCount:1},
  {name:"resignationLetter",maxCount:1},
  {name:"confirmationLetter",maxCount:1},
  {name:"relievingLetter",maxCount:1},
  {name:"expCertificate",maxCount:1},

  ...Array.from({ length: 5 }).map((_, index) => ({
    name: `images[${index}]`,
    maxCount: null,
  }))
]);

const uploadDRImage = (req, res, next) => {
  uploadImageMulter.single("doctorImage")(req, res, (err) => {
    if (err) return throwMulterError(err, next);
    next();
  });
};




const empImageUpload = (req, res, next) => {
  uploadImageMulter.single("image")(req, res, (err) => {
    if (err) return throwMulterError(err, next);
    next();
  });
};

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
    file.mimetype === "application/vnd.ms-excel"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel files are allowed!"), false);
  }
};

export const uploadExcel2 = multer({
  storage: excelstorage,
  fileFilter,
});


const attachmentUpload = (req, res, next) => {
  uploadImageMulter.single("attachments")(req, res, (err) => {
    if (err) return throwMulterError(err, next);
    next();
  });
};



export { uploadImage,attachmentUpload, uploadImageAndZip,empImageUpload, uploadImageAndZipOptional, uploadCustomImage,uploadDRImage,fileFilter };

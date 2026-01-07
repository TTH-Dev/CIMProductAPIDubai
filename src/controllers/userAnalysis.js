import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import UserAnalysis from "../models/userAnaliysis.js";

export const createTest = catchAsync(async (req, res, next) => {
  if (!req.body.organizationId || !req.body.userId) {
    return next(new AppError("OrgId and userId required", 401));
  }

  const data = await UserAnalysis.create(req.body);
  res.status(201).json({
    status: "success",
    message: "Time created successfully",
    data,
  });
});

export const getAllusage = catchAsync(async (req, res, next) => {
  const { orgId, period } = req.query; // period: "daily" | "weekly" | "monthly"

  let matchStage = {
    organizationId: orgId,
  };

  if(req.query.branch){
    matchStage.branch=req.query.branch
  }

  // Adjust date filter based on period
  const now = new Date();
  let startDate = new Date();

  if (period === "daily") {
    startDate.setHours(0, 0, 0, 0); 
  } else if (period === "weekly") {
    startDate.setDate(now.getDate() - 7); 
  } else if (period === "monthly") {
    startDate.setMonth(now.getMonth() - 1); 
  }

  matchStage.createdAt = { $gte: startDate };

 const data = await UserAnalysis.find(matchStage);

const grouped = {};

for (const entry of data) {
  const module = entry.moduleName;

  if (!grouped[module]) grouped[module] = 0;
  grouped[module] += entry.timeSpent;
}

const total = Object.values(grouped).reduce((acc, t) => acc + t, 0);

res.status(200).json({
  success: true,
  data: Object.entries(grouped).map(([module, time]) => ({
    module,
    durationHrs: +(time / 3600).toFixed(2),
    percentage: total > 0 ? Math.round((time / total) * 100) : 0,
  })),
  totalDurationHrs: +(total / 3600).toFixed(2),
});

});

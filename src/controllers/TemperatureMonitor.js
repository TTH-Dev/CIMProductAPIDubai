import express from "express";
import TemperatureMonitor from "../models/TemperatureMonitor.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";


export const createTemperatureMonitor = catchAsync(async (req, res, next) => {
    const temperatureEntry = await TemperatureMonitor.create(req.body);
    res.status(201).json({
        status: "Success",
        data: { temperatureEntry },
    });
});

export const getAllTemperatureMonitors = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    if(!req.query.id){
        return next(new AppError("ORGID not found!"))

    }
    let filter={}

    if(req.query.id){
        filter.organizationId=req.query.id
    }

    
    if(req.query.branch){
        filter.branch=req.query.branch
    }

    const temperatureEntries = await TemperatureMonitor.find(filter)
        .skip(skip)
        .limit(limit);
    
    const totalRecords = await TemperatureMonitor.countDocuments();
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        result: temperatureEntries.length,
        data: { temperatureEntries },
    });
});

export const getTemperatureMonitorById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const temperatureEntry = await TemperatureMonitor.findById(id);

    if (!temperatureEntry) {
        return next(new AppError("Temperature entry not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { temperatureEntry },
    });
});

export const updateTemperatureMonitor = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const updatedEntry = await TemperatureMonitor.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updatedEntry) {
        return next(new AppError("Temperature entry not found", 404));
    }

    res.status(200).json({
        status: "Success",
        data: { updatedEntry },
    });
});

export const deleteTemperatureMonitor = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const deletedEntry = await TemperatureMonitor.findByIdAndDelete(id);

    if (!deletedEntry) {
        return next(new AppError("Temperature entry not found", 404));
    }

    res.status(204).json({
        status: "Success",
        data: null,
    });
});

export const getAllPlaceNames = catchAsync(async (req, res, next) => {
    if(!req.query.id){
        return next(new AppError("ORGID not found!",400))
    }
   let filter={}

    if(req.query.id){
        filter.organizationId=req.query.id
    }

    
    if(req.query.branch){
        filter.branch=req.query.branch
    }
    const places = await TemperatureMonitor.find(filter).distinct("placeName");
    res.status(200).json({
        status: "Success",
        data: { places },
    });
});

export const filterTemperatureMonitor = catchAsync(async (req, res, next) => {
    let filter = {};

   
    if (req.query.date) {
        const date = new Date(req.query.date);
        filter.temperatureMonitorDate = {
            $gte: new Date(date.setHours(0, 0, 0, 0)),
            $lt: new Date(date.setHours(23, 59, 59, 999)),
        };
    }

    if(req.query.id){
        filter.organizationId=req.query.id
    }

       if(req.query.branch){
        filter.branch=req.query.branch
    }

    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const monitors = await TemperatureMonitor.find(filter)
        .skip(skip)
        .limit(limit);

    const totalRecords = await TemperatureMonitor.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json({
        status: "Success",
        totalPages,
        currentPage: page,
        results: monitors.length,
        data: { monitors }
    });
});

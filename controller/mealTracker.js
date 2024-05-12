import index from '../index.js'

import moment from 'moment'

export const sendLocationToServer = async (req,res) => {
    try {

        // Opretter forbindelse til Nominatim API med korrekte headers
        const cityResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${req.body.latitude}&lon=${req.body.longitude}`, {
            method: 'GET',
        });

        if (!cityResponse.ok) {
            // Håndterer fejl, hvis respons fra serveren ikke er "OK"
            throw new Error(`HTTP error! Status: ${cityResponse.status}`);
        }

        const cityData = await cityResponse.json();

        // Udtrækker bynavn fra svaret, eller angiver en fejlmeddelelse hvis ikke fundet
        const cityName = cityData.address?.town || cityData.address?.city || cityData.address?.village || cityData.address?.hamlet || cityData.address?.suburb || "Location not found";
        console.log("City Name:", cityName);
        res.json({ cityName });  // Sender bynavnet som et svar til klienten
    } catch (error) {
        // Logger eventuelle fejl som opstår under udførsel af funktionen
        console.error('Failed to fetch city name:', error);
    }
}

export const addWeightToMeal = async (req, res) => {

    console.log("Back-end received:", req.body.cityName);

    const mealID = req.body.mealID
    const recipeName = req.body.recipeName
    const quantity = req.body.quantity;
    const userID = req.body.userID
    const getCityFromLocation = req.body.cityName

    console.log("Meal ID: ", mealID, "geolokation", req.body.cityName);

    const getMacro = await index.connectedDatabase.getTotalNutriens(mealID)
    const getTotalEnergyKj = (quantity / 100) * getMacro[0].tEnergyKj
    const getTotalProtein = (quantity / 100) * getMacro[0].tProtein
    const getTotalFat = (quantity / 100) * getMacro[0].tFat
    const getTotalFiber = (quantity / 100) * getMacro[0].tFiber
    const getTotalEnergyKcal = (quantity / 100) * getMacro[0].tEnergyKcal
    const getTotalWater = (quantity / 100) * getMacro[0].tWater
    const getTotalDryMatter = (quantity / 100) * getMacro[0].tDryMatter




    const regTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');


    try {


     const mealTracked = await index.connectedDatabase.postIntoDbMealTracker(userID, mealID, quantity, regTime, getCityFromLocation, getTotalEnergyKj, getTotalProtein, getTotalFat, getTotalFiber, getTotalEnergyKcal, getTotalWater, getTotalDryMatter);
        console.log("Meal Created with ID:", mealTracked);

        // Ensure meal ID is valid before proceeding
        if (!mealID) {
            throw new Error("Meal creation failed, no ID returned.");
        }

        // Optionally, you might want to send a response back
        res.json({ success: true, message: `Meal created with ID ${mealID}` });
    } catch (error) {
        console.error("Error in addWeightToMeal:", error);
        // Handle errors more gracefully
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteTrackedMeal = async (req, res) => {
    // console.log("Back-end Modtaget: ",req.body.mealID);
    const userID = req.session.user.userID
    const mealID = req.body.mealID
    console.log("Back-end Modtaget: ", userID, "&", mealID);
    const deleteMeal = await index.connectedDatabase.deleteTrackedMeal(mealID, userID);
}
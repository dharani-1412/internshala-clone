"use client";
import { selectuser } from "@/Feature/Userslice";
import { ExternalLink, Mail, User, MapPin, CloudSun } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { useSelector } from "react-redux";

interface User {
  name: string;
  email: string;
  photo: string;
}

const Index = () => {
  const user = useSelector(selectuser);

  const [location, setLocation] = useState<string>("");
  const [weather, setWeather] = useState<string>("");

  const getLocationAndWeather = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      // 1. Get Location Info using Google Maps Geocoding API
      const geoResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCQa_dCpPkEGcs-yLjWx4ZPGqKvheXCvRg `
      );
      const geoData = await geoResponse.json();
      const addressComponents = geoData.results[0]?.address_components || [];

      let city = "", state = "", country = "";

      addressComponents.forEach((component: any) => {
        if (component.types.includes("locality")) {
          city = component.long_name;
        }
        if (component.types.includes("administrative_area_level_1")) {
          state = component.long_name;
        }
        if (component.types.includes("country")) {
          country = component.long_name;
        }
      });

      setLocation(`Location: ${city}, ${state}, ${country}`);

      // 2. Get Weather using OpenWeatherMap API
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=a0e7008f6aa5ef58930fbb41fb441ed5&units=metric`
      );
      const weatherData = await weatherResponse.json();

      const temp = weatherData.main.temp;
      const condition = weatherData.weather[0].description;

      setWeather(`Weather: ${temp}°C, ${condition.charAt(0).toUpperCase() + condition.slice(1)}`);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              {user?.photo ? (
                <img
                  src={user?.photo}
                  alt={user?.name}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-16 pb-8 px-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
              <div className="mt-2 flex items-center justify-center text-gray-500">
                <Mail className="h-4 w-4 mr-2" />
                <span>{user?.email}</span>
              </div>
            </div>

            {/* Location and Weather */}
            <div className="space-y-2 text-center mb-6">
              {location && (
                <div className="text-gray-700 flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  {location}
                </div>
              )}
              {weather && (
                <div className="text-gray-700 flex items-center justify-center gap-2">
                  <CloudSun className="w-4 h-4 text-yellow-500" />
                  {weather}
                </div>
              )}
              <button
                onClick={getLocationAndWeather}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Obtain Location
              </button>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <span className="text-blue-600 font-semibold text-2xl">0</span>
                  <p className="text-blue-600 text-sm mt-1">Active Applications</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <span className="text-green-600 font-semibold text-2xl">0</span>
                  <p className="text-green-600 text-sm mt-1">Accepted Applications</p>
                </div>
              </div>

              {/* View Applications */}
              <div className="flex justify-center pt-4">
                <Link
                  href="/userapplication"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  View Applications
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

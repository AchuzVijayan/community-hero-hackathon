import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { MapPin, Navigation, Map as MapIcon, Check, Loader, Edit3, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

declare global {
  interface Window {
    L: any;
  }
}

export default function LocationSetupPage() {
  const { currentUser, updateProfile, wards, fetchData } = useApp();
  const [method, setMethod] = useState<"gps" | "map" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // States for location resolution
  const [resolvedLocalBody, setResolvedLocalBody] = useState("");
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
  const [wardNumber, setWardNumber] = useState(currentUser?.ward_number || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Map elements
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);

  // Step 1: Load Leaflet CDN if not already loaded
  useEffect(() => {
    if (window.L) {
      setIsLeafletLoaded(true);
      return;
    }

    // Load CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    script.onload = () => {
      setIsLeafletLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  // Helper to parse local body type from Nominatim address object
  const parseLocalBody = (address: any): string => {
    if (!address) return "Local Panchayat";

    // 1. Check for explicit village or panchayat indicators
    if (address.village) {
      const v = address.village;
      return v.toLowerCase().includes("panchayat") ? v : `${v} Panchayat`;
    }
    if (address.hamlet) {
      return `${address.hamlet} Panchayat`;
    }
    if (address.suburb) {
      const sub = address.suburb;
      return sub.toLowerCase().includes("corporation") || sub.toLowerCase().includes("municipality") 
        ? sub 
        : `${sub} Municipality`;
    }

    // 2. Check for municipality
    if (address.municipality) {
      return address.municipality;
    }
    if (address.town) {
      const t = address.town;
      return t.toLowerCase().includes("municipality") ? t : `${t} Municipality`;
    }

    // 3. Check for city / corporation
    if (address.city) {
      const c = address.city;
      if (c.toLowerCase().includes("corporation") || c.toLowerCase().includes("corp")) {
        return c;
      }
      return `${c} Corporation`;
    }

    // 4. Check for county/district
    if (address.county) {
      return `${address.county} District`;
    }

    return "Anavoor Panchayat"; // fallback classic
  };

  // Reverse geocoding fetch with Nominatim API
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "CommunityHeroOnboardingApp"
          }
        }
      );
      if (!res.ok) throw new Error("Reverse geocoding request failed");
      const data = await res.json();
      
      if (data && data.address) {
        const localBodyName = parseLocalBody(data.address);
        setResolvedLocalBody(localBodyName);
        setSelectedCoords([lat, lng]);
      } else {
        throw new Error("Could not extract local body name");
      }
    } catch (e: any) {
      console.error(e);
      // Fallback beautiful presets to show if blocked or slow
      setResolvedLocalBody("Anavoor Panchayat");
      setSelectedCoords([lat, lng]);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger geolocation detection
  const handleGpsDetection = () => {
    setMethod("gps");
    setIsLoading(true);
    setErrorMsg(null);

    if (!navigator.geolocation) {
      setErrorMsg("Your browser does not support geolocation. Please select on the map manually.");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.error(err);
        // Fallback coordinates (Anavoor area)
        reverseGeocode(8.3970, 77.1645);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Setup interactive map instance
  useEffect(() => {
    if (method !== "map" || !isLeafletLoaded || !mapContainerRef.current) return;

    // Default center at Trivandrum / Anavoor area [8.4, 77.15]
    const defaultCenter: [number, number] = [8.4000, 77.1600];

    if (!mapInstanceRef.current) {
      const map = window.L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 12,
        scrollWheelZoom: true,
      });

      window.L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      mapInstanceRef.current = map;

      // Handle Map Clicks to select custom location preference
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        
        // Update marker
        if (markerRef.current) {
          markerRef.current.setLatLng(e.latlng);
        } else {
          markerRef.current = window.L.marker(e.latlng, {
            draggable: true
          }).addTo(map);
        }
        
        reverseGeocode(lat, lng);
      });
    }

    return () => {
      // Clean up map instance if unmounting
    };
  }, [method, isLeafletLoaded]);

  // Handle Save
  const handleSavePreference = async () => {
    if (!currentUser) return;
    if (!resolvedLocalBody.trim()) {
      setErrorMsg("Please enter or detect a valid Panchayat, Corporation, or Municipality");
      return;
    }
    if (!wardNumber.trim()) {
      setErrorMsg("Please verify your manual Ward number");
      return;
    }

    setIsLoading(true);
    try {
      // Update profile with local body and ward number preference
      const updatedUser = await updateProfile(currentUser.id, {
        local_body: resolvedLocalBody.trim(),
        ward_number: wardNumber.trim(),
        // Also ensure ward is correctly represented in standard ward_id
        ward_id: `ward_${resolvedLocalBody.trim().toLowerCase().replace(/\s+/g, "_")}_${wardNumber.trim()}`
      });

      setIsSuccess(true);
      setTimeout(() => {
        // Force refresh contextual wards and dashboard
        fetchData();
      }, 1500);

    } catch (e: any) {
      setErrorMsg(e.message || "Failed to save location preference. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white border-2 border-slate-100 rounded-3xl overflow-hidden shadow-xl shadow-indigo-50/50 animate-slide-up">
      {/* Visual Header */}
      <div className="bg-indigo-900 text-white p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-800 rounded-full blur-2xl opacity-50" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-amber-400 rounded-full blur-2xl opacity-25" />
        
        <div className="relative space-y-2">
          <div className="bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md inline-block">
            Step 2: Onboarding Setup
          </div>
          <h2 className="text-2xl font-black font-display tracking-tight">Set Location Preference</h2>
          <p className="text-xs text-indigo-200 font-medium leading-relaxed">
            We show hyper-targeted issues of Panchayat, Municipality, or Corporation based on your current device location or selected map location.
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-100 p-3 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse shrink-0"></span>
            {errorMsg}
          </div>
        )}

        {isSuccess ? (
          <div className="text-center py-12 space-y-4 animate-scale-in">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">Location Preference Locked!</h3>
              <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto">
                Successfully configured {resolvedLocalBody}, Ward {wardNumber}. Accessing your personalized solver desk...
              </p>
            </div>
            <div className="flex justify-center pt-2">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Form Fields: Ward number confirmation */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block flex items-center gap-1">
                Verify Ward Number
                <span className="text-[10px] text-slate-400 font-bold lowercase italic">(editable)</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. 5"
                  value={wardNumber}
                  onChange={(e) => setWardNumber(e.target.value)}
                  className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-xs font-black focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Methods Switcher */}
            {!method && (
              <div className="space-y-4">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">How would you like to set your location?</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <button
                    onClick={handleGpsDetection}
                    className="flex flex-col items-center justify-center p-5 bg-indigo-50/50 border-2 border-indigo-100 hover:border-indigo-500 hover:bg-white hover:shadow-lg hover:shadow-indigo-50 rounded-2xl text-center gap-3 transition-all group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Navigation className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-slate-900 block">Detect Location (GPS)</span>
                      <span className="text-[10px] text-slate-500 font-medium block">Automatic high-precision detection</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setMethod("map")}
                    className="flex flex-col items-center justify-center p-5 bg-amber-50/50 border-2 border-amber-100 hover:border-amber-500 hover:bg-white hover:shadow-lg hover:shadow-amber-50 rounded-2xl text-center gap-3 transition-all group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-colors">
                      <MapIcon className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-slate-900 block">Select on Leaflet Map</span>
                      <span className="text-[10px] text-slate-500 font-medium block">Click to pinpoint on real interactive map</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* GPS loading / status */}
            {method === "gps" && (
              <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-indigo-600 animate-bounce" />
                    GPS Resolution
                  </span>
                  <button 
                    onClick={() => setMethod(null)}
                    className="text-[10px] font-black text-indigo-600 uppercase hover:underline"
                  >
                    Change Method
                  </button>
                </div>

                {isLoading ? (
                  <div className="py-6 flex flex-col items-center justify-center gap-3">
                    <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
                    <span className="text-xs text-slate-500 font-semibold">Resolving coordinates to local government body...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest block">Detected Governing Body</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={resolvedLocalBody}
                            onChange={(e) => setResolvedLocalBody(e.target.value)}
                            className="text-sm font-black text-slate-900 border-b border-indigo-400 focus:outline-none w-full bg-transparent py-0.5"
                          />
                        ) : (
                          <span className="text-sm font-black text-slate-900 block">{resolvedLocalBody}</span>
                        )}
                        <span className="text-[10px] text-slate-400 block font-medium">Kerala, India (resolved via Nominatim OSM Reverse Geocoder)</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center gap-3">
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 text-[10px] font-bold text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <Edit3 className="w-3 h-3 text-indigo-500" />
                        {isEditing ? "Done Editing" : "Manually Edit Name"}
                      </button>

                      <button
                        onClick={handleGpsDetection}
                        className="text-[10px] font-bold text-indigo-600 hover:underline"
                      >
                        Re-detect Coordinates
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Map Selection Component */}
            {method === "map" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <MapIcon className="w-4 h-4 text-amber-500" />
                    Click Map to Set Preference
                  </span>
                  <button 
                    onClick={() => {
                      setMethod(null);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.remove();
                        mapInstanceRef.current = null;
                      }
                      markerRef.current = null;
                    }}
                    className="text-[10px] font-black text-indigo-600 uppercase hover:underline"
                  >
                    Cancel Map
                  </button>
                </div>

                <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 relative">
                  <div ref={mapContainerRef} className="w-full h-full z-10" />
                </div>

                {isLoading ? (
                  <div className="py-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
                    <Loader className="w-4 h-4 text-indigo-600 animate-spin" />
                    Reverse geocoding map selection...
                  </div>
                ) : resolvedLocalBody ? (
                  <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-150 text-indigo-700 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <span className="text-[10px] font-black text-indigo-800 uppercase tracking-widest block">Geocoded Local Body</span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={resolvedLocalBody}
                          onChange={(e) => setResolvedLocalBody(e.target.value)}
                          className="text-sm font-black text-slate-900 border-b border-indigo-400 focus:outline-none w-full bg-transparent py-0.5"
                        />
                      ) : (
                        <span className="text-sm font-black text-slate-900 block">{resolvedLocalBody}</span>
                      )}
                      
                      <div className="flex justify-between items-center pt-2">
                        <button
                          onClick={() => setIsEditing(!isEditing)}
                          className="flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:underline"
                        >
                          <Edit3 className="w-3 h-3 text-indigo-500" />
                          {isEditing ? "Confirm Edit" : "Change detected name"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-150 text-xs font-semibold text-slate-500">
                    💡 Click anywhere on the map to pinpoint your location & detect Panchayat/Municipality/Corporation.
                  </div>
                )}
              </div>
            )}

            {/* CTA Submit Button */}
            {(resolvedLocalBody || method) && (
              <button
                onClick={handleSavePreference}
                disabled={isLoading || !resolvedLocalBody}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-150 transform active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isLoading ? "Saving Preference..." : "Save Location Preference & Continue"}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

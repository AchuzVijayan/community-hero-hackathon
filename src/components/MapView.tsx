import React, { useEffect, useRef, useState } from "react";
import { Issue, Ward } from "../types";

interface MapViewProps {
  issues: Issue[];
  wards: Ward[];
  selectedIssueId?: string;
  onSelectIssue?: (issueId: string) => void;
  showHeatmap?: boolean;
  filterCategory?: string;
  filterStatus?: string;
  focusLocation?: [number, number] | null;
}

// Global window reference for Leaflet
declare global {
  interface Window {
    L: any;
  }
}

export default function MapView({
  issues,
  wards,
  selectedIssueId,
  onSelectIssue,
  showHeatmap = false,
  filterCategory = "All",
  filterStatus = "All",
  focusLocation = null,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const polygonsRef = useRef<any[]>([]);
  const circlesRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Define approximate boundaries for Kochi wards to draw beautiful overlays
  const wardBoundaries: Record<string, [number, number][]> = {
    ward_1: [ // Fort Kochi
      [9.972, 76.230], [9.975, 76.245], [9.955, 76.250], [9.952, 76.232]
    ],
    ward_2: [ // Edappally
      [10.035, 76.300], [10.038, 76.325], [10.015, 76.330], [10.012, 76.302]
    ],
    ward_3: [ // Mattancherry
      [9.962, 76.250], [9.965, 76.270], [9.950, 76.275], [9.948, 76.252]
    ],
    ward_4: [ // Vyttila
      [9.975, 76.310], [9.978, 76.330], [9.955, 76.332], [9.952, 76.312]
    ]
  };

  // Step 1: Load Leaflet from CDN dynamically
  useEffect(() => {
    if (window.L) {
      setIsLoaded(true);
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
      setIsLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      // Clean up scripts if required
    };
  }, []);

  // Step 2: Initialize map instance once loaded
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center of Kochi
      const kochiCenter = [9.97, 76.28];
      const map = window.L.map(mapContainerRef.current, {
        center: kochiCenter,
        zoom: 12,
        scrollWheelZoom: true,
      });

      // Add OpenStreetMap tile layer with elegant custom style filters if wanted, or standard clean look
      window.L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      mapInstanceRef.current = map;
    }
  }, [isLoaded]);

  // Step 3: Draw Ward Boundaries and Markers when issues/wards change
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const L = window.L;

    // Clear existing markers, boundaries & circles
    Object.values(markersRef.current).forEach((marker) => map.removeLayer(marker));
    markersRef.current = {};

    polygonsRef.current.forEach((p) => map.removeLayer(p));
    polygonsRef.current = [];

    circlesRef.current.forEach((c) => map.removeLayer(c));
    circlesRef.current = [];

    // Draw Wards
    wards.forEach((ward) => {
      const bounds = wardBoundaries[ward.id];
      if (!bounds) return;

      // Color code by health score
      let scoreColor = "#22c55e"; // Green
      if (ward.health_score < 50) scoreColor = "#ef4444"; // Red
      else if (ward.health_score < 75) scoreColor = "#f97316"; // Orange
      else if (ward.health_score < 90) scoreColor = "#eab308"; // Yellow

      const polygon = L.polygon(bounds, {
        color: scoreColor,
        fillColor: scoreColor,
        fillOpacity: showHeatmap ? 0.05 : 0.15,
        weight: 1.5,
      }).addTo(map);

      polygon.bindTooltip(`<strong>${ward.name}</strong><br/>Health: ${ward.health_score}/100`, {
        permanent: false,
        direction: "center",
      });

      polygonsRef.current.push(polygon);
    });

    // Filter issues based on criteria
    const filteredIssues = issues.filter((issue) => {
      const matchCat = filterCategory === "All" || issue.category === filterCategory;
      const matchStatus = filterStatus === "All" || issue.status === filterStatus;
      return matchCat && matchStatus && !issue.is_duplicate;
    });

    // Draw Heatmap Overlay if toggled
    if (showHeatmap) {
      filteredIssues.forEach((issue) => {
        let intensityColor = "#ef4444"; // high severity
        if (issue.severity < 4) intensityColor = "#22c55e";
        else if (issue.severity < 7) intensityColor = "#eab308";

        // Draw overlapping circles to simulate a rich civic heatmap
        const circle = L.circle([issue.latitude, issue.longitude], {
          color: intensityColor,
          fillColor: intensityColor,
          fillOpacity: 0.4,
          radius: 200 + (issue.severity * 50),
          stroke: false,
        }).addTo(map);

        circlesRef.current.push(circle);
      });
    } else {
      // Draw standard pins
      filteredIssues.forEach((issue) => {
        // Determine pin colors based on severity
        let markerColor = "#ef4444"; // Severe (Red)
        if (issue.severity < 4) markerColor = "#22c55e"; // Mild (Green)
        else if (issue.severity < 7) markerColor = "#f97316"; // Moderate (Orange)

        // Custom Leaflet DivIcon for gorgeous modern look instead of default retro pins
        const customIcon = L.divIcon({
          className: "custom-div-icon",
          html: `<div class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-lg transform transition hover:scale-115 text-white font-bold" style="background-color: ${markerColor}; font-size: 11px;">
            ${issue.severity}
          </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([issue.latitude, issue.longitude], { icon: customIcon }).addTo(map);

        // Customize popup HTML
        const popupContent = `
          <div style="font-family: sans-serif; min-width: 200px;">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${issue.title}</div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">${issue.address}</div>
            <div style="display: flex; gap: 4px; margin-bottom: 8px;">
              <span style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase;">${issue.category}</span>
              <span style="background-color: ${issue.status === 'resolved' ? '#dcfce7' : '#fee2e2'}; color: ${issue.status === 'resolved' ? '#166534' : '#991b1b'}; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase;">${issue.status}</span>
            </div>
            <button id="btn-popup-${issue.id}" style="width: 100%; padding: 6px; border: none; background-color: #2563eb; color: white; border-radius: 4px; font-size: 12px; font-weight: bold; cursor: pointer; transition: background 0.2s;">
              View Full Details
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);

        // Capture popup click
        marker.on("popupopen", () => {
          const button = document.getElementById(`btn-popup-${issue.id}`);
          if (button && onSelectIssue) {
            button.onclick = () => {
              onSelectIssue(issue.id);
              marker.closePopup();
            };
          }
        });

        markersRef.current[issue.id] = marker;
      });
    }

    // Pan and fit bounds to new issues if they exist and no selectedIssueId is active
    if (!selectedIssueId && filteredIssues.length > 0) {
      const validLatLngs = filteredIssues
        .filter(issue => issue.latitude && issue.longitude)
        .map(issue => L.latLng(issue.latitude, issue.longitude));
      
      if (validLatLngs.length > 0) {
        const bounds = L.latLngBounds(validLatLngs);
        map.fitBounds(bounds.pad(0.25));
      }
    }

    // Pan to selected issue if applicable
    if (selectedIssueId && markersRef.current[selectedIssueId]) {
      const marker = markersRef.current[selectedIssueId];
      map.setView(marker.getLatLng(), 15);
      marker.openPopup();
    }

    // Handle focusLocation (user's selected or current location)
    if (focusLocation) {
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
      }

      // Create a gorgeous pulsing blue dot for current user location
      const pulseIcon = L.divIcon({
        className: "user-pulse-icon",
        html: `<div class="relative flex items-center justify-center w-6 h-6">
          <div class="absolute w-6 h-6 bg-blue-500 rounded-full opacity-40 animate-ping"></div>
          <div class="relative w-3.5 h-3.5 bg-blue-600 border-2 border-white rounded-full shadow-md"></div>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      userMarkerRef.current = L.marker(focusLocation, { icon: pulseIcon })
        .addTo(map)
        .bindPopup("<strong>My Selected Location</strong>")
        .openPopup();

      map.setView(focusLocation, 14);
    }

  }, [isLoaded, issues, wards, showHeatmap, filterCategory, filterStatus, selectedIssueId, focusLocation]);

  return (
    <div className="relative w-full h-full bg-slate-100 flex items-center justify-center">
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-slate-600 font-medium">Initializing Hyperlocal Map Engine...</p>
          <p className="text-slate-400 text-xs mt-1">Fetching OpenStreetMap Tiles & Leaflet Layer</p>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" id="map-element" />
    </div>
  );
}

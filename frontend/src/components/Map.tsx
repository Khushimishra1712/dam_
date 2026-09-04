"use client";

import { useEffect, useRef } from "react";

interface MapProps {
  damCoordinates?: [number, number];
  geojsonUrl?: string | null;
}

export default function Map({ damCoordinates = [79.52, 30.48], geojsonUrl }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const maplibreglRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      const ml = await import("maplibre-gl");
      const maplibregl = (ml as any).default || ml;
      maplibreglRef.current = maplibregl;

      if (!isMounted || !mapContainer.current) return;

      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "OpenStreetMap Contributors",
            },
          },
          layers: [
            {
              id: "osm-layer",
              type: "raster",
              source: "osm",
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: damCoordinates,
        zoom: 12,
      });

      map.addControl(new maplibregl.NavigationControl(), "top-right");

      new maplibregl.Marker({ color: "#ef4444" })
        .setLngLat(damCoordinates)
        .addTo(map);

      mapRef.current = map;
    };

    initMap();

    return () => {
      isMounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [damCoordinates]);

  useEffect(() => {
    if (!geojsonUrl) return;

    const renderFloodZone = async () => {
      try {
        const res = await fetch(geojsonUrl);
        const data = await res.json();
        const map = mapRef.current;
        if (!map) return;

        const drawLayers = () => {
          if (!map.isStyleLoaded()) {
            map.once("idle", drawLayers);
            return;
          }

          // Clear previous layers if any
          if (map.getLayer("hazard-flood-line")) map.removeLayer("hazard-flood-line");
          if (map.getLayer("hazard-flood-fill")) map.removeLayer("hazard-flood-fill");
          if (map.getSource("hazard-source")) map.removeSource("hazard-source");

          map.addSource("hazard-source", {
            type: "geojson",
            data: data,
          });

          // 1. Flood Fill
          map.addLayer({
            id: "hazard-flood-fill",
            type: "fill",
            source: "hazard-source",
            paint: {
              "fill-color": "#ef4444",
              "fill-opacity": 0.8,
            },
          });

          // 2. Thick Flood Outline
          map.addLayer({
            id: "hazard-flood-line",
            type: "line",
            source: "hazard-source",
            paint: {
              "line-color": "#b91c1c",
              "line-width": 8,
              "line-opacity": 1.0,
            },
          });

          // Fly directly right on top of the river channel polygon
          map.flyTo({
            center: [79.52, 30.4997],
            zoom: 13.5,
            essential: true,
            duration: 1500,
          });
        };

        drawLayers();
      } catch (err) {
        console.error("Failed to render hazard data:", err);
      }
    };

    renderFloodZone();
  }, [geojsonUrl]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full min-h-[500px] rounded-xl overflow-hidden shadow-lg border border-slate-700"
    />
  );
}
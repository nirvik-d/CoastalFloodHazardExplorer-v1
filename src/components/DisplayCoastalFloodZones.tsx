import "./LayerToggle";
import { useEffect, useRef } from "react";

interface DisplayPlacesProps {
  mapRef?: any;
  layerRef?: any;
}

export function DisplayCoastalFloodZones({
  mapRef,
  layerRef,
}: DisplayPlacesProps) {
  const toggleRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const arcgisMap = mapRef?.current;
    const coastalFloodZonesGraphicsLayer = layerRef?.current;

    if (!arcgisMap || !coastalFloodZonesGraphicsLayer) return;

    // Add layer to map
    arcgisMap.map.add(coastalFloodZonesGraphicsLayer);

    // Handle toggle visibility
    const handleToggle = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { visible } = customEvent.detail;
      coastalFloodZonesGraphicsLayer.visible = visible;
    };

    const toggleEl = toggleRef.current;
    toggleEl?.addEventListener("layer-toggle", handleToggle);

    return () => {
      toggleEl?.removeEventListener("layer-toggle", handleToggle);
    };
  }, [mapRef, layerRef]);

  return (
    <layer-toggle
      ref={toggleRef}
      label="Show Coastal Flood Zones"
      layer-id="coastalFloodZonesGraphicsLayer"
      aria-checked="true"
    />
  );
}

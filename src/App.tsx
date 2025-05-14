import { useRef, useState } from "react";
import "./App.css";
import { AuthenticateEsriAPI } from "./components/Authentication";
import { FetchFeatureLayers } from "./components/FetchLayers";
import "@esri/calcite-components/components/calcite-shell";
import { RenderMap } from "./components/RenderMap";
import { DisplayCoastalFloodZones } from "./components/DisplayCoastalFloodZones";

function App() {
  const mapRef = useRef<any>(null),
    mapViewRef = useRef<any>(null),
    layerRef = useRef<any>(null);
  const [isDrawingComplete, setDrawingComplete] = useState<boolean>(false),
    [isLoadingComplete, setLoadingComplete] = useState<boolean>(false);

  function handleDrawingComplete(complete: boolean) {
    setDrawingComplete(complete);
  }

  function handleLoadingComplete(complete: boolean) {
    setLoadingComplete(complete);
  }

  return (
    <calcite-shell>
      <>
        <AuthenticateEsriAPI />
        {console.log("Authentication complete.")}
        <FetchFeatureLayers
          mapRef={mapRef}
          layerRef={layerRef}
          isLoadingComplete={handleLoadingComplete}
        />
        {console.log("Layer fetching complete.")}
        <RenderMap
          mapType="arcgis/topographic"
          mapCenter={[-117.9988, 33.6595]}
          mapZoom={8}
          mapRef={mapRef}
          mapViewRef={mapViewRef}
          isDrawingComplete={handleDrawingComplete}
        />
        {console.log("Map rendering complete.")}
        {isLoadingComplete && isDrawingComplete && (
          <>
            <DisplayCoastalFloodZones mapRef={mapRef} layerRef={layerRef} />
            {console.log("Coastal flood zones display complete.")}
          </>
        )}
      </>
    </calcite-shell>
  );
}

export default App;

import { useEffect } from "react";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";

interface DisplayFeatureLayersProps {
  mapRef?: any;
  layerRef?: any;
  isLoadingComplete: (complete: boolean) => void;
}

const alreadyExists = new Set<any>();

export function FetchFeatureLayers({
  mapRef,
  layerRef,
  isLoadingComplete,
}: DisplayFeatureLayersProps) {
  useEffect(() => {
    async function loadFeatures() {
      const coastalFloodZonesGraphicsLayer = new GraphicsLayer();

      const beachAccessPoints = new FeatureLayer({
        url: "https://services9.arcgis.com/wwVnNW92ZHUIr0V0/arcgis/rest/services/AccessPoints/FeatureServer/0/",
        outFields: ["*"],
        definitionExpression: `COUNTY IN ('Santa Barbara', 'Ventura', 'Los Angeles', 'Orange', 'San Diego', 'San Luis Obispo', 'Imperial')`,
      });

      const coastalBufferLayer = new FeatureLayer({
        url: "https://services3.arcgis.com/uknczv4rpevve42E/arcgis/rest/services/California_County_Boundaries_and_Identifiers_with_Coastal_Buffers/FeatureServer/1",
        definitionExpression:
          "OFFSHORE IS NOT NULL AND CDTFA_COUNTY in ('Santa Barbara County', 'Ventura County', 'Los Angeles County', 'Orange County', 'San Diego County', 'San Luis Obispo County', 'Imperial County')",
        outFields: ["*"],
      });

      const coastalFloodZonesLayer = new FeatureLayer({
        url: "https://services2.arcgis.com/Uq9r85Potqm3MfRV/arcgis/rest/services/S_FLD_HAZ_AR_Reduced_Set_CA_wm/FeatureServer",
        outFields: ["*"],
      });

      await beachAccessPoints.load();
      await coastalBufferLayer.load();
      await coastalFloodZonesLayer.load();

      const coastalBufferResult = await coastalBufferLayer.queryFeatures();
      if (!coastalBufferResult.features.length) {
        console.error("No coastal buffer found!");
        return;
      }

      const beachAccessResult = await beachAccessPoints.queryFeatures();
      if (!beachAccessResult.features.length) {
        console.error("No beach access found!");
        return;
      }

      for (const coastalBufferFeature of coastalBufferResult.features) {
        const coastalFloodZonesResult =
          await coastalFloodZonesLayer.queryFeatures({
            geometry: coastalBufferFeature.geometry,
            spatialRelationship: "intersects",
            returnGeometry: true,
            outFields: ["*"],
          });

        const coastalFloodZoneFeatures =
          coastalFloodZonesResult.features.filter((feature) => {
            const cityName = feature.attributes.OBJECTID;

            if (alreadyExists.has(cityName)) {
              return false;
            } else {
              alreadyExists.add(cityName);
              return true;
            }
          });

        const coastalFloodZonesGraphics = createPlaceGraphics(
          coastalFloodZoneFeatures
        );
        coastalFloodZonesGraphicsLayer.addMany(coastalFloodZonesGraphics);
      }

      for (const beachAccessFeature of beachAccessResult.features) {
        const coastalFloodZonesResult =
          await coastalFloodZonesLayer.queryFeatures({
            geometry: beachAccessFeature.geometry,
            spatialRelationship: "intersects",
            returnGeometry: true,
            outFields: ["*"],
          });

        const coastalFloodZoneFeatures =
          coastalFloodZonesResult.features.filter((feature) => {
            const cityName = feature.attributes.OBJECTID;

            if (alreadyExists.has(cityName)) {
              return false;
            } else {
              alreadyExists.add(cityName);
              return true;
            }
          });

        const coastalFloodZonesGraphics = createPlaceGraphics(
          coastalFloodZoneFeatures
        );
        coastalFloodZonesGraphicsLayer.addMany(coastalFloodZonesGraphics);
      }

      layerRef.current = coastalFloodZonesGraphicsLayer;
      isLoadingComplete(true);
    }

    loadFeatures();
  }, [mapRef]);

  return null;
}

export function createPlaceGraphics(coastalFloodZoneFeatures: any) {
  return coastalFloodZoneFeatures.map((feature: any) => {
    return new Graphic({
      geometry: feature.geometry,
      attributes: feature.attributes,
      symbol: {
        type: "simple-fill",
        color: [0, 120, 255, 0.5],
        outline: {
          color: [0, 0, 0, 0.6],
          width: 1,
        },
      },
      popupTemplate: {
        title: "{FLD_ZONE}",
        content: `
          <b>Census Place Type:</b> {CENSUS_PLACE_TYPE}<br/>
          <b>County:</b> {CDTFA_COUNTY}
        `,
      },
    });
  });
}

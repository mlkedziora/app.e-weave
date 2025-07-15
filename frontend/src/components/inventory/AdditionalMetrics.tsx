// frontend/src/components/inventory/AdditionalMetrics.tsx
import React from 'react';

type AdditionalMetricsProps = {
  material: any;
  onClose: () => void;
};

export default function AdditionalMetrics({ material, onClose }: AdditionalMetricsProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md max-w-lg w-full space-y-4">
        <h2 className="text-xl font-bold">All Environmental Impact Metrics</h2>
        <div className="grid grid-cols-1 gap-2">
          <p><strong>Climate Change (kg CO₂-eq):</strong> {material.climateChange}</p>
          <p><strong>Ozone Depletion (kg CFC-11-eq):</strong> {material.ozoneDepletion}</p>
          <p><strong>Human Toxicity - Cancer (CTUh):</strong> {material.humanToxicityCancer}</p>
          <p><strong>Human Toxicity - Non-Cancer (CTUh):</strong> {material.humanToxicityNonCancer}</p>
          <p><strong>Particulate Matter (disease incidence):</strong> {material.particulateMatter}</p>
          <p><strong>Ionising Radiation (kBq U-235-eq):</strong> {material.ionisingRadiation}</p>
          <p><strong>Photochemical Ozone Formation (kg NMVOC-eq):</strong> {material.photochemicalOzoneFormation}</p>
          <p><strong>Acidification (mol H+-eq):</strong> {material.acidification}</p>
          <p><strong>Terrestrial Eutrophication (mol N-eq):</strong> {material.terrestrialEutrophication}</p>
          <p><strong>Freshwater Eutrophication (kg P-eq):</strong> {material.freshwaterEutrophication}</p>
          <p><strong>Marine Eutrophication (kg N-eq):</strong> {material.marineEutrophication}</p>
          <p><strong>Freshwater Ecotoxicity (CTUe):</strong> {material.freshwaterEcotoxicity}</p>
          <p><strong>Land Use (species-yr):</strong> {material.landUse}</p>
          <p><strong>Water Scarcity (m³ world-eq):</strong> {material.waterScarcity}</p>
          <p><strong>Mineral Resource Depletion (kg Sb-eq):</strong> {material.mineralResourceDepletion}</p>
          <p><strong>Fossil Resource Depletion (MJ):</strong> {material.fossilResourceDepletion}</p>
        </div>
        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
// frontend/src/components/inventory/AdditionalMetrics.tsx
import React from 'react';
import BlurryOverlayPanel from '../common/BlurryOverlayPanel';
import UnderlinedHeader from '../common/UnderlinedHeader';
import Typography from '../common/Typography';
import StyledLink from '../common/StyledLink';

type AdditionalMetricsProps = {
  material: any;
  onClose: () => void;
};

export default function AdditionalMetrics({ material, onClose }: AdditionalMetricsProps) {
  const headerToContentGap = '4';
  const contentToButtonGap = '12';
  const contentPadding = '5';
  const metricVerticalGap = '4';

  const metrics = [
    { name: 'Climate Change', unit: 'kg CO₂-eq', key: 'climateChange' },
    { name: 'Ozone Depletion', unit: 'kg CFC-11-eq', key: 'ozoneDepletion' },
    { name: 'Human Toxicity - Cancer', unit: 'CTUh', key: 'humanToxicityCancer' },
    { name: 'Human Toxicity - Non-Cancer', unit: 'CTUh', key: 'humanToxicityNonCancer' },
    { name: 'Particulate Matter', unit: 'disease incidence', key: 'particulateMatter' },
    { name: 'Ionising Radiation', unit: 'kBq U-235-eq', key: 'ionisingRadiation' },
    { name: 'Photochemical Ozone Formation', unit: 'kg NMVOC-eq', key: 'photochemicalOzoneFormation' },
    { name: 'Acidification', unit: 'mol H+-eq', key: 'acidification' },
    { name: 'Terrestrial Eutrophication', unit: 'mol N-eq', key: 'terrestrialEutrophication' },
    { name: 'Freshwater Eutrophication', unit: 'kg P-eq', key: 'freshwaterEutrophication' },
    { name: 'Marine Eutrophication', unit: 'kg N-eq', key: 'marineEutrophication' },
    { name: 'Freshwater Ecotoxicity', unit: 'CTUe', key: 'freshwaterEcotoxicity' },
    { name: 'Land Use', unit: 'species-yr', key: 'landUse' },
    { name: 'Water Scarcity', unit: 'm³ world-eq', key: 'waterScarcity' },
    { name: 'Mineral Resource Depletion', unit: 'kg Sb-eq', key: 'mineralResourceDepletion' },
    { name: 'Fossil Resource Depletion', unit: 'MJ', key: 'fossilResourceDepletion' },
  ];

  return (
    <BlurryOverlayPanel draggable={true} onClose={onClose}>
      <UnderlinedHeader title="ALL ENVIRONMENTAL IMPACT METRICS" />
      <div
        className={`mt-${headerToContentGap} mb-${contentToButtonGap}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={`px-${contentPadding} py-0 space-y-${metricVerticalGap}`}>
          {metrics.map((metric) => (
            <div key={metric.key} className="flex justify-between">
              <Typography variant="13" className="text-black text-left font-normal">
                {metric.name} ({metric.unit})
              </Typography>
              <Typography variant="13" className="text-black text-right font-normal">
                {material[metric.key]}
              </Typography>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center" onMouseDown={(e) => e.stopPropagation()}>
        <StyledLink onClick={onClose} className="text-black">
          <Typography variant="15" className="text-black">CLOSE</Typography>
        </StyledLink>
      </div>
    </BlurryOverlayPanel>
  );
}
// frontend/src/components/inventory/TrackQuantityHistory.tsx
import React, { useState } from 'react';
import BlurryOverlayPanel from '../common/BlurryOverlayPanel';
import UnderlinedHeader from '../common/UnderlinedHeader';
import StyledLink from '../common/StyledLink';
import Typography from '../common/Typography';
import ActionButtonsRow from '../common/ActionButtonsRow';
import UpdateQuantityModal from './UpdateQuantityModal';
import AddQuantityModal from './AddQuantityModal';

interface HistoryEntry {
  teamMember?: { name: string };
  task?: { name: string; project?: { name: string } };
  previousLength: number;
  newLength: number;
  changedAt: string;
}

interface TrackQuantityHistoryProps {
  material: {
    id: string;
    name: string;
    length: number;
    history: HistoryEntry[];
  };
  onClose: () => void;
  onRefresh: (newLength?: number) => void;
}

export default function TrackQuantityHistory({ material, onClose, onRefresh }: TrackQuantityHistoryProps) {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAddQuantityModal, setShowAddQuantityModal] = useState(false);

  const tablePadding = 'p-2.5';

  return (
    <BlurryOverlayPanel draggable={true} onClose={onClose}>
      <UnderlinedHeader title="TRACK QUANTITY HISTORY" />
      <div className="border border-black rounded-lg overflow-hidden mb-6" onMouseDown={(e) => e.stopPropagation()}>
        {Array.isArray(material.history) && material.history.length > 0 ? (
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr>
                <th className={`${tablePadding} text-center border-b border-r last:border-r-0 text-black font-normal`}>USER</th>
                <th className={`${tablePadding} text-center border-b border-r last:border-r-0 text-black font-normal`}>PROJECT</th>
                <th className={`${tablePadding} text-center border-b border-r last:border-r-0 text-black font-normal`}>TASK</th>
                <th className={`${tablePadding} text-center border-b border-r last:border-r-0 text-black font-normal`}>PREVIOUS</th>
                <th className={`${tablePadding} text-center border-b border-r last:border-r-0 text-black font-normal`}>NEW</th>
                <th className={`${tablePadding} text-center border-b border-r last:border-r-0 text-black font-normal`}>TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              {material.history.map((entry: any) => (
                <tr key={entry.id}>
                  <td className={`${tablePadding} text-center border-t border-r last:border-r-0 text-black font-normal`}>{entry.teamMember?.name || 'Unknown'}</td>
                  <td className={`${tablePadding} text-center border-t border-r last:border-r-0 text-black font-normal`}>{entry.task?.project?.name || 'N/A'}</td>
                  <td className={`${tablePadding} text-center border-t border-r last:border-r-0 text-black font-normal`}>{entry.task?.name || 'N/A'}</td>
                  <td className={`${tablePadding} text-center border-t border-r last:border-r-0 text-black font-normal`}>{entry.previousLength} m</td>
                  <td className={`${tablePadding} text-center border-t border-r last:border-r-0 text-black font-normal`}>{entry.newLength} m</td>
                  <td className={`${tablePadding} text-center border-t border-r last:border-r-0 text-black font-normal`}>{new Date(entry.changedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={`${tablePadding} bg-white text-center`}>
            <Typography variant="13" className="text-black italic">No quantity history available.</Typography>
          </div>
        )}
      </div>
      <ActionButtonsRow onMouseDown={(e) => e.stopPropagation()}>
        <StyledLink onClick={() => setShowUpdateModal(true)} className="text-black">
          <Typography variant="15" className="text-black">UPDATE QUANTITY</Typography>
        </StyledLink>
        <StyledLink onClick={() => setShowAddQuantityModal(true)} className="text-black">
          <Typography variant="15" className="text-black">ADD QUANTITY</Typography>
        </StyledLink>
      </ActionButtonsRow>
      <div className="flex justify-center mt-6" onMouseDown={(e) => e.stopPropagation()}>
        <StyledLink onClick={onClose} className="text-black">
          <Typography variant="15" className="text-black">QUIT</Typography>
        </StyledLink>
      </div>

      {showUpdateModal && (
        <UpdateQuantityModal
          materialId={material.id}
          currentLength={material.length}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={(newLength) => {
            setShowUpdateModal(false);
            onRefresh(newLength);
          }}
        />
      )}
      {showAddQuantityModal && (
        <AddQuantityModal
          materialId={material.id}
          currentLength={material.length}
          onClose={() => setShowAddQuantityModal(false)}
          onSuccess={(newLength) => {
            setShowAddQuantityModal(false);
            onRefresh(newLength);
          }}
        />
      )}
    </BlurryOverlayPanel>
  );
}
// frontend/src/components/common/RecentNotesTable.tsx
import React from 'react';
import Typography from './Typography';
import StyledLink from './StyledLink';
import ActionButtonsRow from './ActionButtonsRow';

interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  teamMember?: { name: string; userId: string };
}

interface RecentNotesTableProps {
  notes: Note[];
  currentUserId: string | undefined;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onShowAll: () => void;
  onAdd: () => void;
}

const TIMESTAMP_PADDING_RIGHT = '4'; // Adjust this const to set the padding from the right border for the timestamp
const NOTE_PADDING_LEFT = '4'; // Adjust this const to set the gap space from the left border for the note
const TABLE_PADDING = 'p-2.5'; // Matches the tablePadding from MaterialDetail for consistency

export default function RecentNotesTable({
  notes,
  currentUserId,
  onEdit,
  onDelete,
  onShowAll,
  onAdd,
}: RecentNotesTableProps) {
  const sortedNotes = [...notes].sort((a, b) =>
    new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
  );
  const recentNotes = sortedNotes.slice(0, 3);

  return (
    <>
      <div className="border border-black rounded-lg overflow-hidden mb-6">
        {recentNotes.length > 0 ? (
          <table className="w-full border-collapse bg-white">
            <tbody>
              {recentNotes.map((note, index) => (
                <React.Fragment key={note.id}>
                  <tr>
                    <td
                      className={`w-1/4 text-center border-b border-r ${TABLE_PADDING} ${
                        index > 0 ? 'border-t' : ''
                      } text-black font-normal`}
                    >
                      {note.teamMember?.name || 'Unknown'}
                    </td>
                    <td
                      className={`w-3/4 text-right border-b ${TABLE_PADDING} ${
                        index > 0 ? 'border-t' : ''
                      } pr-${TIMESTAMP_PADDING_RIGHT} text-black font-normal`}
                    >
                      {new Date(note.updatedAt || note.createdAt).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className={`${TABLE_PADDING}`}>
                      <div className="flex items-center justify-between">
                        <div className={`flex-1 truncate pr-4 pl-${NOTE_PADDING_LEFT}`}>
                          <Typography variant="15" className="text-black">
                            {note.content}
                          </Typography>
                        </div>
                        {note.teamMember?.userId === currentUserId && (
                          <div className="flex gap-4 whitespace-nowrap">
                            <StyledLink
                              onClick={() => onEdit(note)}
                              className="text-black"
                            >
                              <Typography variant="13" className="text-black">EDIT</Typography>
                            </StyledLink>
                            <StyledLink
                              onClick={() => onDelete(note.id)}
                              className="text-black"
                            >
                              <Typography variant="13" className="text-black">DELETE</Typography>
                            </StyledLink>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={`${TABLE_PADDING} bg-white text-center`}>
            <Typography variant="13" className="text-black italic">
              No recent notes available.
            </Typography>
          </div>
        )}
      </div>
      <ActionButtonsRow>
        <StyledLink onClick={onShowAll} className="text-black">
          <Typography variant="15" className="text-black">
            EXPAND HISTORY
          </Typography>
        </StyledLink>
        <StyledLink onClick={onAdd} className="text-black">
          <Typography variant="15" className="text-black">
            ADD NOTE
          </Typography>
        </StyledLink>
      </ActionButtonsRow>
    </>
  );
}
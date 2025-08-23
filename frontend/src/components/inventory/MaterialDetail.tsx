// frontend/src/components/inventory/MaterialDetail.tsx
import React, { useState, useEffect } from 'react'
import TrackQuantityHistory from './TrackQuantityHistory'
import UpdateQuantityModal from './UpdateQuantityModal'
import AdditionalMetrics from './AdditionalMetrics'
import EditNoteModal from './EditNoteModal'
import AddNoteModal from './AddNoteModal'
import AllNotesModal from './AllNotesModal'
import AddQuantityModal from './AddQuantityModal'
import AddProject from './AddProject' // ✅ Added import
import { useUser, useAuth } from '@clerk/clerk-react'
import ScrollablePanel from '../common/ScrollablePanel' // ✅ Use for panel + scroll
import EmptyPanel from '../common/EmptyPanel' // ✅ Use for no-material state
import Typography from '../common/Typography'
import StyledLink from '../common/StyledLink'
import UnderlinedHeader from '../common/UnderlinedHeader'
import BlurryOverlayPanel from '../common/BlurryOverlayPanel'
import ActionButtonsRow from '../common/ActionButtonsRow'

interface HistoryEntry {
  teamMember?: { name: string };
  task?: { name: string; project?: { name: string } };
  previousLength: number;
  newLength: number;
  changedAt: string;
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  teamMember?: { name: string; userId: string };
}

type MaterialDetailProps = {
  material: {
    id: string;
    name: string;
    length: number;
    fiber: string;
    supplier: string;
    pricePerMeter: number;
    certifications?: string;
    history: HistoryEntry[];
    materialNotes: Note[];
    assignedTo?: { project: { id: string; name: string } }[]; // For projects
  };
  onRefresh: (newLength?: number) => void
}

const ProjectTasksView = ({ project, onClose }: { project: any; onClose: () => void }) => {
  const [tasks, setTasks] = useState<any[]>([])
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const { getToken } = useAuth()

  useEffect(() => {
    const fetchProjectTasks = async () => {
      try {
        const token = await getToken({ template: 'backend-access' })
        const res = await fetch(`/api/projects/${project.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setTasks(data.tasks || [])
        }
      } catch (err) {
        console.error('Failed to fetch project tasks:', err)
      }
    }
    fetchProjectTasks()
  }, [project.id, getToken])

  const toggleSubtasks = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId)
  }

  return (
    <BlurryOverlayPanel onClose={onClose}>
      <UnderlinedHeader title={project.name.toUpperCase()} />
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="border p-4 rounded bg-gray-50 space-y-2">
            <StyledLink onClick={() => toggleSubtasks(task.id)} className="text-black">
              {task.name}
            </StyledLink>
            <Typography variant="13" className="text-black">
              Assigned to: {task.assignees?.map((a: any) => a.teamMember.name).join(', ') || 'Unassigned'}
            </Typography>
            <Typography variant="13" className="text-black">
              Start: {task.startedAt ? new Date(task.startedAt).toLocaleDateString() : 'N/A'}
            </Typography>
            <Typography variant="13" className="text-black">
              Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
            </Typography>
            {expandedTaskId === task.id && (
              <div className="mt-2 space-y-2">
                <Typography variant="13" weight="light" className="text-black">Top 5 Subtasks:</Typography>
                {task.subtasks
                  ?.sort((a: any, b: any) => a.completed - b.completed || a.name.localeCompare(b.name))
                  .slice(0, 5)
                  .map((sub: any, idx: number) => (
                    <Typography key={idx} variant="13" className="text-black">
                      {sub.name} {sub.completed ? '(Completed)' : ''}
                    </Typography>
                  )) || <Typography variant="13" className="text-black italic">No subtasks</Typography>}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-6">
        <StyledLink onClick={onClose} className="text-black">
          <Typography variant="15" className="text-black">QUIT</Typography>
        </StyledLink>
      </div>
    </BlurryOverlayPanel>
  )
}

export default function MaterialDetail({ material, onRefresh }: MaterialDetailProps) {
  const [showFullHistory, setShowFullHistory] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showAddQuantityModal, setShowAddQuantityModal] = useState(false)
  const [showAdditionalMetrics, setShowAdditionalMetrics] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAllNotes, setShowAllNotes] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [showAllAssigned, setShowAllAssigned] = useState(false)
  const [showAddProject, setShowAddProject] = useState(false) // ✅ Added state for AddProject

  const { user: currentUser } = useUser()
  const { getToken } = useAuth()

  const refreshNotes = () => {
    onRefresh()
  }

  if (!material) {
    return <EmptyPanel>Select a material to view details.</EmptyPanel> // ✅ Use reusable
  }

  const assignedProjects = material.assignedTo?.map(pm => pm.project) || [];
  const sortedAssignedProjects = assignedProjects.sort((a, b) => a.name.localeCompare(b.name));
  const visibleProjects = showAllAssigned ? sortedAssignedProjects : sortedAssignedProjects.slice(0, 10);
  const half = Math.ceil(visibleProjects.length / 2);
  const leftProjects = visibleProjects.slice(0, half);
  const rightProjects = visibleProjects.slice(half);

  const tablePadding = 'p-2.5'

  return (
    <ScrollablePanel className="space-y-12"> {/* ✅ Increased spacing for airiness */}
      {/* FABRIC DETAILS */}
      <div>
        <UnderlinedHeader title="FABRIC DETAILS" />
        <div className="flex gap-8"> {/* ✅ Increased gap for airiness */}
          <img
            src="/fabric.jpg"
            alt="Fabric"
            className="w-48 h-48 object-cover rounded"
          />
          <div className="space-y-4"> {/* ✅ Increased to space-y-4 for airiness */}
            <Typography variant="15" className="text-black">Product Name: {material.name}</Typography>
            <Typography variant="15" className="text-black">ID: {material.id}</Typography>
            <Typography variant="15" className="text-black">Quantity Available: {material.length} m</Typography>
            <Typography variant="15" className="text-black">Composition: {material.fiber}</Typography>
            <Typography variant="15" className="text-black">Supplier: {material.supplier}</Typography>
            <Typography variant="15" className="text-black">Price: ${material.pricePerMeter}</Typography>
            <Typography variant="15" className="text-black">Certifications: {material.certifications || '—'}</Typography>
          </div>
        </div>
      </div>

      {/* ASSIGNED PROJECTS */}
      <div>
        <UnderlinedHeader title="ASSIGNED PROJECTS" />
        {assignedProjects.length > 0 ? (
          <div className="flex gap-4 mb-6">
            <div className="flex flex-col space-y-4 flex-1">
              {leftProjects.map((proj) => (
                <div 
                  key={proj.id} 
                  className="flex items-center cursor-pointer"
                  onClick={() => setSelectedProject(proj)}
                >
                  <div className="w-4 h-4 border border-black rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    {/* No completion status for projects, so empty */}
                  </div>
                  <div>
                    <Typography variant="15" className="text-black">{proj.name}</Typography>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col space-y-4 flex-1">
              {rightProjects.map((proj) => (
                <div 
                  key={proj.id} 
                  className="flex items-center cursor-pointer"
                  onClick={() => setSelectedProject(proj)}
                >
                  <div className="w-4 h-4 border border-black rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    {/* No completion status for projects, so empty */}
                  </div>
                  <div>
                    <Typography variant="15" className="text-black">{proj.name}</Typography>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Typography variant="13" className="text-black italic mb-6">No assigned projects.</Typography>
        )}
        <ActionButtonsRow>
          <StyledLink onClick={() => setShowAddProject(true)} className="text-black"> {/* ✅ Updated onClick */}
            <Typography variant="15" className="text-black">ADD PROJECT</Typography>
          </StyledLink>
          <StyledLink onClick={() => setShowAllAssigned(!showAllAssigned)} className="text-black">
            <Typography variant="15" className="text-black">
              {showAllAssigned ? 'HIDE HISTORY' : 'EXPAND HISTORY'}
            </Typography>
          </StyledLink>
        </ActionButtonsRow>
      </div>

      {/* TRACK QUANTITY */}
      <div>
        <UnderlinedHeader title="TRACK QUANTITY" />
        <div className="border border-black rounded-lg overflow-hidden mb-6">
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
                {material.history.slice(0, 6).map((entry: any) => (
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
        <ActionButtonsRow>
          <StyledLink onClick={() => setShowUpdateModal(true)} className="text-black">
            <Typography variant="15" className="text-black">UPDATE QUANTITY</Typography>
          </StyledLink>
          <StyledLink onClick={() => setShowFullHistory(true)} className="text-black">
            <Typography variant="15" className="text-black">EXPAND HISTORY</Typography>
          </StyledLink>
        </ActionButtonsRow>
        <div className="flex justify-center mt-4">
          <StyledLink onClick={() => setShowAddQuantityModal(true)} className="text-black">
            <Typography variant="15" className="text-black">ADD QUANTITY</Typography>
          </StyledLink>
        </div>

        {showFullHistory && (
          <TrackQuantityHistory
            material={material}
            onClose={() => setShowFullHistory(false)}
            onRefresh={onRefresh}
          />
        )}

        {showUpdateModal && (
          <UpdateQuantityModal
            materialId={material.id}
            currentLength={material.length}
            onClose={() => setShowUpdateModal(false)}
            onSuccess={(newLength) => {
              console.log('[MaterialDetail] onSuccess triggered');
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
      </div>

      {/* ENVIRONMENTAL IMPACT */}
      <div>
        <UnderlinedHeader title="ENVIRONMENTAL IMPACT" />
        <Typography variant="13" className="text-black mb-4">Prototype – Based on PEFCR Guidelines</Typography>
        <div className="grid grid-cols-2 gap-6"> {/* ✅ Increased gap */}
          <Typography variant="15" className="text-black">CO₂ eq (kg): {material.climateChange}</Typography>
          <Typography variant="15" className="text-black">Fossil Energy (MJ): {material.fossilResourceDepletion}</Typography>
          <Typography variant="15" className="text-black">Water (m³): {material.waterScarcity}</Typography>
          <Typography variant="15" className="text-black">Freshwater P eq (kg): {material.freshwaterEutrophication}</Typography>
        </div>
        <StyledLink onClick={() => setShowAdditionalMetrics(true)} className="mt-4 text-black block">
          Additional Metrics +
        </StyledLink>

        {showAdditionalMetrics && (
          <AdditionalMetrics material={material} onClose={() => setShowAdditionalMetrics(false)} />
        )}
      </div>

      {/* TRANSPORT */}
      <div>
        <UnderlinedHeader title="TRANSPORT" />
        <Typography variant="13" className="text-black mb-2">Prototype – Based on User Input</Typography>
        <img
          src="/map.png"
          alt="Transport Map"
          className="w-full max-w-md rounded mb-4" 
        />
        <Typography variant="13" className="text-black">
          The transportation of this fabric to your studio used an estimated amount of resources based on fastest available transport information.
        </Typography>
      </div>

      {/* RECENT NOTES */}
      <div>
        <UnderlinedHeader title="RECENT NOTES" />
        <Typography variant="13" className="text-black mb-4">Quantity Available: {material.length} m</Typography>
        <div className="space-y-4"> {/* ✅ Increased spacing */}
          {material.materialNotes?.slice(0, 3).map((note: any, i: number) => (
            <div key={i} className="border p-4 rounded bg-gray-50 space-y-2"> {/* ✅ Increased padding */}
              <Typography variant="13" className="text-black">
                {note.teamMember?.name || 'Unknown'} – {new Date(note.updatedAt || note.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="15" className="text-black">{note.content}</Typography>
              {note.teamMember?.userId === currentUser?.id && (
                <div className="mt-1 flex gap-4"> {/* ✅ Increased mt and gap */}
                  <StyledLink
                    onClick={() => {
                      setSelectedNote(note);
                      setShowEditModal(true);
                    }}
                    className="text-black text-[13px]"
                  >
                    Edit
                  </StyledLink>
                  <StyledLink
                    onClick={async () => {
                      if (confirm('Delete this note?')) {
                        try {
                          const token = await getToken({ template: 'backend-access' });
                          const res = await fetch(`/materials/notes/${note.id}`, {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          if (!res.ok) {
                            const errorBody = await res.json();
                            console.error(`[DeleteNote] Failed: Status ${res.status}, Body:`, errorBody);
                            alert('Failed to delete');
                          } else {
                            console.log('[DeleteNote] Success');
                            refreshNotes();
                          }
                        } catch (err) {
                          console.error('[DeleteNote] Error:', err);
                          alert('Error deleting');
                        }
                      }
                    }}
                    className="text-black text-[13px]"
                  >
                    Delete
                  </StyledLink>
                </div>
              )}
            </div>
          ))}
        </div>
        <StyledLink onClick={() => setShowAllNotes(true)} className="mt-4 text-black block">
          Expand History
        </StyledLink>
        <StyledLink onClick={() => setShowAddModal(true)} className="mt-4 ml-0 text-black block">
          Add Note
        </StyledLink>

        {showEditModal && selectedNote && (
          <EditNoteModal note={selectedNote} onClose={() => setShowEditModal(false)} onSuccess={() => { setShowEditModal(false); refreshNotes(); }} />
        )}

        {showAddModal && (
          <AddNoteModal materialId={material.id} onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); refreshNotes(); }} />
        )}

        {showAllNotes && (
          <AllNotesModal notes={material.materialNotes} onClose={() => setShowAllNotes(false)} />
        )}
      </div>

      {selectedProject && (
        <ProjectTasksView project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}

      {showAddProject && ( // ✅ Added conditional render
        <AddProject
          material={material}
          onClose={() => setShowAddProject(false)}
          onAdded={() => {
            setShowAddProject(false);
            onRefresh();
          }}
        />
      )}
    </ScrollablePanel>
  )
}
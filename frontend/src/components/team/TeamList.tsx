// frontend/src/components/team/TeamList.tsx
import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import ScrollableContainer from '../common/ScrollableContainer'
import Typography from '../common/Typography'

export default function TeamList({
  onMemberClick,
}: {
  onMemberClick: (member: any) => void
}) {
  const [members, setMembers] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const token = await getToken({ template: 'backend-access' })
        const res = await fetch('http://localhost:3000/members', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`)
        }
        const data = await res.json()
        if (!Array.isArray(data)) {
          throw new Error('Expected array but received invalid data')
        }
        setMembers(data)
      } catch (err) {
        console.error('Error fetching members:', err)
        setError('Failed to load team members. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadMembers()
  }, [getToken])

  if (loading) return <div className="h-full flex items-center justify-center text-black">Loading team members...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>
  if (members.length === 0) return <div className="h-full flex items-center justify-center text-black">No team members found.</div>

  return (
    <ScrollableContainer className="space-y-4">
      <div className="bg-white p-4 rounded-lg [--progress-bar-height:0.4rem] [--progress-fill-height:0.2rem] [--progress-bar-width:100%] [--progress-bg-color:#d4d4d4] [--progress-fill-color:#D7FAEA] [--progress-padding:0.155rem] mb-6 h-[calc(100%-1.5rem)]"> {/* Adjusted: only mb-6 (bottom margin, e.g., mb-4 for smaller, mb-8 for larger) to your sweet spot; no mr- here; update the h calc accordingly (e.g., for mb-4 use h-[calc(100%-1rem)]) */}
        {/* CSS Variables Defined Here:
           --progress-bar-height: Sets outer (grey) bar height (default 0.5rem/8px, 'normal' size, matches h-2)
           --progress-fill-height: Sets inner (turquoise) bar height (default 0.25rem/4px, half of outer)
           --progress-bar-width: Sets bar width (default 100% to span card; options: 80%, 50%, 400px, etc.)
           --progress-bg-color: Sets outer bar background color (default #E0E0E0/gray-200; options: #F0F0F0, #CCCCCC, #D3D3D3)
           --progress-fill-color: Sets inner bar color (default #40E0D0/turquoise; options: #14b8a6/teal-500, #06b6d4/cyan-500, #22c55e/green-500)
           --progress-padding: Sets horizontal padding for the inner fill (default 0.25rem/4px; options: 0.125rem/2px thinner, 0.5rem/8px wider, 0 for no padding)
        */}
        {members.map((member) => {
          const progress = member.currentTask?.progress ?? 0
          return (
            <div
              key={member.userId}
              className="cursor-pointer hover:bg-gray-50 p-3"
              onClick={() => onMemberClick(member)}
            >
              <div className="flex items-center space-x-4"> {/* Structured like MaterialList */}
                <img
                  src="/profile-icon.jpg"
                  alt="Profile"
                  className="w-[75px] h-[75px] rounded-full object-cover"
                />
                <div className="space-y-1">
                  <Typography variant="17" weight="regular" className="text-black">{member.name} — {member.role}</Typography>
                  <Typography variant="13" weight="regular" className="text-black">TASK PROGRESS: {progress}%</Typography>
                </div>
              </div>
              <div className="mt-2" style={{ width: 'var(--progress-bar-width)' }}> {/* Uses --progress-bar-width for bar width */}
                <div 
                  className="overflow-hidden bg-[var(--progress-bg-color)] rounded" 
                  style={{ height: 'var(--progress-bar-height)' }} 
                > {/* overflow-hidden to clip inner rounded corners if they protrude; Uses --progress-bg-color for grey bg, --progress-bar-height for outer height */}
                  <div
                    className="bg-[var(--progress-fill-color)] rounded" // Uses --progress-fill-color for turquoise fill; rounded for corners
                    style={{ 
                      width: `max(0px, calc(${progress}% - 2 * var(--progress-padding)))`, // Adjusted width to account for padding, max to avoid negative
                      height: 'var(--progress-fill-height)', // Uses --progress-fill-height for inner bar height
                      marginLeft: 'var(--progress-padding)', // Left padding inset
                      marginTop: 'calc((var(--progress-bar-height) - var(--progress-fill-height)) / 2)' // Centers vertically
                    }} 
                  ></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollableContainer>
  )
}
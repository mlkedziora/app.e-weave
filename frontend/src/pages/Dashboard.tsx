import TeamProgress from '@/components/dashboard/TeamProgress'
import MostUsedMaterials from '@/components/dashboard/MostUsedMaterials'
import UpcomingDeadlines from '@/components/dashboard/UpcomingDeadlines'

export default function Dashboard() {
  return (
    <div className="p-6 space-y-10">
      <TeamProgress />
      <MostUsedMaterials />
      <UpcomingDeadlines />
    </div>
  )
}

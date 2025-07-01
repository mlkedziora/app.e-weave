import { useSeedUserData } from '../hooks/useSeedUserData'

export default function Dashboard() {
  useSeedUserData()

  return (
    <div className="space-y-6">
      {/* 👋 Welcome Section */}
      <section>
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-gray-600">Here’s what’s happening today:</p>
      </section>

      {/* 📊 Team Progress */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Team Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Replace with real components later */}
          <div className="bg-white shadow p-4 rounded">🧑‍🤝‍🧑 Member A — 70%</div>
          <div className="bg-white shadow p-4 rounded">🧑‍🤝‍🧑 Member B — 45%</div>
          <div className="bg-white shadow p-4 rounded">🧑‍🤝‍🧑 Member C — 95%</div>
        </div>
      </section>

      {/* 🧵 Most Used Materials */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Most Used Materials</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Fabric A – Cotton – 18m used</li>
          <li>Fabric B – Wool – 15m used</li>
          <li>Fabric C – Polyester – 12m used</li>
        </ul>
      </section>

      {/* 🕒 Nearest Deadline */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Nearest Project Deadline</h2>
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded flex items-center justify-between">
          <div>
            <strong>Project Alpha</strong>
            <p className="text-sm">Due: July 2, 2025</p>
          </div>
          <div>
            {/* Replace with real pie chart component */}
            <div className="w-16 h-16 rounded-full bg-yellow-300 flex items-center justify-center">
              80%
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

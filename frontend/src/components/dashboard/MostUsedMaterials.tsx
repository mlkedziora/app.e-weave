import { useEffect, useState } from 'react'

type MaterialUsage = {
  name: string
  category: string
  quantityUsed: number
}

export default function MostUsedMaterials() {
  const [topMaterials, setTopMaterials] = useState<MaterialUsage[]>([])

  useEffect(() => {
    fetch('http://localhost:3000/members')
      .then(res => res.json())
      .then(members => {
        const usageMap: Record<string, MaterialUsage> = {}

        members.forEach((m: any) => {
          m.materialHistories.forEach((entry: any) => {
            const mat = entry.material
            const key = mat.name

            if (!usageMap[key]) {
              usageMap[key] = {
                name: mat.name,
                category: mat.fiber ?? 'Unknown',
                quantityUsed: 0,
              }
            }

            usageMap[key].quantityUsed += Math.abs(entry.deltaQuantity)
          })
        })

        const sorted = Object.values(usageMap).sort((a, b) => b.quantityUsed - a.quantityUsed)
        setTopMaterials(sorted.slice(0, 5))
      })
      .catch(console.error)
  }, [])

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">📦 Most Used Materials</h2>
      <ul className="space-y-2 text-gray-800">
        {topMaterials.map((mat, index) => (
          <li key={index}>
            {mat.name} – <span className="italic">{mat.category}</span> – <strong>{mat.quantityUsed} used</strong>
          </li>
        ))}
      </ul>
    </section>
  )
}

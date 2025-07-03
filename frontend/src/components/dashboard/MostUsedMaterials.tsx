// MostUsedMaterials.tsx
type Material = {
  name: string
  category: string
  quantityUsed: string
}

const dummyMaterials: Material[] = [
  { name: 'Cotton Twill', category: 'Fabrics', quantityUsed: '28m' },
  { name: 'Metal Zipper', category: 'Trims', quantityUsed: '14pcs' },
  { name: 'Nylon Thread', category: 'Trims', quantityUsed: '5 rolls' }
]

export default function MostUsedMaterials() {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">📦 Most Used Materials</h2>
      <ul className="space-y-2 text-gray-800">
        {dummyMaterials.map((material, index) => (
          <li key={index}>
            {material.name} – <span className="italic">{material.category}</span> – <strong>{material.quantityUsed}</strong>
          </li>
        ))}
      </ul>
    </section>
  )
}

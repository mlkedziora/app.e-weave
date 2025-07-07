type Props = {
  materials: any[]
  onMaterialClick: (id: string) => void
}

export default function MaterialList({ materials, onMaterialClick }: Props) {
  return (
    <div className="space-y-4">
      {materials.map(material => (
        <div
          key={material.id}
          onClick={() => onMaterialClick(material.id)}
          className="cursor-pointer p-3 bg-gray-100 rounded hover:bg-gray-200 transition"
        >
          <h3 className="font-medium">{material.name}</h3>
          <p className="text-sm text-gray-600">{material.composition}</p>
        </div>
      ))}
    </div>
  )
}

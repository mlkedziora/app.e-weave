export default function MaterialDetail({ material }: { material: any }) {
  return (
    <div className="border p-4 rounded shadow-sm bg-white">
      <h3 className="text-xl font-semibold mb-2">{material.name}</h3>
      <p><strong>Quantity Available:</strong> {material.quantity}</p>
      <p><strong>Composition:</strong> {material.composition}</p>
      <p><strong>Supplier:</strong> {material.supplier}</p>
      <p><strong>Price:</strong> {material.price}</p>
      <p><strong>Assigned Tasks:</strong> {material.assignedTasks.join(', ')}</p>
      <p><strong>Quantity History:</strong> {material.quantityHistory.join(' → ')}</p>
      <p><strong>Environmental Impact:</strong> {material.impactMetrics}</p>
      <p><strong>Transport:</strong> {material.transport}</p>
      <p><strong>Recent Notes:</strong> {material.notes}</p>
    </div>
  )
}
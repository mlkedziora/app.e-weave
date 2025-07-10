import React from 'react'

export default function MaterialDetail({ material }: { material: any }) {
  return (
    <div className="space-y-10 bg-white p-6 rounded shadow-md">
      {/* FABRIC DETAILS */}
      <div>
        <h2 className="text-2xl font-bold mb-4">FABRIC DETAILS</h2>
        <div className="flex gap-6">
          <img src="/fabric.jpg" alt="Fabric" className="w-48 h-48 object-cover rounded" />
          <div className="space-y-2">
            <p><strong>Product Name:</strong> {material.name}</p>
            <p><strong>Quantity Available:</strong> {material.length} m</p>
            <p><strong>Composition:</strong> {material.fiber}</p>
            <p><strong>Supplier:</strong> {material.supplier}</p>
            <p><strong>Price:</strong> ${material.pricePerMeter}</p>
            <p><strong>Certifications:</strong> {material.certifications || '—'}</p>
          </div>
        </div>
      </div>

      {/* ASSIGNED TASKS */}
      <div>
        <h2 className="text-2xl font-bold mb-2">ASSIGNED TASKS</h2>
        <div className="text-gray-600 italic">[Currently unlinked — backend does not relate tasks to materials]</div>
        {/* Placeholder for future logic */}
        <button className="mt-2 px-3 py-1 border rounded text-sm">Add Tasks</button>
        <button className="mt-2 ml-2 px-3 py-1 border rounded text-sm">Expand History</button>
      </div>

      {/* QUANTITY TRACKING */}
      <div>
        <h2 className="text-2xl font-bold mb-4">TRACK QUANTITY</h2>
        <div className="space-y-2">
          {material.materialHistories?.map((entry: any, i: number) => (
            <div key={i} className="border p-3 rounded bg-gray-50">
              <p><strong>User Taking:</strong> {entry.teamMember?.name || 'Unknown'}</p>
              <p><strong>Previous Amount:</strong> {entry.previousLength} m</p>
              <p><strong>New Amount:</strong> {entry.newLength} m</p>
              <p><strong>Timestamp:</strong> {new Date(entry.changedAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <button className="mt-3 px-3 py-1 border rounded text-sm">Update Quantity</button>
        <button className="mt-3 ml-2 px-3 py-1 border rounded text-sm">Expand History</button>
      </div>

      {/* ENVIRONMENTAL IMPACT */}
      <div>
        <h2 className="text-2xl font-bold">ENVIRONMENTAL IMPACT</h2>
        <h3 className="text-sm text-gray-500 mb-4">Prototype – Based on PEFCR Guidelines</h3>
        <div className="grid grid-cols-2 gap-4">
          <p><strong>CO₂ eq (kg):</strong> —</p>
          <p><strong>Fossil Energy (MJ):</strong> —</p>
          <p><strong>Water (m³):</strong> —</p>
          <p><strong>Freshwater P eq (kg):</strong> —</p>
        </div>
        <button className="mt-3 px-3 py-1 border rounded text-sm">Additional Metrics +</button>
      </div>

      {/* TRANSPORT */}
      <div>
        <h2 className="text-2xl font-bold">TRANSPORT</h2>
        <h3 className="text-sm text-gray-500 mb-2">Prototype – Based on User Input</h3>
        <img src="/map.png" alt="Transport Map" className="w-full max-w-md rounded mb-2" />
        <p className="text-sm text-gray-600">
          The transportation of this fabric to your studio used an estimated amount of resources based on fastest available transport information.
        </p>
      </div>

      {/* RECENT NOTES */}
      <div>
        <h2 className="text-2xl font-bold">RECENT NOTES</h2>
        <h3 className="text-sm text-gray-500 mb-4">Quantity Available: {material.length} m</h3>
        <div className="space-y-3">
          {material.materialNotes?.map((note: any, i: number) => (
            <div key={i} className="border p-3 rounded bg-gray-50">
              <p className="text-sm text-gray-600">{note.teamMember?.name || 'Unknown'} – {new Date(note.createdAt).toLocaleString()}</p>
              <p>{note.content}</p>
              <div className="mt-1 flex gap-2">
                <button className="text-xs underline text-blue-600">Edit</button>
                <button className="text-xs underline text-red-500">Delete</button>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-3 px-3 py-1 border rounded text-sm">Expand History</button>
      </div>
    </div>
  )
}

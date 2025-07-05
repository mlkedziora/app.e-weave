export default function MaterialDetail({ material }: { material: any }) {
  return (
    <div className="border p-4 rounded shadow-sm bg-white">
      <h3 className="text-xl font-semibold mb-2">{material.name}</h3>
      <p><strong>Fiber:</strong> {material.fiber}</p>
      <p><strong>Color:</strong> {material.color}</p>
      <p><strong>Texture:</strong> {material.texture}</p>
      <p><strong>Origin:</strong> {material.origin}</p>
      <p><strong>Supplier:</strong> {material.supplier}</p>
      <p><strong>Product Code:</strong> {material.productCode}</p>
      <p><strong>Purchase Location:</strong> {material.purchaseLocation}</p>
      <p><strong>Date Purchased:</strong> {new Date(material.datePurchased).toLocaleDateString()}</p>
      <p><strong>Price per Meter:</strong> ${material.pricePerMeter}</p>
      <p><strong>Certifications:</strong> {material.certifications || '—'}</p>
      <p><strong>Notes:</strong> {material.notes || '—'}</p>
      <p><strong>Length:</strong> {material.length} m</p>
      <p><strong>Width:</strong> {material.width} cm</p>
      <p><strong>GSM:</strong> {material.gsm}</p>
    </div>
  )
}
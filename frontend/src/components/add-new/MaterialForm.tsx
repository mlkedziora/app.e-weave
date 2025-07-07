export default function MaterialForm() {
  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input placeholder="Category" required className="input" />
      <input placeholder="Name/Type" required className="input" />
      <input placeholder="Fiber" required className="input" />
      <input placeholder="Length (m)" type="number" className="input" />
      <input placeholder="Width (cm)" type="number" className="input" />
      <input placeholder="GSM" type="number" className="input" />
      <input placeholder="Color" className="input" />
      <input placeholder="Texture" className="input" />
      <input placeholder="Origin" className="input" />
      <input placeholder="Supplier" className="input" />
      <input placeholder="Product Code" className="input" />
      <input placeholder="Purchase Location" className="input" />
      <input placeholder="Date Purchased" type="date" className="input" />
      <input placeholder="Price per Meter" type="number" className="input" />
      <input placeholder="Known Certifications" className="input" />
      <textarea placeholder="Initial Notes" rows={3} className="input md:col-span-2" />
      <button className="col-span-full bg-black text-white py-2 rounded">Save Material</button>
    </form>
  )
}
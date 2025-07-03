export default function ProjectForm() {
  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input placeholder="Project Name" required className="input" />
      <input placeholder="Initial Task Count" type="number" className="input" />
      <input placeholder="Start Date" type="date" className="input" />
      <input placeholder="Deadline" type="date" className="input" />
      <textarea placeholder="Initial Notes" rows={3} className="input md:col-span-2" />
      <button className="col-span-full bg-black text-white py-2 rounded">Save Project</button>
    </form>
  )
}
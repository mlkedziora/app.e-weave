export default function TeamMemberForm() {
  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input placeholder="Name" required className="input" />
      <input placeholder="Position" required className="input" />
      <input placeholder="Start Date" type="date" className="input" />
      <input placeholder="End Date" type="date" className="input" />
      <button className="col-span-full bg-black text-white py-2 rounded">Add Member</button>
    </form>
  )
}
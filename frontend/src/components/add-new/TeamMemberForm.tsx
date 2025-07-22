// frontend/src/components/add-new/TeamMemberForm.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import StyledLink from '../common/StyledLink';

interface Project { id: string; name: string; }

export default function TeamMemberForm() {
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectIds, setProjectIds] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState('/profile-icon.jpg');
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getToken({ template: 'backend-access' }).then(async (t) => { // Use correct token template
      setToken(t);
      try {
        const res = await fetch('/api/projects', { headers: { Authorization: `Bearer ${t}` } }); // Proxied path
        setProjects(await res.json());
      } catch (err) {
        setError('Failed to load projects');
      }
    });
  }, [getToken]);

  useEffect(() => {
    if (image) {
      setPreview(URL.createObjectURL(image));
    } else {
      setPreview('/profile-icon.jpg');
    }
  }, [image]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPosition('');
    setStartDate('');
    setEndDate('');
    setProjectIds([]);
    setImage(null);
    setPreview('/profile-icon.jpg');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Authentication token missing');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('position', position);
    if (startDate) formData.append('startDate', startDate);
    if (endDate) formData.append('endDate', endDate);
    if (projectIds.length) formData.append('projectIds', JSON.stringify(projectIds));
    if (image) formData.append('image', image);

    try {
      const res = await fetch('/api/members', { // Proxied path
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        console.log('Team Member created');
        resetForm();
        setError(null);
      } else {
        setError('Failed to create team member');
      }
    } catch (err) {
      console.error(err);
      setError('Error creating team member');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {error && <div className="col-span-2 text-red-500">{error}</div>}
      <div className="md:col-span-2">
        <img src={preview} alt="Profile Preview" className="w-32 h-32 rounded-full mx-auto mb-4" />
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:border-black" />
      </div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black" />
      <input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Position" required className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black" />
      <input value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="Start Date" type="date" className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black" />
      <input value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End Date" type="date" className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black" />
      <div className="col-span-2">
        <label className="block mb-2">Assign Projects</label>
        <select multiple value={projectIds} onChange={(e) => setProjectIds(Array.from(e.target.selectedOptions, o => o.value))} className="border border-gray-300 rounded px-3 py-2 w-full">
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <button type="submit" className="col-span-full text-black hover:underline block text-center">
        Add Member
      </button>
    </form>
  );
}
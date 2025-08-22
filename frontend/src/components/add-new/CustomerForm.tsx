// frontend/src/components/add-new/CustomerForm.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import Typography from '../common/Typography';
import SmartInput from '../common/SmartInput';

interface Project { id: string; name: string; }

export default function CustomerForm() {
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [initialNotes, setInitialNotes] = useState('');
  const [projectIds, setProjectIds] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState('/profile-icon.jpg');
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getToken({ template: 'backend-access' }).then(async (t) => {
      setToken(t);
      try {
        const res = await fetch('/api/projects', { headers: { Authorization: `Bearer ${t}` } });
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
    setPhone('');
    setAddress('');
    setInitialNotes('');
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
    formData.append('phone', phone);
    formData.append('address', address);
    if (initialNotes) formData.append('initialNotes', initialNotes);
    if (projectIds.length) formData.append('projectIds', JSON.stringify(projectIds));
    if (image) formData.append('image', image);

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        resetForm();
        setError(null);
      } else {
        setError('Failed to create customer');
      }
    } catch (err) {
      setError('Error creating customer');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {error && <div className="col-span-2 text-red-500">{error}</div>}
      <div className="md:col-span-2 flex flex-col items-center">
        <img src={preview} alt="Profile Preview" className="w-48 h-48 object-cover rounded-full mb-4" />
        <label className="border border-gray-300 rounded-full px-4 py-2 text-black focus-within:outline-none focus-within:border-black focus-within:shadow-[0_0_10px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] cursor-pointer text-center uppercase">
          CHOOSE FILE
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="hidden" />
        </label>
      </div>
      <SmartInput value={name} onChange={(e) => setName(e.target.value)} placeholder="NAME" required />
      <SmartInput value={email} onChange={(e) => setEmail(e.target.value)} placeholder="EMAIL" type="email" required />
      <SmartInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="PHONE" type="tel" />
      <SmartInput value={address} onChange={(e) => setAddress(e.target.value)} placeholder="ADDRESS" />
      <div className="col-span-2">
        <label className="block mb-2">ASSIGN PROJECTS</label>
        <SmartInput as="select" multiple value={projectIds} onChange={(e) => setProjectIds(Array.from(e.target.selectedOptions, o => o.value))} className="w-full">
          {projects.map(p => <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>)}
        </SmartInput>
      </div>
      <SmartInput as="textarea" value={initialNotes} onChange={(e) => setInitialNotes(e.target.value)} placeholder="INITIAL NOTES" rows={3} className="md:col-span-2" />
      <div className="col-span-full flex justify-center mb-6">
        <button type="submit" className="text-black hover:underline">
          <Typography variant="15" className="text-black">ADD CUSTOMER</Typography>
        </button>
      </div>
    </form>
  );
}
// frontend/src/components/add-new/MaterialForm.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

interface MaterialFormProps {
  onSuccess: (newMaterial: Material) => void;
  onCancel?: () => void;
}

export default function MaterialForm({ onSuccess, onCancel }: MaterialFormProps) {
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [name, setName] = useState('');
  const [fiber, setFiber] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [gsm, setGsm] = useState('');
  const [color, setColor] = useState('');
  const [texture, setTexture] = useState('');
  const [origin, setOrigin] = useState('');
  const [supplier, setSupplier] = useState('');
  const [productCode, setProductCode] = useState('');
  const [purchaseLocation, setPurchaseLocation] = useState('');
  const [datePurchased, setDatePurchased] = useState('');
  const [pricePerMeter, setPricePerMeter] = useState('');
  const [certifications, setCertifications] = useState('');
  const [initialNotes, setInitialNotes] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState('/fabric.jpg');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getToken({ template: 'backend-access' }).then(async (t) => {
      setToken(t);
      console.log('[MaterialForm] Fresh token for manual testing:', t);
      try {
        console.log('[MaterialForm] Using token:', t?.substring(0, 20) + '...');
        const res = await fetch('/api/materials/categories', {  // Changed to /api/materials/categories
          headers: { Authorization: `Bearer ${t}` },
        });
        console.log('[MaterialForm] Fetch status:', res.status, res.statusText);
        const text = await res.text();
        console.log('[MaterialForm] Response body:', text || 'Empty response');
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}, Body: ${text}`);
        }
        const data = JSON.parse(text);
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format: ' + JSON.stringify(data));
        }
        setCategories(data);
      } catch (err) {
        console.error('[MaterialForm] Error fetching categories:', err);
        setError('Failed to load categories. Please try again.');
      }
    }).catch((err) => {
      console.error('[MaterialForm] Error getting token:', err);
      setError('Failed to authenticate. Please try again.');
    });
  }, [getToken]);

  useEffect(() => {
    if (image) {
      setPreview(URL.createObjectURL(image));
    } else {
      setPreview('/fabric.jpg');
    }
  }, [image]);

  const resetForm = () => {
    setSelectedCategory('');
    setName('');
    setFiber('');
    setLength('');
    setWidth('');
    setGsm('');
    setColor('');
    setTexture('');
    setOrigin('');
    setSupplier('');
    setProductCode('');
    setPurchaseLocation('');
    setDatePurchased('');
    setPricePerMeter('');
    setCertifications('');
    setInitialNotes('');
    setImage(null);
    setPreview('/fabric.jpg');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Authentication token missing');
      return;
    }

    const formData = new FormData();
    formData.append('category', selectedCategory); // Name, as in DTO
    formData.append('name', name);
    formData.append('fiber', fiber);
    if (length) formData.append('length', parseFloat(length).toString());  // Ensure numeric string
    if (width) formData.append('width', parseFloat(width).toString());
    if (gsm) formData.append('gsm', parseFloat(gsm).toString());
    if (color) formData.append('color', color);
    if (texture) formData.append('texture', texture);
    if (origin) formData.append('origin', origin);
    if (supplier) formData.append('supplier', supplier);
    if (productCode) formData.append('productCode', productCode);
    if (purchaseLocation) formData.append('purchaseLocation', purchaseLocation);
    if (datePurchased) formData.append('datePurchased', datePurchased);
    if (pricePerMeter) formData.append('pricePerMeter', parseFloat(pricePerMeter).toString());
    if (certifications) formData.append('certifications', certifications);
    if (initialNotes) formData.append('initialNotes', initialNotes);
    if (image) formData.append('image', image);

    try {
      const res = await fetch('/api/materials', {  // Changed to /api/materials for consistency
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const newMaterial = await res.json();
        console.log('Material created');
        resetForm();
        setError(null);
        onSuccess(newMaterial);
      } else {
        const text = await res.text();
        setError(`Failed to create material: ${res.status} - ${text}`);
      }
    } catch (err) {
      console.error(err);
      setError('Error creating material');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {error && <div className="col-span-2 text-red-500">{error}</div>}
      <div className="md:col-span-2">
        <img src={preview} alt="Material Preview" className="w-full h-48 object-cover rounded mb-4" />
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:border-black" />
      </div>
      <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required className="border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:border-black">
        <option value="">Select Category</option>
        {categories.length === 0 ? (
          <option disabled>No categories available</option>
        ) : (
          categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))
        )}
      </select>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name/Type" required className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black" />
      <input value={fiber} onChange={(e) => setFiber(e.target.value)} placeholder="Fiber" required className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black" />
      <input value={length} onChange={(e) => setLength(e.target.value)} placeholder="Length (m)" type="number" className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black" />
      <input value={width} onChange={(e) => setWidth(e.target.value)} placeholder="Width (cm)" type="number" className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black" />
      <input value={gsm} onChange={(e) => setGsm(e.target.value)} placeholder="GSM" type="number" className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black" />
      <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Color" className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black" />
      <input value={texture} onChange={(e) => setTexture(e.target.value)} placeholder="Texture" className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black" />
      <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Origin" className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black" />
      <input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Supplier" className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black" />
      <input value={productCode} onChange={(e) => setProductCode(e.target.value)} placeholder="Product Code" className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black" />
      <input value={purchaseLocation} onChange={(e) => setPurchaseLocation(e.target.value)} placeholder="Purchase Location" className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black" />
      <input value={datePurchased} onChange={(e) => setDatePurchased(e.target.value)} placeholder="Date Purchased" type="date" className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black" />
      <input value={pricePerMeter} onChange={(e) => setPricePerMeter(e.target.value)} placeholder="Price per Meter" type="number" className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black" />
      <input value={certifications} onChange={(e) => setCertifications(e.target.value)} placeholder="Known Certifications" className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black" />
      <textarea value={initialNotes} onChange={(e) => setInitialNotes(e.target.value)} placeholder="Initial Notes" rows={3} className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black md:col-span-2" />
      <div className="col-span-full flex justify-center gap-4">
        <StyledLink onClick={(e) => { e.preventDefault(); handleSubmit(e as any); }} className="text-black">
          <Typography variant="15" className="text-black">SAVE MATERIAL</Typography>
        </StyledLink>
        {onCancel && (
          <StyledLink onClick={onCancel} className="text-black">
            <Typography variant="15" className="text-black">CANCEL</Typography>
          </StyledLink>
        )}
      </div>
    </form>
  );
}
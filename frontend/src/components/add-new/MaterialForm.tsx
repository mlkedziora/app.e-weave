// frontend/src/components/add-new/MaterialForm.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import StyledLink from '../common/StyledLink';
import Typography from '../common/Typography';
import SmartInput from '../common/SmartInput';

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
      try {
        const res = await fetch('/api/materials/categories', {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        setError('Failed to load categories');
      }
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
    formData.append('category', selectedCategory);
    formData.append('name', name);
    formData.append('fiber', fiber);
    if (length) formData.append('length', parseFloat(length).toString());
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
      const res = await fetch('/api/materials', {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const newMaterial = await res.json();
        resetForm();
        setError(null);
        onSuccess(newMaterial);
      } else {
        setError('Failed to create material');
      }
    } catch (err) {
      setError('Error creating material');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      {error && <div className="col-span-2 text-red-500">{error}</div>}
      <div className="md:col-span-2 flex flex-col items-center">
        <img src={preview} alt="Material Preview" className="w-48 h-48 object-cover rounded-full mb-4" />
        <label className="w-full md:w-1/2 border border-gray-300 rounded-full px-4 py-2 text-black focus-within:outline-none focus-within:border-black focus-within:shadow-[0_0_10px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] cursor-pointer text-center uppercase">
          CHOOSE FILE
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="hidden" />
        </label>
      </div>
      <SmartInput as="select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required className="w-full text-center appearance-none border border-gray-300 rounded-full px-4 py-2 text-black focus:outline-none focus:border-black focus:shadow-[0_0_10px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.6)]">
        <option value="">SELECT CATEGORY</option>
        {categories.length === 0 ? (
          <option disabled>NO CATEGORIES AVAILABLE</option>
        ) : (
          categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))
        )}
      </SmartInput>
      <SmartInput value={name} onChange={(e) => setName(e.target.value)} placeholder="NAME/TYPE" required />
      <SmartInput value={fiber} onChange={(e) => setFiber(e.target.value)} placeholder="FIBER" required />
      <SmartInput value={length} onChange={(e) => setLength(e.target.value)} placeholder="LENGTH (M)" type="number" />
      <SmartInput value={width} onChange={(e) => setWidth(e.target.value)} placeholder="WIDTH (CM)" type="number" />
      <SmartInput value={gsm} onChange={(e) => setGsm(e.target.value)} placeholder="GSM" type="number" />
      <SmartInput value={color} onChange={(e) => setColor(e.target.value)} placeholder="COLOR" />
      <SmartInput value={texture} onChange={(e) => setTexture(e.target.value)} placeholder="TEXTURE" />
      <SmartInput value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="ORIGIN" />
      <SmartInput value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="SUPPLIER" />
      <SmartInput value={productCode} onChange={(e) => setProductCode(e.target.value)} placeholder="PRODUCT CODE" />
      <SmartInput value={purchaseLocation} onChange={(e) => setPurchaseLocation(e.target.value)} placeholder="PURCHASE LOCATION" />
      <SmartInput value={datePurchased} onChange={(e) => setDatePurchased(e.target.value)} placeholder="DATE PURCHASED" type="text" />
      <SmartInput value={pricePerMeter} onChange={(e) => setPricePerMeter(e.target.value)} placeholder="PRICE PER METER" type="number" />
      <div className="md:col-span-2 flex justify-center">
        <SmartInput value={certifications} onChange={(e) => setCertifications(e.target.value)} placeholder="KNOWN CERTIFICATIONS" className="w-full md:w-1/2 text-center" />
      </div>
      <SmartInput as="textarea" value={initialNotes} onChange={(e) => setInitialNotes(e.target.value)} placeholder="INITIAL NOTES" rows={3} className="md:col-span-2 text-center" />
      <div className="col-span-full flex justify-center gap-4 mb-6">
        <button type="submit" className="text-black hover:underline">
          <Typography variant="15" className="text-black">SAVE MATERIAL</Typography>
        </button>
        {onCancel && (
          <StyledLink onClick={onCancel} className="text-black">
            <Typography variant="15" className="text-black">CANCEL</Typography>
          </StyledLink>
        )}
      </div>
    </form>
  );
}
// frontend/src/components/inventory/AddCategoryPanel.tsx
import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import BlurryOverlayPanel from '../common/BlurryOverlayPanel';
import Typography from '../common/Typography';
import UnderlinedHeader from '../common/UnderlinedHeader';
import ScrollableContainer from '../common/ScrollableContainer';
import StyledLink from '../common/StyledLink';
import ActionButtonsRow from '../common/ActionButtonsRow';

interface Material {
  id: string;
  name: string;
  category: string;
  length: number;
}

interface Category {
  id: string;
  name: string;
}

interface AddCategoryPanelProps {
  onClose: () => void;
  onCategoryAdded: (newCategory: Category) => void;
  materials: Material[];
  onMaterialsUpdated: (updatedMaterials: Material[]) => void;
}

export default function AddCategoryPanel({ onClose, onCategoryAdded, materials, onMaterialsUpdated }: AddCategoryPanelProps) {
  const [name, setName] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Enter a category name.');
      return;
    }
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/materials/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const errorBody = await res.json();
        throw new Error(`Failed to add category: ${errorBody.message || 'Unknown error'}`);
      }
      const newCategory: Category = await res.json();

      // Assign selected materials to the new category
      const updatedMaterials = [...materials];
      for (const matId of selectedMaterials) {
        await fetch(`/api/materials/${matId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ categoryId: newCategory.id }),
        });
        const index = updatedMaterials.findIndex(m => m.id === matId);
        if (index !== -1) {
          updatedMaterials[index].category = newCategory.name;
        }
      }
      onMaterialsUpdated(updatedMaterials);

      onCategoryAdded(newCategory);
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Error adding category, possibly due to network issues.');
    }
  };

  const handleToggleMaterial = (id: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <BlurryOverlayPanel onClose={onClose}>
      <UnderlinedHeader title="ADD NEW CATEGORY" />
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category name"
        className="border border-gray-300 rounded px-3 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black w-full mb-6 mt-6"
      />
      <Typography variant="15" className="text-black mb-4">Add existing materials (optional)</Typography>
      <ScrollableContainer className="max-h-40 mb-6">
        {materials.map((mat) => (
          <div 
            key={mat.id} 
            className="flex items-center cursor-pointer mb-4"
            onClick={() => handleToggleMaterial(mat.id)}
          >
            <div className="w-4 h-4 border border-black rounded-full flex items-center justify-center mr-2 flex-shrink-0">
              {selectedMaterials.includes(mat.id) && <div className="w-2 h-2 bg-[#D7FAEA] rounded-full"></div>}
            </div>
            <Typography variant="13" className="text-black">
              {mat.name}
            </Typography>
          </div>
        ))}
        {materials.length === 0 && (
          <Typography variant="13" className="text-black italic">
            No materials available.
          </Typography>
        )}
      </ScrollableContainer>
      {error && <Typography variant="13" className="text-red-500 mb-4">{error}</Typography>}
      <ActionButtonsRow>
        <StyledLink onClick={handleSubmit} className="text-black">
          <Typography variant="15" className="text-black">ADD</Typography>
        </StyledLink>
        <StyledLink onClick={onClose} className="text-black">
          <Typography variant="15" className="text-black">CANCEL</Typography>
        </StyledLink>
      </ActionButtonsRow>
    </BlurryOverlayPanel>
  );
}
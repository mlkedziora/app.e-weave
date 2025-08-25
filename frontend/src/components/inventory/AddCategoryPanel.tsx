// frontend/src/components/inventory/AddCategoryPanel.tsx
import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import BlurryOverlayPanel from '../common/BlurryOverlayPanel';
import Typography from '../common/Typography';
import UnderlinedHeader from '../common/UnderlinedHeader';
import ListContainer from '../common/ListContainer';
import SubtaskItem from '../common/SubtaskItem';
import StyledLink from '../common/StyledLink';
import SmartInput from '../common/SmartInput';

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
  const [selectedMaterials, setSelectedMaterials] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const customInnerStyle = {
    marginTop: '0px',
    marginLeft: '0',
    overflow: 'visible',
  };

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
    setSelectedMaterials((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <BlurryOverlayPanel draggable={true} innerStyle={customInnerStyle} onClose={onClose}>
      <UnderlinedHeader title="ADD NEW CATEGORY" />
      <div className="mb-10">
        <Typography variant="15" className="text-black mb-2">Enter Category Name:</Typography>
        <SmartInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="CATEGORY NAME"
          className="w-full uppercase text-left"
        />
      </div>

      <UnderlinedHeader title="ADD EXISTING MATERIALS (OPTIONAL)" />
      <ListContainer
        className="mb-6 max-h-60 overflow-y-auto"
        items={materials.map((mat) => (
          <SubtaskItem
            key={mat.id}
            id={mat.id}
            name={mat.name}
            completed={selectedMaterials.has(mat.id)}
            showDelete={false}
            showStatus={false}
            onToggle={() => handleToggleMaterial(mat.id)}
          />
        ))}
        emptyMessage="No materials available."
      />

      <div className="flex justify-between">
        <StyledLink onClick={handleSubmit} className="text-black">
          <Typography variant="15" className="text-black">ADD</Typography>
        </StyledLink>
        <StyledLink onClick={onClose} className="text-black">
          <Typography variant="15" className="text-black">CANCEL</Typography>
        </StyledLink>
      </div>

      {error && <Typography variant="13" className="text-red-500 mt-4">{error}</Typography>}
    </BlurryOverlayPanel>
  );
}
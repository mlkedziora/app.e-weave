// frontend/src/pages/AddNew.tsx
import AddNewTabs from '../components/add-new/AddNewTabs' // ✅ Adjust import path if needed (@ to ..)

export default function AddNew() {
  return (
    <div className="w-full h-full p-4 pt-6 pr-8.5 pb-8.5 overflow-hidden"> {/* Added p-6 for spacing around the card (left from sidebar, bottom from page edge, etc.); overflow-hidden to contain any potential overflow, with scrolling handled inside AddNewTabs */}
      {/* <div className="w-full h-full flex justify-center items-center absolute top-0 left-0"> {/* Option 2: Absolute - positioned relative to parent <main>, full cover */} 
      {/* <div className="w-full h-full flex justify-center items-center fixed top-0 left-0"> {/* Option 3: Fixed - fixed to viewport, but may overlap topbar/sidebar; use cautiously */} 
      <AddNewTabs />
    </div>
  )
}
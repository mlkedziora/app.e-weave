import Typography from './Typography';
import ProgressBar from './ProgressBar';

interface MemberItemProps {
  name: string;
  role: string;
  progress: number;
  onClick?: () => void;
  imageUrl?: string;
  imageSrc?: string;  // Default placeholder
}

export default function MemberItem({ 
  name, 
  role, 
  progress, 
  onClick, 
  imageUrl, 
  imageSrc = '/profile-icon.jpg' 
}: MemberItemProps) {
  return (
    <div className="cursor-pointer hover:bg-gray-50 p-3" onClick={onClick}>
      <div className="flex items-center space-x-4">
        <img
          src={imageUrl ?? imageSrc}
          alt="Profile"
          className="w-[75px] h-[75px] rounded-full object-cover"
        />
        <div className="space-y-1">
          <Typography variant="17" weight="regular" className="text-black">{name} — {role}</Typography>
          <Typography variant="13" weight="regular" className="text-black">TASK PROGRESS: {progress}%</Typography>
        </div>
      </div>
      <ProgressBar progress={progress} fillColor="var(--progress-fill-color, #D7FAEA)" />
    </div>
  );
}
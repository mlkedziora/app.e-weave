import Typography from './Typography';
import ProgressBar from './ProgressBar';

interface MaterialItemProps {
  name: string;
  length: number;
  eScore: number;
  onClick?: () => void;
  imageUrl?: string;
  imageSrc?: string;  // Default placeholder
}

export default function MaterialItem({ 
  name, 
  length, 
  eScore, 
  onClick, 
  imageUrl, 
  imageSrc = '/fabric.jpg' 
}: MaterialItemProps) {
  const getFillColor = (score: number) => {
    if (score < 33) return '#FFB3B3';
    if (score < 66) return '#FFE4B3';
    return '#B3FFB3';
  };

  return (
    <div className="cursor-pointer hover:bg-gray-50" onClick={onClick}>
      <div className="flex items-center space-x-4">
        <img
          src={imageUrl ?? imageSrc}
          alt="Fabric"
          className="w-[75px] h-[75px] rounded-full object-cover"
        />
        <div>
          <Typography variant="17" weight="regular" className="text-black">{name}</Typography>
          <Typography variant="13" weight="regular" className="text-black">Quantity: {length}m</Typography>
          <Typography variant="13" weight="regular" className="text-black">E-Score: {eScore} / 100</Typography>
        </div>
      </div>
      <ProgressBar progress={eScore} fillColor={getFillColor(eScore)} />
    </div>
  );
}
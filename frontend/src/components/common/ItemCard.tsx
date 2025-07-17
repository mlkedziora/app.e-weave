import { FC, ReactNode } from 'react';

interface ItemCardProps {
  imageSrc: string;
  alt: string;
  children: ReactNode;
}

const ItemCard: FC<ItemCardProps> = ({ imageSrc, alt, children }) => {
  return (
    <div className="flex items-center space-x-4">
      <img
        src={imageSrc}
        alt={alt}
        className="max-w-[100px] max-h-[100px] w-[100px] h-[100px] rounded-full object-cover"
      />
      <div>{children}</div>
    </div>
  )
}

export default ItemCard;
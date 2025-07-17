// frontend/src/components/common/StyledLink.tsx
import React, { FC, ReactNode } from 'react';

interface StyledLinkProps {
  children: ReactNode;
  onClick?: () => void; // For button-like actions
  href?: string; // For actual navigation links
  className?: string; // Extra classes
}

const StyledLink: FC<StyledLinkProps> = ({ children, onClick, href, className = '' }) => {
  const baseClasses = 'text-black hover:underline hover:text-gray-800 cursor-pointer transition-colors font-inherit bg-transparent border-none p-0';

  if (href) {
    return (
      <a href={href} className={`${baseClasses} ${className}`}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${baseClasses} ${className}`}>
      {children}
    </button>
  );
};

export default StyledLink;
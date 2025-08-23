// frontend/src/components/common/SmartInput.tsx
import React, { useState, useEffect, useRef } from 'react';

export const SINGLE_LINE_RADIUS = '9999px';
export const MULTI_LINE_RADIUS = '0.5rem';

type SmartInputProps = {
  as?: 'input' | 'textarea' | 'select';
  multiple?: boolean;
  rows?: number;
  className?: string;
  [key: string]: any;
};

export default function SmartInput({ as = 'input', className = '', ...props }: SmartInputProps) {
  if (as === 'select' && !props.multiple) {
    const { value, onChange, disabled, children } = props;
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const childArray = React.Children.toArray(children);
    const selectedChild = childArray.find((child: any) => child.props.value === value);
    const displayText = selectedChild ? selectedChild.props.children : (childArray[0] as any)?.props.children || '';

    const radius = SINGLE_LINE_RADIUS;
    const baseClass = `border border-gray-300 px-4 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black focus:shadow-[0_0_10px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] text-left ${className}`;

    return (
      <div ref={ref} className="relative">
        <button
          type="button"
          className={baseClass}
          style={{ borderRadius: radius }}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) setOpen(!open);
          }}
          disabled={disabled}
        >
          <span className="block truncate pr-8">{displayText}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <svg className="h-4 w-4 text-gray-400" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </span>
        </button>
        {open && (
          <div 
            className="absolute z-50 mt-1 w-full bg-white shadow-lg border border-gray-300 overflow-auto max-h-60" 
            style={{ borderRadius: MULTI_LINE_RADIUS }}
            onClick={(e) => e.stopPropagation()}
          >
            {childArray.map((child: any, index) => (
              <div
                key={index}
                className="px-4 py-2 text-black hover:bg-gray-100 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ target: { value: child.props.value } });
                  setOpen(false);
                }}
              >
                {child.props.children}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } else {
    const Component: any = as;
    const isMulti = as === 'textarea' || props.multiple;
    const radius = isMulti ? MULTI_LINE_RADIUS : SINGLE_LINE_RADIUS;
    const alignClass = (as === 'input' || (as === 'select' && !props.multiple)) ? 'text-center' : 'text-left';
    const baseClass = `border border-gray-300 px-4 py-2 text-black placeholder:text-gray-500 focus:outline-none focus:border-black focus:shadow-[0_0_10px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] ${alignClass} ${className}`;
    return <Component {...props} className={baseClass} style={{ borderRadius: radius }} />;
  }
}
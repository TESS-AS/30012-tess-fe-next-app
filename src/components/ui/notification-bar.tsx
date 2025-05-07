import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from './button';

interface NotificationBarProps {
  message: string;
  className?: string;
  autoHideDuration?: number;
}

const NotificationBar: React.FC<NotificationBarProps> = ({
  message,
  className,
  autoHideDuration = 0, // 0 means it won't auto-hide
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const showTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    let hideTimeout: NodeJS.Timeout;
    if (autoHideDuration > 0) {
      hideTimeout = setTimeout(() => {
        handleClose();
      }, autoHideDuration);
    }

    return () => {
      clearTimeout(showTimeout);
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [autoHideDuration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };


  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'bg-green-500 fixed top-0 left-0 right-0 z-50 px-4 py-2 text-white text-center transform transition-all duration-300 ease-in-out',
        isVisible && !isClosing ? 'translate-y-0' : '-translate-y-full',
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center relative">
        <span className="flex-1 text-sm text-center">{message}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute right-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default NotificationBar;

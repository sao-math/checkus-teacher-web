import { useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

export const useAutoCloseSidebar = (isTaskSidebarOpen: boolean) => {
  const { setOpen: setAppSidebarOpen, isMobile } = useSidebar();

  useEffect(() => {
    // Close AppSidebar when TaskSidebar opens or when screen becomes mobile size
    if (isTaskSidebarOpen || isMobile) {
      setAppSidebarOpen(false);
    }
  }, [isTaskSidebarOpen, isMobile, setAppSidebarOpen]);

  return { isMobile };
}; 
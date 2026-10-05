// Context and Hook for "Why this?" Explainable Drawer
// Provides a global drawer state accessible by any stat card, recommendation chip, or plan item.

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Explanation } from '../types';

export interface WhyDrawerContent {
  title: string;
  subtitle?: string;
  valueDisplay?: string | number;
  explanation: Explanation;
}

interface WhyDrawerContextType {
  isOpen: boolean;
  content: WhyDrawerContent | null;
  openDrawer: (content: WhyDrawerContent) => void;
  closeDrawer: () => void;
}

const WhyDrawerContext = createContext<WhyDrawerContextType | undefined>(undefined);

export const WhyDrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<WhyDrawerContent | null>(null);

  const openDrawer = useCallback((data: WhyDrawerContent) => {
    setContent(data);
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <WhyDrawerContext.Provider value={{ isOpen, content, openDrawer, closeDrawer }}>
      {children}
    </WhyDrawerContext.Provider>
  );
};

export function useWhyDrawer() {
  const context = useContext(WhyDrawerContext);
  if (!context) {
    throw new Error('useWhyDrawer must be used within a WhyDrawerProvider');
  }
  return context;
}

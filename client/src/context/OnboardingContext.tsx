import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface OnboardingContextType {
  isVisible: boolean;
  launchOnboarding: () => void;
  dismissOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeen = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeen) {
      setIsVisible(true);
    }
  }, []);

  const launchOnboarding = () => {
    setIsVisible(true);
  };

  const dismissOnboarding = () => {
    setIsVisible(false);
    localStorage.setItem("hasSeenOnboarding", "true");
  };

  return (
    <OnboardingContext.Provider value={{ isVisible, launchOnboarding, dismissOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}

import { useEffect } from "react";
import { useBlocker } from "react-router-dom";

/**
 * Hook to warn users about unsaved changes before leaving the page.
 * 
 * @param isDirty boolean indicating if there are unsaved changes
 * @param message custom warning message (optional)
 */
export function useUnsavedChanges(
  isDirty: boolean,
  message: string = "You have unsaved changes. Are you sure you want to leave this page?"
) {
  // 1. Intercept standard React Router navigation
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      const confirmLeave = window.confirm(message);
      if (confirmLeave) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker, message]);

  // 2. Intercept browser tab close / refresh
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = message; // Standard for most browsers to show prompt
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty, message]);
}

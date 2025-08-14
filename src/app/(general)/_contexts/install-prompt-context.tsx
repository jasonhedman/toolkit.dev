"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallPromptContextType {
  installPrompt: BeforeInstallPromptEvent | null;
  isIOS: boolean;
  isStandalone: boolean;
  isDismissed: boolean;
  handleInstall: () => Promise<void>;
  dismissPrompt: () => void;
}

interface Window {
  MSStream: unknown;
}

const InstallPromptContext = createContext<InstallPromptContextType | null>(
  null,
);

// Global capture BEFORE React hydration
let globalPrompt: BeforeInstallPromptEvent | null = null;
let isListenerSetup = false;

// Set up listener immediately when module loads (before React hydration)
if (typeof window !== "undefined" && !isListenerSetup) {
  isListenerSetup = true;

  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    globalPrompt = e as BeforeInstallPromptEvent;
  });
}

// Why is this a provider?
// The main events that we are looking for to detect the state of the pwa installations
// is beforeinstallprompt which fires once and only once when the app mounts, this means if
// we have the prompt inside of a conditionally rendered component, it will not be listening
// when the event fires so cannot detect the state of the pwa installation.
export function InstallPromptProvider({ children }: { children: ReactNode }) {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(globalPrompt);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Set up device detection
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as unknown as Window).MSStream,
    );

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    // Check if user has dismissed the prompt
    const dismissed = localStorage.getItem("installPromptDismissed") === "true";
    setIsDismissed(dismissed);

    // Check if we already captured the prompt before React hydrated
    if (globalPrompt && !installPrompt) {
      setInstallPrompt(globalPrompt);
    }

    // Set up listener for future events (in case it fires again)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const prompt = e as BeforeInstallPromptEvent;
      globalPrompt = prompt;
      setInstallPrompt(prompt);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, [installPrompt]);

  const handleInstall = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;

      if (outcome === "accepted") {
        globalPrompt = null;
        setInstallPrompt(null);
      }
    } catch (error) {
      console.error("Install prompt error:", error);
    }
  };

  const dismissPrompt = () => {
    localStorage.setItem("installPromptDismissed", "true");
    setIsDismissed(true);
  };

  return (
    <InstallPromptContext.Provider
      value={{
        installPrompt,
        isIOS,
        isStandalone,
        isDismissed,
        handleInstall,
        dismissPrompt,
      }}
    >
      {children}
    </InstallPromptContext.Provider>
  );
}

export function useInstallPrompt() {
  const context = useContext(InstallPromptContext);
  if (!context) {
    throw new Error(
      "useInstallPrompt must be used within InstallPromptProvider",
    );
  }
  return context;
}

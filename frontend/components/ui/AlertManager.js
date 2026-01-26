"use client";
import { useState, useContext } from "react";
import Alert from "@/components/ui/Alert";

import { AlertContext } from "@/context/context";

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  // Function to add a new alert
  const pushAlert = (type, message, duration = 5000) => {
    const id = Date.now() + Math.random(); // Unique ID
    setAlerts((prev) => [...prev, { id, type, message, duration }]);
  };

  // Function to remove an alert
  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={pushAlert}>
      {children}

      {/* Render alerts */}
      <div className="fixed top-4 inset-x-4 flex flex-col items-end gap-3 z-[9999] sm:inset-x-auto sm:right-4 sm:max-w-[420px]">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            type={alert.type}
            message={alert.message}
            duration={alert.duration}
            onDismiss={() => dismissAlert(alert.id)}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  return context;
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CollectionItem, CouncilConfig } from "../types";
import { useAuth } from "./AuthContext";
import { getScheduleForUser, getCouncilConfig } from "../firebase/firestoreService";

interface ScheduleContextType {
  schedule: CollectionItem[];
  nextCollection: CollectionItem | null;
  councilConfig: CouncilConfig | null;
  loading: boolean;
  refreshSchedule: () => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<CollectionItem[]>([]);
  const [councilConfig, setCouncilConfig] = useState<CouncilConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadData = async () => {
    if (!user) {
      setSchedule([]);
      setCouncilConfig(null);
      return;
    }

    setLoading(true);
    try {
      const [items, config] = await Promise.all([
        getScheduleForUser(user),
        getCouncilConfig(user.address.custodianCode)
      ]);
      setSchedule(items);
      setCouncilConfig(config);
    } catch (e) {
      console.error("Error loading schedule data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.uid, user?.scheduleKey, user?.customisations?.binAliases]);

  const nextCollection = schedule.length > 0 ? schedule[0] : null;

  return (
    <ScheduleContext.Provider
      value={{
        schedule,
        nextCollection,
        councilConfig,
        loading,
        refreshSchedule: loadData
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = (): ScheduleContextType => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
};

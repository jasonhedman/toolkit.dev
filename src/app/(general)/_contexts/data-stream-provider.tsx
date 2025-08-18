"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import type { DataUIPart, UIDataTypes } from "ai";

interface DataStreamContextValue {
  dataStream: DataUIPart<UIDataTypes>[];
  setDataStream: React.Dispatch<
    React.SetStateAction<DataUIPart<UIDataTypes>[]>
  >;
}

const DataStreamContext = createContext<DataStreamContextValue | null>(null);

export function DataStreamProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dataStream, setDataStream] = useState<DataUIPart<UIDataTypes>[]>([]);

  const value = useMemo(() => ({ dataStream, setDataStream }), [dataStream]);

  return (
    <DataStreamContext.Provider value={value}>
      {children}
    </DataStreamContext.Provider>
  );
}

export function useDataStream() {
  const context = useContext(DataStreamContext);
  if (!context) {
    throw new Error("useDataStream must be used within a DataStreamProvider");
  }
  return context;
}

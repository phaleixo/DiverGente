import React, { useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

type TodayDateProps = {
  shortMonth?: boolean; // use short month names when true
};

function formatToday(shortMonth = true) {
  const now = new Date();
  const formatted = now.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: shortMonth ? "short" : "long",
  });
  const cleaned = formatted.replace(/\./g, "");
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1) + " ";
}

export default function TodayDate({ shortMonth = true }: TodayDateProps) {
  const [value, setValue] = useState<string>(() => formatToday(shortMonth));

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const scheduleMidnightUpdate = () => {
      const now = new Date();
      const next = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );
      const ms = next.getTime() - now.getTime();
      timeoutId = setTimeout(() => {
        setValue(formatToday(shortMonth));
        scheduleMidnightUpdate();
      }, ms + 1000);
    };

    scheduleMidnightUpdate();

    const handleAppState = (state: AppStateStatus) => {
      if (state === "active") {
        // refresh when app returns to foreground (in case date changed while in background)
        setValue(formatToday(shortMonth));
      }
    };

    const sub = AppState.addEventListener("change", handleAppState);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      sub.remove();
    };
  }, [shortMonth]);

  return <>{value}</>;
}

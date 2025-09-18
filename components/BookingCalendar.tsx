"use client";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useState } from "react";

export default function BookingCalendar() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <div>
      <Calendar
        className="custom-calendar border border-gray-300 rounded-lg shadow-lg"
        locale="en-US"
        onChange={(value) => setDate(value as Date)}
        value={date}
        tileDisabled={({ date }) => date.getDay() !== 5}
      />

      <input
        type="hidden"
        name="date"
        value={date ? date.toISOString().split("T")[0] : ""}
      />

      <p className="mt-4">
        {date
          ? `You selected: ${date.toDateString()}`
          : "Select a date (Fridays only)"}
      </p>
    </div>
  );
}

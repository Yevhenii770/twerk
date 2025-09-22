"use client";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useState } from "react";

export default function BookingCalendar() {
  const [date, setDate] = useState<Date | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div>
      <Calendar
        className="custom-calendar"
        locale="en-US"
        onChange={(value) => setDate(value as Date)}
        value={date}
        tileDisabled={({ date }) => date.getDay() !== 5}
        minDate={today}
        tileClassName={({ date }) =>
          date.getDay() === 5 ? "bg-green-100" : undefined
        }
      />

      <input
        type="hidden"
        name="date"
        value={date ? date.toISOString().split("T")[0] : ""}
      />

      <p className="mt-4">
        {date
          ? `You selected: ${date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}`
          : "Select a date (Fridays only)"}
      </p>
    </div>
  );
}

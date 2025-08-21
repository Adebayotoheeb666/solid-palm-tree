import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { Calendar, ChevronDown } from "lucide-react";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder: string;
}

export default function DatePicker({
  value,
  onChange,
  placeholder,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined,
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onChange(format(date, "MM/dd/yyyy"));
      setIsOpen(false);
    }
  };

  const formatDisplayDate = (dateString: string) => {
    try {
      if (!dateString) return "";
      const date = new Date(dateString);
      return format(date, "MM/dd/yyyy");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border border-gray-300 rounded-lg p-4 cursor-pointer flex items-center justify-between min-h-[56px] shadow-sm hover:border-gray-400 hover:shadow-md transition-all ${isOpen ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
      >
        <span
          className={`font-medium ${value ? "text-gray-900" : "text-gray-500"}`}
        >
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <Calendar className="w-5 h-5 text-gray-600" />
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10 bg-black/10 sm:bg-transparent"
            onClick={() => setIsOpen(false)}
          />

          {/* Calendar Dropdown */}
          <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border z-[100] p-4 min-w-[280px] max-w-[calc(100vw-2rem)] sm:max-w-none">
            <style>{`
              .calendar-day {
                transition: background-color 0.15s ease;
              }
              .calendar-day:hover:not(.day-selected):not(.day-disabled) {
                background-color: #f3f4f6 !important;
              }
            `}</style>
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="text-gray-900"
              onDayMouseEnter={(day, modifiers) => {
                if (!modifiers.disabled && !modifiers.outside) {
                  // Add hover effect through CSS
                }
              }}
              classNames={{
                months: "flex flex-col gap-4",
                month: "flex flex-col gap-4",
                caption:
                  "flex justify-center items-center py-2 font-medium text-gray-900",
                nav: "flex items-center gap-1",
                nav_button:
                  "w-7 h-7 bg-transparent border-none text-gray-500 hover:text-gray-900 cursor-pointer",
                table: "w-full border-collapse",
                head_row: "flex gap-1",
                head_cell:
                  "text-gray-500 rounded-md w-8 font-normal text-xs text-center",
                row: "flex w-full mt-2 gap-1",
                cell: "h-8 w-8 text-center text-sm p-0 relative",
                day: "calendar-day h-8 w-8 p-0 font-normal text-gray-900 rounded-md border-none bg-transparent cursor-pointer",
                day_selected: "bg-blue-600 text-white hover:bg-blue-600",
                day_today: "bg-gray-100 text-gray-900",
                day_outside: "text-gray-300",
                day_disabled: "text-gray-300 cursor-not-allowed",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

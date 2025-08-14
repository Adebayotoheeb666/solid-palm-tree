import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, AlertCircle } from "lucide-react";

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  className?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  onBlur,
  placeholder = "Select an option",
  disabled = false,
  error = false,
  errorMessage,
  className = "",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (option.description &&
        option.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Get selected option display text
  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : "";

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
        onBlur?.();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onBlur]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            onChange(filteredOptions[highlightedIndex].value);
            setIsOpen(false);
            setSearchTerm("");
            setHighlightedIndex(-1);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setSearchTerm("");
          setHighlightedIndex(-1);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, highlightedIndex, filteredOptions, onChange]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm("");
      setHighlightedIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Main input field */}
      <div
        onClick={handleToggle}
        className={`w-full bg-white border rounded p-4 text-gray-600 cursor-pointer flex items-center justify-between ${
          error ? "border-red-500" : "border-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-400"}`}
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>
          {displayText || placeholder}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-600 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-hidden">
          {/* Search input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(-1);
                }}
                placeholder="Type to search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={`px-4 py-3 cursor-pointer hover:bg-blue-50 ${
                    index === highlightedIndex ? "bg-blue-50" : ""
                  } ${value === option.value ? "bg-blue-100 text-blue-900" : "text-gray-900"}`}
                >
                  <div className="font-medium">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-gray-500 mt-1">
                      {option.description}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-500">
                No options found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && errorMessage && (
        <div className="flex items-center gap-1 mt-1 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

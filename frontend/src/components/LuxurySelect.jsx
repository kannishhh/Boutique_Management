import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function LuxurySelect({
  value,
  onChange,
  options = [],
  placeholder,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-background border border-border rounded-xl hover:bg-muted/30 hover:border-accent/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent shadow-sm"
      >
        <span
          className={
            selectedOption ? "text-foreground" : "text-muted-foreground"
          }
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in duration-200">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 transition-colors duration-150 ${
                  option.value === value
                    ? "bg-accent/10 text-accent font-medium"
                    : "hover:bg-muted/50 text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function LuxurySelectCompact({
  value,
  onChange,
  options,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-lg hover:bg-muted/30 hover:border-accent/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm shadow-sm"
      >
        <span
          className={`font-medium ${
            selectedOption?.color || "text-foreground"
          }`}
        >
          {selectedOption?.label}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 right-0 mt-2 bg-background border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in duration-200 min-w-40">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 transition-colors duration-150 flex items-center gap-2 ${
                  option.value === value
                    ? "bg-accent/10 font-medium"
                    : "hover:bg-muted/50"
                }`}
              >
                {option.icon && <span>{option.icon}</span>}
                <span className={option.color || "text-foreground"}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

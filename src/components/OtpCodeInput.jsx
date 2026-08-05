import { useRef } from "react";

const CODE_LENGTH = 6;

// Hand-built rather than a new dependency — no OTP-input library exists in
// this codebase, and it already favors hand-built form primitives (see
// AuthPage.jsx's own Field component) over pulling in a form library.
function OtpCodeInput({ value, onChange, error, disabled = false }) {
  const inputRefs = useRef([]);
  const digits = value.padEnd(CODE_LENGTH, " ").split("").slice(0, CODE_LENGTH);
  const errorId = error ? "otp-code-error" : undefined;

  const setDigit = (index, digit) => {
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    onChange(nextDigits.join("").trimEnd());
  };

  const focusInput = (index) => {
    inputRefs.current[index]?.focus();
  };

  const handleChange = (index, event) => {
    const raw = event.target.value.replace(/\D/g, "");
    if (!raw) {
      setDigit(index, "");
      return;
    }

    // Typing or pasting into a single box can still carry multiple digits
    // (e.g. mobile keyboards, or a paste that only partially matched
    // maxLength) — spread whatever arrived across the remaining boxes.
    const chars = raw.split("");
    const nextDigits = [...digits];
    let cursor = index;
    for (const char of chars) {
      if (cursor >= CODE_LENGTH) break;
      nextDigits[cursor] = char;
      cursor += 1;
    }
    onChange(nextDigits.join("").trimEnd());
    focusInput(Math.min(cursor, CODE_LENGTH - 1));
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index].trim() && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (event) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    event.preventDefault();
    onChange(pasted.slice(0, CODE_LENGTH));
    focusInput(Math.min(pasted.length, CODE_LENGTH) - 1);
  };

  return (
    <div>
      <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            autoComplete="one-time-code"
            value={digit.trim()}
            disabled={disabled}
            aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId}
            onChange={(event) => handleChange(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            className={`h-14 w-11 rounded-[4px] border text-center text-xl font-semibold outline-none transition-colors focus:border-black disabled:cursor-not-allowed disabled:opacity-60 sm:h-16 sm:w-12 ${
              error ? "border-red-500" : "border-black/20"
            }`}
          />
        ))}
      </div>
      {error && (
        <p
          id={errorId}
          className="mt-3 text-center text-xs font-medium leading-relaxed text-[#9f3d32]"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default OtpCodeInput;

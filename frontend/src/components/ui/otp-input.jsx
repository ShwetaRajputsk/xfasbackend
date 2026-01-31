import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

const OTPInput = ({ 
  length = 6, 
  onComplete, 
  onResend, 
  isLoading = false, 
  error = null,
  className = '',
  autoFocus = true,
  disabled = false 
}) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputRefs = useRef([]);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(timer => timer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (element, index) => {
    const value = element.value;
    
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substr(0, 1);
    setOtp(newOtp);

    // Move to next input if current field is filled
    if (value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    // Call onComplete when all fields are filled
    const otpValue = newOtp.join('');
    if (otpValue.length === length) {
      onComplete?.(otpValue);
    }
  };

  const handleKeyDown = (e, index) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    
    // Move to next input on right arrow
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
    
    // Move to previous input on left arrow
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    
    // Only allow numeric paste data
    if (!/^\d+$/.test(pasteData)) return;
    
    const pastedOtp = pasteData.slice(0, length).split('');
    const newOtp = [...otp];
    
    pastedOtp.forEach((value, index) => {
      if (index < length) {
        newOtp[index] = value;
      }
    });
    
    setOtp(newOtp);
    
    // Focus last filled input or next empty input
    const focusIndex = Math.min(pastedOtp.length, length - 1);
    inputRefs.current[focusIndex].focus();
    
    // Call onComplete if OTP is complete
    const otpValue = newOtp.join('');
    if (otpValue.length === length) {
      onComplete?.(otpValue);
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    
    setOtp(new Array(length).fill(''));
    setResendTimer(30); // 30 second cooldown
    onResend?.();
    
    // Focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  const clearOtp = () => {
    setOtp(new Array(length).fill(''));
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* OTP Input Fields */}
      <div className="flex justify-center space-x-2">
        {otp.map((value, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            ref={(ref) => (inputRefs.current[index] = ref)}
            value={value}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            disabled={disabled || isLoading}
            className={cn(
              'w-12 h-12 text-center text-lg font-semibold border rounded-lg',
              'focus:ring-2 focus:ring-orange-500 focus:border-orange-500',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              error 
                ? 'border-red-500 bg-red-50' 
                : value 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-300 bg-white hover:border-gray-400',
              'transition-colors duration-200'
            )}
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-center">
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
            {error}
          </p>
        </div>
      )}

      {/* Resend Button */}
      {onResend && (
        <div className="text-center">
          {resendTimer > 0 ? (
            <p className="text-sm text-gray-500">
              Resend OTP in {resendTimer} seconds
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading}
              className={cn(
                'text-sm font-medium text-orange-600 hover:text-orange-700',
                'disabled:text-gray-400 disabled:cursor-not-allowed',
                'transition-colors duration-200'
              )}
            >
              Didn't receive OTP? Resend
            </button>
          )}
        </div>
      )}

      {/* Helper Actions */}
      <div className="flex justify-center space-x-4 text-sm">
        <button
          type="button"
          onClick={clearOtp}
          disabled={isLoading}
          className="text-gray-500 hover:text-gray-700 disabled:text-gray-400"
        >
          Clear
        </button>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OTPInput;
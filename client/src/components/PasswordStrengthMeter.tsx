import React, { useMemo } from 'react';
import zxcvbn from 'zxcvbn';
import { useThemeClasses } from '../hooks/useThemeClasses';

interface PasswordStrengthMeterProps {
  password?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password = '' }) => {
  const themeClasses = useThemeClasses();

  const { score, feedback, strengthText, color } = useMemo(() => {
    if (!password) {
      return { score: -1, feedback: null, strengthText: '', color: 'bg-gray-300 dark:bg-gray-700' };
    }

    const result = zxcvbn(password);
    
    // zxcvbn score is 0 to 4
    let color = 'bg-red-500';
    let text = 'Weak';
    
    switch (result.score) {
      case 0:
        color = 'bg-red-500';
        text = 'Very Weak';
        break;
      case 1:
        color = 'bg-red-400';
        text = 'Weak';
        break;
      case 2:
        color = 'bg-yellow-500';
        text = 'Fair';
        break;
      case 3:
        color = 'bg-green-400';
        text = 'Good';
        break;
      case 4:
        color = 'bg-green-600';
        text = 'Strong';
        break;
    }

    return {
      score: result.score,
      feedback: result.feedback,
      strengthText: text,
      color,
    };
  }, [password]);

  // Render 4 segments for the progress bar
  const createProgressBar = () => {
    const bars = [];
    for (let i = 0; i < 4; i++) {
      const isFilled = password.length > 0 && score >= (i === 0 ? 0 : i);
      bars.push(
        <div
          key={i}
          className={`h-1.5 w-full rounded-full transition-colors duration-300 ${
            isFilled ? color : 'bg-gray-200 dark:bg-[#191919]/50'
          }`}
        />
      );
    }
    return bars;
  };

  if (!password) {
    return null; // or keep it rendered but empty, but returning null saves space until they type
  }

  return (
    <div className="mt-2 w-full transition-all duration-300">
      <div className="flex justify-between items-center mb-1">
        <span className={`text-xs font-semibold ${color.replace('bg-', 'text-')}`}>
          {strengthText}
        </span>
      </div>
      
      <div className="flex gap-1 mb-2">
        {createProgressBar()}
      </div>

      {feedback && feedback.warning && (
        <p className={`text-xs text-red-500 dark:text-red-400 mb-1`}>
          {feedback.warning}
        </p>
      )}
      
      {feedback && feedback.suggestions && feedback.suggestions.length > 0 && (
        <ul className="text-xs text-gray-500 dark:text-gray-400 pl-4 list-disc space-y-0.5">
          {feedback.suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;

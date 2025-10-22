import type { TimeRangeSelectorProps } from '../types';
import { TIME_RANGES } from '../utils/constants';

export const TimeRangeSelector = ({ selected, onChange }: TimeRangeSelectorProps) => {
  return (
    <div className="flex gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">
      {TIME_RANGES.map((range) => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
            selected === range
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400'
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  );
};

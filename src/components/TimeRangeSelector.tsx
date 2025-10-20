import type { TimeRangeSelectorProps } from '../types';
import { TIME_RANGES } from '../utils/constants';

export const TimeRangeSelector = ({ selected, onChange }: TimeRangeSelectorProps) => {
  return (
    <div className="flex gap-2">
      {TIME_RANGES.map((range) => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            selected === range
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  );
};

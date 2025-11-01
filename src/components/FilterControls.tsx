import { FilterState } from '../types';
import { Filter, Calendar, Globe, Target } from 'lucide-react';

interface FilterControlsProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function FilterControls({ filters, onFiltersChange }: FilterControlsProps) {
  const handleFilterChange = (key: keyof FilterState, value: string | number | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={16} className="text-gray-500" />
        <h3 className="text-sm font-medium text-gray-700">Search Filters</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Domain Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            <Globe size={12} className="inline mr-1" />
            Domain
          </label>
          <select
            value={filters.domain || ''}
            onChange={(e) => handleFilterChange('domain', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All domains</option>
            <option value="tech">Technology</option>
            <option value="science">Science</option>
            <option value="business">Business</option>
            <option value="health">Health</option>
            <option value="education">Education</option>
          </select>
        </div>

        {/* Time Range Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            <Calendar size={12} className="inline mr-1" />
            Time Range
          </label>
          <select
            value={filters.timeRange || ''}
            onChange={(e) => handleFilterChange('timeRange', e.target.value as any)}
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Any time</option>
            <option value="day">Last 24 hours</option>
            <option value="week">Last week</option>
            <option value="month">Last month</option>
            <option value="year">Last year</option>
          </select>
        </div>

        {/* Source Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Source
          </label>
          <select
            value={filters.source || ''}
            onChange={(e) => handleFilterChange('source', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All sources</option>
            <option value="academic">Academic</option>
            <option value="news">News</option>
            <option value="forums">Forums</option>
            <option value="documentation">Documentation</option>
          </select>
        </div>

        {/* Confidence Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            <Target size={12} className="inline mr-1" />
            Min Confidence
          </label>
          <select
            value={filters.confidence?.toString() || ''}
            onChange={(e) => handleFilterChange('confidence', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Any confidence</option>
            <option value="0.9">90%+</option>
            <option value="0.8">80%+</option>
            <option value="0.7">70%+</option>
            <option value="0.6">60%+</option>
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {(filters.domain || filters.timeRange || filters.source || filters.confidence) && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={() => onFiltersChange({})}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
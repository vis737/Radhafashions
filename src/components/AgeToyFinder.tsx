import React from 'react';
import { motion } from 'motion/react';
import { Brain, Sparkles, Filter, RotateCcw } from 'lucide-react';

const AGE_GROUPS = [
  '0-6 Months',
  '6-12 Months',
  '1-2 Years',
  '2-4 Years',
  '4-6 Years',
  '6-8 Years',
  '8-10 Years',
  '10-13 Years',
  '13+ Years'
];

const SKILL_FILTERS = [
  'STEM',
  'Educational',
  'Puzzle',
  'Motor Skills',
  'Creative Learning',
  'Montessori',
  'Wooden Toys',
  'Eco Friendly',
  'Indoor',
  'Outdoor'
];

interface AgeToyFinderProps {
  selectedAgeGroup: string;
  onSelectAgeGroup: (age: string) => void;
  selectedSkills: string[];
  onToggleSkill: (skill: string) => void;
  onClearFilters: () => void;
}

export default function AgeToyFinder({
  selectedAgeGroup,
  onSelectAgeGroup,
  selectedSkills,
  onToggleSkill,
  onClearFilters
}: AgeToyFinderProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 text-left space-y-6 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-800/60 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#D4648A]/15 text-[#D4648A] flex items-center justify-center">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-gray-50">
              Age-Based Toy Finder
            </h3>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-sans mt-0.5">
              Select an age segment to discover tailored developmental crafts.
            </p>
          </div>
        </div>
        {(selectedAgeGroup || selectedSkills.length > 0) && (
          <button
            onClick={onClearFilters}
            className="text-[10px] font-semibold text-[#D4648A] hover:text-[#D4648A]/80 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
          </button>
        )}
      </div>

      {/* Advanced Interactive Range Slider Selector */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-gray-400 dark:text-gray-500 uppercase font-semibold">
          <span>Developmental Age Range</span>
          <span className="text-[#D4648A] font-bold text-xs font-sans">
            {(() => {
              if (!selectedAgeGroup) return 'All Developmental Stages';
              return `${selectedAgeGroup}`;
            })()}
          </span>
        </div>

        <div className="px-2">
          {/* Dual Range/Category Slider UI */}
          <input
            type="range"
            min={0}
            max={AGE_GROUPS.length - 1}
            value={selectedAgeGroup ? AGE_GROUPS.indexOf(selectedAgeGroup) : AGE_GROUPS.length - 1}
            onChange={(e) => {
              const idx = parseInt(e.target.value, 10);
              onSelectAgeGroup(idx === AGE_GROUPS.length - 1 && !selectedAgeGroup ? '' : AGE_GROUPS[idx]);
            }}
            className="w-full h-1.5 bg-gray-150 dark:bg-gray-950 rounded-lg appearance-none cursor-pointer accent-[#D4648A]"
          />
          <div className="flex justify-between text-[9px] text-gray-400 dark:text-gray-500 font-mono pt-1">
            <span>0 Months</span>
            <span>2 Years</span>
            <span>6 Years</span>
            <span>10 Years</span>
            <span>13+ Years</span>
          </div>
        </div>

        {/* Quick select stages buttons/chips */}
        <div className="flex flex-wrap gap-1.5">
          {AGE_GROUPS.slice(0, 5).map((age) => {
            const isSelected = selectedAgeGroup === age;
            return (
              <button
                key={age}
                onClick={() => onSelectAgeGroup(isSelected ? '' : age)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-medium transition cursor-pointer border ${
                  isSelected
                    ? 'bg-[#D4648A]/15 text-[#D4648A] border-[#D4648A]'
                    : 'bg-transparent border-gray-150 dark:border-gray-800 text-gray-500 dark:text-gray-500 hover:border-gray-300'
                }`}
              >
                {age}
              </button>
            );
          })}
          {AGE_GROUPS.slice(5).map((age) => {
            const isSelected = selectedAgeGroup === age;
            return (
              <button
                key={age}
                onClick={() => onSelectAgeGroup(isSelected ? '' : age)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-medium transition cursor-pointer border ${
                  isSelected
                    ? 'bg-[#D4648A]/15 text-[#D4648A] border-[#D4648A]'
                    : 'bg-transparent border-gray-150 dark:border-gray-800 text-gray-500 dark:text-gray-500 hover:border-gray-300'
                }`}
              >
                {age}
              </button>
            );
          })}
        </div>
      </div>

      {/* Skill Filters Badges */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono tracking-wider text-gray-400 dark:text-gray-500 uppercase font-semibold flex items-center gap-1">
          <Filter className="w-3 h-3 text-[#D4648A]" /> Cognitive & Play Focus
        </span>
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {SKILL_FILTERS.map((skill) => {
            const isSelected = selectedSkills.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => onToggleSkill(skill)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-medium transition cursor-pointer border flex items-center gap-1 ${
                  isSelected
                    ? 'bg-[#D4648A]/15 text-[#D4648A] border-[#D4648A] font-semibold'
                    : 'bg-transparent border-gray-150 dark:border-gray-800 text-gray-500 dark:text-gray-500 hover:border-gray-300 dark:hover:border-pink-900/30'
                }`}
              >
                {isSelected && <Sparkles className="w-2.5 h-2.5 text-[#D4648A]" />}
                {skill}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}

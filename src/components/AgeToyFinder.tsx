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
    <div className="bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 rounded-3xl p-6 text-left space-y-6 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-50 dark:border-navy-800/60 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#C5A021]/15 text-[#C5A021] flex items-center justify-center">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-navy-900 dark:text-navy-50">
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
            className="text-[10px] font-semibold text-[#C5A021] hover:text-[#C5A021]/80 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
          </button>
        )}
      </div>

      {/* Horizontal Age Selector */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono tracking-wider text-gray-400 dark:text-gray-500 uppercase font-semibold block">
          Developmental Age Group
        </span>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2">
          {AGE_GROUPS.map((age) => {
            const isSelected = selectedAgeGroup === age;
            return (
              <motion.button
                key={age}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectAgeGroup(isSelected ? '' : age)}
                className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#C5A021] text-navy-950 shadow-md shadow-[#C5A021]/10 font-bold border border-transparent'
                    : 'bg-gray-50 dark:bg-navy-950 text-gray-600 dark:text-slate-300 border border-gray-100 dark:border-navy-800 hover:bg-gray-100 dark:hover:bg-navy-800'
                }`}
              >
                {age}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Skill Filters Badges */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono tracking-wider text-gray-400 dark:text-gray-500 uppercase font-semibold flex items-center gap-1">
          <Filter className="w-3 h-3 text-[#C5A021]" /> Cognitive & Play Focus
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
                    ? 'bg-[#C5A021]/15 text-[#C5A021] border-[#C5A021] font-semibold'
                    : 'bg-transparent border-gray-150 dark:border-navy-800 text-gray-500 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              >
                {isSelected && <Sparkles className="w-2.5 h-2.5 text-[#C5A021]" />}
                {skill}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}

import React from 'react';

const PhaseIndicator = ({ phase }) => {
  const getPhaseLabel = (p) => {
    switch (p) {
      case 'EXPLORE':
        return 'Sun raha hoon...';
      case 'UNDERSTAND':
        return 'Samajh raha hoon...';
      case 'SUGGEST':
        return 'Madad karna chahta hoon...';
      default:
        return 'Sakoon';
    }
  };

  const getPhaseColor = (p) => {
    switch (p) {
      case 'EXPLORE':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'UNDERSTAND':
        return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'SUGGEST':
        return 'bg-sakoon-50 text-sakoon-700 border-sakoon-100';
      default:
        return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  return (
    <div className={`py-1.5 px-3 border-b text-[12px] font-medium transition-all duration-500 text-center ${getPhaseColor(phase)}`}>
      {getPhaseLabel(phase)}
    </div>
  );
};

export default PhaseIndicator;

import React from 'react';

interface FlowNodeProps {
  title: string;
  type: 'action' | 'empty';
  position?: { x: number; y: number };
}

const FlowNode: React.FC<FlowNodeProps> = ({ title, type, position = { x: 0, y: 0 } }) => {
  return (
    <div
      className={`
        absolute p-4 rounded-lg shadow-lg min-w-[200px]
        ${type === 'action' ? 'bg-white border border-gray-200' : 'border-2 border-dashed border-gray-300 bg-gray-50'}
      `}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{title}</span>
        {type === 'action' && (
          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
            Action
          </span>
        )}
      </div>
      
      {/* Connection points */}
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 translate-y-1/2">
        <div className="w-3 h-3 rounded-full bg-purple-500 border-2 border-white shadow-sm" />
      </div>
      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-3 h-3 rounded-full bg-purple-500 border-2 border-white shadow-sm" />
      </div>
    </div>
  );
};

export default FlowNode; 
import { useState } from 'react';

export default function Header() {
  return null;
}

// src/components/Sidebar.jsx
import { FaBars, FaPlus } from 'react-icons/fa';
import { MdOutlineLocationOn } from 'react-icons/md';
import { LuLineChart } from 'react-icons/lu';
import { BsPentagon } from 'react-icons/bs';

export default function Sidebar({ onExpand, onDraw }) {
  return (
    <div className="fixed left-0 top-0 h-full w-12 bg-gray-800 flex flex-col items-center py-4 gap-4 text-white">
      <button onClick={onExpand}><FaBars /></button>
      <button onClick={() => onDraw('point')}><FaPlus /><MdOutlineLocationOn /></button>
      <button onClick={() => onDraw('line')}><FaPlus /><LuLineChart /></button>
      <button onClick={() => onDraw('polygon')}><FaPlus /><BsPentagon /></button>
    </div>
  );
}

// src/components/ExpandedSidebar.jsx
import { useState } from 'react';

export default function ExpandedSidebar({ onClose, onToggleType, onListType }) {


  return (
    <div className="fixed right-0 top-0 h-full w-64 bg-gray-100 p-4 shadow-lg">
      <button className="mb-4" onClick={onClose}>❌</button>
      <div className="mt-4">
        <button onClick={() => onListType('list')} className="font-bold">Listele</button>
      </div>
    </div>
  );
}

// src/components/FeaturePopup.jsx
export default function FeaturePopup({ onSave, onCancel }) {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-xl shadow-md z-10">
      <input placeholder="İsim" className="block w-full mb-2 border p-1 rounded" />
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="text-red-500">❌</button>
        <button onClick={onSave} className="text-green-500">✔️</button>
      </div>
    </div>
  );
}


import React, { useState, useRef, useMemo } from 'react';
import { Person } from '../types';
import { getFullName } from '../mockData';

interface TreeViewProps {
  people: Person[];
  onSelect: (person: Person) => void;
}

export const TreeView: React.FC<TreeViewProps> = ({ people, onSelect }) => {
  const [viewState, setViewState] = useState({ x: 400, y: 100, zoom: 0.85 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - viewState.x, y: e.clientY - viewState.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setViewState(prev => ({
      ...prev,
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05;
    setViewState(prev => ({
      ...prev,
      zoom: Math.min(Math.max(0.1, prev.zoom * zoomFactor), 4)
    }));
  };

  const nodes = useMemo(() => {
    const levelMap: Record<string, number> = {};
    
    // 1. Determine Levels
    const findLevel = (id: string, visited = new Set<string>()): number => {
      if (visited.has(id)) return levelMap[id] || 0;
      visited.add(id);
      if (levelMap[id] !== undefined) return levelMap[id];
      
      const person = people.find(p => p.id === id);
      if (!person) return 0;
      
      if (!person.fatherId && !person.motherId) {
        levelMap[id] = 0;
        return 0;
      }
      
      const fLevel = person.fatherId ? findLevel(person.fatherId, visited) : -1;
      const mLevel = person.motherId ? findLevel(person.motherId, visited) : -1;
      const level = Math.max(fLevel, mLevel) + 1;
      levelMap[id] = level;
      return level;
    };

    people.forEach(p => findLevel(p.id));

    // 2. Assign Coordinates based on level counts to avoid overlapping
    const levelCounts: Record<number, number> = {};
    const spacingX = 320;
    const spacingY = 280;

    return people.map((p) => {
      const level = levelMap[p.id] || 0;
      const indexInLevel = levelCounts[level] || 0;
      levelCounts[level] = indexInLevel + 1;

      // Centering logic: offset each level so they grow from a center line
      // (This is basic, but prevents hard overlapping)
      return {
        ...p,
        x: (indexInLevel) * spacingX,
        y: level * spacingY,
      };
    });
  }, [people]);

  const NODE_WIDTH = 192;

  return (
    <div 
      className="relative w-full h-full bg-[#fdfdfd] overflow-hidden cursor-grab active:cursor-grabbing rounded-3xl border border-slate-100"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{ 
          backgroundImage: `radial-gradient(#4f46e5 1px, transparent 1px)`,
          backgroundSize: `${20 * viewState.zoom}px ${20 * viewState.zoom}px`,
          backgroundPosition: `${viewState.x}px ${viewState.y}px`
        }}
      />

      <div 
        className="absolute transition-transform duration-75 origin-center"
        style={{ transform: `translate(${viewState.x}px, ${viewState.y}px) scale(${viewState.zoom})` }}
      >
        <svg width="10000" height="10000" className="pointer-events-none absolute top-0 left-0 overflow-visible">
          <defs>
            <linearGradient id="lineGradFather" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="lineGradMother" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          {nodes.map(p => {
            const father = nodes.find(f => f.id === p.fatherId);
            const mother = nodes.find(m => m.id === p.motherId);
            const spouse = nodes.find(s => s.id === p.spouseId || p.id === s.spouseId);

            const connections = [];

            if (father) {
              connections.push(
                <path 
                  key={`father-${p.id}`}
                  d={`M ${father.x + 96} ${father.y + 110} C ${father.x + 96} ${father.y + 180}, ${p.x + 80} ${p.y - 80}, ${p.x + 80} ${p.y}`}
                  fill="none" 
                  stroke="url(#lineGradFather)" 
                  strokeWidth="3"
                />
              );
            }

            if (mother) {
              connections.push(
                <path 
                  key={`mother-${p.id}`}
                  d={`M ${mother.x + 96} ${mother.y + 110} C ${mother.x + 96} ${mother.y + 180}, ${p.x + 112} ${p.y - 80}, ${p.x + 112} ${p.y}`}
                  fill="none" 
                  stroke="url(#lineGradMother)" 
                  strokeWidth="3"
                />
              );
            }

            if (spouse && p.id < spouse.id) {
              const startX = p.x < spouse.x ? p.x + NODE_WIDTH : p.x;
              const endX = p.x < spouse.x ? spouse.x : spouse.x + NODE_WIDTH;
              
              connections.push(
                <path 
                  key={`spouse-${p.id}`}
                  d={`M ${startX} ${p.y + 60} L ${endX} ${spouse.y + 60}`}
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="4"
                  strokeDasharray="8 4"
                  opacity="0.4"
                />
              );
            }

            return connections;
          })}
        </svg>

        {nodes.map(person => (
          <div
            key={person.id}
            onClick={(e) => { e.stopPropagation(); onSelect(person); }}
            className="absolute group cursor-pointer transition-all duration-300 hover:scale-105"
            style={{ left: person.x, top: person.y }}
          >
            <div className="relative w-48 bg-white p-4 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 group-hover:border-indigo-400 group-hover:shadow-indigo-100 overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${person.gender === 'Male' ? 'bg-indigo-500' : person.gender === 'Female' ? 'bg-rose-500' : 'bg-slate-500'}`} />
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mb-3 rounded-2xl overflow-hidden shadow-inner bg-slate-100 ring-4 ring-white">
                  <img src={person.photo || `https://ui-avatars.com/api/?name=${getFullName(person)}&background=random`} alt="" className="w-full h-full object-cover" />
                </div>
                <h4 className="text-sm font-black text-slate-800 tracking-tight text-center line-clamp-1">{getFullName(person)}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{(person.currentLocation || person.ancestralHome || '').split(',')[0]}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-6 left-6 flex items-center gap-1 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-2xl">
        <button onClick={() => setViewState(v => ({...v, zoom: Math.min(v.zoom * 1.2, 4)}))} className="p-3 hover:bg-white rounded-xl transition-all"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg></button>
        <div className="w-px h-4 bg-slate-200 mx-1" />
        <button onClick={() => setViewState(v => ({...v, zoom: Math.max(v.zoom * 0.8, 0.1)}))} className="p-3 hover:bg-white rounded-xl transition-all"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 12H4"/></svg></button>
      </div>
      
      <div className="absolute top-6 right-6 bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-400">
        Click a profile to manage roots
      </div>
    </div>
  );
};

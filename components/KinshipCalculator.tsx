
import React, { useState } from 'react';
import { Person, Gender } from '../types';
import { getIndianKinshipTerm } from '../services/geminiService';
import { getFullName } from '../mockData';

interface KinshipCalculatorProps {
  people: Person[];
}

interface PathStep {
  personId: string;
  relation: string;
}

export const KinshipCalculator: React.FC<KinshipCalculatorProps> = ({ people }) => {
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const findPath = (startId: string, endId: string): PathStep[] | null => {
    if (startId === endId) return [];

    const queue: { id: string; path: PathStep[] }[] = [{ id: startId, path: [] }];
    const visited = new Set<string>([startId]);

    while (queue.length > 0) {
      const { id, path } = queue.shift()!;
      const person = people.find(p => p.id === id);
      if (!person) continue;

      // Define potential neighbors
      const neighbors: { id: string; rel: string }[] = [];

      // Parents
      if (person.fatherId) neighbors.push({ id: person.fatherId, rel: 'Father' });
      if (person.motherId) neighbors.push({ id: person.motherId, rel: 'Mother' });
      
      // Spouse
      if (person.spouseId) neighbors.push({ id: person.spouseId, rel: 'Spouse' });
      
      // Children
      people.forEach(p => {
        if (p.fatherId === id || p.motherId === id) {
          neighbors.push({ id: p.id, rel: 'Child' });
        }
      });
      
      // Siblings (Shared parents)
      if (person.fatherId || person.motherId) {
        people.forEach(p => {
          if (p.id !== id && ((person.fatherId && p.fatherId === person.fatherId) || (person.motherId && p.motherId === person.motherId))) {
            neighbors.push({ id: p.id, rel: 'Sibling' });
          }
        });
      }

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.id)) {
          const newPath = [...path, { personId: neighbor.id, relation: neighbor.rel }];
          if (neighbor.id === endId) return newPath;
          visited.add(neighbor.id);
          queue.push({ id: neighbor.id, path: newPath });
        }
      }
    }

    return null;
  };

  const calculate = async () => {
    if (!p1 || !p2) return;
    setIsLoading(true);
    setResult(null);

    const person1 = people.find(p => p.id === p1);
    const person2 = people.find(p => p.id === p2);

    if (!person1 || !person2) {
        setIsLoading(false);
        return;
    }

    const pathSteps = findPath(p1, p2);

    if (!pathSteps) {
      setResult("No direct family connection found in the current database.");
      setIsLoading(false);
      return;
    }

    // Build the path description for Gemini
    let currentPerson = person1;
    let descriptionParts = [getFullName(currentPerson)];

    pathSteps.forEach(step => {
      const nextPerson = people.find(p => p.id === step.personId)!;
      descriptionParts.push(`is the ${step.relation} of ${getFullName(nextPerson)}`);
      currentPerson = nextPerson;
    });

    const fullDescription = descriptionParts.join(' -> ');
    // Add gender context to help Gemini
    const contextPrompt = `Target relationship: How is ${getFullName(person2)} (${person2.gender}) related to ${getFullName(person1)} (${person1.gender})? 
    Path: ${fullDescription}. 
    Please provide the specific Indian (Hindi) kinship term from the perspective of ${getFullName(person1)}.`;

    const term = await getIndianKinshipTerm(contextPrompt);
    
    setResult(term);
    setIsLoading(false);
  };

  return (
    <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-slate-100 max-w-xl mx-auto animate-in fade-in zoom-in-95">
      <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-8 flex items-center gap-4">
        <span className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
        </span>
        Kinship Checker
      </h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">From (Person A)</label>
          <select
            className="w-full rounded-2xl border-slate-200 bg-slate-50 p-4 border transition-all outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={p1}
            onChange={(e) => setP1(e.target.value)}
          >
            <option value="">Select Root Member</option>
            {people.map(p => <option key={p.id} value={p.id}>{getFullName(p)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">To (Person B)</label>
          <select
            className="w-full rounded-2xl border-slate-200 bg-slate-50 p-4 border transition-all outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={p2}
            onChange={(e) => setP2(e.target.value)}
          >
            <option value="">Select Target Member</option>
            {people.map(p => <option key={p.id} value={p.id}>{getFullName(p)}</option>)}
          </select>
        </div>

        <button
          onClick={calculate}
          disabled={isLoading || !p1 || !p2}
          className="w-full py-5 bg-slate-900 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-300 hover:bg-black disabled:bg-slate-200 transition-all flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Connection...</span>
            </div>
          ) : 'Calculate Relationship'}
        </button>

        {result && (
          <div className="mt-8 p-8 bg-indigo-50/50 border border-indigo-100 rounded-[32px] animate-in slide-in-from-bottom-4 duration-500">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3 text-center">Result</p>
            <p className="text-indigo-900 font-black text-center text-xl tracking-tight leading-tight">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
};

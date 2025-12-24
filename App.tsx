
import React, { useState, useEffect } from 'react';
import { Person } from './types';
import { getFullName } from './mockData';
import { TreeView } from './components/TreeView';
import { AddPersonForm } from './components/AddPersonForm';
import { KinshipCalculator } from './components/KinshipCalculator';
import { Icons } from './constants';
import { db } from './services/databaseService';

const App: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [connectionContext, setConnectionContext] = useState<Person | null>(null);
  const [activeTab, setActiveTab] = useState<'tree' | 'add' | 'calc'>('tree');
  const [showToast, setShowToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Initial Load from Shared Source
  useEffect(() => {
    const init = async () => {
      const data = await db.loadLineage();
      setPeople(data);
      setIsLoading(false);
    };
    init();
  }, []);

  // Shared Sync Trigger
  useEffect(() => {
    if (!isLoading) {
      db.saveLineage(people);
    }
  }, [people, isLoading]);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleSavePerson = (person: Person) => {
    setPeople(prevPeople => {
      const index = prevPeople.findIndex(p => p.id === person.id);
      let newPeople = [...prevPeople];
      
      if (index !== -1) {
        newPeople[index] = person;
      } else {
        newPeople.push(person);
      }

      // Link Spouse back automatically
      if (person.spouseId) {
        const spouseIndex = newPeople.findIndex(p => p.id === person.spouseId);
        if (spouseIndex !== -1 && newPeople[spouseIndex].spouseId !== person.id) {
          newPeople[spouseIndex] = { ...newPeople[spouseIndex], spouseId: person.id };
        }
      }

      return newPeople;
    });

    setEditingPerson(null);
    setConnectionContext(null);
    setSelectedPerson(null);
    setActiveTab('tree');
    triggerToast('Roots updated across the community');
  };

  const handleEditMemorial = (person: Person) => {
    setEditingPerson({ ...person });
    setConnectionContext(null);
    setSelectedPerson(null);
    setActiveTab('add');
  };

  const handleConnectRelative = (person: Person) => {
    setEditingPerson(null);
    setConnectionContext({ ...person });
    setSelectedPerson(null);
    setActiveTab('add');
  };

  if (isLoading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Connecting to Lineage...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fcfdfe] text-slate-900 overflow-hidden font-sans">
      {/* Shared Navigation */}
      <nav className="w-full md:w-24 bg-white border-b md:border-b-0 md:border-r border-slate-100 flex flex-row md:flex-col items-center py-4 md:py-10 gap-4 md:gap-8 px-6 md:px-0 sticky top-0 z-20">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 mb-0 md:mb-8">
          <span className="text-white font-black text-xl">R</span>
        </div>
        
        <div className="flex flex-row md:flex-col gap-2 flex-1 items-center">
          {[
            { id: 'tree', icon: <Icons.Person />, label: 'Community Tree' },
            { id: 'add', icon: <Icons.Plus />, label: 'Add Ancestor' },
            { id: 'calc', icon: <Icons.Calculator />, label: 'Find Kinship' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id !== 'add') {
                  setEditingPerson(null);
                  setConnectionContext(null);
                }
              }}
              className={`group relative p-4 rounded-2xl transition-all duration-300 ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-50/50' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-50'}`}
              title={tab.label}
            >
              {tab.icon}
              {activeTab === tab.id && <div className="hidden md:block absolute -right-[13px] top-1/2 -translate-y-1/2 w-1.5 h-6 bg-indigo-600 rounded-l-full" />}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 flex flex-col min-h-0 relative">
        <header className="px-8 py-6 flex justify-between items-center z-10 backdrop-blur-sm bg-white/50 border-b border-slate-50">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">CommunityRoots</h1>
            <p className="text-sm font-semibold text-indigo-500/80 uppercase tracking-widest">Shared Family Heritage</p>
          </div>
          
          <div className="hidden lg:flex items-center gap-4">
            <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync Active
            </div>
            <div className="bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Profiles:</span>
              <span className="text-sm font-black text-indigo-600">{people.length}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto px-8 pb-8">
          {activeTab === 'tree' && <TreeView people={people} onSelect={setSelectedPerson} />}
          
          {activeTab === 'add' && (
            <div className="py-4">
              <AddPersonForm 
                onSave={handleSavePerson} 
                existingPeople={people} 
                initialData={editingPerson}
                connectionContext={connectionContext}
                onCancel={() => setActiveTab('tree')}
              />
            </div>
          )}

          {activeTab === 'calc' && <div className="py-10"><KinshipCalculator people={people} /></div>}
        </div>

        {showToast && (
          <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 rounded-[24px] shadow-2xl z-[100] animate-in slide-in-from-bottom-10 flex items-center gap-4 ${showToast.type === 'success' ? 'bg-slate-900 text-white' : 'bg-rose-600 text-white'}`}>
            <span className="text-xs font-black uppercase tracking-widest">{showToast.message}</span>
          </div>
        )}

        {/* Selected Person Details View */}
        {selectedPerson && (
          <>
            <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-30" onClick={() => setSelectedPerson(null)} />
            <div className="fixed top-0 right-0 bottom-0 w-full md:w-[500px] bg-white shadow-[-30px_0_80px_-15px_rgba(0,0,0,0.15)] z-40 p-12 animate-in slide-in-from-right duration-500 overflow-y-auto border-l border-slate-50">
              <button onClick={() => setSelectedPerson(null)} className="absolute top-10 right-10 p-3 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              
              <div className="mt-8">
                <div className="relative inline-block mb-12">
                  <div className="w-44 h-44 rounded-[56px] overflow-hidden shadow-2xl ring-[16px] ring-indigo-50/40">
                    <img src={selectedPerson.photo || `https://ui-avatars.com/api/?name=${getFullName(selectedPerson)}&background=random`} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>

                <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-3 leading-tight">{getFullName(selectedPerson)}</h2>
                <div className="flex flex-wrap gap-2 mb-10">
                  <span className="px-5 py-2 bg-indigo-50 text-indigo-600 text-[11px] font-black rounded-full uppercase tracking-widest">{selectedPerson.profession || 'Community Member'}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-x-10 gap-y-10 mb-12 border-t border-slate-50 pt-10">
                  <div><p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Ancestry Origin</p><p className="font-bold text-slate-800 text-base">{selectedPerson.ancestralHome || 'Legacy unrecorded'}</p></div>
                  <div><p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Heritage Clan</p><p className="font-bold text-slate-800 text-base">{selectedPerson.gotra || 'Gotra unknown'}</p></div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <button onClick={() => handleConnectRelative(selectedPerson)} className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-4">
                    <Icons.Plus /> <span>Link Relatives</span>
                  </button>
                  <button onClick={() => handleEditMemorial(selectedPerson)} className="w-full py-6 bg-white border-2 border-slate-100 text-slate-500 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-50 transition-all">
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;

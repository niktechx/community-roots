
import React, { useState, useEffect } from 'react';
import { Person, Gender } from '../types';
import { resolveEntity } from '../services/geminiService';
import { getFullName } from '../mockData';

interface AddPersonFormProps {
  onSave: (person: Person) => void;
  existingPeople: Person[];
  initialData?: Person | null;
  connectionContext?: Person | null;
  onCancel?: () => void;
}

type RelationshipType = 'child' | 'parent' | 'spouse';

const DEFAULT_FORM_STATE: Partial<Person> = {
  firstName: '',
  middleName: '',
  lastName: '',
  gender: Gender.MALE,
  dob: '',
  currentLocation: '',
  placeOfBirth: '',
  ancestralHome: '',
  gotra: '',
  profession: '',
  bio: '',
  isLiving: true,
  fatherId: '',
  motherId: '',
  spouseId: ''
};

const inputClass = "w-full rounded-xl border-slate-200 bg-slate-50/50 shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 p-3 border transition-all outline-none text-sm placeholder:text-slate-300";
const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1";
const sectionTitle = "text-xs font-black text-indigo-900 uppercase tracking-[0.2em] mb-4 pb-2 border-b border-indigo-50 flex items-center gap-2";

const NameFields = ({ values, onChange, required = false }: any) => (
  <div className="grid grid-cols-3 gap-3">
    <div>
      <label className={labelClass}>First Name {required && '*'}</label>
      <input
        type="text"
        required={required}
        className={inputClass}
        value={values.firstName || ''}
        onChange={(e) => onChange({ firstName: e.target.value })}
        placeholder="Required"
      />
    </div>
    <div>
      <label className={labelClass}>Middle Name</label>
      <input
        type="text"
        className={inputClass}
        value={values.middleName || ''}
        onChange={(e) => onChange({ middleName: e.target.value })}
        placeholder="Optional"
      />
    </div>
    <div>
      <label className={labelClass}>Last Name {required && '*'}</label>
      <input
        type="text"
        required={required}
        className={inputClass}
        value={values.lastName || ''}
        onChange={(e) => onChange({ lastName: e.target.value })}
        placeholder="Required"
      />
    </div>
  </div>
);

export const AddPersonForm: React.FC<AddPersonFormProps> = ({ onSave, existingPeople, initialData, connectionContext, onCancel }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Person>>(DEFAULT_FORM_STATE);
  const [isChecking, setIsChecking] = useState(false);

  const isEditMode = !!initialData;
  const isConnectMode = !!connectionContext;

  const steps = isEditMode 
    ? ['identity', 'origins', 'narrative'] 
    : isConnectMode 
      ? ['kinship'] 
      : ['identity', 'origins', 'kinship', 'narrative'];

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({ ...initialData });
    } else if (isConnectMode && connectionContext) {
      // In connect mode, we are editing the relationships of the connectionContext person
      setFormData({
        ...connectionContext
      });
    } else {
      setFormData(DEFAULT_FORM_STATE);
    }
    setStep(1);
  }, [initialData, connectionContext, isEditMode, isConnectMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const personToSave: Person = {
      ...formData,
      // If editing or connecting, use the existing ID. Otherwise generate a new one.
      id: (isEditMode || isConnectMode) ? (formData.id || connectionContext?.id || initialData?.id) : (formData.id || Math.random().toString(36).substr(2, 9)),
      isLiving: formData.isLiving ?? true,
    } as Person;
    onSave(personToSave);
  };

  const currentStepKey = steps[step - 1];

  return (
    <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-2xl border border-slate-100 max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
            {isEditMode ? 'Edit Memorial' : isConnectMode ? 'Establish Links' : 'Add Community Root'}
          </h2>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-wider font-bold text-[10px]">
            {isEditMode ? `Step ${step} of ${steps.length}: Updating ${getFullName(initialData!)}` : 
             isConnectMode ? `Updating connections for ${getFullName(connectionContext!)}` : 
             `Step ${step} of ${steps.length}: Preserving new profile`}
          </p>
        </div>
        <div className="flex gap-2 pt-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 w-12 rounded-full transition-all duration-700 ${i + 1 <= step ? 'bg-indigo-600 shadow-sm shadow-indigo-100' : 'bg-slate-100'}`} />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {currentStepKey === 'identity' && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <div className={sectionTitle}>
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Core Identity
            </div>
            <NameFields values={formData} onChange={(d: any) => setFormData({...formData, ...d})} required />
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Gender</label>
                <select className={inputClass} value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as Gender})}>
                  <option value={Gender.MALE}>Male</option>
                  <option value={Gender.FEMALE}>Female</option>
                  <option value={Gender.OTHER}>Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input type="date" className={inputClass} value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
              </div>
            </div>
            <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-[24px] border border-slate-100">
              <input type="checkbox" className="w-6 h-6 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" checked={formData.isLiving} onChange={e => setFormData({...formData, isLiving: e.target.checked})} />
              <div className="flex-1">
                <span className="text-sm font-bold text-slate-800 block">Living Member</span>
                <p className="text-[11px] text-slate-400 font-medium">Privacy protocols will be applied.</p>
              </div>
            </div>
          </div>
        )}

        {currentStepKey === 'origins' && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <div className={sectionTitle}>
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Origins & Roots
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Place of Birth</label>
                <input type="text" className={inputClass} value={formData.placeOfBirth} onChange={e => setFormData({...formData, placeOfBirth: e.target.value})} placeholder="City, State" />
              </div>
              <div>
                <label className={labelClass}>Current Location</label>
                <input type="text" className={inputClass} value={formData.currentLocation} onChange={e => setFormData({...formData, currentLocation: e.target.value})} placeholder="City, Country" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Ancestral Home</label>
                <input type="text" className={inputClass} value={formData.ancestralHome} onChange={e => setFormData({...formData, ancestralHome: e.target.value})} placeholder="Roots origin" />
              </div>
              <div>
                <label className={labelClass}>Gotra</label>
                <input type="text" className={inputClass} value={formData.gotra} onChange={e => setFormData({...formData, gotra: e.target.value})} placeholder="Clan lineage" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Profession</label>
              <input type="text" className={inputClass} value={formData.profession} onChange={e => setFormData({...formData, profession: e.target.value})} placeholder="Career / Legacy work" />
            </div>
          </div>
        )}

        {currentStepKey === 'kinship' && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <div className={sectionTitle}>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Relationship Mapping
            </div>
            <p className="text-xs text-slate-400 font-medium mb-6">Link this profile to parents and spouse to build the community tree.</p>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Father</label>
                <select className={inputClass} value={formData.fatherId} onChange={e => setFormData({...formData, fatherId: e.target.value})}>
                  <option value="">Unknown / Not Listed</option>
                  {existingPeople.filter(p => p.id !== (formData.id || connectionContext?.id) && (p.gender === Gender.MALE || p.gender === Gender.OTHER)).map(p => (
                    <option key={p.id} value={p.id}>{getFullName(p)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Mother</label>
                <select className={inputClass} value={formData.motherId} onChange={e => setFormData({...formData, motherId: e.target.value})}>
                  <option value="">Unknown / Not Listed</option>
                  {existingPeople.filter(p => p.id !== (formData.id || connectionContext?.id) && (p.gender === Gender.FEMALE || p.gender === Gender.OTHER)).map(p => (
                    <option key={p.id} value={p.id}>{getFullName(p)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-5">
              <label className={labelClass}>Spouse</label>
              <select className={inputClass} value={formData.spouseId} onChange={e => setFormData({...formData, spouseId: e.target.value})}>
                <option value="">None / Not Linked</option>
                {existingPeople.filter(p => p.id !== (formData.id || connectionContext?.id)).map(p => (
                  <option key={p.id} value={p.id}>{getFullName(p)}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {currentStepKey === 'narrative' && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <div className={sectionTitle}>
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Legacy Narrative
            </div>
            <div>
              <label className={labelClass}>Memorial Biography</label>
              <textarea className={`${inputClass} h-40 resize-none`} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Describe their life, values, and memories..." />
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-8">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black text-xs rounded-[20px] hover:bg-slate-200 transition-all uppercase tracking-widest">
              Back
            </button>
          ) : (
            <button type="button" onClick={onCancel} className="flex-1 py-4 bg-rose-50 text-rose-600 font-black text-xs rounded-[20px] hover:bg-rose-100 transition-all uppercase tracking-widest">
              Cancel
            </button>
          )}
          {step < steps.length ? (
            <button type="button" onClick={() => setStep(step + 1)} className="flex-[2] py-4 bg-indigo-600 text-white font-black text-xs rounded-[20px] hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all uppercase tracking-widest">
              Continue
            </button>
          ) : (
            <button type="submit" className="flex-[2] py-4 bg-slate-900 text-white font-black text-xs rounded-[20px] hover:bg-black shadow-xl shadow-slate-300 transition-all uppercase tracking-widest">
              {isEditMode ? 'Update Memorial' : isConnectMode ? 'Establish Links' : 'Preserve Root'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

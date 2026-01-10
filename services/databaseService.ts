import { Person } from "../types";
import { INITIAL_PEOPLE } from "../mockData";

/**
 * SHARED DATABASE SERVICE - GitHub Pages Edition
 * 
 * This version uses Google Sheets API for reading lineage data.
 * For a complete implementation:
 * 1. Make your Google Sheet publicly accessible (View access)
 * 2. Use Google Sheets API v4 with your API_KEY
 * 3. For write operations, deploy a Google Apps Script Web App as a CORS proxy
 */

// Get your Sheets ID from the URL: https://docs.google.com/spreadsheets/d/{SHEETS_ID}/edit
const SHEETS_ID = process.env.REACT_APP_SHEETS_ID || 'YOUR_SHEETS_ID';
const API_KEY = process.env.REACT_APP_API_KEY || '';
const RANGE = 'FamilyRoots!A:Z'; // Adjust range as needed

const SHEETS_API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/${RANGE}`;

export const db = {
  // Load the shared community lineage from Google Sheets
  async loadLineage(): Promise<Person[]> {
    try {
      // Try to fetch from Google Sheets first
      if (SHEETS_ID !== 'YOUR_SHEETS_ID' && API_KEY) {
        const response = await fetch(
          `${SHEETS_API_URL}?key=${API_KEY}`
        );
        
        if (response.ok) {
          const data = await response.json();
          const people = parseSheetData(data.values);
          return people.length > 0 ? people : INITIAL_PEOPLE;
        }
      }
      
      // Fallback to localStorage
      const saved = localStorage.getItem('shared_roots_sync');
      if (saved) return JSON.parse(saved);
      
      // Initial bootstrap
      return INITIAL_PEOPLE;
    } catch (e) {
      console.error("Connection lost to Google Sheets database", e);
      // Fallback to localStorage
      const saved = localStorage.getItem('shared_roots_sync');
      return saved ? JSON.parse(saved) : INITIAL_PEOPLE;
    }
  },

  // Sync a change to local storage (for offline support)
  // For production: Deploy a Google Apps Script to handle writes
  async saveLineage(people: Person[]): Promise<void> {
    // Local persistence for now
    localStorage.setItem('shared_roots_sync', JSON.stringify(people));
    
    // In production, you would send to a Google Apps Script endpoint:
    // await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(people)
    // });
  }
};

// Helper function to parse Google Sheets data into Person objects
function parseSheetData(values: any[][]): Person[] {
  if (!values || values.length < 2) return []; // Need header row
  
  const headers = values[0];
  const people: Person[] = [];
  
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const person: Person = {
      id: row[0] || `person-${i}`,
      firstName: row[1] || '',
      lastName: row[2] || '',
      gender: row[3] as any || 'not-specified',
      ancestralHome: row[4] || '',
      gotra: row[5] || '',
      profession: row[6] || '',
      parentId: row[7] || null,
      spouseId: row[8] || null,
      photo: row[9] || null,
    };
    
    if (person.firstName || person.lastName) {
      people.push(person);
    }
  }
  
  return people;
}

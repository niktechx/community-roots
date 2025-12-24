
import { Person } from "../types";
import { INITIAL_PEOPLE } from "../mockData";

/**
 * SHARED DATABASE SERVICE
 * 
 * To make this work for your whole family:
 * 1. Deploy a simple "Backend" (e.g. Vercel Function or Cloudflare Worker).
 * 2. This backend will act as a bridge to your Neo4j AuraDB.
 * 3. Replace 'API_ENDPOINT' with your deployed URL.
 */
const API_ENDPOINT = '/api/heritage'; // Placeholder for your future serverless API

export const db = {
  // Load the shared community lineage from the server
  async loadLineage(): Promise<Person[]> {
    try {
      // For now, we use localStorage as a fallback, but in production,
      // this would be: const res = await fetch(API_ENDPOINT); return res.json();
      const saved = localStorage.getItem('shared_roots_sync');
      if (saved) return JSON.parse(saved);
      
      // Initial bootstrap
      return INITIAL_PEOPLE;
    } catch (e) {
      console.error("Connection lost to community database", e);
      return INITIAL_PEOPLE;
    }
  },

  // Sync a change to the shared server
  async saveLineage(people: Person[]): Promise<void> {
    // In your live app, you would send a POST request to your API:
    /*
    await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(people)
    });
    */
    
    // For the preview, we maintain local persistence that mimics a cloud sync
    localStorage.setItem('shared_roots_sync', JSON.stringify(people));
  }
};

import { Person } from "../types";
import { INITIAL_PEOPLE } from "../mockData";

/**
 * SHARED DATABASE SERVICE
 * 
 * Simple localStorage-based database for GitHub Pages compatibility.
 * Automatically syncs data across browser tabs.
 */

export const db = {
  // Load the shared community lineage
  async loadLineage(): Promise<Person[]> {
    try {
      const saved = localStorage.getItem('shared_roots_sync');
      if (saved) {
        return JSON.parse(saved);
      }
      // Bootstrap with initial data on first load
      return INITIAL_PEOPLE;
    } catch (e) {
      console.error("Error loading lineage", e);
      return INITIAL_PEOPLE;
    }
  },

  // Save changes to local storage (automatically synced across tabs)
  async saveLineage(people: Person[]): Promise<void> {
    try {
      localStorage.setItem('shared_roots_sync', JSON.stringify(people));
      console.log('✓ Lineage saved and synced');
    } catch (e) {
      console.error("Error saving lineage", e);
    }
  }
};

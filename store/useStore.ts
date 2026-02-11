import { create } from 'zustand';

export type StructureType = 'pillar' | 'obelisk' | 'node';

export interface Structure {
  id: string;
  x: number;
  y: number;
  type: StructureType;
  value: number;
  ownerId: string;
}

interface GameState {
  structures: Structure[];
  faithPool: number;
  era: number;
  filter: StructureType | 'all';
  addStructure: (structure: Omit<Structure, 'id'>) => void;
  incrementEra: () => void;
  setFilter: (filter: StructureType | 'all') => void;
}

export const useStore = create<GameState>((set) => ({
  structures: [],
  faithPool: 0,
  era: 1,
  filter: 'all',
  addStructure: (structure) =>
    set((state) => ({
      structures: [
        ...state.structures,
        { ...structure, id: Math.random().toString(36).substr(2, 9) },
      ],
      faithPool: state.faithPool + structure.value,
    })),
  incrementEra: () => set((state) => ({ era: state.era + 1 })),
  setFilter: (filter) => set({ filter }),
}));

import { create } from 'zustand';
import type { UserDto } from '@/types';

interface AuthStore {
  user: UserDto | null;
  setUser: (user: UserDto | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

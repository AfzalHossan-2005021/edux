/**
 * User Store - Zustand state management for user authentication and profile
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (userData) => set({
        user: userData,
        isAuthenticated: !!userData,
        error: null,
      }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await response.json();
          
          if (response.ok && data.u_id) {
            set({
              user: data,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return { success: true, data };
          } else {
            set({ isLoading: false, error: data.message || 'Login failed' });
            return { success: false, error: data.message };
          }
        } catch (error) {
          set({ isLoading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
        // Clear any cookies via API
        fetch('/api/logout', { method: 'POST' }).catch(() => {});
      },

      updateProfile: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),

      clearError: () => set({ error: null }),

      // Selectors
      getUserId: () => get().user?.u_id || get().user?.s_id || get().user?.i_id,
      getStudentId: () => get().user?.s_id,
      getInstructorId: () => get().user?.i_id,
      isStudent: () => !!get().user?.s_id,
      isInstructor: () => !!get().user?.i_id,
    }),
    {
      name: 'edux-user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useUserStore;

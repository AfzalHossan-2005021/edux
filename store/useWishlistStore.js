/**
 * Wishlist Store - Zustand state management for wishlist
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      // State
      wishlist: [],
      isLoading: false,

      // Actions
      fetchWishlist: async (userId) => {
        if (!userId) return;
        set({ isLoading: true });
        try {
          const response = await fetch('/api/wishlist/get_items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ u_id: userId }),
          });
          const data = await response.json();
          set({
            wishlist: Array.isArray(data) ? data : [],
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
        }
      },

      addToWishlist: async (userId, courseId) => {
        try {
          const response = await fetch('/api/wishlist/get_items/add_item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ u_id: userId, c_id: courseId }),
          });
          
          if (response.ok) {
            // Optimistic update
            set((state) => ({
              wishlist: [...state.wishlist, { c_id: courseId }],
            }));
            // Refresh from server
            get().fetchWishlist(userId);
            return { success: true };
          }
          return { success: false };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      removeFromWishlist: async (userId, courseId) => {
        try {
          const response = await fetch('/api/wishlist/get_items/remove_item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ u_id: userId, c_id: courseId }),
          });
          
          if (response.ok) {
            // Optimistic update
            set((state) => ({
              wishlist: state.wishlist.filter((item) => item.c_id !== courseId),
            }));
            return { success: true };
          }
          return { success: false };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      isInWishlist: (courseId) => {
        return get().wishlist.some((item) => item.c_id === courseId);
      },

      clearWishlist: () => set({ wishlist: [] }),
    }),
    {
      name: 'edux-wishlist-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ wishlist: state.wishlist }),
    }
  )
);

export default useWishlistStore;

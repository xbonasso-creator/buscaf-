/**
 * collectionsStore — listas de guardados organizadas por el usuario
 * Persistidas localmente con AsyncStorage via zustand/middleware persist.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Collection = {
  id: string;
  name: string;
  cafeIds: string[];
  createdAt: number;
};

type CollectionsStore = {
  collections: Collection[];
  createCollection: (name: string) => string;
  deleteCollection: (id: string) => void;
  renameCollection: (id: string, name: string) => void;
  addCafe: (collectionId: string, cafeId: string) => void;
  removeCafe: (collectionId: string, cafeId: string) => void;
  isInCollection: (collectionId: string, cafeId: string) => boolean;
  getCollection: (id: string) => Collection | undefined;
  collectionsForCafe: (cafeId: string) => Collection[];
};

export const useCollectionsStore = create<CollectionsStore>()(
  persist(
    (set, get) => ({
      collections: [],

      createCollection: (name) => {
        const id = Date.now().toString();
        set(s => ({
          collections: [...s.collections, { id, name, cafeIds: [], createdAt: Date.now() }],
        }));
        return id;
      },

      deleteCollection: (id) => {
        set(s => ({ collections: s.collections.filter(c => c.id !== id) }));
      },

      renameCollection: (id, name) => {
        set(s => ({
          collections: s.collections.map(c => c.id === id ? { ...c, name } : c),
        }));
      },

      addCafe: (collectionId, cafeId) => {
        set(s => ({
          collections: s.collections.map(c =>
            c.id === collectionId && !c.cafeIds.includes(cafeId)
              ? { ...c, cafeIds: [...c.cafeIds, cafeId] }
              : c
          ),
        }));
      },

      removeCafe: (collectionId, cafeId) => {
        set(s => ({
          collections: s.collections.map(c =>
            c.id === collectionId
              ? { ...c, cafeIds: c.cafeIds.filter(id => id !== cafeId) }
              : c
          ),
        }));
      },

      isInCollection: (collectionId, cafeId) => {
        const col = get().collections.find(c => c.id === collectionId);
        return col ? col.cafeIds.includes(cafeId) : false;
      },

      getCollection: (id) => get().collections.find(c => c.id === id),

      collectionsForCafe: (cafeId) =>
        get().collections.filter(c => c.cafeIds.includes(cafeId)),
    }),
    {
      name: "buscafe:collections",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

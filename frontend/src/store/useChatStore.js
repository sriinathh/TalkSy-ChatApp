import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const { authUser } = useAuthStore.getState();
      
      // Only fetch if user is logged in
      if (!authUser) {
        console.warn("[CHAT] User not authenticated, skipping getUsers");
        set({ users: [], isUsersLoading: false });
        return;
      }
      
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      // If unauthorized, user is not logged in — avoid noisy toast messages.
      if (error?.response?.status === 401) {
        console.warn("[CHAT] Unauthorized access to /messages/users - user needs to login");
        set({ users: [] });
      } else if (error?.code === 'ECONNABORTED') {
        console.warn("[CHAT] Request timeout loading users");
        toast.error("Request timeout - please try again");
      } else {
        console.error("[CHAT] Error loading users:", error.message);
        toast.error(error.response?.data?.message || "Could not load users");
      }
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const { authUser } = useAuthStore.getState();
      
      if (!authUser) {
        console.warn("[CHAT] User not authenticated, skipping getMessages");
        set({ messages: [], isMessagesLoading: false });
        return;
      }
      
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      if (error?.response?.status === 401) {
        console.warn("[CHAT] Unauthorized access to messages");
        set({ messages: [] });
      } else if (error?.code === 'ECONNABORTED') {
        console.warn("[CHAT] Request timeout loading messages");
        toast.error("Request timeout - please try again");
      } else {
        console.error("[CHAT] Error loading messages:", error.message);
        toast.error(error.response?.data?.message || "Could not load messages");
      }
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const { authUser } = useAuthStore.getState();
      
      if (!authUser) {
        toast.error("You must be logged in to send messages");
        return;
      }
      
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      if (error?.response?.status === 401) {
        toast.error("Session expired - please login again");
      } else if (error?.code === 'ECONNABORTED') {
        toast.error("Request timeout - please try again");
      } else {
        console.error("[CHAT] Error sending message:", error.message);
        toast.error(error.response?.data?.message || "Could not send message");
      }
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));

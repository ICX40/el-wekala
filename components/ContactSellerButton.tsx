"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/components/AuthProvider';
import { MessageSquare, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ContactSellerButtonProps {
  sellerId: string;
  sellerName: string;
}

export default function ContactSellerButton({ sellerId, sellerName }: ContactSellerButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleContactSeller = async () => {
    // 1. Check if user is logged in
    if (!user) {
      toast.error("Please login to contact the seller.");
      router.push('/login');
      return;
    }

    // 2. Prevent crashing if sellerId is missing from old products
    if (!sellerId) {
      toast.error("Seller information is missing for this product.");
      return;
    }

    // 3. Prevent user from messaging themselves
    if (user.uid === sellerId) {
      toast.error("You cannot message your own store.");
      return;
    }

    setIsLoading(true);

    try {
      const chatsRef = collection(db, 'chats');
      
      // 4. Search for an existing chat where the current user is a participant
      const q = query(
        chatsRef, 
        where('participants', 'array-contains', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      let existingChatId = null;

      // Filter locally to find if the specific seller is the OTHER participant
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants && data.participants.includes(sellerId) && data.type !== 'support') {
          existingChatId = doc.id;
        }
      });

      // 5. If chat exists, redirect. If not, create a new one.
      if (existingChatId) {
        router.push('/account/messages');
      } else {
        const chatData = {
          participants: [user.uid, sellerId],
          participantNames: {
            [user.uid]: user.displayName || 'Customer',
            [sellerId]: sellerName || 'Seller'
          },
          type: 'direct',
          lastMessage: 'New conversation started',
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        };

        await addDoc(chatsRef, chatData);
        toast.success("Chat started successfully!");
        router.push('/account/messages');
      }
    } catch (error: any) {
      console.error("Error creating chat:", error);
      // Display the actual error message for better debugging if it fails again
      toast.error(`Failed to start chat: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleContactSeller}
      disabled={isLoading || !sellerId}
      className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 w-full md:w-auto border border-blue-200"
    >
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5" />}
      تواصل مع التاجر
    </button>
  );
}
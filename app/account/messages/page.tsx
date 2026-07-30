"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { db, storage } from '@/firebase/config';
import { 
  collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, orderBy 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { MessageSquare, Search, Send, Info, Image as ImageIcon, Smile, X, Loader2, Headset, ArrowRight, ChevronRight } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CustomerMessagesPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch all chats for the Customer
  useEffect(() => {
    if (!user) return;

    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedChats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => b.updatedAt?.toMillis() - a.updatedAt?.toMillis());
      
      setChats(fetchedChats);
      setIsLoadingChats(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Fetch messages for the active chat in real-time
  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(db, `chats/${activeChat.id}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(fetchedMessages);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onEmojiClick = (emojiObject: any) => {
    setNewMessage(prevInput => prevInput + emojiObject.emoji);
  };

  const startSupportChat = async () => {
    if (!user) return;
    try {
      const existingChat = chats.find(c => c.type === 'support');
      if (existingChat) {
        setActiveChat(existingChat);
        return;
      }

      const chatData = {
        participants: [user.uid, 'SUPPORT_TEAM'],
        participantNames: {
          [user.uid]: user.displayName || 'Customer',
          'SUPPORT_TEAM': 'Technical Support'
        },
        type: 'support',
        lastMessage: 'Chat started',
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'chats'), chatData);
      setActiveChat({ id: docRef.id, ...chatData });
      toast.success("Started a new conversation with Support");
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Failed to start chat");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !activeChat || !user) return;

    setIsSending(true);
    let imageUrl = '';

    try {
      if (selectedImage) {
        const imageRef = ref(storage, `chat_images/${activeChat.id}/${Date.now()}_${selectedImage.name}`);
        const uploadTask = await uploadBytesResumable(imageRef, selectedImage);
        imageUrl = await getDownloadURL(uploadTask.ref);
      }

      const messageData = {
        senderId: user.uid,
        text: newMessage.trim(),
        imageUrl: imageUrl,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, `chats/${activeChat.id}/messages`), messageData);

      await updateDoc(doc(db, 'chats', activeChat.id), {
        lastMessage: imageUrl ? '📷 Image' : newMessage.trim(),
        updatedAt: serverTimestamp(),
      });

      setNewMessage('');
      removeImage();
      setShowEmojiPicker(false);
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const getOtherParticipantName = (chat: any) => {
    if (!chat || !user) return 'Unknown';
    const otherId = chat.participants.find((id: string) => id !== user.uid);
    return chat.participantNames?.[otherId] || (otherId === 'SUPPORT_TEAM' ? 'الدعم الفني' : 'تاجر');
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)] flex flex-col pt-4 md:pt-8 px-2 md:px-4" dir="rtl">
      
      {/* Header section - hides on mobile when chat is active */}
      <div className={`flex items-center justify-between ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">رسائلي</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">تواصل مع التجار والدعم الفني.</p>
        </div>
        <div className="flex gap-2 md:gap-3">
          <button 
            onClick={startSupportChat}
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold px-3 md:px-4 py-2 rounded-xl flex items-center gap-1.5 md:gap-2 transition-colors border border-blue-200 text-sm md:text-base"
          >
            <Headset className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">مراسلة الدعم</span>
            <span className="sm:hidden">الدعم</span>
          </button>
          <Link href="/account" className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold px-3 md:px-4 py-2 rounded-xl flex items-center gap-1.5 md:gap-2 transition-colors text-sm md:text-base">
            <ArrowRight className="w-4 h-4" />
            <span className="hidden sm:inline">حسابي</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-1 relative">
        
        {/* Chat List Sidebar */}
        <div className={`w-full md:w-1/3 border-l border-slate-100 flex flex-col bg-slate-50/50 absolute md:relative inset-0 z-10 transition-transform ${activeChat ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
          <div className="p-3 md:p-4 border-b border-slate-100 bg-white">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="ابحث في رسائلك..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pr-9 pl-4 py-2.5 md:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoadingChats ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : chats.length === 0 ? (
              <div className="text-center p-8 text-slate-400 text-sm">
                لا توجد رسائل حالياً
              </div>
            ) : (
              chats.map(chat => (
                <button 
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  className={`w-full text-right p-3 md:p-4 border-b border-slate-100 hover:bg-slate-100 transition-colors flex items-start gap-3 ${activeChat?.id === chat.id ? 'bg-blue-50 md:border-l-4 md:border-l-blue-600' : 'md:border-l-4 md:border-l-transparent'}`}
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full shrink-0 flex items-center justify-center font-bold text-white text-lg ${chat.type === 'support' ? 'bg-purple-600' : 'bg-slate-800'}`}>
                    {getOtherParticipantName(chat).charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-900 text-sm md:text-base truncate">
                        {getOtherParticipantName(chat)}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-slate-500 truncate">{chat.lastMessage}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`w-full md:w-2/3 flex flex-col bg-white absolute md:relative inset-0 z-20 transition-transform ${activeChat ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-3 md:p-4 border-b border-slate-100 flex justify-between items-center bg-white z-10 shadow-sm md:shadow-none">
                <div className="flex items-center gap-2 md:gap-3">
                  <button 
                    onClick={() => setActiveChat(null)}
                    className="md:hidden p-2 -mr-2 text-slate-500 hover:text-slate-900"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-white ${activeChat.type === 'support' ? 'bg-purple-600' : 'bg-slate-800'}`}>
                    {getOtherParticipantName(activeChat).charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm md:text-base">{getOtherParticipantName(activeChat)}</h3>
                    <p className="text-[10px] md:text-xs text-slate-500">{activeChat.type === 'support' ? 'فريق الدعم متاح لمساعدتك' : 'تاجر معتمد'}</p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600 p-2">
                  <Info className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-50/50 flex flex-col gap-3 md:gap-4">
                {messages.length === 0 ? (
                  <div className="text-center text-xs md:text-sm text-slate-400 my-4">بداية المحادثة</div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user?.uid;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-3 text-sm shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'}`}>
                          {msg.imageUrl && (
                            <img src={msg.imageUrl} alt="Attachment" className="rounded-xl mb-2 max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(msg.imageUrl)} />
                          )}
                          {msg.text && <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Overlays */}
              {showEmojiPicker && (
                <div className="absolute bottom-20 md:bottom-24 left-2 md:left-4 z-50 shadow-xl rounded-xl scale-90 origin-bottom-left md:scale-100">
                  <EmojiPicker onEmojiClick={onEmojiClick} searchDisabled />
                </div>
              )}

              {imagePreview && (
                <div className="absolute bottom-16 md:bottom-20 left-2 md:left-4 bg-white p-2 rounded-xl shadow-lg border border-slate-200 z-40">
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="h-20 w-auto md:h-24 rounded-lg object-cover" />
                    <button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 md:p-4 border-t border-slate-100 bg-white">
                <div className="flex items-end gap-1.5 md:gap-2">
                  <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2.5 md:p-3 text-slate-400 hover:text-yellow-500 transition-colors bg-slate-50 rounded-xl border border-slate-200 shrink-0">
                    <Smile className="w-5 h-5" />
                  </button>
                  
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 md:p-3 text-slate-400 hover:text-blue-500 transition-colors bg-slate-50 rounded-xl border border-slate-200 shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />

                  <textarea 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="اكتب رسالتك..." 
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 resize-none max-h-24 md:max-h-32 min-h-[44px] md:min-h-[48px]"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  
                  <button 
                    type="submit" 
                    disabled={isSending || (!newMessage.trim() && !selectedImage)}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white w-11 h-[44px] md:w-12 md:h-[48px] rounded-xl flex items-center justify-center transition-colors shrink-0"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4 md:w-5 md:h-5 rotate-180" />}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="hidden md:flex flex-1 flex-col items-center justify-center text-slate-400">
              <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
              <p className="font-medium">اختر محادثة أو تواصل مع الدعم الفني</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
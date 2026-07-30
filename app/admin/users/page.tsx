"use client";

import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { User as AppUser, Role } from '@/types';
import { Loader2, Search, Users, ShieldAlert, Trash2, ShieldCheck, UserCircle } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const fetchedUsers: AppUser[] = [];
        
        querySnapshot.forEach((doc) => {
          fetchedUsers.push({ uid: doc.id, ...doc.data() } as AppUser);
        });

        // Sort by creation date (newest first)
        fetchedUsers.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle Search Filtering
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = users.filter(
        u => 
          u.displayName?.toLowerCase().includes(lowercasedTerm) || 
          u.email?.toLowerCase().includes(lowercasedTerm)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    if (!window.confirm(`هل أنت متأكد من تغيير صلاحية هذا المستخدم إلى ${newRole}؟`)) return;

    setUpdatingId(userId);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date().toISOString()
      });
      
      const updatedUsers = users.map(u => 
        u.uid === userId ? { ...u, role: newRole } : u
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("حدث خطأ أثناء محاولة تحديث صلاحية المستخدم.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("تحذير: سيتم حذف بيانات هذا المستخدم بالكامل من قاعدة البيانات. هل تريد الاستمرار؟")) return;

    setUpdatingId(userId);
    try {
      // Note: This only deletes the Firestore document. Deleting from Firebase Auth requires Cloud Functions or Admin SDK.
      await deleteDoc(doc(db, "users", userId));
      
      const updatedUsers = users.filter(u => u.uid !== userId);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("حدث خطأ أثناء محاولة حذف المستخدم.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case 'Admin': return 'bg-error/10 text-error';
      case 'Seller': return 'bg-primary/10 text-primary';
      case 'Support': return 'bg-warning/10 text-warning';
      case 'Customer':
      default: return 'bg-success/10 text-success';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">جاري تحميل بيانات المستخدمين...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة المستخدمين</h1>
          <p className="text-muted-foreground mt-1">عرض، وتعديل صلاحيات، وحذف الحسابات المسجلة في المنصة.</p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <Users className="w-5 h-5" />
          {filteredUsers.length} مستخدم
        </div>
      </div>

      <div className="bg-surface p-4 rounded-xl border border-border shadow-sm flex items-center">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="ابحث بالاسم أو البريد الإلكتروني..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <UserCircle className="w-16 h-16 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">لا توجد نتائج</h3>
            <p className="text-muted-foreground text-sm">
              لم نتمكن من العثور على مستخدم يطابق بيانات البحث.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-foreground">المستخدم</th>
                  <th className="px-6 py-4 text-sm font-semibold text-foreground">البريد الإلكتروني</th>
                  <th className="px-6 py-4 text-sm font-semibold text-foreground">الصلاحية الحالية</th>
                  <th className="px-6 py-4 text-sm font-semibold text-foreground">تغيير الصلاحية</th>
                  <th className="px-6 py-4 text-sm font-semibold text-foreground">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((u) => {
                  return (
                    <tr key={u.uid} className="hover:bg-muted/30 transition-colors">
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                            {u.displayName ? u.displayName.charAt(0).toUpperCase() : <UserCircle className="w-6 h-6" />}
                          </div>
                          <span className="font-bold text-foreground">{u.displayName || "بدون اسم"}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">{u.email}</span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(u.role)}`}>
                          {u.role === 'Admin' && <ShieldAlert className="w-3 h-3 inline ml-1" />}
                          {u.role === 'Support' && <ShieldCheck className="w-3 h-3 inline ml-1" />}
                          {u.role}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select 
                            className="bg-background border border-border text-foreground text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.uid, e.target.value as Role)}
                            disabled={updatingId === u.uid}
                          >
                            <option value="Customer">Customer (عميل)</option>
                            <option value="Seller">Seller (تاجر)</option>
                            <option value="Support">Support (دعم فني)</option>
                            <option value="Admin">Admin (مدير)</option>
                          </select>
                          {updatingId === u.uid && <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleDeleteUser(u.uid)}
                          disabled={updatingId === u.uid}
                          className="p-2 text-muted-foreground hover:text-error hover:bg-error/10 rounded-md transition-colors disabled:opacity-50"
                          title="حذف المستخدم"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
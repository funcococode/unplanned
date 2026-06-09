'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { Camera, Loader2, Check, Plus, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { TravelStyle, TRAVEL_STYLE_LABELS } from '@/types';
import type { UserDto } from '@/types';
import { apiClient } from '@/lib/api-client';

const COMMON_LANGUAGES = [
  'English', 'Hindi', 'Spanish', 'French', 'German', 'Mandarin',
  'Japanese', 'Portuguese', 'Arabic', 'Russian', 'Italian', 'Korean',
  'Bengali', 'Gujarati', 'Marathi', 'Tamil', 'Telugu', 'Kannada',
];

interface FormValues {
  username: string;
  bio: string;
  city: string;
  country: string;
  travelStyle: string;
  instagram: string;
  phone: string;
}

export function EditProfileForm({ user }: { user: UserDto | null }) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.image ?? null);
  const [languages, setLanguages] = useState<string[]>((user as any)?.languages ?? []);
  const [langInput, setLangInput] = useState('');

  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      username:    user?.username    ?? '',
      bio:         user?.bio         ?? '',
      city:        user?.city        ?? '',
      country:     user?.country     ?? '',
      travelStyle: user?.travelStyle ?? '',
      instagram:   (user as any)?.instagram ?? '',
      phone:       (user as any)?.phone     ?? '',
    },
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd, credentials: 'include' });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json() as { url: string };
      setAvatarUrl(data.url);
      await apiClient.patch('/users/me', { image: data.url });
    } catch { setError('Image upload failed'); }
    finally { setUploading(false); }
  };

  const addLanguage = (lang: string) => {
    const t = lang.trim();
    if (t && !languages.includes(t)) setLanguages((p) => [...p, t]);
    setLangInput('');
  };
  const removeLanguage = (lang: string) => setLanguages((p) => p.filter((l) => l !== lang));

  const onSubmit = async (data: FormValues) => {
    setSaving(true); setError(null);
    try {
      await apiClient.patch('/users/me', { ...data, languages });
      // Force the JWT to re-read username from DB so navbar updates immediately
      await updateSession();
      setSaved(true);
      const dest = data.username || user?.username;
      setTimeout(() => router.push(dest ? `/profile/${dest}` : '/dashboard'), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sav
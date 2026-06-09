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
    } catch {
      setError('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const addLanguage = (lang: string) => {
    const t = lang.trim();
    if (t && !languages.includes(t)) setLanguages((p) => [...p, t]);
    setLangInput('');
  };
  const removeLanguage = (lang: string) => setLanguages((p) => p.filter((l) => l !== lang));

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    setError(null);
    try {
      await apiClient.patch('/users/me', { ...data, languages });
      await updateSession();
      setSaved(true);
      const dest = data.username || user?.username;
      setTimeout(() => router.push(dest ? `/profile/${dest}` : '/dashboard'), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      setSaving(false);
    }
  };

  const cls  = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white';
  const lbl  = 'block text-sm font-medium text-gray-700 mb-1.5';
  const card = 'bg-white rounded-2xl border border-gray-100 p-6 space-y-5';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Photo */}
      <div className={card}>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Photo</h2>
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            {avatarUrl
              ? <Image src={avatarUrl} alt="avatar" width={80} height={80} className="rounded-2xl object-cover w-20 h-20" />
              : <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-300">
                  {user?.name?.[0] ?? '?'}
                </div>}
            <label className="absolute -bottom-2 -right-2 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors shadow">
              {uploading
                ? <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                : <Camera className="h-3.5 w-3.5 text-white" />}
              <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarUpload} disabled={uploading} />
            </label>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-0.5">Profile photo</p>
            <p className="text-xs text-gray-400">PNG, JPG or WebP · Max 5MB</p>
          </div>
        </div>
      </div>

      {/* About */}
      <div className={card}>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">About</h2>
        <div>
          <label className={lbl}>Username</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">@</span>
            <input {...register('username')} placeholder="your_username"
              className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
          </div>
        </div>
        <div>
          <label className={lbl}>Bio</label>
          <textarea {...register('bio')} rows={4}
            placeholder="Tell other travelers about yourself..."
            className={cls} />
          <p className="text-xs text-gray-400 mt-1">Shown publicly on your profile.</p>
        </div>
      </div>

      {/* Location */}
      <div className={card}>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Location</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>City</label>
            <input {...register('city')} placeholder="Mumbai" className={cls} />
          </div>
          <div>
            <label className={lbl}>Country</label>
            <input {...register('country')} placeholder="India" className={cls} />
          </div>
        </div>
      </div>

      {/* Travel preferences */}
      <div className={card}>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Travel Preferences</h2>
        <div>
          <label className={lbl}>Travel style</label>
          <select {...register('travelStyle')} className={cls}>
            <option value="">Select your style</option>
            {Object.values(TravelStyle).map((s) => (
              <option key={s} value={s}>{TRAVEL_STYLE_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={lbl}>Languages spoken</label>
          {languages.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {languages.map((lang) => (
                <span key={lang} className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                  {lang}
                  <button type="button" onClick={() => removeLanguage(lang)} className="hover:text-orange-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {COMMON_LANGUAGES.filter((l) => !languages.includes(l)).map((lang) => (
              <button type="button" key={lang} onClick={() => addLanguage(lang)}
                className="flex items-center gap-1 px-2.5 py-1 border border-gray-200 text-gray-500 rounded-full text-xs hover:border-orange-300 hover:text-orange-600 transition-colors">
                <Plus className="h-2.5 w-2.5" />{lang}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={langInput}
              onChange={(e) => setLangInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLanguage(langInput); } }}
              placeholder="Other language..."
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
            />
            <button type="button" onClick={() => addLanguage(langInput)} disabled={!langInput.trim()}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 disabled:opacity-40">
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Social & contact */}
      <div className={card}>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Social & Contact</h2>
        <div>
          <label className={lbl}>Instagram</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">@</span>
            <input {...register('instagram')} placeholder="yourhandle"
              className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
          </div>
          <p className="text-xs text-gray-400 mt-1">Shown publicly on your profile.</p>
        </div>
        <div>
          <label className={lbl}>Phone number</label>
          <input {...register('phone')} placeholder="+91 98765 43210" type="tel" className={cls} />
          <p className="text-xs text-gray-400 mt-1">Private — only visible to trip hosts.</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 rounded-xl border border-red-100">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button type="submit" disabled={saving || saved}
        className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
        {saved
          ? <><Check className="h-4 w-4" />Saved! Redirecting...</>
          : saving
          ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
          : 'Save profile'}
      </button>
    </form>
  );
}

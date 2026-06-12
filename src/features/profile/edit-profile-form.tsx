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

  const cls  = 'w-full px-4 py-2.5 text-zinc-950 dark:text-white placeholder:text-zinc-950/45 dark:placeholder:text-white/30 border border-zinc-950/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-night-soft';
  const lbl  = 'block text-sm font-medium text-zinc-950/90 dark:text-white/80 mb-1.5';
  const card = 'bg-night-soft rounded-2xl border border-zinc-950/10 dark:border-white/10 p-6 space-y-5';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Photo */}
      <div className={card}>
        <h2 className="text-xs font-semibold text-zinc-950/55 dark:text-white/40 uppercase tracking-widest">Photo</h2>
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            {avatarUrl
              ? <Image src={avatarUrl} alt="avatar" width={80} height={80} className="rounded-2xl object-cover w-20 h-20" />
              : <div className="w-20 h-20 rounded-2xl bg-zinc-950/[0.05] dark:bg-white/[0.06] flex items-center justify-center text-2xl font-bold text-zinc-950/45 dark:text-white/30">
                  {user?.name?.[0] ?? '?'}
                </div>}
            <label className="absolute -bottom-2 -right-2 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors shadow">
              {uploading
                ? <Loader2 className="h-3.5 w-3.5 text-zinc-950 dark:text-white animate-spin" />
                : <Camera className="h-3.5 w-3.5 text-zinc-950 dark:text-white" />}
              <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarUpload} disabled={uploading} />
            </label>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-950 dark:text-white mb-0.5">Profile photo</p>
            <p className="text-xs text-zinc-950/55 dark:text-white/40">PNG, JPG or WebP · Max 5MB</p>
          </div>
        </div>
      </div>

      {/* About */}
      <div className={card}>
        <h2 className="text-xs font-semibold text-zinc-950/55 dark:text-white/40 uppercase tracking-widest">About</h2>
        <div>
          <label className={lbl}>Username</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-950/55 dark:text-white/40">@</span>
            <input {...register('username')} placeholder="your_username"
              className="w-full pl-8 pr-4 py-2.5 border border-zinc-950/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-night-soft" />
          </div>
        </div>
        <div>
          <label className={lbl}>Bio</label>
          <textarea {...register('bio')} rows={4}
            placeholder="Tell other travelers about yourself..."
            className={cls} />
          <p className="text-xs text-zinc-950/55 dark:text-white/40 mt-1">Shown publicly on your profile.</p>
        </div>
      </div>

      {/* Location */}
      <div className={card}>
        <h2 className="text-xs font-semibold text-zinc-950/55 dark:text-white/40 uppercase tracking-widest">Location</h2>
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
        <h2 className="text-xs font-semibold text-zinc-950/55 dark:text-white/40 uppercase tracking-widest">Travel Preferences</h2>
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
                <span key={lang} className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-orange-500/15 text-orange-300 rounded-full text-xs font-medium">
                  {lang}
                  <button type="button" onClick={() => removeLanguage(lang)} className="hover:text-orange-200">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {COMMON_LANGUAGES.filter((l) => !languages.includes(l)).map((lang) => (
              <button type="button" key={lang} onClick={() => addLanguage(lang)}
                className="flex items-center gap-1 px-2.5 py-1 border border-zinc-950/10 dark:border-white/10 text-zinc-950/60 dark:text-white/50 rounded-full text-xs hover:border-orange-500/50 hover:text-orange-400 transition-colors">
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
              className="flex-1 px-3 py-2 text-sm border border-zinc-950/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-night-soft"
            />
            <button type="button" onClick={() => addLanguage(langInput)} disabled={!langInput.trim()}
              className="px-3 py-2 text-sm bg-zinc-950/[0.05] dark:bg-white/[0.06] text-zinc-950/70 dark:text-white/60 rounded-xl hover:bg-zinc-950/[0.06] dark:hover:bg-white/10 disabled:opacity-40">
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Social & contact */}
      <div className={card}>
        <h2 className="text-xs font-semibold text-zinc-950/55 dark:text-white/40 uppercase tracking-widest">Social & Contact</h2>
        <div>
          <label className={lbl}>Instagram</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-950/55 dark:text-white/40">@</span>
            <input {...register('instagram')} placeholder="yourhandle"
              className="w-full pl-8 pr-4 py-2.5 border border-zinc-950/10 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-night-soft" />
          </div>
          <p className="text-xs text-zinc-950/55 dark:text-white/40 mt-1">Shown publicly on your profile.</p>
        </div>
        <div>
          <label className={lbl}>Phone number</label>
          <input {...register('phone')} placeholder="+91 98765 43210" type="tel" className={cls} />
          <p className="text-xs text-zinc-950/55 dark:text-white/40 mt-1">Private — only visible to trip hosts.</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/30">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <button type="submit" disabled={saving || saved}
        className="w-full py-3 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-400 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
        {saved
          ? <><Check className="h-4 w-4" />Saved! Redirecting...</>
          : saving
          ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
          : 'Save profile'}
      </button>
    </form>
  );
}

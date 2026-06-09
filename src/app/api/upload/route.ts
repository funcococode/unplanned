import type { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const result = await requireAuth();
  if (result.error) return result.error;

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return Response.json({ error: 'Only images allowed' }, { status: 400 });
  if (file.size > MAX_SIZE) return Response.json({ error: 'File too large (max 5MB)' }, { status: 400 });

  const ext = file.name.split('.').pop() ?? 'jpg';
  const filename = `${randomUUID()}.${ext}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(uploadDir, filename), buffer);

  return Response.json({ url: `/uploads/${filename}`, key: filename });
}

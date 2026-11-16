import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

function secretsMatch(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  try {
    const expectedSecret = process.env.REVALIDATE_SECRET;
    if (!expectedSecret) {
      return NextResponse.json({ message: 'Revalidation secret not configured' }, { status: 500 });
    }

    const providedSecret = req.headers.get('x-revalidate-secret');
    if (!secretsMatch(providedSecret, expectedSecret)) {
      return NextResponse.json({ message: 'Invalid revalidation secret' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    const paths: string[] = Array.isArray(body?.paths) ? body.paths : [];
    const revalidateAll = Boolean(body?.revalidateAll);

    if (revalidateAll) {
      revalidatePath('/', 'layout');
    }

    const revalidated: string[] = [];
    for (const p of paths) {
      if (typeof p === 'string' && p.startsWith('/')) {
        revalidatePath(p, 'page');
        revalidated.push(p);
      }
    }

    return NextResponse.json({
      revalidated: true,
      revalidateAll,
      paths: revalidated,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('Error in /api/revalidate:', err);
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}


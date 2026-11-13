import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const expectedSecret = process.env.REVALIDATE_SECRET || 'megaman-revalidate-2026';
    const providedSecret = body?.secret || req.headers.get('x-revalidate-secret');

    if (providedSecret !== expectedSecret) {
      return NextResponse.json({ message: 'Invalid revalidation secret' }, { status: 401 });
    }

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


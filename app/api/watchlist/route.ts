import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

interface WatchlistItem {
  slug: string;
  name: string;
  mdl: string;
  addedAt: string;
}

// Resolve clerkClient across SDK versions:
// - v5+: clerkClient is an async function -> `await clerkClient()`
// - v4:  clerkClient is a direct object  -> use it as-is
async function getClerkClient(): Promise<any> {
  if (typeof clerkClient === 'function') {
    return await (clerkClient as unknown as () => Promise<any>)();
  }
  return clerkClient;
}

async function getUserId(): Promise<string | null> {
  const a = auth as unknown as () => any;
  const result = a();
  // v5 returns a Promise; v4 returns the object directly
  const resolved = result && typeof result.then === 'function' ? await result : result;
  return resolved?.userId ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { slug, name, mdl } = body as Partial<WatchlistItem>;
    if (!slug || !name) {
      return NextResponse.json({ error: 'missing slug or name' }, { status: 400 });
    }

    const client = await getClerkClient();
    const user = await client.users.getUser(userId);
    const existing = (user.publicMetadata?.watchlist as WatchlistItem[] | undefined) ?? [];

    if (existing.find((w) => w.slug === slug)) {
      return NextResponse.json({ ok: true, alreadyWatching: true, count: existing.length });
    }

    const updated: WatchlistItem[] = [
      ...existing,
      { slug, name, mdl: mdl || '', addedAt: new Date().toISOString() },
    ];

    await client.users.updateUserMetadata(userId, {
      publicMetadata: { ...user.publicMetadata, watchlist: updated },
    });

    return NextResponse.json({ ok: true, count: updated.length });
  } catch (err: any) {
    console.error('[/api/watchlist POST]', err);
    return NextResponse.json(
      { error: err?.message || String(err), name: err?.name, stack: err?.stack?.split('\n').slice(0, 5) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');
    if (!slug) return NextResponse.json({ error: 'missing slug' }, { status: 400 });

    const client = await getClerkClient();
    const user = await client.users.getUser(userId);
    const existing = (user.publicMetadata?.watchlist as WatchlistItem[] | undefined) ?? [];
    const updated = existing.filter((w) => w.slug !== slug);

    await client.users.updateUserMetadata(userId, {
      publicMetadata: { ...user.publicMetadata, watchlist: updated },
    });

    return NextResponse.json({ ok: true, count: updated.length });
  } catch (err: any) {
    console.error('[/api/watchlist DELETE]', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const client = await getClerkClient();
    const user = await client.users.getUser(userId);
    const watchlist = (user.publicMetadata?.watchlist as WatchlistItem[] | undefined) ?? [];

    return NextResponse.json({ watchlist });
  } catch (err: any) {
    console.error('[/api/watchlist GET]', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

interface WatchlistItem {
  slug: string;
  name: string;
  mdl: string;
  addedAt: string;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { slug, name, mdl } = body as Partial<WatchlistItem>;
  if (!slug || !name) {
    return NextResponse.json({ error: 'missing slug or name' }, { status: 400 });
  }

  const client = await clerkClient();
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
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const slug = url.searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'missing slug' }, { status: 400 });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const existing = (user.publicMetadata?.watchlist as WatchlistItem[] | undefined) ?? [];
  const updated = existing.filter((w) => w.slug !== slug);

  await client.users.updateUserMetadata(userId, {
    publicMetadata: { ...user.publicMetadata, watchlist: updated },
  });

  return NextResponse.json({ ok: true, count: updated.length });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const watchlist = (user.publicMetadata?.watchlist as WatchlistItem[] | undefined) ?? [];

  return NextResponse.json({ watchlist });
}

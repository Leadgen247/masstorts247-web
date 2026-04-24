import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { upsertUserFromClerk, deleteUserFromClerk } from '@/lib/clerk-webhook-handler';

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'CLERK_WEBHOOK_SECRET not configured' },
      { status: 500 }
    );
  }

  const h = await headers();
  const svix_id = h.get('svix-id');
  const svix_timestamp = h.get('svix-timestamp');
  const svix_signature = h.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
  }

  try {
    switch (evt.type) {
      case 'user.created':
      case 'user.updated':
        await upsertUserFromClerk(evt.data);
        break;
      case 'user.deleted':
        if (evt.data.id) await deleteUserFromClerk(evt.data.id);
        break;
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
}

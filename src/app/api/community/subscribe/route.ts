import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { CommunitySubscriptionValidator } from '@/lib/validators/community';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response('Unauthorised', { status: 401 });
    }

    const body = await req.json();

    const { communityId } = CommunitySubscriptionValidator.parse(body);

    const subscriptionExists = await db.subscription.findFirst({
      where: {
        communityId,
        userId: session.user.id,
      },
    });

    if (subscriptionExists) {
      return new Response('You are aleardy a part of the Community', {
        status: 400,
      });
    }
    await db.subscription.create({
      data: {
        communityId,
        userId: session.user.id,
      },
    });

    return new Response(communityId);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request data passed', { status: 422 });
    }
    return new Response('Failed to join community', { status: 500 });
  }
}

import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { CommunitySubscriptionValidator } from '@/lib/validators/community';
import { PostValidator } from '@/lib/validators/post';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response('Unauthorised', { status: 401 });
    }

    const body = await req.json();

    const { communityId, title, content } = PostValidator.parse(body);

    const subscriptionExists = await db.subscription.findFirst({
      where: {
        communityId,
        userId: session.user.id,
      },
    });

    if (!subscriptionExists) {
      return new Response('Join the community to post', {
        status: 400,
      });
    }
    await db.post.create({
      data: {
        title,
        content,
        authorId: session.user.id,
        communityId,
      },
    });

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request data passed', { status: 422 });
    }
    return new Response('Could not post the community at the moment', {
      status: 500,
    });
  }
}

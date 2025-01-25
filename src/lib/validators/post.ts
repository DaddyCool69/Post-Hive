import { title } from 'process';
import { z } from 'zod';

export const PostValidator = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be longer thn 3 characters' })
    .max(120, { message: 'Title should be less than 120 character' }),
  communityId: z.string(),
  content: z.any(),
});

export type PostCreationRequest = z.infer<typeof PostValidator>;

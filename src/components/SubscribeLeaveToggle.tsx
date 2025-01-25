'use client';

import { FC, startTransition } from 'react';
import { Button } from './ui/Button';
import { useMutation } from '@tanstack/react-query';
import { SubscribeToCommunityPayload } from '@/lib/validators/community';
import axios, { AxiosError } from 'axios';
import { useCustomToasts } from '@/hooks/use-custom-toasts';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface SubscribeLeaveToggleProps {
  communityId: string;
  communityName: string;
  isSubscribed: boolean;
}

const SubscribeLeaveToggle: FC<SubscribeLeaveToggleProps> = ({
  communityId,
  isSubscribed,
  communityName,
}) => {
  const { loginToast } = useCustomToasts();
  const router = useRouter();
  const { mutate: subscribe, isLoading: isSubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToCommunityPayload = {
        communityId: communityId,
      };
      const { data } = await axios.post('/api/community/subscribe', payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }
      return toast({
        title: 'There was a problem',
        description: 'Something went wrong, please try again!',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });
      return toast({
        title: 'Joined',
        description: `now you are member of h/${communityName}`,
      });
    },
  });

  const { mutate: unsubscribe, isLoading: isUnsubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToCommunityPayload = {
        communityId: communityId,
      };
      const { data } = await axios.post('/api/community/unsubscribe', payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }
      return toast({
        title: 'There was a problem',
        description: 'Something went wrong, please try again!',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });
      return toast({
        title: 'Unsubscribed',
        description: `you are now unsubscribed from h/${communityName}`,
      });
    },
  });
  return isSubscribed ? (
    <Button
      isLoading={isUnsubLoading}
      onClick={() => unsubscribe()}
      className='w-full mt-1 mb-4'
    >
      Leave community
    </Button>
  ) : (
    <Button
      isLoading={isSubLoading}
      onClick={() => subscribe()}
      className='w-full mt-1 mb-4'
    >
      Join to post
    </Button>
  );
};

export default SubscribeLeaveToggle;

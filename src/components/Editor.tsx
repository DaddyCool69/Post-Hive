'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useForm } from 'react-hook-form';
import { PostCreationRequest, PostValidator } from '@/lib/validators/post';
import { zodResolver } from '@hookform/resolvers/zod';
import type EditorJS from '@editorjs/editorjs';
import { uploadFiles } from '@/lib/uploadthing';
import { toast } from '@/hooks/use-toast';
import { Content } from 'next/font/google';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { usePathname, useRouter } from 'next/navigation';

interface EditorProps {
  communityId: string;
}

const Editor: FC<EditorProps> = ({ communityId }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostCreationRequest>({
    resolver: zodResolver(PostValidator),
    defaultValues: {
      communityId,
      title: '',
      content: null,
    },
  });

  const ref = useRef<EditorJS>();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const _titleRef = useRef<HTMLTextAreaElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import('@editorjs/editorjs')).default;
    const Header = (await import('@editorjs/header')).default;
    const Embed = (await import('@editorjs/embed')).default;
    const Table = (await import('@editorjs/table')).default;
    const List = (await import('@editorjs/list')).default;
    const Code = (await import('@editorjs/code')).default;
    const LinkTool = (await import('@editorjs/link')).default;
    const InlineCode = (await import('@editorjs/inline-code')).default;
    const ImageTool = (await import('@editorjs/image')).default;

    if (!ref.current) {
      const editor = new EditorJS({
        holder: 'editor',
        onReady() {
          ref.current = editor;
        },
        placeholder: 'Type here to write your post...',
        inlineToolbar: true,
        data: { blocks: [] },
        tools: {
          header: Header,
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: '/api/link',
            },
          },
          // image: {
          //   class: ImageTool,
          //   config: {
          //     uploader: {
          //       async uploadByFile(file: File) {
          //         // upload to uploadthing
          //         const [res] = await uploadFiles([file], 'imageUploader');

          //         return {
          //           success: 1,
          //           file: {
          //             url: res.fileUrl,
          //           },
          //         };
          //       },
          //     },
          //   },
          // },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  // upload to uploadthing
                  const [res] = await uploadFiles('imageUploader', {
                    files: [file], // Files as an array
                  });
                  console.log(res.url);

                  return {
                    success: 1,
                    file: {
                      url: res.url,
                    },
                  };
                },
              },
            },
          },
          list: List,
          code: Code,
          inlineCode: InlineCode,
          table: Table,
          embed: Embed,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(errors).length) {
      for (const [_key, value] of Object.entries(errors)) {
        toast({
          title: 'Something went wrong',
          description: (value as { message: String }).message,
          variant: 'destructive',
        });
      }
    }
  }, [errors]);

  useEffect(() => {
    const init = async () => {
      await initializeEditor();
      setTimeout(() => {
        _titleRef.current?.focus();
      });
    };
    if (isMounted) {
      init();
      return () => {
        ref.current?.destroy();
        ref.current = undefined;
      };
    }
  }, [isMounted, initializeEditor]);

  const { mutate: createPost } = useMutation({
    mutationFn: async ({
      title,
      content,
      communityId,
    }: PostCreationRequest) => {
      const payload: PostCreationRequest = {
        communityId,
        title,
        content,
      };
      const { data } = await axios.post('/api/community/post/create', payload);
    },
    onError: () => {
      return toast({
        title: 'Something went wrong',
        description: 'Your post was not published',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      const newPathname = pathname.split('/').slice(0, -1).join('/');
      router.push(newPathname);
      router.refresh();
      toast({
        description: 'post published',
      });
    },
  });

  async function onSubmit(data: PostCreationRequest) {
    const blocks = await ref.current?.save();

    const payload: PostCreationRequest = {
      title: data.title,
      content: blocks,
      communityId,
    };
    createPost(payload);
  }

  if (!isMounted) {
    return null;
  }

  const { ref: titleRef, ...rest } = register('title');

  return (
    <div className='w-full p-4 bg-zinc-50 rounded-lg border'>
      <form
        id='community-post-form'
        className='w-fit'
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className='prose prose-stone dark:prose-invert'>
          <TextareaAutosize
            ref={(e) => {
              titleRef(e);
              //@ts-ignore
              _titleRef.current = e;
            }}
            {...rest}
            placeholder='Title'
            className='w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none'
          />
          <div id='editor' className='min-h-[500]px'></div>
        </div>
      </form>
    </div>
  );
};

export default Editor;

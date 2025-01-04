"use client";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useForm } from "react-hook-form";
import { postCreationValidator, postValidator } from "@/lib/validators/post";
import { zodResolver } from "@hookform/resolvers/zod";
import type EditorJS from "@editorjs/editorjs";
import { uploadFiles } from "@/lib/uploadthing";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import Header from "@editorjs/header";
interface EditorProps {
  subredditId: string;
}

const Editor: FC<EditorProps> = ({ subredditId }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<postCreationValidator>({
    resolver: zodResolver(postValidator),
    defaultValues: {
      subredditId,
      title: "",
      content: null,
    },
  });

  const ref = useRef<EditorJS>();

  const [isMounted, setIsMounted] = useState<boolean>(false);

  const _titleRef = useRef<HTMLTextAreaElement>(null);
  const pathname = usePathname();
  const Router = useRouter();

  const initializeEditor = useCallback(async () => {
    const editorJs = (await import("@editorjs/editorjs")).default;
    const Embed = (await import("@editorjs/embed")).default;
    const Table = (await import("@editorjs/table")).default;
    const List = (await import("@editorjs/list")).default;
    const Code = (await import("@editorjs/code")).default;
    const LinkTool = (await import("@editorjs/link")).default;
    const InlineCode = (await import("@editorjs/inline-code")).default;
    const ImageTool = (await import("@editorjs/image")).default;

    if (!ref.current) {
      const tools = {
        header: Header,
        LinkTool: {
          class: LinkTool,
          config: {
            endpoint: "/api/link",
          },
        },
        image: {
          class: ImageTool,
          config: {
            uploader: {
              async uploadByFile(file: File) {
                const [res] = await uploadFiles("imageUploader", {
                  files: [file],
                });

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
      };

      const editor = new editorJs({
        holder: "editor",
        onReady() {
          ref.current = editor;
        },
        placeholder: "Type here to write your post ...",
        inlineToolbar: true,
        data: { blocks: [] },
        tools,
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
      return;
    }
  }, []);

  useEffect(() => {
    if (Object.keys(errors).length) {
      for (const [_keys, value] of Object.entries(errors)) {
        toast({
          title: "Error",
          description: (value as { message: string }).message,
          variant: "destructive",
        });
      }
    }
  }, [errors]);

  useEffect(() => {
    const init = async () => {
      await initializeEditor();
    };
    setTimeout(() => {
      _titleRef.current?.focus();
    }, 0);

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
      subredditId,
    }: postCreationValidator) => {
      const payload: postCreationValidator = {
        title,
        content,
        subredditId,
      };
      const { data } = await axios.post("/api/subreddit/post/create", payload);

      return data;
    },
    onError: () => {
      return toast({
        title: "Error",
        description: "Post was not published. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      const newPathName = pathname.split("/").slice(0, -1).join("/");
      Router.push(newPathName);
      Router.refresh();
      toast({
        title: "Success",
        description: "Post was posted successfully.",
        variant: "default",
      });
    },
  });
  async function onSubmit(data: postCreationValidator) {
    const blocks = await ref.current?.save();

    const payload: postCreationValidator = {
      ...data,
      content: blocks,
    };

    createPost(payload);
  }

  const { ref: titleref, ...rest } = register("title");

  return (
    <div className="border-zinc-200 bg-zinc-50 p-4 border rounded-lg w-full">
      <form
        id="subreddit-post-form"
        className="w-fit"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="dark:prose-invert prose prose-stone">
          <TextareaAutosize
            ref={(e) => {
              titleref(e);
              //@ts-ignore
              _titleRef.current = e;
            }}
            {...rest}
            placeholder="Title"
            className="bg-transparent w-full font-bold text-5xl overflow-hidden appearance-none focus:outline-none resize-none"
          />
          <div id="editor" className="min-h-[500px]" />
        </div>
      </form>
    </div>
  );
};

export default Editor;

"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { FC } from "react";

const OutPut = dynamic(
  async () => (await import("editorjs-react-renderer")).default,
  { ssr: false }
);

interface EditorOutputProps {
  content: any;
}

const style = {
  paragraph: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
};

const renderers = {
  image: customeImageRenderer,
  code: customCodeRenderer,
};

const EditorOutput: FC<EditorOutputProps> = ({ content }) => {
  return (
    <OutPut
      data={content}
      style={style}
      className="text-sm"
      renderers={renderers}
    />
  );
};

function customeImageRenderer({ data }: any) {
  const src = data.file.url;
  return (
    <div className="relative w-full min-h-[15rem]">
      <Image alt="img" className="object-contain" fill src={src} />
    </div>
  );
}

function customCodeRenderer({ data }: any) {
  return (
    <pre className="bg-gray-800 text-white p-2 rounded-md">
      <code className="text-gray-100 text-sm">{data.code}</code>
    </pre>
  );
}

export default EditorOutput;

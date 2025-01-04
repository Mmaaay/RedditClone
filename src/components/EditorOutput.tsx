"use client";

import CustomCodeRenderer from "@/app/renderers/src/components/renderers/CustomCodeRenderer";
import CustomImageRenderer from "@/app/renderers/src/components/renderers/CustomImageRenderer";
import Output from "editorjs-react-renderer";
import { FC } from "react";

interface EditorOutputProps {
  content: any;
}

const renderers = {
  image: CustomImageRenderer,
  code: CustomCodeRenderer,
};

const style = {
  paragraph: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
};

const EditorOutput: FC<EditorOutputProps> = ({ content }) => {
  return (
    <Output
      style={style}
      className="text-sm"
      renderers={renderers}
      data={content}
    />
  );
};

export default EditorOutput;

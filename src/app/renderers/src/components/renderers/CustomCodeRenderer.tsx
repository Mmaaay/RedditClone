"use client";

function CustomCodeRenderer({ data }: any) {
  data;

  return (
    <pre className="bg-gray-800 p-4 rounded-md">
      <code className="text-gray-100 text-sm">{data.code}</code>
    </pre>
  );
}

export default CustomCodeRenderer;

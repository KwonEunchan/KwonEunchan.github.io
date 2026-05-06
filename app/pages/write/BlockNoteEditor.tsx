"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

export default function BlockNoteEditor({ editorRef }: { editorRef: any }) {
  const uploadFile = async (file: File) => {
    return URL.createObjectURL(file);
  };

  const editor = useCreateBlockNote({
    uploadFile,
  });

  editorRef.current = editor;
  
  return <BlockNoteView editor={editor} theme="light" />;
}
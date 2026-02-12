"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import FontFamily from "@tiptap/extension-font-family";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import HardBreak from "@tiptap/extension-hard-break";
import { RichTextContent } from "@/types";

interface RichViewerProps {
  content: RichTextContent | string;
  className?: string;
}

/**
 * RichViewer
 * ----------------------------
 * Read-only TipTap renderer for rich text content
 * - SSR-safe (used only after data fetch)
 * - No editing, no mutations
 * - Strongly typed (no `any`)
 * - Supports extensive formatting including tables, colors, fonts, etc.
 * - Compatible with Google Docs paste formatting
 */
export default function RichViewer({
  content,
  className = "",
}: RichViewerProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bulletList: {
          keepMarks: true,
        },
        orderedList: {
          keepMarks: true,
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg shadow-sm",
        },
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: "text-radiance-goldColor hover:underline",
        },
      }),
      TextStyle,
      Color,
      Table.configure({
        resizable: false,
        HTMLAttributes: {
          class: "border-collapse border border-gray-300 my-4",
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-gray-300 bg-gray-50 font-semibold",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 p-2",
        },
      }),
      FontFamily,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
      Subscript,
      Superscript,
      HardBreak.configure({
        keepMarks: true,
      }),
    ],
    content: typeof content === "string" ? content : content,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `prose prose-zinc max-w-none focus:outline-none ${className}`,
      },
    },
  });

  if (!editor) {
    return <div className="animate-pulse h-32 bg-gray-200 rounded"></div>;
  }

  return (
    <div className="rich-viewer">
      <EditorContent editor={editor} className="min-h-25" />
      <style jsx global>{`
        .rich-viewer .ProseMirror {
          outline: none;
          padding: 0;
        }
        .rich-viewer .ProseMirror p {
          margin: 1em 0;
        }
        .rich-viewer .ProseMirror h1,
        .rich-viewer .ProseMirror h2,
        .rich-viewer .ProseMirror h3,
        .rich-viewer .ProseMirror h4,
        .rich-viewer .ProseMirror h5,
        .rich-viewer .ProseMirror h6 {
          margin: 1em 0 0.5em 0;
          line-height: 1.2;
        }
        .rich-viewer .ProseMirror ul,
        .rich-viewer .ProseMirror ol {
          padding-left: 1.5em;
          margin: 1em 0;
        }
        .rich-viewer .ProseMirror blockquote {
          border-left: 4px solid #d4af37;
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
          background: #f9fafb;
          padding: 0.5em 1em;
          border-radius: 0 0.25em 0.25em 0;
        }
        .rich-viewer .ProseMirror code {
          background: #f3f4f6;
          padding: 0.125em 0.25em;
          border-radius: 0.25em;
          font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
          font-size: 0.875em;
        }
        .rich-viewer .ProseMirror pre {
          background: #f3f4f6;
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
          margin: 1em 0;
        }
        .rich-viewer .ProseMirror pre code {
          background: none;
          padding: 0;
          border-radius: 0;
        }
        .rich-viewer .ProseMirror table {
          border-collapse: collapse;
          margin: 1em 0;
          width: 100%;
        }
        .rich-viewer .ProseMirror th,
        .rich-viewer .ProseMirror td {
          border: 1px solid #d1d5db;
          padding: 0.5em;
        }
        .rich-viewer .ProseMirror th {
          background: #f9fafb;
          font-weight: 600;
        }
        .rich-viewer .ProseMirror mark {
          background: #fef3c7;
          padding: 0.125em 0.25em;
          border-radius: 0.25em;
        }
        .rich-viewer .ProseMirror u {
          text-decoration: underline;
        }
        .rich-viewer .ProseMirror sub {
          vertical-align: sub;
          font-size: 0.75em;
        }
        .rich-viewer .ProseMirror sup {
          vertical-align: super;
          font-size: 0.75em;
        }
        .rich-viewer .ProseMirror .text-left {
          text-align: left;
        }
        .rich-viewer .ProseMirror .text-center {
          text-align: center;
        }
        .rich-viewer .ProseMirror .text-right {
          text-align: right;
        }
        .rich-viewer .ProseMirror .text-justify {
          text-align: justify;
        }
      `}</style>
    </div>
  );
}

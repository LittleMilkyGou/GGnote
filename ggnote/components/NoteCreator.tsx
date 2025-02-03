import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function NoteEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [activeFormats, setActiveFormats] = useState<string[]>([]);

  // Handle keydown for formatting shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement;
      if (!editorRef.current || !activeElement?.isContentEditable) return;

      if (e.ctrlKey || e.metaKey) {
        let command = "";
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            command = "bold";
            break;
          case "i":
            e.preventDefault();
            command = "italic";
            break;
          case "u":
            e.preventDefault();
            command = "underline";
            break;
          default:
            return;
        }
        document.execCommand(command);
        updateActiveFormats();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Detect active styles
  const updateActiveFormats = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const parentNode = range.commonAncestorContainer.parentElement;

    if (parentNode) {
      const newFormats: string[] = [];
      if (document.queryCommandState("bold")) newFormats.push("bold");
      if (document.queryCommandState("italic")) newFormats.push("italic");
      if (document.queryCommandState("underline")) newFormats.push("underline");
      setActiveFormats(newFormats);
    }
  };

  // Handle manual button toggles
  const handleToggle = (format: string) => {
    document.execCommand(format);
    updateActiveFormats();
  };

  return (
    <div ref={editorRef} className="rounded h-full bg-white p-4">
      <h3 className="text-lg font-semibold mb-2">New Note</h3>

      {/* Title Input */}
      <input
        type="text"
        placeholder="Enter note title..."
        className="w-full border-b p-2 text-2xl font-bold outline-none focus:border-blue-500"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Formatting Toolbar */}
      <ToggleGroup
        type="multiple"
        value={activeFormats}
        onValueChange={setActiveFormats}
      >
        <ToggleGroupItem
          value="bold"
          aria-label="Toggle bold"
          onClick={() => handleToggle("bold")}
        >
          <Bold className={`h-4 w-4 ${activeFormats.includes("bold") ? "text-blue-500" : ""}`} />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="italic"
          aria-label="Toggle italic"
          onClick={() => handleToggle("italic")}
        >
          <Italic className={`h-4 w-4 ${activeFormats.includes("italic") ? "text-blue-500" : ""}`} />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="underline"
          aria-label="Toggle underline"
          onClick={() => handleToggle("underline")}
        >
          <Underline className={`h-4 w-4 ${activeFormats.includes("underline") ? "text-blue-500" : ""}`} />
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Content Editor */}
      <div
        contentEditable
        ref={editorRef}
        onInput={(e) => {
          setContent(e.currentTarget.innerHTML);
          updateActiveFormats();
        }}
        className="w-full mt-3 p-2 text-gray-700 outline-none focus:border-blue-500"
        style={{ whiteSpace: "pre-wrap" }}
      />
    </div>
  );
}

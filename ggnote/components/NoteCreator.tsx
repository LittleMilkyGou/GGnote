"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Undo,
  Redo,
  List,
  ListOrdered,
  Plus,
  Minus,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  wrapImageWithResizer,
  updateActiveFormatsState,
  handleToggle,
  handleUndo,
  handleRedo,
} from "@/utils/EditorUtils"; 

interface NoteCreatorProps {
  selectedFolder: number | null;
  onCloseCreator: () => void;
}

export default function NoteCreator({
  selectedFolder,
  onCloseCreator,
}: NoteCreatorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState(3); // Default size (3 ~ 16px)
  const [textColor, setTextColor] = useState("#000000"); 
  const [textAlign, setTextAlign] = useState<"left" | "center">("left");

  // A helper to update text format states.
  const updateFormats = () => {
    updateActiveFormatsState(setActiveFormats, setCanUndo, setCanRedo);
  };

   // Function to increase font size
  const handleFontSizeChange = (change: number) => {
    let newSize = Math.min(7, Math.max(1, fontSize + change)); // Ensure size stays within 1-7 (execCommand range)
    setFontSize(newSize);
    document.execCommand("fontSize", false, newSize.toString());
  };
  // Change text color
const handleTextColorChange = (color: string) => {
  setTextColor(color);
  document.execCommand("foreColor", false, color);
};
const handleToggleAlignment = () => {
  const newAlign = textAlign === "left" ? "center" : "left";
  setTextAlign(newAlign);
  document.execCommand(newAlign === "center" ? "justifyCenter" : "justifyLeft");
};

  // Handle keydown for formatting shortcuts & undo/redo
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
          case "z": // Undo
            e.preventDefault();
            handleUndo(canUndo, updateFormats);
            return;
          case "y": // Redo
            e.preventDefault();
            handleRedo(canRedo, updateFormats);
            return;
          case "l": // Toggle list (Ordered List)
            e.preventDefault();
            handleToggle("insertOrderedList", updateFormats);
            return;
          case "m": // Toggle list (Unordered List)
            e.preventDefault();
            handleToggle("insertUnorderedList", updateFormats);
            return;
          default:
            return;
        }
        document.execCommand(command);
        updateFormats();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo]);

  // Click outside to trigger save
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        handleSave();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [title, content]);

  // Observer to detect pasted images and wrap them with the resizer.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === "IMG") {
            wrapImageWithResizer(node as HTMLImageElement);
          }
          if (node instanceof HTMLElement) {
            node.querySelectorAll("img").forEach((img) =>
              wrapImageWithResizer(img)
            );
          }
        });
      });
    });

    observer.observe(editor, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Save function
  const handleSave = async () => {
    if (isSaving) return;
    if (!title.trim() && !content.trim()) {
      onCloseCreator();
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          folder_id: selectedFolder,
        }),
      });

      if (!response.ok) throw new Error("Failed to save note");

      console.log("Note saved successfully");
      onCloseCreator();
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note");
    } finally {
      setIsSaving(false);
    }
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
      <ToggleGroup type="multiple" value={activeFormats} onValueChange={setActiveFormats}>
        {/* Increase Font Size */}
        <ToggleGroupItem
          value="increaseFontSize"
          aria-label="Increase Font Size"
          onClick={() => handleFontSizeChange(1)}
        >
          <span className="text-lg font-bold">A+</span>
          
        </ToggleGroupItem>

        <ToggleGroupItem
          value="decreaseFontSize"
          aria-label="Decrease Font Size"
          onClick={() => handleFontSizeChange(-1)}
        >
          <span className="text-lg font-bold">A-</span>
        </ToggleGroupItem>

        <ToggleGroupItem
          value="textColor"
          aria-label="Text Color"
        >
          <input
            type="color"
            value={textColor}
            onChange={(e) => handleTextColorChange(e.target.value)}
            className="w-8 h-8 cursor-pointer border rounded"
          />
        </ToggleGroupItem>

        <ToggleGroupItem
          value="bold"
          aria-label="Toggle bold"
          onClick={() => handleToggle("bold", updateFormats)}
        >
          <Bold className={`h-4 w-4 ${activeFormats.includes("bold") ? "text-blue-500" : ""}`} />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="italic"
          aria-label="Toggle italic"
          onClick={() => handleToggle("italic", updateFormats)}
        >
          <Italic className={`h-4 w-4 ${activeFormats.includes("italic") ? "text-blue-500" : ""}`} />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="underline"
          aria-label="Toggle underline"
          onClick={() => handleToggle("underline", updateFormats)}
        >
          <Underline className={`h-4 w-4 ${activeFormats.includes("underline") ? "text-blue-500" : ""}`} />
        </ToggleGroupItem>
        {/* Center Align Button */}
        <ToggleGroupItem
  value="alignToggle"
  aria-label="Toggle Align"
  onClick={handleToggleAlignment}
>
  <span className={`text-lg font-bold ${textAlign === "center" ? "text-blue-500" : ""}`}>
    {textAlign === "center" ? "↔️" : "⬅️"} {/* Icons for visualization */}
  </span>
</ToggleGroupItem>


        {/* Ordered List Button */}
        <ToggleGroupItem
          value="orderedList"
          aria-label="Insert Ordered List"
          onClick={() => handleToggle("insertOrderedList", updateFormats)}
        >
          <ListOrdered
            className={`h-4 w-4 ${activeFormats.includes("orderedList") ? "text-blue-500" : ""}`}
          />
        </ToggleGroupItem>

        {/* Unordered List Button */}
        <ToggleGroupItem
          value="unorderedList"
          aria-label="Insert Unordered List"
          onClick={() => handleToggle("insertUnorderedList", updateFormats)}
        >
          <List className={`h-4 w-4 ${activeFormats.includes("unorderedList") ? "text-blue-500" : ""}`} />
        </ToggleGroupItem>

        {/* Undo Button */}
        <ToggleGroupItem
          value="undo"
          aria-label="Undo"
          onClick={() => handleUndo(canUndo, updateFormats)}
          disabled={!canUndo}
        >
          <Undo className={`h-4 w-4 ${canUndo ? "text-black" : "text-gray-300"}`} />
        </ToggleGroupItem>

        {/* Redo Button */}
        <ToggleGroupItem
          value="redo"
          aria-label="Redo"
          onClick={() => handleRedo(canRedo, updateFormats)}
          disabled={!canRedo}
        >
          <Redo className={`h-4 w-4 ${canRedo ? "text-black" : "text-gray-300"}`} />
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Content Editor */}
      <div
        contentEditable
        ref={editorRef}
        onInput={(e) => {
          setContent(e.currentTarget.innerHTML);
          updateFormats();
        }}
        className="w-full mt-3 p-2 text-gray-700 outline-none focus:border-blue-500"
        style={{ whiteSpace: "pre-wrap" }}
      />
    </div>
  );
}

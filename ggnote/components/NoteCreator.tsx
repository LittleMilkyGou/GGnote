'use client'

import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline, Undo, Redo, List, ListOrdered } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface NoteCreatorProps {
  selectedFolder: number | null;
  onCloseCreator: () => void;
}

export default function NoteEditor({ selectedFolder, onCloseCreator }: NoteCreatorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

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
            handleUndo();
            return;
          case "y": // Redo
            e.preventDefault();
            handleRedo();
            return;
          case "l": // Toggle list (Ordered List)
            e.preventDefault();
            handleToggle("insertOrderedList");
            return;
          case "m": // Toggle list (Unordered List)
            e.preventDefault();
            handleToggle("insertUnorderedList");
            return;
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

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // Observer to detect pasted images
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === "IMG") {
            wrapImageWithResizer(node as HTMLImageElement);
          }
          if (node instanceof HTMLElement) {
            node.querySelectorAll("img").forEach((img) => wrapImageWithResizer(img));
          }
        });
      });
    });

    observer.observe(editor, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  // Function to wrap an image with resize handles
  const wrapImageWithResizer = (img: HTMLImageElement) => {
    if (img.parentElement?.classList.contains("resizable-wrapper")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "resizable-wrapper";
    wrapper.style.position = "relative";
    wrapper.style.display = "inline-block";
    wrapper.style.border = "1px solid #ccc";
    wrapper.style.padding = "4px";
    wrapper.style.resize = "both";
    wrapper.style.overflow = "hidden";

    img.style.maxWidth = "100%";
    img.style.display = "block";

    img.parentNode?.insertBefore(wrapper, img);
    wrapper.appendChild(img);

    // Create resize handle
    const handle = document.createElement("div");
    handle.style.position = "absolute";
    handle.style.width = "10px";
    handle.style.height = "10px";
    handle.style.background = "blue";
    handle.style.bottom = "0";
    handle.style.right = "0";
    handle.style.cursor = "nwse-resize";
    wrapper.appendChild(handle);

    // Resize functionality
    let startX = 0, startY = 0, startWidth = 0, startHeight = 0;

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX);
      const newHeight = startHeight + (e.clientY - startY);
      img.style.width = `${newWidth}px`;
      img.style.height = `${newHeight}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    handle.addEventListener("mousedown", (e) => {
      e.preventDefault();
      startX = e.clientX;
      startY = e.clientY;
      startWidth = img.clientWidth;
      startHeight = img.clientHeight;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  };

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
        body: JSON.stringify({ title: title.trim(), content: content.trim(), folder_id: selectedFolder }),
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

  // Detect active styles
  const updateActiveFormats = () => {
    if (!editorRef.current) return;

    const newFormats: string[] = [];
    if (document.queryCommandState("bold")) newFormats.push("bold");
    if (document.queryCommandState("italic")) newFormats.push("italic");
    if (document.queryCommandState("underline")) newFormats.push("underline");
    if (document.queryCommandState("insertOrderedList")) newFormats.push("orderedList");
    if (document.queryCommandState("insertUnorderedList")) newFormats.push("unorderedList");
    setActiveFormats(newFormats);

    setCanUndo(document.queryCommandEnabled("undo"));
    setCanRedo(document.queryCommandEnabled("redo"));
  };

  // Handle manual button toggles
  const handleToggle = (format: string) => {
    document.execCommand(format);
    updateActiveFormats();
  };

  // Handle Undo
  const handleUndo = () => {
    if (canUndo) {
      document.execCommand("undo");
      updateActiveFormats();
    }
  };

  // Handle Redo
  const handleRedo = () => {
    if (canRedo) {
      document.execCommand("redo");
      updateActiveFormats();
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

        {/* Ordered List Button */}
        <ToggleGroupItem
          value="orderedList"
          aria-label="Insert Ordered List"
          onClick={() => handleToggle("insertOrderedList")}
        >
          <ListOrdered className={`h-4 w-4 ${activeFormats.includes("orderedList") ? "text-blue-500" : ""}`} />
        </ToggleGroupItem>

        {/* Unordered List Button */}
        <ToggleGroupItem
          value="unorderedList"
          aria-label="Insert Unordered List"
          onClick={() => handleToggle("insertUnorderedList")}
        >
          <List className={`h-4 w-4 ${activeFormats.includes("unorderedList") ? "text-blue-500" : ""}`} />
        </ToggleGroupItem>

        {/* Undo Button */}
        <ToggleGroupItem
          value="undo"
          aria-label="Undo"
          onClick={handleUndo}
          disabled={!canUndo}
        >
          <Undo className={`h-4 w-4 ${canUndo ? "text-black" : "text-gray-300"}`} />
        </ToggleGroupItem>

        {/* Redo Button */}
        <ToggleGroupItem
          value="redo"
          aria-label="Redo"
          onClick={handleRedo}
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
          updateActiveFormats();
        }}
        className="w-full mt-3 p-2 text-gray-700 outline-none focus:border-blue-500"
        style={{ whiteSpace: "pre-wrap" }}
      />
    </div>
  );
}

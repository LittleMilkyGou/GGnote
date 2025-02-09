"use client";

import { useEffect, useRef, useState } from "react";
import {
  updateActiveFormatsState,
} from "@/utils/EditorUtils"; 
import ToolBar from "@/components/ToolBar";

interface NoteCreatorProps {
  selectedFolder: number | null;
  onCloseCreator: () => void;
}

export default function NoteCreator({
  selectedFolder,
  onCloseCreator,
}: NoteCreatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateFormats = () => {
    updateActiveFormatsState(setActiveFormats, setCanUndo, setCanRedo);
  };

  // Click outside to trigger save
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleSave();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [title, content]);

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
          content: content.trim(), // This now contains only the content editor HTML
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

  // Set up the image resizing logic on the contentEditable area
  useEffect(() => {
    // Only proceed if using Chrome.
    if (!(/chrome/i.test(navigator.userAgent) && /google/i.test(navigator.vendor))) {
      return;
    }
  
    const editor = editorRef.current;
    if (!editor) return;
  
    // Helper to create DOM elements with inline styles.
    const createDOM = (
      elementType: string,
      className: string,
      styles: { [key: string]: string }
    ) => {
      const ele = document.createElement(elementType);
      ele.className = className;
      for (const key in styles) {
        ele.style[key as any] = styles[key];
      }
      return ele;
    };
  
    // Remove any existing resize frames or resizer borders.
    const removeResizeFrame = () => {
      editor.querySelectorAll(".resize-frame, .resizer").forEach((item) =>
        item.parentNode?.removeChild(item)
      );
    };
  
    let currentImage: HTMLImageElement | null = null;
  
    // When an image is clicked, add the resizable frame elements.
    const clickImage = (img: HTMLImageElement) => {
      removeResizeFrame();
      currentImage = img;
  
      // Capture the original dimensions and mouse starting point later.
      const initialImageWidth = img.offsetWidth;
      const initialImageHeight = img.offsetHeight;
      const imgPosition = { top: img.offsetTop, left: img.offsetLeft };
      const editorScrollTop = editor.scrollTop;
      const editorScrollLeft = editor.scrollLeft;
      const top = imgPosition.top - editorScrollTop - 1;
      const left = imgPosition.left - editorScrollLeft - 1;
  
      // Create and append the draggable corner.
      const resizeFrame = createDOM("span", "resize-frame", {
        margin: "10px",
        position: "absolute",
        top: `${top + initialImageHeight - 10}px`,
        left: `${left + initialImageWidth - 10}px`,
        border: "solid 3px blue",
        width: "6px",
        height: "6px",
        cursor: "se-resize",
        zIndex: "1",
        display: "block",
      });
      editor.appendChild(resizeFrame);
  
      // Append border elements to visualize the image boundary.
      const topBorder = createDOM("span", "resizer top-border", {
        position: "absolute",
        top: `${top}px`,
        left: `${left}px`,
        width: `${initialImageWidth}px`,
        height: "0px",
        display: "block",
      });
      const leftBorder = createDOM("span", "resizer left-border", {
        position: "absolute",
        top: `${top}px`,
        left: `${left}px`,
        width: "0px",
        height: `${initialImageHeight}px`,
        display: "block",
      });
      const rightBorder = createDOM("span", "resizer right-border", {
        position: "absolute",
        top: `${top}px`,
        left: `${left + initialImageWidth}px`,
        width: "0px",
        height: `${initialImageHeight}px`,
        display: "block",
      });
      const bottomBorder = createDOM("span", "resizer bottom-border", {
        position: "absolute",
        top: `${top + initialImageHeight}px`,
        left: `${left}px`,
        width: `${initialImageWidth}px`,
        height: "0px",
        display: "block",
      });
      editor.appendChild(topBorder);
      editor.appendChild(leftBorder);
      editor.appendChild(rightBorder);
      editor.appendChild(bottomBorder);
  
      // Variables to store the initial mouse position and image dimensions.
      let resizing = false;
      let startX = 0;
      let startY = 0;
  
      // When the user presses the mouse button on the resize corner,
      // store the starting mouse position.
      resizeFrame.onmousedown = (mouseDownEvent: MouseEvent) => {
        resizing = true;
        startX = mouseDownEvent.pageX;
        startY = mouseDownEvent.pageY;
        // Prevent default to avoid unwanted selections.
        mouseDownEvent.preventDefault();
        // Attach mousemove and mouseup handlers on the document so that
        // dragging still works even if the mouse leaves the editor.
        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);
        return false;
      };
  
      // On mouse move, compute the delta and update the frame.
      const mouseMoveHandler = (mouseEvent: MouseEvent) => {
        if (resizing && currentImage) {
          const deltaX = mouseEvent.pageX - startX;
          const deltaY = mouseEvent.pageY - startY;
          let newWidth = initialImageWidth + deltaX;
          let newHeight = initialImageHeight + deltaY;
          newWidth = Math.max(newWidth, 1);
          newHeight = Math.max(newHeight, 1);
  
          // Update the draggable corner's position.
          resizeFrame.style.top = `${top + newHeight - 10}px`;
          resizeFrame.style.left = `${left + newWidth - 10}px`;
  
          // Update the border elements.
          topBorder.style.width = `${newWidth}px`;
          leftBorder.style.height = `${newHeight}px`;
          rightBorder.style.left = `${left + newWidth}px`;
          rightBorder.style.height = `${newHeight}px`;
          bottomBorder.style.top = `${top + newHeight}px`;
          bottomBorder.style.width = `${newWidth}px`;
        }
      };
  
      // On mouse up, apply the new size to the image and clean up.
      const mouseUpHandler = () => {
        if (resizing && currentImage) {
          // Apply the new dimensions to the image.
          currentImage.style.width = topBorder.style.width;
          currentImage.style.height = leftBorder.style.height;
          // Clean up event listeners.
          resizing = false;
          document.removeEventListener("mousemove", mouseMoveHandler);
          document.removeEventListener("mouseup", mouseUpHandler);
          // Optionally refresh the frame and update state.
          refresh();
          setContent(editor.innerHTML);
          // Re-select the image to update the frame.
          currentImage.click();
        }
      };
    };
  
    // Bind click events to all images inside the content editor.
    const bindClickListener = () => {
      editor.querySelectorAll("img").forEach((img) => {
        (img as HTMLImageElement).onclick = (e) => {
          if (e.target === img) {
            clickImage(img as HTMLImageElement);
          }
        };
      });
    };
  
    // Refresh the frame for the currently selected image.
    const refresh = () => {
      bindClickListener();
      removeResizeFrame();
      if (!currentImage) return;
      const img = currentImage;
      const imgHeight = img.offsetHeight;
      const imgWidth = img.offsetWidth;
      const imgPosition = { top: img.offsetTop, left: img.offsetLeft };
      const editorScrollTop = editor.scrollTop;
      const editorScrollLeft = editor.scrollLeft;
      const top = imgPosition.top - editorScrollTop - 1;
      const left = imgPosition.left - editorScrollLeft - 1;
  
      editor.appendChild(
        createDOM("span", "resize-frame", {
          position: "absolute",
          top: `${top + imgHeight}px`,
          left: `${left + imgWidth}px`,
          width: "6px",
          height: "6px",
          cursor: "se-resize",
          zIndex: "1",
          display: "block",
        })
      );
      editor.appendChild(
        createDOM("span", "resizer", {
          position: "absolute",
          top: `${top}px`,
          left: `${left}px`,
          width: `${imgWidth}px`,
          height: "0px",
          display: "block",
        })
      );
      editor.appendChild(
        createDOM("span", "resizer", {
          position: "absolute",
          top: `${top}px`,
          left: `${left + imgWidth}px`,
          width: "0px",
          height: `${imgHeight}px`,
          display: "block",
        })
      );
      editor.appendChild(
        createDOM("span", "resizer", {
          position: "absolute",
          top: `${top + imgHeight}px`,
          left: `${left}px`,
          width: `${imgWidth}px`,
          height: "0px",
          display: "block",
        })
      );
    };
  
    // Reset the selection and remove any frames.
    const reset = () => {
      if (currentImage !== null) {
        currentImage = null;
        removeResizeFrame();
      }
      bindClickListener();
    };
  
    // Rebind events on scroll.
    editor.addEventListener("scroll", reset);
  
    // When the mouse is released outside the image, check if we need to update the frame.
    editor.addEventListener("mouseup", (e) => {
      if (!currentImage) {
        reset();
      }
    });
  
    // Initial binding for images already in the editor.
    bindClickListener();
  
    // Cleanup on unmount.
    return () => {
      editor.removeEventListener("scroll", reset);
      editor.removeEventListener("mouseup", reset);
    };
  }, []);
  

  return (
    <div ref={containerRef} className="rounded h-full bg-white p-4">
      <h3 className="text-lg font-semibold mb-2">New Note</h3>

      {/* Title Input */}
      <input
        autoFocus
        type="text"
        placeholder="Enter note title..."
        className="w-full border-b p-2 text-2xl font-bold outline-none focus:border-blue-500"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Formatting Toolbar */}
      <ToolBar 
        canRedo={canRedo}
        canUndo={canUndo}
        updateFormats={updateFormats}
        activeFormats={activeFormats}
        setActiveFormats={setActiveFormats}
      />

      {/* Content Editor */}
      <div
        contentEditable
        ref={editorRef}
        onInput={(e) => {
          setContent(e.currentTarget.innerHTML);
          updateFormats();
        }}
        className="w-full mt-3 p-2 text-gray-700 outline-none focus:border-blue-500"
        style={{ whiteSpace: "pre-wrap",minHeight:"500px" }}
      />
    </div>
  );
}

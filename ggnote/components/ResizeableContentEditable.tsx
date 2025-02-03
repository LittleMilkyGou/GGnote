'use client'

import { useEffect, useRef } from "react";

export default function ResizableContentEditable() {
  const editorRef = useRef<HTMLDivElement>(null);

  // Basic function to wrap an image with resize handles
  const wrapImageWithResizer = (img: HTMLImageElement) => {
    // Create a wrapper element
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.display = "inline-block";
    // Insert the wrapper before the image and move the image inside it
    img.parentNode?.insertBefore(wrapper, img);
    wrapper.appendChild(img);

    // Create a simple resize handle
    const handle = document.createElement("div");
    handle.style.position = "absolute";
    handle.style.width = "10px";
    handle.style.height = "10px";
    handle.style.background = "blue";
    handle.style.bottom = "0";
    handle.style.right = "0";
    handle.style.cursor = "nwse-resize";
    wrapper.appendChild(handle);

    // Add event listeners for dragging the handle
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX);
      const newHeight = startHeight + (e.clientY - startY);
      img.style.width = newWidth + "px";
      img.style.height = newHeight + "px";
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

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // Monitor for changes in the editor and wrap new images
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === "IMG") {
            wrapImageWithResizer(node as HTMLImageElement);
          }
          // If the added node contains images
          if (node instanceof HTMLElement) {
            node.querySelectorAll("img").forEach((img) => {
              wrapImageWithResizer(img);
            });
          }
        });
      });
    });

    observer.observe(editor, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        minHeight: "200px",
      }}
    >
      Paste your content with images here.
    </div>
  );
}

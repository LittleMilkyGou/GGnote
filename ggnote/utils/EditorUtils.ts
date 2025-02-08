// editorUtils.ts

/**
 * Wraps an image with a resizable container and adds a resize handle.
 */
export function wrapImageWithResizer(img: HTMLImageElement): void {
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

  // Create the resize handle
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
  let startX = 0,
    startY = 0,
    startWidth = 0,
    startHeight = 0;

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
}

/**
 * Returns the current active text formats and whether undo/redo are enabled.
 */
export function getActiveEditorState() {
  const activeFormats: string[] = [];
  if (document.queryCommandState("bold")) activeFormats.push("bold");
  if (document.queryCommandState("italic")) activeFormats.push("italic");
  if (document.queryCommandState("underline")) activeFormats.push("underline");
  if (document.queryCommandState("insertOrderedList"))
    activeFormats.push("orderedList");
  if (document.queryCommandState("insertUnorderedList"))
    activeFormats.push("unorderedList");

  const canUndo = document.queryCommandEnabled("undo");
  const canRedo = document.queryCommandEnabled("redo");

  return { activeFormats, canUndo, canRedo };
}

/**
 * Updates the state in the component by calling the provided setters.
 */
export function updateActiveFormatsState(
  setActiveFormats: (formats: string[]) => void,
  setCanUndo: (value: boolean) => void,
  setCanRedo: (value: boolean) => void
): void {
  const { activeFormats, canUndo, canRedo } = getActiveEditorState();
  setActiveFormats(activeFormats);
  setCanUndo(canUndo);
  setCanRedo(canRedo);
}

/**
 * A helper to execute an editor command.
 */
export function execEditorCommand(command: string): void {
  document.execCommand(command);
}

/**
 * Toggles a text format and then updates the component state.
 */
export function handleToggle(
  command: string,
  updateState: () => void
): void {
  execEditorCommand(command);
  updateState();
}



/**
 * Executes an undo command if enabled, then updates the component state.
 */
export function handleUndo(
  canUndo: boolean,
  updateState: () => void
): void {
  if (canUndo) {
    execEditorCommand("undo");
    updateState();
  }
}

/**
 * Executes a redo command if enabled, then updates the component state.
 */
export function handleRedo(
  canRedo: boolean,
  updateState: () => void
): void {
  if (canRedo) {
    execEditorCommand("redo");
    updateState();
  }
}


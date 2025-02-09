// editorUtils.ts

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


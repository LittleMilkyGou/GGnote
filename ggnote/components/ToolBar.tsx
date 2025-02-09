'use client'

import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group"
import { AlignCenter, AlignLeft, Bold, Italic, List, ListOrdered, Redo, Underline, Undo } from "lucide-react"
import { useState } from "react";
import {
  handleToggle,
  handleUndo,
  handleRedo,
} from "@/utils/EditorUtils"; 

interface ToolBarProps {
  canUndo: boolean;
  canRedo: boolean;
  activeFormats: string[];
  setActiveFormats: (formats: string[]) => void; // Fix type
  updateFormats: () => void; // Fix type
}


export default function ToolBar({canUndo,canRedo,activeFormats,setActiveFormats,updateFormats}:ToolBarProps){
  const [fontSize, setFontSize] = useState(3); // Default size (3 ~ 16px)
  const [textColor, setTextColor] = useState("#000000"); 
  const [textAlign, setTextAlign] = useState<"left" | "center">("left");



  const handleFontSizeChange = (change: number) => {
    const newSize = Math.min(7, Math.max(1, fontSize + change)); // Ensure size stays within 1-7 (execCommand range)
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
  return(
    <div>
      <ToggleGroup className="flex flex-wrap justify-center items-center gap-4" autoCapitalize="true" type="multiple" value={activeFormats} onValueChange={setActiveFormats}>
        
        <div className="font-bold">{fontSize}pt</div>
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
          <span className={`text-lg font-bold `}>
            {textAlign === "center" ? <AlignCenter /> : <AlignLeft />} 
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
    </div>
  )
}
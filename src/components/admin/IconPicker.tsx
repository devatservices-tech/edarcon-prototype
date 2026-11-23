"use client";

import * as lucide from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

const ICON_NAMES: string[] = [
  "Tool", "Wrench", "Settings", "Users", "Building2", "Award", "FileText", "File",
  "Phone", "Sliders", "Wind", "Zap", "Scissors", "Shield", "ClipboardList",
  "HardHat", "Building", "Briefcase", "Activity", "CheckCircle2", "AlertTriangle",
  "Save", "Link", "Image", "Send", "Mail", "Target", "ShieldCheck", "Gavel",
  "Layers", "Palette", "Grid", "List", "Truck", "Cpu", "Droplet", "Flame",
  "Factory", "Warehouse", "Barcode", "Tag", "Percent", "DollarSign", "CreditCard",
  "LayoutGrid", "LayoutList", "LayoutTemplate", "Calendar", "Clock", "Timer",
  "Play", "Pause", "StopCircle", "SkipBack", "SkipForward", "Shuffle", "Repeat",
  "Music", "Mic", "Camera", "Photo", "Video", "Film", "Link2", "LinkExternal",
  "Download", "Upload", "ExternalLink", "Maximize", "Minimize", "Expand",
  "Compress", "Enter", "Exit", "LogIn", "LogOut", "SignIn", "SignOut", "User",
  "UserPlus", "UserMinus", "UserX", "UserCheck", "UserCircle", "UserGear",
  "UserKey", "UserRound", "UserSearch", "UserCog", "User2", "User3", "Star",
  "StarHalf", "StarOff", "Heart", "HeartOff", "ThumbsUp", "ThumbsDown", "Trophy",
  "Badge", "Certificate", "Ribbon", "Pin", "PinOutline", "Location", "MapPin",
  "Globe", "World", "Languages", "Translate", "Text", "TextCursor", "Edit",
  "Edit2", "Edit3", "Pencil", "PenTool", "Pen", "Scissors", "Crop", "Eraser",
  "Palette", "ColorPicker", "Eyedropper", "Lasso", "Polygon", "Square", "Circle",
  "Triangle", "Diamond", "Hexagon", "Octagon", "Cross", "Plus", "Minus", "X",
  "Check", "CheckCircle", "CheckSquare", "AlertCircle", "AlertOctagon", "Info",
  "HelpCircle", "QuestionMark", "Search", "ZoomIn", "ZoomOut", "Filter", "Funnel",
  "SlidersHorizontal", "Settings2", "Menu", "MoreHorizontal", "MoreVertical",
  "Layout", "ListOrdered", "ListTree", "ListPlus", "ListMinus", "ListX",
  "ListCheck", "Home", "Office", "Store", "ShoppingBag", "ShoppingCart",
  "Banknote", "Bill", "Receipt", "Printer", "Scan", "Barcode", "QrCode", "Wifi",
  "Bluetooth", "Signal", "SignalHigh", "SignalMedium", "SignalLow", "SignalZero",
  "Battery", "BatteryFull", "BatteryMedium", "BatteryLow", "BatteryCharging",
  "BatteryWarning", "Plug", "PlugZap", "Flash", "FlashOff", "Sun", "Moon",
  "Stars", "Cloud", "CloudRain", "CloudSnow", "CloudLightning", "CloudFog",
  "CloudWind", "CloudDrizzle", "MoonStar", "SunMoon", "Sunrise", "Sunset",
  "History", "Hourglass", "TimerOff", "PlayCircle", "PauseCircle", "RepeatOne",
  "Music2", "Headphones", "Ear", "EarOff", "Volume", "Volume1", "Volume2",
  "VolumeX", "VideoOff", "CameraOff", "ImageMinus", "ImageOff", "ImagePlus",
  "Photo", "FilmReel", "AlignLeft", "AlignCenter", "AlignRight", "AlignJustify",
  "AlignHorizontal", "AlignVertical", "Distribute", "Indent", "Outdent", "Bold",
  "Italic", "Underline", "Strikethrough", "Quote", "Code2", "CodeBlock",
  "Terminal", "Prompt", "Hash", "Unlink", "Anchor", "View", "Hide", "Visible",
  "Invisible", "Find", "FindReplace", "SortAsc", "SortDesc", "GroupBy",
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUpLeft", "ArrowUpRight",
  "ArrowDownLeft", "ArrowDownRight", "ChevronUp", "ChevronDown", "ChevronLeft",
  "ChevronRight", "Move", "MoveDiagonal", "MoveHorizontal", "MoveVertical",
  "Resize", "RotateCw", "RotateCcw", "FlipHorizontal", "FlipVertical",
  "RefreshCw", "RefreshCcw", "History", "Undo", "Redo", "Trash", "Trash2",
  "TrashX", "Delete", "Archive", "ArchiveRestore", "SaveAll", "SaveAs", "Copy",
  "CopyCheck", "Paste", "Cut",
].filter((name) => {
  const component = lucide[name as keyof typeof lucide];
  return (
    typeof component === "function" ||
    (typeof component === "object" && component !== null && "$$typeof" in component)
  );
});

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const filteredIcons = ICON_NAMES.filter((name) =>
    name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-input bg-background text-left hover:bg-muted transition-colors",
        )}
      >
        {value && <span>{getIconElement(value)}</span>}
        <span className="text-sm text-muted-foreground">{value || "Select icon"}</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-lg border border-border bg-background shadow-lg">
          <input
            autoFocus
            placeholder="Search icons…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm border-b border-input focus:outline-none"
          />
          <div className="grid grid-cols-4 gap-1 p-2">
            {filteredIcons.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded text-sm transition-colors",
                  value === name
                    ? "bg-brand-blue/10 text-brand-blue border border-brand-blue/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                title={name}
              >
                <span className="w-5 h-5 shrink-0">{getIconElement(name)}</span>
                <span className="text-[10px]">{name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getIconElement(name: string): React.ReactElement | null {
  const component = lucide[name as keyof typeof lucide];
  if (
    !component ||
    (typeof component !== "function" &&
      (typeof component !== "object" || !("$$typeof" in component)))
  ) {
    return null;
  }
  const Comp = component as React.ElementType;
  return React.createElement(Comp, { className: "w-4 h-4" });
}

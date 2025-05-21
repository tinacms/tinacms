"use client";

import React, { useState } from "react";

import type { TCodeBlockElement } from "@udecode/plate-code-block";

import { cn } from "@udecode/cn";
import { useEditorRef, useElement, useReadOnly } from "@udecode/plate/react";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import lowlight from "lowlight";

const languages: { label: string; value: string }[] = [
  { label: "Plain Text", value: "plaintext" },
  { label: "1C", value: "1c" },
  { label: "Access Log", value: "accesslog" },
  { label: "ActionScript", value: "actionscript" },
  { label: "Ada", value: "ada" },
  { label: "Apache", value: "apache" },
  { label: "AppleScript", value: "applescript" },
  { label: "Arduino", value: "arduino" },
  { label: "ARM Assembly", value: "armasm" },
  { label: "AsciiDoc", value: "asciidoc" },
  { label: "AspectJ", value: "aspectj" },
  { label: "AutoHotkey", value: "autohotkey" },
  { label: "AutoIt", value: "autoit" },
  { label: "AVR Assembly", value: "avrasm" },
  { label: "Bash", value: "bash" },
  { label: "Basic", value: "basic" },
  { label: "BNF", value: "bnf" },
  { label: "Brainfuck", value: "brainfuck" },
  { label: "Cap'n Proto", value: "capnproto" },
  { label: "Ceylon", value: "ceylon" },
  { label: "Clojure", value: "clojure" },
  { label: "Clojure REPL", value: "clojure-repl" },
  { label: "CMake", value: "cmake" },
  { label: "CoffeeScript", value: "coffeescript" },
  { label: "C++", value: "cpp" },
  { label: "C", value: "c" },
  { label: "CrmSh", value: "crmsh" },
  { label: "Crystal", value: "crystal" },
  { label: "C#", value: "cs" },
  { label: "CSP", value: "csp" },
  { label: "CSS", value: "css" },
  { label: "D", value: "d" },
  { label: "Dart", value: "dart" },
  { label: "Delphi", value: "delphi" },
  { label: "Diff", value: "diff" },
  { label: "Django", value: "django" },
  { label: "DNS", value: "dns" },
  { label: "Dockerfile", value: "dockerfile" },
  { label: "DOS", value: "dos" },
  { label: "DTS", value: "dts" },
  { label: "Dust", value: "dust" },
  { label: "Elixir", value: "elixir" },
  { label: "Elm", value: "elm" },
  { label: "ERB", value: "erb" },
  { label: "Erlang REPL", value: "erlang-repl" },
  { label: "Erlang", value: "erlang" },
  { label: "Fortran", value: "fortran" },
  { label: "F#", value: "fsharp" },
  { label: "GAMS", value: "gams" },
  { label: "Gauss", value: "gauss" },
  { label: "G-Code", value: "gcode" },
  { label: "Gherkin", value: "gherkin" },
  { label: "GLSL", value: "glsl" },
  { label: "Go", value: "go" },
  { label: "Gradle", value: "gradle" },
  { label: "Groovy", value: "groovy" },
  { label: "HAML", value: "haml" },
  { label: "Handlebars", value: "handlebars" },
  { label: "Haskell", value: "haskell" },
  { label: "Haxe", value: "haxe" },
  { label: "HSP", value: "hsp" },
  { label: "XML", value: "xml" },
  { label: "HTML", value: "htmlbars" },
  { label: "HTTP", value: "http" },
  { label: "Inform7", value: "inform7" },
  { label: "INI", value: "ini" },
  { label: "IRPF90", value: "irpf90" },
  { label: "Java", value: "java" },
  { label: "JavaScript", value: "javascript" },
  { label: "JSON", value: "json" },
  { label: "Julia", value: "julia" },
  { label: "Kotlin", value: "kotlin" },
  { label: "Lasso", value: "lasso" },
  { label: "LaTeX", value: "tex" },
  { label: "Less", value: "less" },
  { label: "Lisp", value: "lisp" },
  { label: "LiveScript", value: "livescript" },
  { label: "Lua", value: "lua" },
  { label: "Makefile", value: "makefile" },
  { label: "Markdown", value: "markdown" },
  { label: "Mathematica", value: "mathematica" },
  { label: "MATLAB", value: "matlab" },
  { label: "Maxima", value: "maxima" },
  { label: "MEL", value: "mel" },
  { label: "Mercury", value: "mercury" },
  { label: "MIPS Assembly", value: "mipsasm" },
  { label: "Mizar", value: "mizar" },
  { label: "Mojolicious", value: "mojolicious" },
  { label: "Monkey", value: "monkey" },
  { label: "MoonScript", value: "moonscript" },
  { label: "NGINX", value: "nginx" },
  { label: "Nim", value: "nimrod" },
  { label: "Nix", value: "nix" },
  { label: "NSIS", value: "nsis" },
  { label: "Objective-C", value: "objectivec" },
  { label: "OCaml", value: "ocaml" },
  { label: "OpenSCAD", value: "openscad" },
  { label: "Oxygene", value: "oxygene" },
  { label: "Parser3", value: "parser3" },
  { label: "PF", value: "pf" },
  { label: "Perl", value: "perl" },
  { label: "PHP", value: "php" },
  { label: "PowerShell", value: "powershell" },
  { label: "Processing", value: "processing" },
  { label: "Prolog", value: "prolog" },
  { label: "Protocol Buffers", value: "protobuf" },
  { label: "Puppet", value: "puppet" },
  { label: "PureBASIC", value: "purebasic" },
  { label: "Python", value: "python" },
  { label: "Q", value: "q" },
  { label: "QML", value: "qml" },
  { label: "R", value: "r" },
  { label: "RenderMan RIB", value: "rib" },
  { label: "Roboconf", value: "roboconf" },
  { label: "Rust", value: "rust" },
  { label: "Ruby", value: "ruby" },
  { label: "Scala", value: "scala" },
  { label: "Scheme", value: "scheme" },
  { label: "Scilab", value: "scilab" },
  { label: "SCSS", value: "scss" },
  { label: "Smali", value: "smali" },
  { label: "Smalltalk", value: "smalltalk" },
  { label: "SML", value: "sml" },
  { label: "SQF", value: "sqf" },
  { label: "SQL", value: "sql" },
  { label: "Stan", value: "stan" },
  { label: "Stata", value: "stata" },
  { label: "STEP Part 21", value: "step21" },
  { label: "Stylus", value: "stylus" },
  { label: "Swift", value: "swift" },
  { label: "Tcl", value: "tcl" },
  { label: "Thrift", value: "thrift" },
  { label: "Twig", value: "twig" },
  { label: "TypeScript", value: "typescript" },
  { label: "Vala", value: "vala" },
  { label: "VB.Net", value: "vbnet" },
  { label: "VBScript in HTML", value: "vbscript-html" },
  { label: "VBScript", value: "vbscript" },
  { label: "Verilog", value: "verilog" },
  { label: "VHDL", value: "vhdl" },
  { label: "Vim", value: "vim" },
  { label: "x86 Assembly", value: "x86asm" },
  { label: "XQuery", value: "xquery" },
  { label: "YAML", value: "yaml" },
  { label: "Zephir", value: "zephir" },
];

export function CodeBlockCombobox() {
  const [open, setOpen] = useState(false);
  const readOnly = useReadOnly();
  const editor = useEditorRef();
  const element = useElement<TCodeBlockElement>();
  const value = element.lang || "plaintext";
  const [searchValue, setSearchValue] = React.useState("");

  const items = React.useMemo(
    () =>
      languages.filter(
        (language) =>
          !searchValue ||
          language.label.toLowerCase().includes(searchValue.toLowerCase())
      ),
    [searchValue]
  );

  if (readOnly) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="xs"
          className={cn(
            "h-6 justify-between gap-1 px-2 text-xs text-muted-foreground select-none",
            "hover:bg-[#E2E8F0] bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]",
            open && "bg-[#E2E8F0] text-[#0F172A]"
          )}
          aria-expanded={open}
          role="combobox"
        >
          {languages.find((language) => language.value === value)?.label ??
            "Plain Text"}
          <ChevronDown className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[200px] p-0 z-[10000]"
        onCloseAutoFocus={() => setSearchValue("")}
      >
        <Command shouldFilter={false}>
          <CommandInput
            className="h-9"
            value={searchValue}
            onValueChange={(value) => setSearchValue(value)}
            placeholder="Search language..."
          />
          <CommandEmpty>No language found.</CommandEmpty>

          <CommandList className="h-48 overflow-y-auto">
            <CommandGroup>
              {items.map((language) => (
                <CommandItem
                  key={language.label}
                  className="cursor-pointer rounded-md"
                  value={language.value}
                  onSelect={(value) => {
                    editor.tf.setNodes<TCodeBlockElement>(
                      { lang: value },
                      { at: element }
                    );
                    setSearchValue(value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      value === language.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {language.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

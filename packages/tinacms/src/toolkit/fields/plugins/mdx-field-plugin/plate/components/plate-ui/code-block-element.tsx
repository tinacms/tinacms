"use client";

import React, { useRef, useEffect } from "react";

import { cn, withRef } from "@udecode/cn";
import { formatCodeBlock, isLangSupported } from "@udecode/plate-code-block";
import { PlateElement } from "@udecode/plate/react";
import { BracesIcon } from "lucide-react";

import { Button } from "./button";
import { CodeBlockCombobox } from "./code-block-combobox";

//the default code block element from @udecode/plate-code-block
//custom styling to match TinaCMS branding + remove copy button
export const CodeBlockElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    const { editor, element } = props;

    return (
      <PlateElement
        ref={ref}
        className={cn(className, "py-1 not-tina-prose")}
        {...props}
      >
        <style>{`
          .tina-code-block .hljs-comment,
          .tina-code-block .hljs-code,
          .tina-code-block .hljs-formula { color: #6a737d; }
          .tina-code-block .hljs-keyword,
          .tina-code-block .hljs-doctag,
          .tina-code-block .hljs-template-tag,
          .tina-code-block .hljs-template-variable,
          .tina-code-block .hljs-type,
          .tina-code-block .hljs-variable.language_ { color: #d73a49; }
          .tina-code-block .hljs-title,
          .tina-code-block .hljs-title.class_,
          .tina-code-block .hljs-title.class_.inherited__,
          .tina-code-block .hljs-title.function_ { color: #6f42c1; }
          .tina-code-block .hljs-attr,
          .tina-code-block .hljs-attribute,
          .tina-code-block .hljs-literal,
          .tina-code-block .hljs-meta,
          .tina-code-block .hljs-number,
          .tina-code-block .hljs-operator,
          .tina-code-block .hljs-selector-attr,
          .tina-code-block .hljs-selector-class,
          .tina-code-block .hljs-selector-id,
          .tina-code-block .hljs-variable { color: #005cc5; }
          .tina-code-block .hljs-regexp,
          .tina-code-block .hljs-string,
          .tina-code-block .hljs-meta_.hljs-string { color: #0366d6; }
          .tina-code-block .hljs-built_in,
          .tina-code-block .hljs-symbol { color: #e36209; }
          .tina-code-block .hljs-name,
          .tina-code-block .hljs-quote,
          .tina-code-block .hljs-selector-tag,
          .tina-code-block .hljs-selector-pseudo { color: #22863a; }
          .tina-code-block .hljs-emphasis { font-style: italic; }
          .tina-code-block .hljs-strong { font-weight: bold; }
          .tina-code-block .hljs-section { font-weight: bold; color: #005cc5; }
          .tina-code-block .hljs-bullet { color: #735c0f; }
          .tina-code-block .hljs-addition { background: #f0fff4; color: #22863a; }
          .tina-code-block .hljs-deletion { background: #ffeef0; color: #b31d28; }
        `}</style>
        <div className="relative rounded-md bg-[#F1F5F9] shadow-sm">
          <pre className="overflow-x-auto p-4 pt-12 font-mono text-sm leading-[normal] [tab-size:2] print:break-inside-avoid my-2 tina-code-block">
            <code>{children}</code>
          </pre>

          <div className="absolute top-0 py-1 pr-1 rounded-t-md z-10 flex w-full justify-end gap-0.5 select-none border-b border-[#CBD5E1] bg-[#F1F5F9]">
            {isLangSupported(element.lang as string) && (
              <Button
                size="icon"
                variant="ghost"
                className="size-6 text-xs"
                onClick={() => formatCodeBlock(editor, { element })}
                title="Format code"
              >
                <BracesIcon className="!size-3.5 text-muted-foreground" />
              </Button>
            )}

            <CodeBlockCombobox />
          </div>
        </div>
      </PlateElement>
    );
  }
);

//

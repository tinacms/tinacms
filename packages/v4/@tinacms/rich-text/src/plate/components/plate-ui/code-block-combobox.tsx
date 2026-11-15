'use client';

import React, { useState } from 'react';

import type { TCodeBlockElement } from '@udecode/plate-code-block';

import { cn } from '@tinacms/ui/lib/utils';
import { useElement, useReadOnly } from '@udecode/plate/react';
import { Check, ChevronDown } from 'lucide-react';

import { Button } from './button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

const languages: { label: string; value: string }[] = [
  { label: 'Plain Text', value: 'plaintext' },
  { label: 'Arduino', value: 'arduino' },
  { label: 'Bash', value: 'bash' },
  { label: 'C', value: 'c' },
  { label: 'C++', value: 'cpp' },
  { label: 'C#', value: 'csharp' },
  { label: 'CSS', value: 'css' },
  { label: 'Diff', value: 'diff' },
  { label: 'Go', value: 'go' },
  { label: 'GraphQL', value: 'graphql' },
  { label: 'INI', value: 'ini' },
  { label: 'Java', value: 'java' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'JSON', value: 'json' },
  { label: 'Kotlin', value: 'kotlin' },
  { label: 'Less', value: 'less' },
  { label: 'Lua', value: 'lua' },
  { label: 'Makefile', value: 'makefile' },
  { label: 'Mermaid', value: 'mermaid' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'Objective-C', value: 'objectivec' },
  { label: 'Perl', value: 'perl' },
  { label: 'PHP', value: 'php' },
  { label: 'PHP Template', value: 'php-template' },
  { label: 'Python', value: 'python' },
  { label: 'Python REPL', value: 'python-repl' },
  { label: 'R', value: 'r' },
  { label: 'Ruby', value: 'ruby' },
  { label: 'Rust', value: 'rust' },
  { label: 'SCSS', value: 'scss' },
  { label: 'Shell', value: 'shell' },
  { label: 'SQL', value: 'sql' },
  { label: 'Swift', value: 'swift' },
  { label: 'TypeScript', value: 'ts' },
  { label: 'VB.Net', value: 'vbnet' },
  { label: 'WebAssembly', value: 'wasm' },
  { label: 'XML', value: 'xml' },
  { label: 'YAML', value: 'yaml' },

  { label: 'ASCIIDoc', value: 'asciidoc' },
  { label: 'Clojure', value: 'clojure' },
  { label: 'CMake', value: 'cmake' },
  { label: 'Dart', value: 'dart' },
  { label: 'Django', value: 'django' },
  { label: 'Dockerfile', value: 'dockerfile' },
  { label: 'Elixir', value: 'elixir' },
  { label: 'Elm', value: 'elm' },
  { label: 'Erlang', value: 'erlang' },
  { label: 'Gradle', value: 'gradle' },
  { label: 'Groovy', value: 'groovy' },
  { label: 'Handlebars', value: 'handlebars' },
  { label: 'Haskell', value: 'haskell' },
  { label: 'HTML', value: 'html' },
  { label: 'HTMLBars', value: 'htmlbars' },
  { label: 'Julia', value: 'julia' },
  { label: 'LaTeX', value: 'latex' },
  { label: 'MATLAB', value: 'matlab' },
  { label: 'NGINX', value: 'nginx' },
  { label: 'Nix', value: 'nix' },
  { label: 'OCaml', value: 'ocaml' },
  { label: 'PowerShell', value: 'powershell' },
  { label: 'Protocol Buffers', value: 'protobuf' },
  { label: 'Scala', value: 'scala' },
  { label: 'Verilog', value: 'verilog' },
  { label: 'VHDL', value: 'vhdl' },
];

interface CodeBlockComboboxProps {
  onLanguageChange: (lang: string) => void;
}

export function CodeBlockCombobox({
  onLanguageChange,
}: CodeBlockComboboxProps) {
  const [open, setOpen] = useState(false);
  const readOnly = useReadOnly();
  const element = useElement<TCodeBlockElement>();
  const value = element.lang || 'plaintext';
  const [searchValue, setSearchValue] = React.useState('');

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
      <PopoverTrigger asChild tabIndex={-1}>
        <Button
          tabIndex={-1}
          size='none'
          variant='ghost'
          className={cn(
            'h-6 justify-between gap-1 px-2 text-xs text-foreground select-none hover:bg-muted',
            open && 'bg-muted'
          )}
          aria-expanded={open}
          aria-label='Code language'
          role='combobox'
        >
          {languages.find((language) => language.value === value)?.label ??
            'Plain Text'}
          <ChevronDown aria-hidden className='size-3.5 text-muted-foreground' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        variant='menu'
        align='start'
        className='z-[10000] w-56'
        onCloseAutoFocus={() => setSearchValue('')}
      >
        <Command shouldFilter={false}>
          <CommandInput
            tabIndex={-1}
            value={searchValue}
            onValueChange={(value) => setSearchValue(value)}
            placeholder='Search language...'
          />
          <CommandEmpty>No language found.</CommandEmpty>

          <CommandList className='max-h-[min(12rem,var(--radix-popover-content-available-height,12rem))]'>
            <CommandGroup>
              {items.map((language) => {
                const current = value === language.value;
                return (
                  <CommandItem
                    key={language.label}
                    value={language.value}
                    aria-current={current || undefined}
                    onSelect={(value) => {
                      onLanguageChange(value);
                      setSearchValue(value);
                      setOpen(false);
                    }}
                  >
                    <span className='min-w-0 flex-1 truncate'>
                      {language.label}
                    </span>
                    {current ? (
                      <Check aria-hidden className='size-4 text-foreground' />
                    ) : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

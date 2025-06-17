'use client';

import React, { useState } from 'react';

import type { TCodeBlockElement } from '@udecode/plate-code-block';

import { cn } from '@udecode/cn';
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

// Languages available in lowlight (base + important additional languages)
const languages: { label: string; value: string }[] = [
  // Base languages
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

  // Additional important languages
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
  { label: 'HTML', value: 'htmlbars' },
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
          size='xs'
          className={cn(
            'h-6 justify-between gap-1 px-2 text-xs text-muted-foreground select-none',
            'hover:bg-[#E2E8F0] bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]',
            open && 'bg-[#E2E8F0] text-[#0F172A]'
          )}
          aria-expanded={open}
          role='combobox'
        >
          {languages.find((language) => language.value === value)?.label ??
            'Plain Text'}
          <ChevronDown className='size-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-[200px] p-0 z-[10000]'
        onCloseAutoFocus={() => setSearchValue('')}
      >
        <Command shouldFilter={false}>
          <CommandInput
            tabIndex={-1}
            className='h-9'
            value={searchValue}
            onValueChange={(value) => setSearchValue(value)}
            placeholder='Search language...'
          />
          <CommandEmpty>No language found.</CommandEmpty>

          <CommandList className='h-48 overflow-y-auto'>
            <CommandGroup>
              {items.map((language) => (
                <CommandItem
                  key={language.label}
                  className='cursor-pointer rounded-md'
                  value={language.value}
                  onSelect={(value) => {
                    onLanguageChange(value);
                    setSearchValue(value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      value === language.value ? 'opacity-100' : 'opacity-0'
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

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  LexicalTypeaheadMenuPlugin,
  QueryMatch,
  TypeaheadOption,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin'
import { TextNode } from 'lexical'
import { useCallback, useEffect, useMemo, useState } from 'react'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { $createMentionNode } from './mentionsNode'

const PUNCTUATION =
  '\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%\'"~=<>_:;'
const NAME = '\\b[A-Z][^\\s' + PUNCTUATION + ']'

const DocumentMentionsRegex = {
  NAME,
  PUNCTUATION,
}

const CapitalizedNameMentionsRegex = new RegExp(
  '(^|[^#])((?:' + DocumentMentionsRegex.NAME + '{' + 1 + ',})$)'
)

const PUNC = DocumentMentionsRegex.PUNCTUATION

const TRIGGERS = ['@'].join('')

// Chars we expect to see in a mention (non-space, non-punctuation).
const VALID_CHARS = '[^' + TRIGGERS + PUNC + '\\s]'

// Non-standard series of chars. Each series must be preceded and followed by
// a valid char.
const VALID_JOINS =
  '(?:' +
  '\\.[ |$]|' + // E.g. "r. " in "Mr. Smith"
  ' |' + // E.g. " " in "Josh Duck"
  '[' +
  PUNC +
  ']|' + // E.g. "-' in "Salier-Hellendag"
  ')'

const LENGTH_LIMIT = 75

const AtSignMentionsRegex = new RegExp(
  '(^|\\s|\\()(' +
    '[' +
    TRIGGERS +
    ']' +
    '((?:' +
    VALID_CHARS +
    VALID_JOINS +
    '){0,' +
    LENGTH_LIMIT +
    '})' +
    ')$'
)

// 50 is the longest alias length limit.
const ALIAS_LENGTH_LIMIT = 50

// Regex used to match alias.
const AtSignMentionsRegexAliasRegex = new RegExp(
  '(^|\\s|\\()(' +
    '[' +
    TRIGGERS +
    ']' +
    '((?:' +
    VALID_CHARS +
    '){0,' +
    ALIAS_LENGTH_LIMIT +
    '})' +
    ')$'
)

// At most, 5 suggestions are shown in the popup.
const SUGGESTION_LIST_LENGTH_LIMIT = 5

const mentionsCache = new Map()

const dummyMentionsData = [
  'Aayla Secura',
  'Admiral Dodd Rancit',
  'Aurra Sing',
  'BB-8',
  'Bo-Katan Kryze',
  'Breha Antilles-Organa',
  'C-3PO',
  'Captain Quarsh Panaka',
  'Chewbacca',
  'Darth Tyranus',
  'Daultay Dofine',
  'Dexter Jettster',
  'Ebe E. Endocott',
  'Eli Vanto',
  'Ezra Bridger',
  'Faro Argyus',
  'Finis Valorum',
  'FN-2003',
  'Garazeb "Zeb" Orrelios',
  'Grand Inquisitor',
  'Greeata Jendowanian',
  'Hammerhead',
  'Han Solo',
  'Hevy',
  'Hondo Ohnaka',
  'Ima-Gun Di',
  'Inquisitors',
  'Inspector Thanoth',
  'Jabba',
  'Janus Greejatus',
  'Jaxxon',
  'K-2SO',
  'Kanan Jarrus',
  'Kylo Ren',
  'L3-37',
  'Lieutenant Kaydel Ko Connix',
  'Luke Skywalker',
  'Mace Windu',
  'Maximilian Veers',
  'Mother Talzin',
  'Nahdar Vebb',
  'Nahdonnis Praji',
  'Nien Nunb',
  'Obi-Wan Kenobi',
  'Odd Ball',
  'Orrimarko',
  'Petty Officer Thanisson',
  'Pooja Naberrie',
  'PZ-4CO',
  'Quarrie',
  'Quiggold',
  'Quinlan Vos',
  'R2-D2',
  'Raymus Antilles',
  'Ree-Yees',
  'Sana Starros',
  'Shmi Skywalker',
  'Shu Mai',
  'Tallissan Lintra',
  'Tarfful',
  'Thane Kyrell',
  'U9-C4',
  'Unkar Plutt',
  'Val Beckett',
  'Vice Admiral Amilyn Holdo',
  'Vober Dand',
  'WAC-47',
  'Wedge Antilles',
  'Wicket W. Warrick',
  'Xamuel Lennox',
  'Yaddle',
  'Yarael Poof',
  'Yoda',
  'Zam Wesell',
  'Ziro the Hutt',
  'Zuckuss',
]

const dummyLookupService = {
  search(string: string, callback: (results: Array<string>) => void): void {
    setTimeout(() => {
      const results = dummyMentionsData.filter((mention) =>
        mention.toLowerCase().includes(string.toLowerCase())
      )
      callback(results)
    }, 500)
  },
}

function useMentionLookupService(mentionString: string | null) {
  const [results, setResults] = useState<Array<string>>([])

  useEffect(() => {
    const cachedResults = mentionsCache.get(mentionString)

    if (mentionString == null) {
      setResults([])
      return
    }

    if (cachedResults === null) {
      return
    } else if (cachedResults !== undefined) {
      setResults(cachedResults)
      return
    }

    mentionsCache.set(mentionString, null)
    dummyLookupService.search(mentionString, (newResults) => {
      mentionsCache.set(mentionString, newResults)
      setResults(newResults)
    })
  }, [mentionString])

  return results
}

function checkForCapitalizedNameMentions(
  text: string,
  minMatchLength: number
): QueryMatch | null {
  const match = CapitalizedNameMentionsRegex.exec(text)
  if (match !== null) {
    // The strategy ignores leading whitespace but we need to know it's
    // length to add it to the leadOffset
    const maybeLeadingWhitespace = match[1]

    const matchingString = match[2]
    if (matchingString != null && matchingString.length >= minMatchLength) {
      return {
        leadOffset: match.index + maybeLeadingWhitespace.length,
        matchingString,
        replaceableString: matchingString,
      }
    }
  }
  return null
}

function checkForAtSignMentions(
  text: string,
  minMatchLength: number
): QueryMatch | null {
  let match = AtSignMentionsRegex.exec(text)

  if (match === null) {
    match = AtSignMentionsRegexAliasRegex.exec(text)
  }
  if (match !== null) {
    // The strategy ignores leading whitespace but we need to know it's
    // length to add it to the leadOffset
    const maybeLeadingWhitespace = match[1]

    const matchingString = match[3]
    if (matchingString.length >= minMatchLength) {
      return {
        leadOffset: match.index + maybeLeadingWhitespace.length,
        matchingString,
        replaceableString: match[2],
      }
    }
  }
  return null
}

function getPossibleQueryMatch(text: string): QueryMatch | null {
  const match = checkForAtSignMentions(text, 1)
  return match === null ? checkForCapitalizedNameMentions(text, 3) : match
}

class MentionTypeaheadOption extends TypeaheadOption {
  name: string
  picture: JSX.Element

  constructor(name: string, picture: JSX.Element) {
    super(name)
    this.name = name
    this.picture = picture
  }
}

function MentionsTypeaheadMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number
  isSelected: boolean
  onClick: () => void
  onMouseEnter: () => void
  option: MentionTypeaheadOption
}) {
  let className = 'block px-4 py-2 text-sm'
  if (isSelected) {
    className += ' bg-gray-100 text-gray-900'
  } else {
    className += ' bg-white text-gray-700 '
  }
  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={className}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={'typeahead-item-' + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      {option.picture}
      <span className="text">{option.name}</span>
    </li>
  )
}

export default function MentionsPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()

  const [queryString, setQueryString] = useState<string | null>(null)

  const results = useMentionLookupService(queryString)

  const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0,
  })

  const options = useMemo(
    () =>
      results
        .map((result) => new MentionTypeaheadOption(result, <i />))
        .slice(0, SUGGESTION_LIST_LENGTH_LIMIT),
    [results]
  )

  const onSelectOption = useCallback(
    (
      selectedOption: MentionTypeaheadOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void
    ) => {
      editor.update(() => {
        const mentionNode = $createMentionNode(selectedOption.name)
        if (nodeToReplace) {
          nodeToReplace.replace(mentionNode)
        }
        mentionNode.select()
        closeMenu()
      })
    },
    [editor]
  )

  const checkForMentionMatch = useCallback(
    (text: string) => {
      const mentionMatch = getPossibleQueryMatch(text)
      const slashMatch = checkForSlashTriggerMatch(text, editor)
      return !slashMatch && mentionMatch ? mentionMatch : null
    },
    [checkForSlashTriggerMatch, editor]
  )

  return (
    <LexicalTypeaheadMenuPlugin<MentionTypeaheadOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForMentionMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
      ) =>
        anchorElementRef.current && results.length
          ? ReactDOM.createPortal(
              <div className="w-72 bg-white shadow-lg rounded-md  relative top-full">
                <ul className="p-0 list-style-none m-0 rounded-md overflow-y-scroll max-h-[200px]">
                  {options.map((option, i: number) => (
                    <MentionsTypeaheadMenuItem
                      index={i}
                      isSelected={selectedIndex === i}
                      onClick={() => {
                        setHighlightedIndex(i)
                        selectOptionAndCleanUp(option)
                      }}
                      onMouseEnter={() => {
                        setHighlightedIndex(i)
                      }}
                      key={option.key}
                      option={option}
                    />
                  ))}
                </ul>
              </div>,
              anchorElementRef.current
            )
          : null
      }
    />
  )
}

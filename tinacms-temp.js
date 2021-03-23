'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}
function _createStarExport(obj) {
  Object.keys(obj)
    .filter(key => key !== 'default' && key !== '__esModule')
    .forEach(key => {
      if (exports.hasOwnProperty(key)) {
        return
      }
      Object.defineProperty(exports, key, {
        enumerable: true,
        get: () => obj[key],
      })
    })
} // packages/tinacms/src/index.ts
var _reactmodals = require('@tinacms/react-modals')
_createStarExport(_reactmodals)

var _core = require('@tinacms/core')
var _reactforms = require('@tinacms/react-forms')
var _reactscreens = require('@tinacms/react-screens')
var _fields = require('@tinacms/fields')
_createStarExport(_fields)
var _formbuilder = require('@tinacms/form-builder')
_createStarExport(_formbuilder)
var _forms = require('@tinacms/forms')

// packages/tinacms/src/react-tinacms/use-cms.ts
var _reactcore = require('@tinacms/react-core')

function useCMS() {
  return _reactcore.useCMS.call(void 0)
}

// packages/tinacms/src/plugins/screens/index.tsx

var _react = require('react')
var _react2 = _interopRequireDefault(_react)
var _icons = require('@tinacms/icons')

var GlobalFormPlugin = class {
  constructor(form, icon, layout) {
    this.form = form
    this.__type = 'screen'
    this.name = form.label
    this.Icon = icon || _icons.SettingsIcon
    this.layout = layout || 'popup'
    this.Component = () => {
      return /* @__PURE__ */ _react.createElement.call(
        void 0,
        _reactforms.FormView,
        {
          activeForm: form,
        }
      )
    }
  }
}

// packages/tinacms/src/react-tinacms/use-form.ts

function useGlobalForm(options, watch = {}) {
  const [values, form] = _reactcore.useForm.call(void 0, options, watch)
  const GlobalForm = _react.useMemo.call(
    void 0,
    () => {
      if (!form) return
      return new GlobalFormPlugin(form)
    },
    [form]
  )
  _reactcore.usePlugins.call(void 0, GlobalForm)
  return [values, form]
}
function useFormScreenPlugin(form, icon, layout) {
  const GlobalForm = _react.useMemo.call(
    void 0,
    () => {
      if (!form) return
      return new GlobalFormPlugin(form, icon, layout)
    },
    [form, icon, layout]
  )
  _reactcore.usePlugins.call(void 0, GlobalForm)
}

// packages/tinacms/src/react-tinacms/use-plugin.tsx

// packages/tinacms/src/react-tinacms/use-subscribable.tsx

// packages/tinacms/src/react-tinacms/use-watch-form-values.ts

// packages/tinacms/src/react-tinacms/with-plugin.tsx

// packages/tinacms/src/react-tinacms/with-tina.tsx

// packages/tinacms/src/components/TinaProvider.tsx

// packages/tinacms/src/components/TinaCMSProvider.tsx

// packages/tinacms/src/tina-cms.ts

var _alerts2 = require('@tinacms/alerts')
var _reactsidebar = require('@tinacms/react-sidebar')
var _reacttoolbar = require('@tinacms/react-toolbar')

// packages/tinacms/src/plugins/fields/markdown.tsx

var _styledcomponents = require('styled-components')
var _styledcomponents2 = _interopRequireDefault(_styledcomponents)
var DateFieldPlaceholder = {
  __type: 'field',
  name: 'date',
  Component: createPlaceholder(
    'Date',
    'https://github.com/tinacms/tinacms/pull/1281'
  ),
}
var MarkdownFieldPlaceholder = {
  __type: 'field',
  name: 'markdown',
  Component: createPlaceholder(
    'Markdown',
    'https://github.com/tinacms/tinacms/pull/1134'
  ),
}
var HtmlFieldPlaceholder = {
  __type: 'field',
  name: 'html',
  Component: createPlaceholder(
    'HTML',
    'https://github.com/tinacms/tinacms/pull/1134'
  ),
}
var PlaceholderParagraph = _styledcomponents2.default.p`
  white-space: normal;
  font-size: var(--tina-font-size-2);
  margin: 8px 0 0 0;

  a {
    color: var(--tina-color-primary);
  }
`
function createPlaceholder(name, pr) {
  return props => {
    return /* @__PURE__ */ _react2.default.createElement(
      _fields.FieldMeta,
      {
        name: props.input.name,
        label: `Deprecated: ${name} Field`,
      },
      /* @__PURE__ */ _react2.default.createElement(
        PlaceholderParagraph,
        null,
        'In order to help improve bundle sizes the ',
        name,
        ' Field has been removed from the set of default fields.'
      ),
      /* @__PURE__ */ _react2.default.createElement(
        PlaceholderParagraph,
        null,
        'See the docs to learn how to',
        ' ',
        /* @__PURE__ */ _react2.default.createElement(
          'a',
          {
            href: 'https://tinacms.org/docs/cms/plugins#adding-plugins',
            target: '_blank',
            rel: 'noreferrer noopener',
          },
          'add the ',
          name,
          ' plugin'
        ),
        ' ',
        'to your CMS.'
      ),
      /* @__PURE__ */ _react2.default.createElement(
        PlaceholderParagraph,
        null,
        'Visit the',
        ' ',
        /* @__PURE__ */ _react2.default.createElement(
          'a',
          {
            href: pr,
            target: '_blank',
            rel: 'noreferrer noopener',
          },
          'Pull Request'
        ),
        ' ',
        'to learn more about why this change was made.'
      )
    )
  }
}

// packages/tinacms/src/plugins/screens/media-manager-screen.tsx

// packages/tinacms/src/components/media/media-manager.tsx

var _path = require('path')
var _path2 = _interopRequireDefault(_path)
var _styles = require('@tinacms/styles')
var _reactdropzone = require('react-dropzone')

function MediaManager() {
  const cms = useCMS()
  const [request, setRequest] = _react.useState.call(void 0)
  _react.useEffect.call(
    void 0,
    () => {
      return cms.events.subscribe('media:open', ({ type, ...request2 }) => {
        setRequest(request2)
      })
    },
    []
  )
  if (!request) return null
  const close = () => setRequest(void 0)
  return /* @__PURE__ */ _react2.default.createElement(
    _reactmodals.Modal,
    null,
    /* @__PURE__ */ _react2.default.createElement(
      _reactmodals.FullscreenModal,
      null,
      /* @__PURE__ */ _react2.default.createElement(
        _reactmodals.ModalHeader,
        {
          close,
        },
        'Media Manager'
      ),
      /* @__PURE__ */ _react2.default.createElement(
        _reactmodals.ModalBody,
        null,
        /* @__PURE__ */ _react2.default.createElement(MediaPicker, {
          ...request,
          close,
        })
      )
    )
  )
}
function MediaPicker({ allowDelete, onSelect, close, ...props }) {
  const cms = useCMS()
  const Paginator = cms.plugins.getType('media:ui').find('paginator')
  const [listState, setListState] = _react.useState.call(void 0, () => {
    if (cms.media.isConfigured) return 'loading'
    return 'not-configured'
  })
  const [directory, setDirectory] = _react.useState.call(
    void 0,
    props.directory
  )
  const [offset, setOffset] = _react.useState.call(void 0, 0)
  const [limit] = _react.useState.call(void 0, props.limit || 50)
  const [list, setList] = _react.useState.call(void 0, {
    limit,
    offset,
    items: [],
    totalCount: 0,
  })
  _react.useEffect.call(
    void 0,
    () => {
      function loadMedia() {
        setListState('loading')
        cms.media
          .list({ offset, limit, directory })
          .then(list2 => {
            setList(list2)
            setListState('loaded')
          })
          .catch(e => {
            console.error(e)
            setListState('error')
          })
      }
      loadMedia()
      return cms.events.subscribe(
        ['media:upload:success', 'media:delete:success'],
        loadMedia
      )
    },
    [offset, limit, directory]
  )
  const onClickMediaItem = item => {
    if (item.type === 'dir') {
      setDirectory(_path2.default.join(item.directory, item.filename))
      setOffset(0)
    }
  }
  let deleteMediaItem
  if (allowDelete) {
    deleteMediaItem = item => {
      if (confirm('Are you sure you want to delete this file?')) {
        cms.media.delete(item)
      }
    }
  }
  let selectMediaItem
  if (onSelect) {
    selectMediaItem = item => {
      onSelect(item)
      if (close) close()
    }
  }
  const [uploading, setUploading] = _react.useState.call(void 0, false)
  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = _reactdropzone.useDropzone.call(void 0, {
    accept: 'image/*',
    onDrop: async files => {
      try {
        setUploading(true)
        await cms.media.persist(
          files.map(file => {
            return {
              directory: directory || '/',
              file,
            }
          })
        )
      } catch (e) {}
      setUploading(false)
    },
  })
  const { onClick, ...rootProps } = getRootProps()
  function disableScrollBody() {
    const body = document == null ? void 0 : document.body
    body.style.overflow = 'hidden'
    return () => {
      body.style.overflow = 'auto'
    }
  }
  _react.useEffect.call(void 0, disableScrollBody, [])
  if (listState === 'loading') {
    return /* @__PURE__ */ _react2.default.createElement(LoadingMediaList, null)
  }
  if (listState === 'not-configured') {
    return /* @__PURE__ */ _react2.default.createElement(DocsLink, {
      title: 'Please Set up a Media Store',
    })
  }
  if (listState === 'error') {
    return /* @__PURE__ */ _react2.default.createElement(DocsLink, {
      title: 'Failed to Load Media',
    })
  }
  return /* @__PURE__ */ _react2.default.createElement(
    MediaPickerWrap,
    null,
    /* @__PURE__ */ _react2.default.createElement(
      Header,
      null,
      /* @__PURE__ */ _react2.default.createElement(Breadcrumb, {
        directory,
        setDirectory,
      }),
      /* @__PURE__ */ _react2.default.createElement(UploadButton, {
        onClick,
        uploading,
      })
    ),
    /* @__PURE__ */ _react2.default.createElement(
      List,
      {
        ...rootProps,
        dragActive: isDragActive,
      },
      /* @__PURE__ */ _react2.default.createElement('input', {
        ...getInputProps(),
      }),
      listState === 'loaded' &&
        list.items.length === 0 &&
        /* @__PURE__ */ _react2.default.createElement(EmptyMediaList, null),
      list.items.map(item =>
        /* @__PURE__ */ _react2.default.createElement(MediaItem, {
          key: item.id,
          item,
          onClick: onClickMediaItem,
          onSelect: selectMediaItem,
          onDelete: deleteMediaItem,
        })
      )
    ),
    /* @__PURE__ */ _react2.default.createElement(Paginator.Component, {
      list,
      setOffset,
    })
  )
}
var UploadButton = ({ onClick, uploading }) => {
  return /* @__PURE__ */ _react2.default.createElement(
    _styles.Button,
    {
      style: { minWidth: '5.3rem' },
      primary: true,
      busy: uploading,
      onClick,
    },
    uploading
      ? /* @__PURE__ */ _react2.default.createElement(
          _reactforms.LoadingDots,
          null
        )
      : 'Upload'
  )
}
var LoadingMediaList = _styledcomponents2.default.call(void 0, props => {
  return /* @__PURE__ */ _react2.default.createElement(
    'div',
    {
      ...props,
    },
    /* @__PURE__ */ _react2.default.createElement(_reactforms.LoadingDots, {
      color: 'var(--tina-color-primary)',
    })
  )
})`
  width: 100%;
  height: 75%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`
var MediaPickerWrap = _styledcomponents2.default.div`
  height: 100%;
  overflow-y: auto;
  color: var(--tina-color-grey-9);
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: var(--tina-color-grey-1);
  padding: 0 1rem var(--tina-padding-big) 1rem;

  ::-webkit-scrollbar {
    width: 0;
  }

  *:active,
  *:focus {
    outline: none;
  }

  @media (min-width: 720px) {
    padding: 0 1.125rem var(--tina-padding-big) 1.125rem;
  }
`
var Header = _styledcomponents2.default.div`
  display: flex;
  align-items: center;
  background: var(--tina-color-grey-1);
  padding: var(--tina-padding-big) 0.75rem;
  border-radius: var(--tina-radius-small);
  position: sticky;
  top: 0;
  z-index: 1;

  @media (min-width: 720px) {
    padding: var(--tina-padding-big) 1rem var(--tina-padding-big) 1.125rem;
  }
`
var List = _styledcomponents2.default.ul`
  display: flex;
  flex-direction: column;
  padding: 0 0 2rem 0;
  margin: 0;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;

  ${p =>
    p.dragActive &&
    _styledcomponents.css`
      border: 2px solid var(--tina-color-primary);
      border-radius: var(--tina-radius-small);
    `}
`
var EmptyMediaList = _styledcomponents2.default.call(void 0, props => {
  return /* @__PURE__ */ _react2.default.createElement(
    'div',
    {
      ...props,
    },
    'Drag and Drop assets here'
  )
})`
  font-size: 1.5rem;
  opacity: 50%;
  padding: 3rem;
  text-align: center;
`
var DocsLink = _styledcomponents2.default.call(
  void 0,
  ({ title, ...props }) => {
    return /* @__PURE__ */ _react2.default.createElement(
      'div',
      {
        ...props,
      },
      /* @__PURE__ */ _react2.default.createElement('h2', null, title),
      /* @__PURE__ */ _react2.default.createElement(
        'div',
        null,
        ' ',
        'Visit the',
        ' ',
        /* @__PURE__ */ _react2.default.createElement(
          'a',
          {
            href: 'https://tinacms.org/docs/media',
            rel: 'noreferrer noopener',
          },
          'docs'
        ),
        ' ',
        'to learn more about setting up the Media Manager for your CMS.'
      )
    )
  }
)`
  height: 75%;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  a {
    color: black;
    text-decoration: underline;
    font-weight: bold;
  }
`

// packages/tinacms/src/components/media/media-item.tsx

function MediaItem({ item, onClick, onSelect, onDelete }) {
  return /* @__PURE__ */ _react2.default.createElement(
    ListItem,
    {
      onClick: () => onClick(item),
      type: item.type,
    },
    /* @__PURE__ */ _react2.default.createElement(
      ItemPreview,
      null,
      item.previewSrc
        ? /* @__PURE__ */ _react2.default.createElement('img', {
            src: item.previewSrc,
            alt: item.filename,
          })
        : /* @__PURE__ */ _react2.default.createElement(FileIcon, {
            type: item.type,
          })
    ),
    /* @__PURE__ */ _react2.default.createElement(
      Filename,
      null,
      item.filename
    ),
    /* @__PURE__ */ _react2.default.createElement(
      ActionButtons,
      null,
      onSelect &&
        item.type === 'file' &&
        /* @__PURE__ */ _react2.default.createElement(
          _styles.Button,
          {
            small: true,
            onClick: () => onSelect(item),
          },
          'Insert'
        ),
      onDelete &&
        item.type === 'file' &&
        /* @__PURE__ */ _react2.default.createElement(
          _styles.IconButton,
          {
            small: true,
            onClick: () => onDelete(item),
          },
          /* @__PURE__ */ _react2.default.createElement(_icons.TrashIcon, null)
        )
    )
  )
}
function FileIcon({ type }) {
  return type === 'dir'
    ? /* @__PURE__ */ _react2.default.createElement(_icons.Folder, null)
    : /* @__PURE__ */ _react2.default.createElement(_icons.File, null)
}
var ListItem = _styledcomponents2.default.li`
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: white;
  filter: drop-shadow(0 0 0 transparent);
  transition: filter 300ms ease;
  border: 1px solid var(--tina-color-grey-2);
  margin-bottom: var(--tina-padding-small);
  border-radius: var(--tina-radius-small);
  min-height: 90px;

  > :first-child {
    margin-right: var(--tina-padding-small);
  }

  &:hover {
    filter: drop-shadow(var(--tina-shadow-small));
    ${p =>
      p.type === 'dir' &&
      _styledcomponents.css`
        cursor: pointer;
      `}
  }

  @media screen and (min-width: 720px) {
    padding: 1.125rem;

    > :first-child {
      margin-right: var(--tina-padding-big);
    }
  }
`
var ItemPreview = _styledcomponents2.default.div`
  width: 56px;
  height: 56px;
  border-radius: var(--tina-radius-small);
  overflow: hidden;
  display: flex;
  justify-content: center;
  flex-shrink: 0;

  > img {
    object-fit: cover;
    width: 100%;
    min-height: 100%;
    object-position: center;
  }

  > svg {
    width: 47%;
    height: 100%;
    fill: var(--tina-color-grey-4);
  }
`
var Filename = _styledcomponents2.default.span`
  flex-grow: 1;
  font-size: var(--tina-font-size-2);
  overflow: hidden;
  width: 100%;
  overflow-wrap: break-word;
  white-space: nowrap;
  text-overflow: ellipsis;
`
var ActionButtons = _styledcomponents2.default.span`
  display: flex;
  > * {
    margin-left: var(--tina-padding-small);
  }
`

// packages/tinacms/src/components/media/breadcrumb.tsx

function Breadcrumb({ directory = '', setDirectory }) {
  directory = directory.replace(/^\/|\/$/g, '')
  let prevDir = _path2.default.dirname(directory)
  if (prevDir === '.') {
    prevDir = ''
  }
  return /* @__PURE__ */ _react2.default.createElement(
    BreadcrumbWrapper,
    {
      showArrow: directory !== '',
    },
    /* @__PURE__ */ _react2.default.createElement(
      'span',
      {
        onClick: () => setDirectory(prevDir),
      },
      /* @__PURE__ */ _react2.default.createElement(_icons.LeftArrowIcon, null)
    ),
    /* @__PURE__ */ _react2.default.createElement(
      'button',
      {
        onClick: () => setDirectory(''),
      },
      'Media'
    ),
    directory &&
      directory.split('/').map((part, index, parts) => {
        const currentDir = parts.slice(0, index + 1).join('/')
        return /* @__PURE__ */ _react2.default.createElement(
          'button',
          {
            key: currentDir,
            onClick: () => {
              setDirectory(currentDir)
            },
          },
          part
        )
      })
  )
}
var BreadcrumbWrapper = _styledcomponents2.default.div`
  width: 100%;
  display: flex;
  align-items: center;
  color: var(--tina-color-grey-4);
  font-size: var(--tina-font-size-3);
  margin-left: -12px;

  button {
    text-transform: capitalize;
    transition: color 180ms ease;
    border: 0;
    background-color: transparent;
    font-size: inherit;
    color: inherit;
  }

  > span {
    display: flex;
  }

  svg {
    width: 20px;
    height: 20px;
    fill: var(--tina-color-grey-4);
    transform: translateX(6px);
    opacity: 0;
    transition: opacity 200ms ease, transform 300ms ease-out;
    align-self: center;
  }

  ${p =>
    p.showArrow &&
    _styledcomponents.css`
      svg {
        opacity: 1;
        transform: translateX(0px);
        transition: opacity 180ms ease, transform 300ms ease-in;
      }
    `}

  svg:hover {
    cursor: pointer;
    fill: var(--tina-color-grey-9);
  }

  button:hover {
    color: var(--tina-color-grey-9);
  }

  > :not(:last-child) {
    display: none;
  }

  > :first-child {
    display: inline;
  }

  *:not(span)::after {
    content: '/';
    padding-left: 8px;
  }

  > *:not(:first-of-type) {
    padding-left: 8px;
  }

  @media (min-width: 720px) {
    font-size: var(--tina-font-size-2);

    svg {
      margin-left: -8px;
    }

    ${p =>
      p.showArrow &&
      _styledcomponents.css`
        svg {
          transform: translateX(-4px);
        }
      `}

    > :not(:last-child) {
      display: flex;
    }

    > *:not(:first-of-type) {
      padding-left: 8px;
    }
  }
`

// packages/tinacms/src/components/media/pagination.tsx

var BaseMediaPaginator = {
  __type: 'media:ui',
  name: 'paginator',
  Component: PageLinks,
}
function PageLinks({ list, setOffset }) {
  const limit = list.limit || 10
  const numPages = Math.ceil(list.totalCount / limit)
  const lastItemIndexOnPage = list.offset + limit
  const currentPageIndex = lastItemIndexOnPage / limit
  let pageLinks = []
  if (numPages <= 1) {
    return null
  }
  for (let i = 1; i <= numPages; i++) {
    const active = i === currentPageIndex
    pageLinks.push(
      /* @__PURE__ */ _react2.default.createElement(
        PageNumber,
        {
          active,
          onClick: () => setOffset(i * limit),
        },
        i
      )
    )
  }
  return /* @__PURE__ */ _react2.default.createElement(
    PageLinksWrap,
    null,
    pageLinks
  )
}
var PageLinksWrap = _styledcomponents2.default.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-top: var(--tina-padding-small);
`
var PageNumber = _styledcomponents2.default.button`
  padding: 0 0.15rem;
  margin: var(--tina-padding-small);
  transition: box-shadow 180ms ease;
  background-color: transparent;
  border: none;

  :hover {
    cursor: pointer;
    box-shadow: 0 1px 0 var(--tina-color-grey-9);
  }

  ${p =>
    !p.active &&
    _styledcomponents.css`
      color: var(--tina-color-grey-4);
    `}
`

// packages/tinacms/src/plugins/screens/media-manager-screen.tsx
var MediaManagerScreenPlugin = _reactscreens.createScreen.call(void 0, {
  name: 'Media Manager',
  Component: MediaPicker,
  Icon: _icons.MediaIcon,
  layout: 'fullscreen',
  props: {
    allowDelete: true,
  },
})

// packages/tinacms/src/tina-cms.ts
var DEFAULT_FIELDS = [
  _fields.TextFieldPlugin,
  _fields.TextareaFieldPlugin,
  _fields.ImageFieldPlugin,
  _fields.ColorFieldPlugin,
  _fields.NumberFieldPlugin,
  _fields.ToggleFieldPlugin,
  _fields.SelectFieldPlugin,
  _fields.RadioGroupFieldPlugin,
  _fields.GroupFieldPlugin,
  _fields.GroupListFieldPlugin,
  _fields.ListFieldPlugin,
  _fields.BlocksFieldPlugin,
  _fields.TagsFieldPlugin,
  MarkdownFieldPlaceholder,
  HtmlFieldPlaceholder,
  DateFieldPlaceholder,
]
var TinaCMS = class extends _core.CMS {
  constructor({ sidebar, toolbar, alerts = {}, ...config } = {}) {
    super(config)
    this.alerts.setMap({
      'media:upload:failure': () => ({
        level: 'error',
        message: 'Failed to upload file.',
      }),
      'media:delete:failure': () => ({
        level: 'error',
        message: 'Failed to delete file.',
      }),
      ...alerts,
    })
    if (sidebar) {
      const sidebarConfig = typeof sidebar === 'object' ? sidebar : void 0
      this.sidebar = new (0, _reactsidebar.SidebarState)(
        this.events,
        sidebarConfig
      )
    }
    if (toolbar) {
      const toolbarConfig = typeof toolbar === 'object' ? toolbar : void 0
      this.toolbar = new (0, _reacttoolbar.ToolbarState)(toolbarConfig)
    }
    DEFAULT_FIELDS.forEach(field => {
      if (!this.fields.find(field.name)) {
        this.fields.add(field)
      }
    })
    this.plugins.add(MediaManagerScreenPlugin)
    if (!this.plugins.getType('media:ui').find('paginator')) {
      this.plugins.add(BaseMediaPaginator)
    }
  }
  get alerts() {
    if (!this._alerts) {
      this._alerts = new (0, _alerts2.Alerts)(this.events)
    }
    return this._alerts
  }
  registerApi(name, api) {
    if (api.alerts) {
      this.alerts.setMap(api.alerts)
    }
    super.registerApi(name, api)
  }
  get forms() {
    return this.plugins.findOrCreateMap('form')
  }
  get fields() {
    return this.plugins.findOrCreateMap('field')
  }
  get screens() {
    return this.plugins.findOrCreateMap('screen')
  }
}

// packages/tinacms/src/components/TinaCMSProvider.tsx
var INVALID_CMS_ERROR = 'The `cms` prop must be an instance of `TinaCMS`.'
var TinaCMSProvider = ({ cms, children }) => {
  if (!(cms instanceof TinaCMS)) {
    throw new Error(INVALID_CMS_ERROR)
  }
  return /* @__PURE__ */ _react.createElement.call(
    void 0,
    _reactcore.CMSContext.Provider,
    {
      value: cms,
    },
    children
  )
}

// packages/tinacms/src/components/TinaUI.tsx

var _reactalerts = require('@tinacms/react-alerts')
var TinaUI = ({ children, position, styled: styled6 = true }) => {
  const cms = useCMS()
  return /* @__PURE__ */ _react.createElement.call(
    void 0,
    _reactmodals.ModalProvider,
    null,
    /* @__PURE__ */ _react.createElement.call(void 0, _reactalerts.Alerts, {
      alerts: cms.alerts,
    }),
    cms.enabled &&
      styled6 &&
      /* @__PURE__ */ _react.createElement.call(void 0, _styles.Theme, null),
    cms.enabled &&
      cms.toolbar &&
      /* @__PURE__ */ _react.createElement.call(
        void 0,
        _reacttoolbar.Toolbar,
        null
      ),
    /* @__PURE__ */ _react.createElement.call(void 0, MediaManager, null),
    cms.sidebar
      ? /* @__PURE__ */ _react.createElement.call(
          void 0,
          _reactsidebar.SidebarProvider,
          {
            position,
            sidebar: cms.sidebar,
          },
          children
        )
      : children
  )
}

// packages/tinacms/src/components/TinaProvider.tsx
var TinaProvider = ({ cms, children, position, styled: styled6 = true }) => {
  return /* @__PURE__ */ _react.createElement.call(
    void 0,
    TinaCMSProvider,
    {
      cms,
    },
    /* @__PURE__ */ _react.createElement.call(
      void 0,
      TinaUI,
      {
        position,
        styled: styled6,
      },
      children
    )
  )
}
var Tina = TinaProvider

// packages/tinacms/src/react-tinacms/with-tina.tsx
function withTina(Component, config) {
  return props => {
    const cms = _react.useMemo.call(void 0, () => new TinaCMS(config), [config])
    return /* @__PURE__ */ _react.createElement.call(
      void 0,
      TinaProvider,
      {
        cms,
      },
      /* @__PURE__ */ _react.createElement.call(void 0, Component, {
        ...props,
      })
    )
  }
}

// packages/tinacms/src/react-tinacms/index.ts

exports.ActionButton = _reactforms.ActionButton
exports.AddContentPlugin = _forms.ContentCreatorPlugin
exports.BaseMediaPaginator = BaseMediaPaginator
exports.CMSContext = _reactcore.CMSContext
exports.ContentCreatorPlugin = _forms.ContentCreatorPlugin
exports.ERROR_MISSING_CMS = _reactcore.ERROR_MISSING_CMS
exports.Field = _forms.Field
exports.Form = _forms.Form
exports.FormOptions = _forms.FormOptions
exports.GlobalFormPlugin = GlobalFormPlugin
exports.Media = _core.Media
exports.MediaList = _core.MediaList
exports.MediaListOptions = _core.MediaListOptions
exports.MediaManager = _core.MediaManager
exports.MediaStore = _core.MediaStore
exports.MediaUploadOptions = _core.MediaUploadOptions
exports.Plugin = _core.Plugin
exports.ScreenPlugin = _reactscreens.ScreenPlugin
exports.Tina = Tina
exports.TinaCMS = TinaCMS
exports.TinaCMSProvider = TinaCMSProvider
exports.TinaProvider = TinaProvider
exports.TinaUI = TinaUI
exports.WatchableFormValue = _reactcore.WatchableFormValue
exports.useCMS = useCMS
exports.useCMSEvent = _reactcore.useCMSEvent
exports.useForm = _reactcore.useForm
exports.useFormScreenPlugin = useFormScreenPlugin
exports.useGlobalForm = useGlobalForm
exports.useLocalForm = _reactcore.useLocalForm
exports.usePlugin = _reactcore.usePlugin
exports.usePlugins = _reactcore.usePlugins
exports.useScreenPlugin = _reactscreens.useScreenPlugin
exports.useSubscribable = _reactcore.useSubscribable
exports.useWatchFormValues = _reactcore.useWatchFormValues
exports.withPlugin = _reactcore.withPlugin
exports.withPlugins = _reactcore.withPlugins
exports.withTina = withTina

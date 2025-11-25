import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from '@headlessui/react';
import type { Collection, TinaField } from '@tinacms/schema-tools';
import {
  BaseTextField,
  Button,
  CreateBranchModal,
  CursorPaginator,
  Input,
  Message,
  Modal,
  ModalActions,
  ModalBody,
  ModalHeader,
  OverflowMenu,
  PopupModal,
  Select,
  type TinaCMS,
} from '@tinacms/toolkit';
import React, { useEffect, useState } from 'react';
import {
  BiArrowBack,
  BiCopy,
  BiEdit,
  BiFile,
  BiFolder,
  BiPlus,
  BiRename,
  BiSearch,
  BiTrash,
  BiX,
} from 'react-icons/bi';
import { FaFile, FaFolder } from 'react-icons/fa';
import { RiHome2Line } from 'react-icons/ri';
import {
  Link,
  type NavigateFunction,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { cn } from '../../lib/utils';
import type { TinaAdminApi } from '../api';
import GetCMS from '../components/GetCMS';
import GetCollection from '../components/GetCollection';
import { PageBody, PageHeader, PageWrapper } from '../components/Page';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
import type { RouteMappingPlugin } from '../plugins/route-mapping';
import type {
  CollectionResponse,
  DocumentSys,
  TemplateResponse,
} from '../types';
import { type CollectionFolder, useCollectionFolder } from './utils';
import { Callout } from '@toolkit/react-sidebar/components/callout';

const LOCAL_STORAGE_KEY = 'tinacms.admin.collection.list.page';
const isSSR = typeof window === 'undefined';

const TemplateMenu = ({
  templates,
  folder,
  collectionName,
}: {
  collectionName: string;
  templates: TemplateResponse[];
  folder: CollectionFolder;
}) => {
  return (
    <Menu as='div' className='relative inline-block text-left w-full md:w-auto'>
      {() => (
        <div>
          <div>
            <MenuButton className='w-full md:w-auto icon-parent inline-flex items-center font-medium focus:outline-none focus:ring-2 focus:shadow-outline text-center rounded justify-center transition-all duration-150 ease-out  shadow text-white bg-tina-orange-dark hover:bg-tina-orange focus:ring-tina-orange-dark text-sm h-10 px-6'>
              Create New <BiPlus className='w-5 h-full ml-1 opacity-70' />
            </MenuButton>
          </div>

          <Transition
            enter='transition ease-out duration-100'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100'
            leave='transition ease-in duration-75'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'
          >
            <MenuItems className='origin-top-right absolute right-0 mt-2 z-menu w-56 rounded shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none'>
              <div className='py-1'>
                {templates.map((template) => (
                  <MenuItem key={`${template.label}-${template.name}`}>
                    {({ focus }) => (
                      <Link
                        to={`/${
                          folder.fullyQualifiedName
                            ? [
                                'collections',
                                'new',
                                collectionName,
                                template.name,
                                '~',
                                folder.name,
                              ].join('/')
                            : [
                                'collections',
                                'new',
                                collectionName,
                                template.name,
                              ].join('/')
                        }`}
                        // to={`${template.name}/new`}
                        className={`w-full text-md px-4 py-2 tracking-wide flex items-center transition ease-out duration-100 ${
                          focus
                            ? 'text-blue-600 opacity-100 bg-gray-50'
                            : 'opacity-80 text-gray-600'
                        }`}
                      >
                        {template.label}
                      </Link>
                    )}
                  </MenuItem>
                ))}
              </div>
            </MenuItems>
          </Transition>
        </div>
      )}
    </Menu>
  );
};

export const handleNavigate = async (
  navigate: NavigateFunction,
  cms: TinaCMS,
  // FIXME: `Collection` is deceiving because it's just the value we get back from the API request
  collection: CollectionResponse,
  // The actual Collection definition
  collectionDefinition: Collection<true>,
  document: DocumentSys
) => {
  /**
   * Retrieve the RouteMapping Plugin
   */
  const plugins = cms.plugins.all<RouteMappingPlugin>('tina-admin');
  const routeMapping = plugins.find(({ name }) => name === 'route-mapping');
  const tinaPreview = cms.flags.get('tina-preview') || false;
  const basePath = cms.flags.get('tina-basepath');

  /**
   * Determine if the document has a route mapped
   */
  let routeOverride = collectionDefinition.ui?.router
    ? await collectionDefinition.ui?.router({
        document,
        collection: collectionDefinition,
      })
    : routeMapping
      ? routeMapping.mapper(collection, document)
      : undefined;

  /**
   * Redirect the browser if 'yes', else navigate react-router.
   */
  if (routeOverride) {
    // remove leading /
    if (routeOverride.startsWith('/')) {
      routeOverride = routeOverride.slice(1);
    }
    tinaPreview
      ? navigate(`/~${basePath ? `/${basePath}` : ''}/${routeOverride}`)
      : (window.location.href = `${basePath ? `/${basePath}` : ''}/${routeOverride}`);
    return null;
  } else {
    const pathToDoc = document._sys.breadcrumbs;
    navigate(
      `/${['collections', 'edit', collection.name, ...pathToDoc].join('/')}`,
      { replace: true }
    );
  }
};

function getUniqueTemplateFields(collection: Collection<true>): TinaField[] {
  const fieldSet: TinaField[] = [];

  collection.templates.forEach((template) => {
    template.fields
      .filter((f) => {
        return fieldSet.find((x) => x.name === f.name) === undefined;
      })
      .forEach((field) => {
        fieldSet.push(field as TinaField);
      });
  });

  return [...fieldSet];
}

const CollectionListPage = () => {
  const navigate = useNavigate();
  const { collectionName } = useParams();
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [renameModalOpen, setRenameModalOpen] = React.useState(false);
  const [folderModalOpen, setFolderModalOpen] = React.useState(false);
  const [vars, setVars] = React.useState({
    collection: collectionName,
    relativePath: '',
    relativePathWithoutExtension: '',
    newRelativePath: '',
    filterField: '',
    folderName: '',
    startsWith: '',
    endsWith: '',
    before: '',
    after: '',
    booleanEquals: null,
  });
  const [endCursor, setEndCursor] = useState('');
  const [prevCursors, setPrevCursors] = useState([]);
  const [sortKey, setSortKey] = useState(
    // set sort key to cached value if it exists
    isSSR
      ? ''
      : window.localStorage.getItem(`${LOCAL_STORAGE_KEY}.${collectionName}`) ||
          JSON.stringify({
            order: 'asc',
            name: '',
          })
  );
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { order = 'asc', name: sortName } = JSON.parse(sortKey || '{}');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(order);
  const loc = useLocation();
  const folder = useCollectionFolder();
  useEffect(() => {
    // set sort key to cached value on route change
    setSortKey(
      window.localStorage.getItem(`${LOCAL_STORAGE_KEY}.${collectionName}`) ||
        JSON.stringify({
          order: 'asc',
          name: '',
        })
    );
    // reset state when the route is changed
    setEndCursor('');
    setPrevCursors([]);
    setSearch('');
    setSearchInput('');
  }, [loc]);

  useEffect(() => {
    // reset filter when the route is changed
    setVars((old) => ({
      ...old,
      collection: collectionName,
      relativePath: '',
      relativePathWithoutExtension: '',
      newRelativePath: '',
      filterField: '',
      startsWith: '',
      endsWith: '',
      before: '',
      after: '',
      booleanEquals: null,
    }));
  }, [collectionName]);

  const tableRowStyle =
    'hover:bg-gray-50/50 border-b-2 border-gray-50 transition-colors duration-300';

  const tableHeadingCellStyle =
    'px-3 py-3 text-left text-xs font-bold text-gray-700 tracking-wider';

  const tableHeadingStyle = 'bg-gray-100 border-b-2 border-gray-200';
  return (
    <GetCMS>
      {(cms: TinaCMS) => {
        return (
          <PageWrapper>
            <GetCollection
              cms={cms}
              collectionName={collectionName}
              includeDocuments
              startCursor={endCursor}
              sortKey={sortKey}
              folder={folder}
              filterArgs={
                // only pass filter args if the collection is the same as the current route
                // We need this hear because this runs before the useEffect above
                collectionName === vars.collection
                  ? vars
                  : {
                      collection: collectionName,
                      relativePath: '',
                      relativePathWithoutExtension: '',
                      newRelativePath: '',
                      filterField: '',
                      startsWith: '',
                      endsWith: '',
                      before: '',
                      after: '',
                      booleanEquals: null,
                    }
              }
              search={search}
            >
              {(
                collection: CollectionResponse,
                _loading,
                reFetchCollection,
                collectionExtra: Collection<true>
              ) => {
                const documents = collection.documents.edges;
                const admin: TinaAdminApi = cms.api.admin;
                const pageInfo = collection.documents.pageInfo;

                // get unique fields from all templates
                const fields = (
                  collectionExtra.templates?.length
                    ? getUniqueTemplateFields(collectionExtra)
                    : collectionExtra.fields
                ).filter((x) =>
                  // only allow sortable fields
                  ['string', 'number', 'datetime', 'boolean'].includes(x.type)
                );

                const sortField = fields?.find(
                  (field) => field.name === sortName
                );

                const searchEnabled =
                  !!cms.api.tina.schema?.config?.config?.search;

                const collectionDefinition = cms.api.tina.schema.getCollection(
                  collection.name
                );

                const allowCreate =
                  collectionDefinition?.ui?.allowedActions?.create ?? true;
                const allowDelete =
                  collectionDefinition?.ui?.allowedActions?.delete ?? true;
                const allowCreateFolder =
                  collectionDefinition?.ui?.allowedActions?.createFolder ??
                  true;
                const allowCreateNestedFolder =
                  collectionDefinition?.ui?.allowedActions
                    ?.createNestedFolder ?? true;

                const folderView = folder.fullyQualifiedName !== '';

                return (
                  <>
                    {/* Normal Flow */}
                    {deleteModalOpen &&
                      !cms.api.tina.usingProtectedBranch() && (
                        <DeleteModal
                          filename={vars.relativePath}
                          checkRefsFunc={async () => {
                            try {
                              const doc = await admin.fetchDocument(
                                collection.name,
                                vars.relativePath,
                                true
                              );
                              return doc?.document?._sys?.hasReferences;
                            } catch (error) {
                              cms.alerts.error(
                                'Document was not found, ask a developer for help or check the console for an error message'
                              );
                              console.error(error);
                              throw error;
                            }
                          }}
                          deleteFunc={async () => {
                            try {
                              await admin.deleteDocument(vars);
                              cms.alerts.info(
                                'Document was successfully deleted'
                              );
                              reFetchCollection();
                            } catch (error) {
                              if (error.message.indexOf('has references')) {
                                cms.alerts.error(
                                  error.message.split('\n\t').filter(Boolean)[1]
                                );
                                return;
                              }
                              cms.alerts.warn(
                                'Document was not deleted, ask a developer for help or check the console for an error message'
                              );
                              console.error(error);
                              throw error;
                            }
                          }}
                          close={() => setDeleteModalOpen(false)}
                        />
                      )}
                    {/* Editorial workflow  */}
                    {deleteModalOpen && cms.api.tina.usingProtectedBranch() && (
                      <CreateBranchModal
                        crudType='delete'
                        path={`${collectionExtra.path}/${vars.relativePath}`}
                        values={vars}
                        close={() => setDeleteModalOpen(false)}
                        safeSubmit={async () => {
                          try {
                            await admin.deleteDocument(vars);
                            cms.alerts.info(
                              'Document was successfully deleted'
                            );
                            reFetchCollection();
                          } catch (error) {
                            cms.alerts.warn(
                              'Document was not deleted, ask a developer for help or check the console for an error message'
                            );
                            console.error(error);
                            throw error;
                          }
                        }}
                      />
                    )}

                    {renameModalOpen && (
                      <RenameModal
                        filename={vars.relativePathWithoutExtension}
                        newRelativePath={vars.newRelativePath}
                        setNewRelativePath={(newRelativePath) => {
                          setVars((vars) => {
                            return { ...vars, newRelativePath };
                          });
                        }}
                        renameFunc={async () => {
                          // add the file extension
                          const newRelativePath = `${vars.newRelativePath}.${collection.format}`;
                          try {
                            await admin.renameDocument({
                              collection: vars.collection,
                              relativePath: vars.relativePath,
                              newRelativePath,
                            });
                            cms.alerts.info(
                              'Document was successfully renamed'
                            );
                            reFetchCollection();
                          } catch (error) {
                            if (error.message.indexOf('has references')) {
                              cms.alerts.error(
                                error.message.split('\n\t').filter(Boolean)[1]
                              );
                              return;
                            }
                            cms.alerts.warn(
                              'Document was not renamed, ask a developer for help or check the console for an error message'
                            );
                            console.error(error);
                            throw error;
                          }
                        }}
                        close={() => setRenameModalOpen(false)}
                      />
                    )}

                    {folderModalOpen && (
                      <FolderModal
                        folderName={vars.folderName}
                        setFolderName={(folderName) => {
                          setVars((vars) => {
                            return { ...vars, folderName };
                          });
                        }}
                        validationRegex={
                          cms.api.tina?.schema.config.config.ui?.regexValidation
                            ?.folderNameRegex
                        }
                        createFunc={async () => {
                          try {
                            admin
                              .createFolder(
                                vars.collection,
                                folder.name
                                  ? [folder.name, vars.folderName].join('/')
                                  : vars.folderName
                              )
                              .then(() => {
                                reFetchCollection();
                                navigate(
                                  `/${[
                                    'collections',
                                    collectionName,
                                    '~',
                                    ...(folder.name
                                      ? [folder.name, vars.folderName]
                                      : [vars.folderName]),
                                  ].join('/')}`,
                                  { replace: true }
                                );
                                cms.alerts.info(
                                  'Folder was successfully created'
                                );
                              })
                              .catch((error) => {
                                throw error;
                              });
                          } catch (error) {
                            cms.alerts.warn(
                              'Folder was not created, ask a developer for help or check the console for an error message'
                            );
                            console.error(error);
                            throw error;
                          }
                        }}
                        close={() => setFolderModalOpen(false)}
                      />
                    )}

                    <PageHeader>
                      <div className='w-full mx-auto max-w-screen-xl'>
                        <h3 className='font-sans text-2xl text-tina-orange'>
                          {collection.label
                            ? collection.label
                            : collection.name}
                        </h3>
                        <div className='flex flex-col lg:flex-row justify-between lg:items-end pt-2'>
                          <div className='flex flex-col md:flex-row gap-2 md:gap-4'>
                            {fields?.length > 0 && (
                              <>
                                {!search && (
                                  <div className='flex flex-col gap-2 items-start w-full md:w-auto'>
                                    <label
                                      htmlFor='sort'
                                      className='block font-sans text-xs font-semibold text-gray-500 whitespace-normal'
                                    >
                                      Sort by
                                    </label>
                                    <Select
                                      name='sort'
                                      options={[
                                        {
                                          label: 'Default',
                                          value: JSON.stringify({
                                            order: 'asc',
                                            name: '',
                                          }),
                                        },
                                        ...fields.flatMap((x) => [
                                          {
                                            label:
                                              (x.label || x.name) +
                                              (x.type === 'datetime'
                                                ? ' (Oldest First)'
                                                : ' (Ascending)'),
                                            value: JSON.stringify({
                                              name: x.name,
                                              order: 'asc',
                                            }),
                                          },
                                          {
                                            label:
                                              (x.label || x.name) +
                                              (x.type === 'datetime'
                                                ? ' (Newest First)'
                                                : ' (Descending)'),
                                            value: JSON.stringify({
                                              name: x.name,
                                              order: 'desc',
                                            }),
                                          },
                                        ]),
                                      ]}
                                      input={{
                                        id: 'sort',
                                        name: 'sort',
                                        value: sortKey,
                                        onChange: (e) => {
                                          const val = JSON.parse(
                                            e.target.value
                                          );
                                          setEndCursor('');
                                          setPrevCursors([]);
                                          window?.localStorage.setItem(
                                            `${LOCAL_STORAGE_KEY}.${collectionName}`,
                                            e.target.value
                                          );
                                          setSortKey(e.target.value);
                                          setSortOrder(val.order);
                                        },
                                      }}
                                    />
                                  </div>
                                )}
                              </>
                            )}
                            <div className='flex flex-1 flex-row gap-2 items-end w-full'>
                              {searchEnabled ? (
                                <SearchInput
                                  cms={cms}
                                  collectionName={collectionName}
                                  loading={_loading}
                                  search={search}
                                  setSearch={setSearch}
                                  searchInput={searchInput}
                                  setSearchInput={setSearchInput}
                                />
                              ) : (
                                <div className='flex flex-col gap-2 items-start w-full md:w-auto'>
                                  <div className='block font-sans text-xs font-semibold opacity-0'>
                                    {' '}
                                  </div>
                                  <Callout calloutStyle='info'>
                                    {' '}
                                    You have not configured search.{' '}
                                    <a
                                      href='https://tina.io/docs/r/content-search'
                                      target='_blank'
                                      className='underline hover:text-blue-700 transition-all duration-150'
                                    >
                                      Read the docs
                                    </a>
                                  </Callout>
                                </div>
                              )}
                            </div>
                          </div>
                          {allowCreate && (
                            <div className='flex flex-col md:flex-row items-start md:items-end gap-2 md:gap-0 pt-4 lg:pt-0'>
                              {allowCreateNestedFolder && (
                                <>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Link
                                          onMouseDown={(evt) => {
                                            if (
                                              collection.templates ||
                                              !allowCreateFolder
                                            ) {
                                              // TODO: behavior not supported yet - see https://github.com/tinacms/tinacms/issues/4797
                                              evt.preventDefault();
                                              return;
                                            }
                                            setVars((old) => ({
                                              ...old,
                                              collection: collectionName,
                                              folderName: '',
                                            }));
                                            setFolderModalOpen(true);
                                            evt.stopPropagation();
                                          }}
                                          to='/collections/new-folder'
                                          className={cn(
                                            'icon-parent inline-flex items-center font-medium focus:outline-none focus:ring-2 focus:shadow-outline text-center rounded justify-center transition-all duration-150 ease-out whitespace-nowrap shadow text-gray-500 bg-white hover:bg-gray-50 border border-gray-100 focus:ring-white focus:ring-blue-500 w-full md:w-auto text-sm h-10 px-6 mr-4',
                                            (collection.templates ||
                                              !allowCreateFolder) &&
                                              'opacity-50 pointer-events-none cursor-not-allowed'
                                          )}
                                          aria-disabled={
                                            !!collection.templates ||
                                            !allowCreateFolder
                                          }
                                          tabIndex={
                                            collection.templates ||
                                            !allowCreateFolder
                                              ? -1
                                              : 0
                                          }
                                        >
                                          <FaFolder className='mr-2' />
                                          Add Folder
                                        </Link>
                                      </TooltipTrigger>
                                      {(collection.templates ||
                                        !allowCreateFolder) && (
                                        <TooltipContent
                                          side='top'
                                          align='center'
                                        >
                                          <p>
                                            {collection.templates ? (
                                              <>
                                                Folders can&apos;t be manually
                                                added when using templates.
                                                <br />
                                                See the docs -{' '}
                                                <a
                                                  href='https://tina.io/docs/r/content-modelling-templates'
                                                  target='_blank'
                                                  rel='noopener noreferrer'
                                                  className='underline text-blue-500'
                                                >
                                                  https://tina.io/docs/r/content-modelling-templates
                                                </a>
                                              </>
                                            ) : (
                                              'Folder creation is disabled for this collection.'
                                            )}
                                          </p>
                                        </TooltipContent>
                                      )}
                                    </Tooltip>
                                  </TooltipProvider>
                                </>
                              )}
                              {!collection.templates && (
                                <>
                                  <Link
                                    to={`/${
                                      folder.fullyQualifiedName
                                        ? [
                                            'collections',
                                            'new',
                                            collectionName,
                                            '~',
                                            folder.name,
                                          ].join('/')
                                        : [
                                            'collections',
                                            'new',
                                            collectionName,
                                          ].join('/')
                                    }`}
                                    className='inline-flex items-center font-medium focus:ring-2 focus:outline-none focus:ring-tina-orange-dark focus:shadow-outline text-center rounded justify-center transition-all duration-150 ease-out whitespace-nowrap shadow text-white bg-tina-orange-dark hover:bg-tina-orange w-full md:w-auto text-sm h-10 px-6'
                                  >
                                    <FaFile className='mr-2' />
                                    Add File
                                  </Link>
                                </>
                              )}
                              {collection.templates && (
                                <TemplateMenu
                                  collectionName={collectionName}
                                  templates={collection.templates}
                                  folder={folder}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </PageHeader>
                    <PageBody>
                      <div className='w-full mx-auto max-w-screen-xl'>
                        {sortField && !sortField.required && (
                          <p className='mb-4 text-gray-500'>
                            <em>
                              Sorting on a non-required field. Some documents
                              may be excluded (if they don't have a value for{' '}
                              {sortName})
                            </em>
                          </p>
                        )}
                        <div className='w-full overflow-x-auto shadow-md rounded-md'>
                          {((folder.name && !search) ||
                            documents.length > 0) && (
                            <table className='table-auto shadow bg-white border border-gray-200 w-full max-w-full rounded-lg'>
                              {(() => {
                                // Check if any documents have titles to determine column structure
                                const hasAnyDocuments = documents.some(
                                  (doc) => doc.node.__typename !== 'Folder'
                                );
                                const hasAnyFolders = documents.some(
                                  (doc) => doc.node.__typename === 'Folder'
                                );
                                const hasAnyTitles = documents.some(
                                  (doc) =>
                                    doc.node.__typename !== 'Folder' &&
                                    Boolean(doc.node._sys?.title)
                                );

                                return (
                                  <>
                                    {hasAnyDocuments && (
                                      <thead className={tableHeadingStyle}>
                                        <tr>
                                          <th
                                            className={tableHeadingCellStyle}
                                            colSpan={hasAnyTitles ? 1 : 2}
                                          >
                                            {hasAnyTitles
                                              ? 'Title'
                                              : 'Filename'}
                                          </th>
                                          {hasAnyTitles && (
                                            <th
                                              className={tableHeadingCellStyle}
                                            >
                                              Filename
                                            </th>
                                          )}
                                          <th className={tableHeadingCellStyle}>
                                            Extension
                                          </th>
                                          <th className={tableHeadingCellStyle}>
                                            Template
                                          </th>
                                          <th>
                                            {/* Empty heading for options column */}
                                          </th>
                                        </tr>
                                      </thead>
                                    )}
                                    {!hasAnyDocuments && hasAnyFolders && (
                                      <thead className={tableHeadingStyle}>
                                        <tr>
                                          <th className={tableHeadingCellStyle}>
                                            Name
                                          </th>
                                          <th
                                            className={tableHeadingCellStyle}
                                            colSpan={4}
                                          >
                                            Path
                                          </th>
                                        </tr>
                                      </thead>
                                    )}
                                    <tbody>
                                      {folder.name && !search ? (
                                        <tr>
                                          <td colSpan={5}>
                                            <Breadcrumb
                                              folder={folder}
                                              navigate={navigate}
                                              collectionName={collectionName}
                                            />
                                          </td>
                                        </tr>
                                      ) : null}
                                      {documents.length > 0 &&
                                        documents.map((document) => {
                                          if (
                                            document.node.__typename ===
                                            'Folder'
                                          ) {
                                            return (
                                              <tr
                                                className={tableRowStyle}
                                                key={`folder-${document.node.path}`}
                                              >
                                                <td className='pl-5 pr-3 py-3'>
                                                  <a
                                                    className='text-blue-600 flex items-center gap-3 cursor-pointer truncate'
                                                    onClick={() => {
                                                      navigate(
                                                        `/${[
                                                          'collections',
                                                          collectionName,
                                                          document.node.path,
                                                        ].join('/')}`,
                                                        { replace: true }
                                                      );
                                                    }}
                                                  >
                                                    <BiFolder className='inline-block h-6 w-auto flex-shrink-0 opacity-70' />
                                                    <span className='truncate block'>
                                                      <span className='leading-5 block truncate'>
                                                        <span>
                                                          {document.node.name}
                                                        </span>
                                                      </span>
                                                    </span>
                                                  </a>
                                                </td>
                                                <td
                                                  className='px-3 py-3'
                                                  colSpan={4}
                                                >
                                                  <span className='leading-5 block text-sm font-medium text-gray-400 truncate'>
                                                    {document.node.path
                                                      .substring(2)
                                                      .split('/')
                                                      .map((node) => {
                                                        return (
                                                          <span key={node}>
                                                            <span className='text-gray-300 pr-0.5'>
                                                              /
                                                            </span>
                                                            <span className='pr-0.5'>
                                                              {node}
                                                            </span>
                                                          </span>
                                                        );
                                                      })}
                                                  </span>
                                                </td>
                                              </tr>
                                            );
                                          }

                                          const hasTitle = Boolean(
                                            document.node._sys.title
                                          );
                                          const subfolders =
                                            document.node._sys.breadcrumbs
                                              .slice(0, -1)
                                              .join('/');

                                          return (
                                            <tr
                                              className={tableRowStyle}
                                              key={`document-${document.node._sys.relativePath}`}
                                            >
                                              <td
                                                className='pl-5 pr-3 py-3'
                                                colSpan={hasTitle ? 1 : 2}
                                              >
                                                <a
                                                  className='text-blue-600 flex items-center gap-3 cursor-pointer truncate'
                                                  onClick={() => {
                                                    handleNavigate(
                                                      navigate,
                                                      cms,
                                                      collection,
                                                      collectionDefinition,
                                                      document.node
                                                    );
                                                  }}
                                                >
                                                  <BiFile className='inline-block h-6 w-auto flex-shrink-0 opacity-70' />
                                                  <span className='truncate block'>
                                                    <span className='leading-5 block truncate mb-1'>
                                                      {!folderView &&
                                                        !hasTitle &&
                                                        subfolders && (
                                                          <span className='text-xs text-gray-400'>
                                                            {`${subfolders}/`}
                                                          </span>
                                                        )}
                                                      <span>
                                                        {hasTitle
                                                          ? document.node._sys
                                                              ?.title
                                                          : document.node._sys
                                                              .filename}
                                                      </span>
                                                    </span>
                                                    <span className='block text-xs text-gray-400'>
                                                      {document.node._sys.path}
                                                    </span>
                                                  </span>
                                                </a>
                                              </td>
                                              {hasTitle && (
                                                <td className='px-3 py-3'>
                                                  <span className='leading-5 block text-sm font-medium text-gray-900 truncate'>
                                                    {!folderView &&
                                                      subfolders && (
                                                        <span className='text-xs text-gray-400'>
                                                          {`${subfolders}/`}
                                                        </span>
                                                      )}
                                                    <span>
                                                      {
                                                        document.node._sys
                                                          .filename
                                                      }
                                                    </span>
                                                  </span>
                                                </td>
                                              )}
                                              <td className='px-3 py-3'>
                                                <span className='leading-5 block text-sm font-medium text-gray-900'>
                                                  {document.node._sys.extension}
                                                </span>
                                              </td>
                                              <td className='px-3 py-3'>
                                                <span className='leading-5 block text-sm font-medium text-gray-900'>
                                                  {document.node._sys.template}
                                                </span>
                                              </td>
                                              <td className='w-0'>
                                                <OverflowMenu
                                                  toolbarItems={[
                                                    {
                                                      name: 'edit',
                                                      label: 'Edit in Admin',
                                                      Icon: (
                                                        <BiEdit size='1.3rem' />
                                                      ),
                                                      onMouseDown: () => {
                                                        const pathToDoc =
                                                          document.node._sys
                                                            .breadcrumbs;
                                                        if (
                                                          folder.fullyQualifiedName
                                                        ) {
                                                          pathToDoc.unshift(
                                                            '~'
                                                          );
                                                        }
                                                        navigate(
                                                          `/${[
                                                            'collections',
                                                            'edit',
                                                            collectionName,
                                                            ...pathToDoc,
                                                          ].join('/')}`,
                                                          { replace: true }
                                                        );
                                                      },
                                                    },
                                                    allowCreate && {
                                                      name: 'duplicate',
                                                      label: 'Duplicate',
                                                      Icon: (
                                                        <BiCopy size='1.3rem' />
                                                      ),
                                                      onMouseDown: () => {
                                                        const pathToDoc =
                                                          document.node._sys
                                                            .breadcrumbs;
                                                        if (
                                                          folder.fullyQualifiedName
                                                        ) {
                                                          pathToDoc.unshift(
                                                            '~'
                                                          );
                                                        }
                                                        navigate(
                                                          `/${[
                                                            'collections',
                                                            'duplicate',
                                                            collectionName,
                                                            ...pathToDoc,
                                                          ].join('/')}`,
                                                          { replace: true }
                                                        );
                                                      },
                                                    },
                                                    allowDelete && {
                                                      name: 'rename',
                                                      label: 'Rename',
                                                      Icon: (
                                                        <BiRename size='1.3rem' />
                                                      ),
                                                      onMouseDown: () => {
                                                        setVars((old) => ({
                                                          ...old,
                                                          collection:
                                                            collectionName,
                                                          relativePathWithoutExtension:
                                                            document.node._sys.breadcrumbs.join(
                                                              '/'
                                                            ),
                                                          relativePath:
                                                            document.node._sys.breadcrumbs.join(
                                                              '/'
                                                            ) +
                                                            document.node._sys
                                                              .extension,
                                                          newRelativePath: '',
                                                        }));
                                                        setRenameModalOpen(
                                                          true
                                                        );
                                                      },
                                                    },
                                                    allowDelete && {
                                                      name: 'delete',
                                                      label: 'Delete',
                                                      Icon: (
                                                        <BiTrash
                                                          size='1.3rem'
                                                          className='text-red-500'
                                                        />
                                                      ),
                                                      className: 'text-red-500',
                                                      onMouseDown: () => {
                                                        setVars((old) => ({
                                                          ...old,
                                                          collection:
                                                            collectionName,
                                                          relativePathWithoutExtension:
                                                            document.node._sys.breadcrumbs.join(
                                                              '/'
                                                            ),
                                                          relativePath:
                                                            document.node._sys.breadcrumbs.join(
                                                              '/'
                                                            ) +
                                                            document.node._sys
                                                              .extension,
                                                          newRelativePath: '',
                                                        }));
                                                        setDeleteModalOpen(
                                                          true
                                                        );
                                                      },
                                                    },
                                                  ].filter(Boolean)}
                                                />
                                              </td>
                                            </tr>
                                          );
                                        })}
                                    </tbody>
                                  </>
                                );
                              })()}
                            </table>
                          )}
                        </div>
                        {documents.length === 0 && <NoDocumentsPlaceholder />}
                        <div className='pt-4'>
                          <CursorPaginator
                            variant='white'
                            hasNext={
                              sortOrder === 'asc'
                                ? pageInfo?.hasNextPage
                                : pageInfo.hasPreviousPage
                            }
                            navigateNext={() => {
                              const newState = [...prevCursors, endCursor];
                              setPrevCursors(newState);
                              setEndCursor(pageInfo?.endCursor);
                            }}
                            hasPrev={prevCursors.length > 0}
                            navigatePrev={() => {
                              const prev = prevCursors[prevCursors.length - 1];
                              if (typeof prev === 'string') {
                                const newState = prevCursors.slice(0, -1);
                                setPrevCursors(newState);
                                setEndCursor(prev);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </PageBody>
                  </>
                );
              }}
            </GetCollection>
          </PageWrapper>
        );
      }}
    </GetCMS>
  );
};

const SearchInput = ({
  cms,
  collectionName,
  loading,
  search,
  setSearch,
  searchInput,
  setSearchInput,
}: {
  cms: TinaCMS;
  collectionName: string;
  loading: boolean;
  search: string;
  setSearch: (search: string) => void;
  searchInput: string;
  setSearchInput: (input: string) => void;
}) => {
  const [searchLoaded, setSearchLoaded] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const suggestionsRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (loading) {
      setSearchLoaded(false);
    } else {
      setSearchLoaded(true);
    }
  }, [loading]);

  // Debounced suggestion fetching
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchInput || searchInput.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoadingSuggestions(true);

      try {
        // Get unique words from the search input
        const words = searchInput.trim().split(/\s+/);
        const currentWord = words[words.length - 1];

        if (currentWord.length < 2) {
          setSuggestions([]);
          setShowSuggestions(false);
          setIsLoadingSuggestions(false);
          return;
        }

        // Try to fetch suggestions from the search index
        if (cms.api.search) {
          try {
            // Query the search index for documents containing the current word
            // This will give us fuzzy matches from the DICTIONARY
            const response: any = await cms.api.search.query(
              `${currentWord} AND _collection:${collectionName}`,
              {
                limit: 10,
                fuzzy: true,
                fuzzyOptions: {
                  maxDistance: 2,
                  minSimilarity: 0.5, // Require at least 50% similarity for suggestions
                  maxResults: 5,
                },
              }
            );

            // Extract suggestions from fuzzyMatches (DICTIONARY terms)
            const uniqueSuggestions = new Set<string>();

            // First, try to use fuzzyMatches from the response
            if (response.fuzzyMatches && response.fuzzyMatches[currentWord]) {
              const matches = response.fuzzyMatches[currentWord];
              // Sort by similarity (descending) and take top 5
              matches
                .sort((a: any, b: any) => b.similarity - a.similarity)
                .slice(0, 5)
                .forEach((match: any) => {
                  if (
                    match.term !== currentWord &&
                    uniqueSuggestions.size < 5
                  ) {
                    uniqueSuggestions.add(match.term);
                  }
                });
            }

            // If we didn't get enough from fuzzyMatches, try extracting from results
            if (uniqueSuggestions.size < 3 && response.results?.length > 0) {
              response.results.forEach((result: any) => {
                const content = JSON.stringify(result).toLowerCase();
                const matches = content.match(
                  new RegExp(`\\b${currentWord}\\w*`, 'gi')
                );
                if (matches) {
                  matches.forEach((match) => {
                    if (
                      match.length >= currentWord.length &&
                      uniqueSuggestions.size < 5 &&
                      match !== currentWord
                    ) {
                      uniqueSuggestions.add(match.toLowerCase());
                    }
                  });
                }
              });
            }

            const suggestionList = Array.from(uniqueSuggestions);

            // If we didn't get enough suggestions from the index, add some common terms
            if (suggestionList.length < 3) {
              const commonTerms = [
                'title',
                'content',
                'author',
                'date',
                'published',
                'draft',
                'category',
                'tags',
                'description',
                'image',
                'post',
                'page',
                'article',
                'blog',
                'news',
                'document',
                'file',
                'folder',
              ];

              const additionalSuggestions = commonTerms
                .filter(
                  (term) =>
                    term.toLowerCase().startsWith(currentWord.toLowerCase()) &&
                    !suggestionList.includes(term)
                )
                .slice(0, 5 - suggestionList.length);

              suggestionList.push(...additionalSuggestions);
            }

            setSuggestions(suggestionList);
            setShowSuggestions(suggestionList.length > 0);
          } catch (error) {
            // Fall back to common terms if search fails
            console.warn(
              'Search API failed, using fallback suggestions:',
              error
            );
            const commonTerms = [
              'title',
              'content',
              'author',
              'date',
              'published',
              'draft',
              'category',
              'tags',
              'description',
              'image',
              'post',
              'page',
              'article',
              'blog',
              'news',
              'document',
              'file',
              'folder',
            ];

            const filtered = commonTerms
              .filter(
                (term) =>
                  term.toLowerCase().startsWith(currentWord.toLowerCase()) ||
                  term.toLowerCase().includes(currentWord.toLowerCase())
              )
              .slice(0, 5);

            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
          }
        } else {
          // Fallback to common terms if search API is not available
          const commonTerms = [
            'title',
            'content',
            'author',
            'date',
            'published',
            'draft',
            'category',
            'tags',
            'description',
            'image',
            'post',
            'page',
            'article',
            'blog',
            'news',
            'document',
            'file',
            'folder',
          ];

          const filtered = commonTerms
            .filter(
              (term) =>
                term.toLowerCase().startsWith(currentWord.toLowerCase()) ||
                term.toLowerCase().includes(currentWord.toLowerCase())
            )
            .slice(0, 5);

          setSuggestions(filtered);
          setShowSuggestions(filtered.length > 0);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [searchInput, cms, collectionName]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    const words = searchInput.trim().split(/\s+/);
    words[words.length - 1] = suggestion;
    const newInput = words.join(' ');
    setSearchInput(newInput);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    // Trigger the search with the new input
    setSearch(newInput);
    setSearchLoaded(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (searchInput.trim()) {
          setSearch(searchInput);
          setSearchLoaded(false);
          setShowSuggestions(false);
        }
      }
      return;
    }

    switch (e.key) {
      case 'Tab':
        e.preventDefault();
        // Tab moves down, Shift+Tab moves up
        if (e.shiftKey) {
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
        } else {
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
          // Trigger search after selecting suggestion
          const words = searchInput.trim().split(/\s+/);
          words[words.length - 1] = suggestions[selectedIndex];
          const newInput = words.join(' ');
          setSearch(newInput);
          setSearchLoaded(false);
        } else if (searchInput.trim()) {
          setSearch(searchInput);
          setSearchLoaded(false);
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <form className='flex flex-1 flex-col gap-2 items-start w-full'>
      <div className='h-4'></div>
      <div className='flex flex-col md:flex-row items-start md:items-center w-full md:w-auto gap-3'>
        <div className='flex-1 min-w-[200px] w-full md:w-auto relative'>
          <BiSearch className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10' />
          <input
            ref={inputRef}
            type='text'
            name='search'
            placeholder='Search...'
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            className='shadow appearance-none bg-white block pl-10 pr-10 py-2 truncate w-full text-base border border-gray-200 focus:outline-none focus:shadow-outline focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded placeholder:text-gray-300 text-gray-600 focus:text-gray-900'
            autoComplete='off'
          />
          {search && searchLoaded && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setSearch('');
                setSearchInput('');
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10'
            >
              <BiX className='w-5 h-5' />
            </button>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 max-h-60 overflow-y-auto'
            >
              {isLoadingSuggestions && (
                <div className='px-4 py-2 text-sm text-gray-400'>
                  Loading suggestions...
                </div>
              )}
              {!isLoadingSuggestions &&
                suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion}-${index}`}
                    type='button'
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      index === selectedIndex
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

const Breadcrumb = ({ folder, navigate, collectionName }) => {
  const folderArray = folder.name.split('/');

  return (
    <div className='w-full bg-gray-50/30 flex items-stretch'>
      <button
        onClick={() => {
          const folders = folder.fullyQualifiedName.split('/');
          navigate(
            `/${[
              'collections',
              collectionName,
              ...folders.slice(0, folders.length - 1),
            ].join('/')}`,
            { replace: true }
          );
        }}
        className='px-3 py-2 bg-white hover:bg-gray-50/50 transition ease-out duration-100 border-r border-gray-100 text-blue-500 hover:text-blue-600'
      >
        <BiArrowBack className='w-6 h-full opacity-70' />
      </button>
      <span className='px-3 py-2 text-gray-600 flex flex-wrap items-center justify-start gap-1'>
        <button
          onClick={() => {
            navigate(`/collections/${collectionName}/~`, {
              replace: true,
            });
          }}
          className='shrink-0 bg-transparent p-0 border-0 text-blue-400 hover:text-blue-500 transition-all ease-out duration-100 opacity-70 hover:opacity-100'
        >
          <RiHome2Line className='w-5 h-auto' />
        </button>
        {folderArray.map((node, index) => {
          return (
            <>
              <span className='text-gray-200 shrink-0'>/</span>
              {index < folderArray.length - 1 ? (
                <button
                  className='bg-transparent whitespace-nowrap truncate p-0 border-0 text-blue-500 hover:text-blue-600 transition-all ease-out duration-100 underline underline-offset-2 decoration-1	decoration-blue-200 hover:decoration-blue-400'
                  onClick={() => {
                    const folders = folder.fullyQualifiedName.split('/');
                    navigate(
                      `/${[
                        'collections',
                        collectionName,
                        ...folders.slice(
                          0,
                          folders.length - (folders.length - (index + 2))
                        ),
                      ].join('/')}`,
                      { replace: true }
                    );
                  }}
                >
                  {node}
                </button>
              ) : (
                <span className='whitespace-nowrap truncate'>{node}</span>
              )}
            </>
          );
        })}
      </span>
    </div>
  );
};

interface DeleteModalProps {
  close(): void;
  deleteFunc(): void;
  checkRefsFunc(): Promise<true | false>;
  filename: string;
}

const NoDocumentsPlaceholder = () => {
  return (
    <div className='text-center px-5 py-3 flex flex-col items-center justify-center shadow border border-gray-100 bg-gray-50 border-b border-gray-200 w-full max-w-full rounded-lg'>
      <p className='text-base italic font-medium text-gray-300'>
        No documents found.
      </p>
    </div>
  );
};

const DeleteModal = ({
  close,
  deleteFunc,
  checkRefsFunc,
  filename,
}: DeleteModalProps) => {
  const [hasRefs, setHasRefs] = React.useState<true | false | undefined>();
  useEffect(() => {
    checkRefsFunc().then((result) => {
      setHasRefs(result);
    });
  }, [filename, checkRefsFunc]);
  return (
    <Modal>
      <PopupModal>
        <ModalHeader close={close}>Delete {filename}</ModalHeader>
        <ModalBody padded={true}>
          <p>{`Are you sure you want to delete ${filename}?${
            hasRefs ? ' References to this document will also be deleted.' : ''
          }`}</p>
        </ModalBody>
        <ModalActions>
          <Button style={{ flexGrow: 2 }} onClick={close}>
            Cancel
          </Button>
          <Button
            style={{ flexGrow: 3 }}
            variant='danger'
            onClick={async () => {
              await deleteFunc();
              close();
            }}
          >
            Delete
          </Button>
        </ModalActions>
      </PopupModal>
    </Modal>
  );
};

interface FolderModalProps {
  close(): void;
  createFunc(): void;
  folderName: string;
  setFolderName(folderName: string): void;
  validationRegex?: string;
}

const FolderModal = ({
  close,
  createFunc,
  folderName,
  setFolderName,
  validationRegex,
}: FolderModalProps) => {
  const [isFolderNameValid, setIsFolderNameValid] = useState(false);
  const [isInteracted, setIsInteracted] = useState(false);

  useEffect(() => {
    validateFolderName(folderName);
  }, [folderName]);

  const validateFolderName = (name: string) => {
    if (!validationRegex || !name.trim()) {
      setIsFolderNameValid(!!name.trim());
      return !!name.trim();
    }

    try {
      const regex = new RegExp(validationRegex);
      const valid = regex.test(name);
      setIsFolderNameValid(valid);
      return valid;
    } catch (error) {
      setIsFolderNameValid(false);
      return false;
    }
  };

  return (
    <Modal>
      <PopupModal>
        <ModalHeader close={close}>Create Folder</ModalHeader>
        <ModalBody padded={true}>
          <>
            <BaseTextField
              placeholder='Enter the name of the new folder'
              value={folderName}
              className={`mb-4 ${!isFolderNameValid && isInteracted ? 'border-red-500' : ''}`}
              onChange={(event) => {
                setFolderName(event.target.value);
                setIsInteracted(true);
                validateFolderName(event.target.value);
              }}
            />
            {!isFolderNameValid && isInteracted && (
              <p className='text-red-500 text-sm pl-1'>
                Folder name is not valid – please enter a valid folder name.
              </p>
            )}
          </>
        </ModalBody>
        <ModalActions>
          <Button style={{ flexGrow: 2 }} onClick={close}>
            Cancel
          </Button>
          <Button
            style={{ flexGrow: 3 }}
            variant='primary'
            disabled={!isFolderNameValid}
            onClick={async () => {
              await createFunc();
              close();
            }}
          >
            Create
          </Button>
        </ModalActions>
      </PopupModal>
    </Modal>
  );
};

interface ModalProps {
  close(): void;
  renameFunc(): void;
  filename: string;
  setNewRelativePath(newRelativePath: string): void;
  newRelativePath: string;
}

const RenameModal = ({
  close,
  renameFunc,
  filename,
  newRelativePath,
  setNewRelativePath,
}: ModalProps) => {
  return (
    <Modal>
      <PopupModal>
        <ModalHeader close={close}>Rename {filename}</ModalHeader>
        <ModalBody padded={true}>
          <>
            <p className='mb-4'>
              Are you sure you want to rename <strong>{filename}</strong>?
            </p>
            <BaseTextField
              placeholder='Enter a new name for the document&apos;s file'
              value={newRelativePath}
              onChange={(event) => setNewRelativePath(event.target.value)}
            />
          </>
        </ModalBody>
        <ModalActions>
          <Button style={{ flexGrow: 2 }} onClick={close}>
            Cancel
          </Button>
          <Button
            style={{ flexGrow: 3 }}
            variant='primary'
            onClick={async () => {
              await renameFunc();
              close();
            }}
            disabled={!newRelativePath || newRelativePath === filename}
          >
            Rename
          </Button>
        </ModalActions>
      </PopupModal>
    </Modal>
  );
};
export default CollectionListPage;

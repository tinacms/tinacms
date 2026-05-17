import type { TinaCMS } from '@tinacms/toolkit';
import React from 'react';
import { BiFile, BiFolder, BiEdit } from 'react-icons/bi';
import { ImFilesEmpty } from 'react-icons/im';
import { NavLink } from 'react-router-dom';

import GetCMS from '../components/GetCMS';
import { PageBody, PageHeader, PageWrapper } from '../components/Page';
import { useGetCollections } from '../components/GetCollections';

const CollectionCard = ({
  collection,
}: {
  collection: { name: string; label?: string };
}) => {
  return (
    <NavLink
      to={`/collections/${collection.name}/~`}
      className='group flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-white hover:border-orange-300 hover:shadow-md transition-all duration-150 ease-out'
    >
      <div className='flex-shrink-0 w-10 h-10 rounded-md bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors duration-150'>
        <ImFilesEmpty className='w-5 h-5 text-orange-500' />
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium text-gray-800 truncate'>
          {collection.label || collection.name}
        </p>
        <p className='text-xs text-gray-400 mt-0.5'>Browse &amp; edit content</p>
      </div>
      <BiEdit className='w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors duration-150 flex-shrink-0' />
    </NavLink>
  );
};

const QuickStartCard = ({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
}) => (
  <a
    href={href}
    target='_blank'
    rel='noopener noreferrer'
    className='flex items-start gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-150 ease-out'
  >
    <div className='flex-shrink-0 w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center mt-0.5'>
      <Icon className='w-4 h-4 text-orange-500' />
    </div>
    <div>
      <p className='text-sm font-medium text-gray-700'>{title}</p>
      <p className='text-xs text-gray-400 mt-0.5 leading-relaxed'>{description}</p>
    </div>
  </a>
);

const CollectionsList = ({ cms }: { cms: TinaCMS }) => {
  const collectionsInfo = useGetCollections(cms);
  const collections = collectionsInfo.collections.filter(
    (c) => !c.isAuthCollection
  );

  if (collections.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-10 text-center rounded-lg border border-dashed border-gray-200 bg-gray-50/50'>
        <BiFolder className='w-10 h-10 text-gray-300 mb-2' />
        <p className='text-sm text-gray-400'>No collections configured yet.</p>
        <a
          href='https://tina.io/docs/r/content-modelling-collections'
          target='_blank'
          rel='noopener noreferrer'
          className='text-xs text-orange-500 underline mt-1 hover:text-orange-600'
        >
          Learn how to add collections
        </a>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
      {collections.map((collection) => (
        <CollectionCard key={collection.name} collection={collection} />
      ))}
    </div>
  );
};

const DashboardPage = () => {
  return (
    <GetCMS>
      {(cms: TinaCMS) => (
        <PageWrapper>
          <>
            <PageHeader>
              <div>
                <h3 className='text-2xl font-sans font-semibold text-gray-800'>
                  Dashboard
                </h3>
                <p className='text-sm text-gray-400 mt-1'>
                  Select a collection to browse and edit your content.
                </p>
              </div>
            </PageHeader>
            <PageBody>
              <div className='w-full mx-auto max-w-screen-xl space-y-8'>
                <section>
                  <h4 className='text-xs font-bold uppercase tracking-wider text-gray-500 mb-3'>
                    Collections
                  </h4>
                  <CollectionsList cms={cms} />
                </section>

                <section>
                  <h4 className='text-xs font-bold uppercase tracking-wider text-gray-500 mb-3'>
                    Resources
                  </h4>
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                    <QuickStartCard
                      icon={BiFile}
                      title='Documentation'
                      description='Read the TinaCMS docs to learn about collections, fields, and more.'
                      href='https://tina.io/docs'
                    />
                    <QuickStartCard
                      icon={BiFolder}
                      title='Content Modelling'
                      description='Learn how to structure your content with collections and templates.'
                      href='https://tina.io/docs/r/content-modelling-collections'
                    />
                    <QuickStartCard
                      icon={BiEdit}
                      title='Media Management'
                      description='Upload and manage images, videos, and other media assets.'
                      href='https://tina.io/docs/r/media'
                    />
                  </div>
                </section>
              </div>
            </PageBody>
          </>
        </PageWrapper>
      )}
    </GetCMS>
  );
};

export default DashboardPage;

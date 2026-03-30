import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/layout';
import { Loading } from './loading';

const Home = React.lazy(() => import('./pages/home'));
const PostsList = React.lazy(() => import('./pages/posts-list'));
const PostDetail = React.lazy(() => import('./pages/post-detail'));
const BlogList = React.lazy(() => import('./pages/blog-list'));
const BlogDetail = React.lazy(() => import('./pages/blog-detail'));
const AuthorsList = React.lazy(() => import('./pages/authors-list'));
const AuthorDetail = React.lazy(() => import('./pages/author-detail'));
const DynamicPage = React.lazy(() => import('./pages/dynamic-page'));
const NotFound = React.lazy(() => import('./pages/not-found'));

function AdminRedirect() {
  window.location.href = '/admin/index.html';
  return null;
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/posts' element={<PostsList />} />
          <Route path='/posts/*' element={<PostDetail />} />
          <Route path='/blog' element={<BlogList />} />
          <Route path='/blog/:filename' element={<BlogDetail />} />
          <Route path='/authors' element={<AuthorsList />} />
          <Route path='/authors/:filename' element={<AuthorDetail />} />
          <Route path='/admin' element={<AdminRedirect />} />
          <Route path='/404' element={<NotFound />} />
          <Route path='/*' element={<DynamicPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

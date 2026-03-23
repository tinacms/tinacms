import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/layout';
import { Loading } from './loading';

const Home = React.lazy(() => import('./pages/home'));

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path='/' element={<Home />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

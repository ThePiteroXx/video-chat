import dynamic from 'next/dynamic';

const Home = dynamic(() => import('@/template/Home'), { ssr: false });

const HomePage = () => {
  return <Home />;
};

export default HomePage;

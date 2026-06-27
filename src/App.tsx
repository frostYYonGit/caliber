import { useEffect, useState } from 'react';
import { QuizProvider } from './state/QuizContext';
import { Home } from './routes/Home';
import { Result } from './routes/Result';

type Route = 'home' | 'result';

function getRoute(): Route {
  const path = window.location.pathname.replace(/\/+$/, '');
  const params = new URLSearchParams(window.location.search);
  return path === '/r' || params.has('s') ? 'result' : 'home';
}

export default function App() {
  const [route, setRoute] = useState<Route>(getRoute);

  useEffect(() => {
    const onPop = () => setRoute(getRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  if (route === 'result') return <Result />;
  return (
    <QuizProvider>
      <Home />
    </QuizProvider>
  );
}

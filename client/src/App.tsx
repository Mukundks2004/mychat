import React, {useEffect, useState} from 'react';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => res.json())
      .then((data) => setMessage("Message: " + data.message));
  }, []);

  return (
    <div>
      <h1>{message || 'Loading...'}</h1>
    </div>
  );
}

export default App;

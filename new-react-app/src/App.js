import './App.css';
import {useEffect, useState} from "react";

function App() {

    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api')
            .then(response => response.text())
            .then(data => setMessage(data))
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    return (
    <div className="App">
      <h1>{message}</h1>
    </div>
    );
}

export default App;

import React from 'react';

function getTitle(title) {
    return  title
}

function App() {
    return (
        <div>
            <h1>Hello {getTitle("React")}</h1>
        </div>
    );
}
export default App;
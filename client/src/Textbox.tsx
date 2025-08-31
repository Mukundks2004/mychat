import React, { useState } from 'react';

export function Textbox() {
    const [text, setText] = useState('');
    const [, setSubmittedText] = useState('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setText(event.target.value);
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmittedText(text);
        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: text })
            });

            if (!response.ok) {
                throw new Error('API call failed!');
            }

            await response.json();
        }
        catch (error) {
            console.error('Submission error:', error);
        }

        setText('');
    }

    return (
        <div>
            <br />
            <form onSubmit={handleSubmit}>
                <input id="textbox" type="text" placeholder="Type message here..." onChange={handleChange} value={text}></input>
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}
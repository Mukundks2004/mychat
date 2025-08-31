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
        console.log("submit")
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

            const result = await response.json();
            console.log(result);
        }
        catch (error) {
            console.error('Submission error:', error);
        }

        console.log(text)

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
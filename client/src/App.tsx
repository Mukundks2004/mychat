import { Textbox } from './Textbox';
import { ScrollBox } from './Scrollbox';
import { Card } from './Card';

function App() {
  return (
    <div style={{padding: "10px"}}>
      <h1>Welcome to MyChat!</h1>
      <ScrollBox height="300px" width="600px" scrollDirection="vertical" childBorder="1px solid #ccc">
        {
          Array.from({ length: 30 }, (_, i) => {
            const myMessage = "This is message number " + (i + 1);

            return (
              <Card key={i} date="10/04/2005" name="orange" color="#0f0" message={myMessage}></Card>
            )
          })
        }
      </ScrollBox>
      <Textbox></Textbox>
    </div>
  );
}

export default App;

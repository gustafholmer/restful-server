# restfulServer
Final project in a web development course focusing on learning how to develop the backend of web apps. The project goal was to create a backend architecture for a university room information app.

# Usage
There are different types of files to run in a certain order:

1. Create a json file consisting of different room data which originally are stored in a excel-file:
- type and run "bash salar2json.bash" (will use the existing excel-file "salar.xlsx" which are filled with room information)

2. Run node.js server:
- type and run "node server/index.js --port <number>" in a separate terminal window
  
3. Run client (using node.js) to test the server
- type and run "node client/index.js --server <server> --port <number>" in a separate terminal window. Use the meny to receive information about different rooms

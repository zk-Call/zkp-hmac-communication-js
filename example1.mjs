import {HMACClient} from './src/HMAC/core/base.mjs';
import {SeedGenerator} from './src/SeedGeneration/core/base.mjs';

// DEBUG constant used for enabling/disabling debugging messages
const DEBUG = true;

// Function to print messages with specific formatting if DEBUG is enabled
function printMsg(who, message) {
    if (DEBUG) {
        console.log(`[${who}] ${message}\n`);
    }
}

// The main function of the script
function main() {
    // Generating a client seed using a SeedGenerator instance
    const client_seed = new SeedGenerator("job").generate();

    // Creating an HMAC client instance for the client using sha256 algorithm and the generated seed
    const client_hmac = new HMACClient("sha256", client_seed, 1);

    // Creating an HMAC server instance for the server using sha256 algorithm and the same generated seed
    const serverhmac = new HMACClient("sha256", client_seed, 1);

    // Checking if the encrypted message from client and server matches
    if (client_hmac.encrypt_message('') === serverhmac.encrypt_message('')) {
        // Defining a message to be sent from client to server
        const client_message = 'hello';

        // Encrypting the client message in chunks using the client HMAC instance
        const client_encrypted_message_for_server = client_hmac.encrypt_message_by_chunks(client_message)

        // Printing a message indicating that client has sent an encrypted message
        printMsg('client', 'sent has encrypted message')

        // Decrypting the message received from client by the server using server HMAC instance
        const server_decrypted_message = serverhmac.decrypt_message_by_chunks(client_encrypted_message_for_server)
        // Printing a message indicating that server has decrypted the message
        printMsg('server', 'server has decrypt message')

        // Encrypting the decrypted message by the server
        const server_response = serverhmac.encrypt_message(server_decrypted_message)
        // Printing a message indicating that server has encrypted the message
        printMsg('server', 'server has encrypted message')

        // Checking if the encrypted message from client matches the server's response
        if (client_hmac.encrypt_message(client_message) === server_response) {
            // Printing a message indicating that server has successfully read the message from client
            printMsg('client', 'server has read message')
        }
    }
}

// Calling the main function to start the script execution
main()

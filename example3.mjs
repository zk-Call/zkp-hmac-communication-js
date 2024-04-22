// Importing necessary modules
import {ZeroKnowledge} from "./src/ZeroKnowledge/core/base.mjs"; // Importing ZeroKnowledge class
import {ZeroKnowledgeData} from "./src/ZeroKnowledge/models/base.mjs";
import {SeedGenerator} from "./src/SeedGeneration/core/base.mjs";
import {HMACClient} from "./src/HMAC/core/base.mjs"; // Importing ZeroKnowledgeData class

// DEBUG constant used for enabling/disabling debugging messages
const DEBUG = true;

// Function to print messages with specific formatting if DEBUG is enabled
function printMsg(who, message) {
    if (DEBUG) {
        console.log(`[${who}] ${message}\n`); // Print formatted message
    }
}

// The main function of the script
function main() {
    // Generating a client seed using a SeedGenerator instance
    const server_password = "SecretServerPassword"; // Define server password

    // Creating ZeroKnowledge instances for server and client
    const server_object = ZeroKnowledge.new("secp256k1", "sha3_256"); // Initialize server ZeroKnowledge instance
    const client_object = ZeroKnowledge.new("secp256k1", "sha3_256"); // Initialize client ZeroKnowledge instance

    // Creating signatures for server and client
    const server_signature = server_object.create_signature(server_password); // Generate server signature
    printMsg("Server", `Server signature: ${server_signature}`); // Print server signature
    const idenity = 'John'; // Define client identity
    const client_sig = client_object.create_signature(idenity); // Generate client signature
    printMsg("Client", `Client signature: ${client_sig}`); // Print client signature

    // Signing and generating token for server and client
    const server_token = server_object.sign(server_password, client_object.token()); // Sign and generate token for server
    printMsg("Server", `Server token: ${server_token}`); // Print server token
    const client_proof = client_object.sign(idenity, server_token.data); // Sign token data for client
    printMsg("Client", `Client proof: ${client_proof}`); // Print client proof

    // Creating ZeroKnowledgeData instance for token verification
    const token_veif = new ZeroKnowledgeData(client_proof.data, client_proof.proof);

    // Verifying the token against server signature
    const server_verif = server_object.verify(token_veif, server_signature); // Verify token against server signature
    printMsg("Server", `Server verification: ${server_verif}`); // Print server verification
    if (server_verif) {
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
}

// Calling the main function to start the script execution
main();

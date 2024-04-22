// Importing necessary modules
import { ZeroKnowledge } from "./src/ZeroKnowledge/core/base.mjs"; // Importing ZeroKnowledge class
import { ZeroKnowledgeData } from "./src/ZeroKnowledge/models/base.mjs"; // Importing ZeroKnowledgeData class

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
}

// Calling the main function to start the script execution
main();

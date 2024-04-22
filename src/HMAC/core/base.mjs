import * as crypto from 'crypto'; // Import the crypto module for cryptographic operations
import * as itertools from 'itertools'; // Import the itertools module for iterating over combinations
import * as string from 'string'; // Import the string module for string operations (e.g., Python-like operations)
import { Hash_type_and_len } from '../algorithms/base.mjs'; // Import the Hash_type_and_len constant from the base module

class HMACClient {
    constructor(algorithm = 'sha3-256', secret = Buffer.from(''), symbol_count = 1) {
        // Constructor for the HMACClient class with default parameters
        this._algorithm = algorithm; // Set the HMAC algorithm
        this._secret = secret; // Set the secret key for HMAC
        this._decrypt_dict = {}; // Initialize a dictionary to store decrypted values
        this._symbol_count = symbol_count; // Set the number of symbols per chunk
        this.init_decrypt_dict(); // Initialize the decrypt dictionary
    }

    // Initialize the decrypt dictionary with combinations of characters
    init_decrypt_dict() {
        const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz'; // Define lowercase letters
        const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // Define uppercase letters
        const digits = '0123456789'; // Define digits
        const punctuation = `!"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~`; // Define punctuation characters

        const all_chars = lowercaseLetters + uppercaseLetters + digits + punctuation; // Combine all characters
        const combinations = this.generateCombinations(all_chars, this._symbol_count); // Generate combinations

        // Generate combinations and encrypt them to create the decrypt dictionary
        for (const comb of combinations) {
            const value = comb.join(''); // Concatenate characters to form a value
            const key = this.encrypt_message(value); // Encrypt the value to get a key
            this._decrypt_dict[key] = value; // Store the key-value pair in the decrypt dictionary
        }
    }

    // Generate combinations of characters
    generateCombinations(characters, length) {
        const combinations = []; // Initialize an array to store combinations

        function generate(prefix, remainingLength) {
            if (remainingLength === 0) { // If remaining length is 0, add the prefix to combinations
                combinations.push(prefix);
            } else {
                for (const char of characters) { // Iterate over characters
                    generate(prefix.concat(char), remainingLength - 1); // Recursively generate combinations
                }
            }
        }

        generate([], length); // Start with an empty prefix and full length
        return combinations; // Return the generated combinations
    }

    // Encrypt message by dividing it into chunks and encrypting each chunk
    encrypt_message_by_chunks(message) {
        let encrypted_message = ''; // Initialize a variable to store the encrypted message
        for (let i = 0; i < message.length; i += this._symbol_count) { // Iterate over the message in chunks
            const chunk = message.slice(i, i + this._symbol_count); // Get a chunk of the message
            encrypted_message += this.encrypt_message(chunk); // Encrypt the chunk and append to the encrypted message
        }
        return encrypted_message; // Return the encrypted message
    }

    // Encrypt message using HMAC
    encrypt_message(message) {
        return crypto.createHMAC(this._algorithm, this._secret) // Create an HMAC object
            .update(Buffer.from(message, 'utf-8')) // Update the HMAC with the message
            .digest('hex'); // Compute the digest and return it as a hexadecimal string
    }

    // Encrypt message and return the digest
    encrypt_message_digest(message) {
        return crypto.createHMAC(this._algorithm, this._secret) // Create an HMAC object
            .update(Buffer.from(message, 'utf-8')) // Update the HMAC with the message
            .digest(); // Compute the digest and return it
    }

    // Decrypt message by dividing it into chunks and decrypting each chunk
    decrypt_message_by_chunks(message, chunk = null) {
        let msg_raw = ''; // Initialize a variable to store the raw message
        const chank = chunk || Hash_type_and_len[this._algorithm]; // Get the chunk size
        if (message.length % this._symbol_count === 0) { // Check if the message length is divisible by symbol count
            for (let i = 0; i < message.length; i += chank) { // Iterate over the message in chunks
                const chunk = message.slice(i, i + chank); // Get a chunk of the message
                msg_raw += this.decrypt_message(chunk); // Decrypt the chunk and append to the raw message
            }
            return msg_raw; // Return the raw message
        } else {
            throw new Error(`The algorithm ${this._algorithm} is invalid`); // Throw an error for an invalid algorithm
        }
    }

    // Decrypt message using the decrypt dictionary
    decrypt_message(message) {
        const val = this._decrypt_dict[message]; // Get the value from the decrypt dictionary
        if (val) { // If the value exists
            return val; // Return the decrypted message
        } else {
            throw new Error(`The algorithm ${this._algorithm} is invalid`); // Throw an error for an invalid algorithm
        }
    }
}

export { HMACClient }; // Export the HMACClient class for usage in other modules

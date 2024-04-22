import * as secrets from 'secrets'; // Import secrets module for cryptographic operations
import * as crypto from 'crypto'; // Import crypto module for cryptographic operations
import { get_random_int, hash_digest } from '../utils/base.mjs'; // Import helper functions from base module

export class SeedGenerator {
    constructor(phrase) {
        this._phrase = phrase; // Initialize SeedGenerator with a phrase
    }

    _hash(length) {
        // Private method to generate a hash
        // Example: generate secure random bytes using crypto module
        const randomBytes = crypto.randomBytes(64); // Generate 64 random bytes securely
        const combinated_bytes = Buffer.concat([randomBytes, Buffer.from(this._phrase)]); // Concatenate random bytes and phrase
        return hash_digest(combinated_bytes); // Return the hash of the combined bytes
    }

    generate() {
        // Public method to generate a seed
        return this._hash(get_random_int()); // Generate a hash using a random length
    }
}

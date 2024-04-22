import { createHash } from 'crypto'; // Import createHash function from the crypto module

// Function to generate a random integer
function get_random_int() {
    const random_int = Math.floor(Math.random() * Math.pow(2, 20)); // Generate a random integer in the range [0, 2^20)
    return random_int; // Return the generated random integer
}

// Function to compute the hash digest of the combined bytes
function hash_digest(combined_bytes) {
    const hash = createHash('sha256'); // Create a hash object using SHA-256 algorithm
    hash.update(combined_bytes); // Update the hash with the combined bytes
    return hash.digest(); // Return the digest (hash value) of the combined bytes
}

// Export the functions for usage in other modules
export { get_random_int, hash_digest };

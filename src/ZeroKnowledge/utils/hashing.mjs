import {HashTypes} from '../algorithms/base.mjs'; // Import HashTypes from base module
import {bytes_to_int, to_bytes} from './convert.mjs'; // Import bytes_to_int and to_bytes functions from convert module
import EC from "elliptic"; // Import elliptic curve library
import pkg from 'js-sha3'; // Import js-sha3 package for SHA3 hashing
const {sha3_256} = pkg; // Destructure sha3_256 function from js-sha3 package

// Function to get curve by name, case-insensitive
function curve_by_name(name) {
    let curv1 = new EC.ec(name); // Create a new instance of the elliptic curve
    return new EC.ec(name);
}

// Function to compute a mod b, accounting for positive/negative numbers
function mod(a, b) {
    return ((a % b) + b) % b; // Compute a mod b, considering positive/negative numbers
}

// Function to convert provided values to bytes and return the hash digest in bytes
function hash_data(...values) {
    const algorithm = "sha3-256"; // Default algorithm
    const HashTypes = { // Define supported hash algorithms
        "sha3-256": (data) => sha3_256(data, { outputLength: 256 }) // Define function for SHA3-256 hash
    };

    if (!(algorithm in HashTypes)) { // Check if the hash algorithm is supported
        throw new Error(`Hash algorithm '${algorithm}' is not supported`);
    }

    // Convert each value to bytes and concatenate them
    const bytesValues = values.map(value => {
        if (typeof value === 'string') {
            return Buffer.from(value);
        } else if (Buffer.isBuffer(value)) {
            return value;
        } else if (typeof value === 'number') {
            return Buffer.from(value.toString());
        } else if (typeof value === 'object' && value.encode !== undefined) {
            return Buffer.from(value.encode());
        } else {
            throw new Error(`Unsupported value type: ${typeof value}`);
        }
    });

    const concatenatedBytes = Buffer.concat(bytesValues); // Concatenate bytes

    // Compute hash of concatenated values
    return HashTypes[algorithm](concatenatedBytes); // Return hash digest
}

// Function to compute the cryptographic hash of provided values and return the digest in integer form
function hash_numeric(...values) {
    const algorithm = "sha3_256"; // Default algorithm
    const hashDigest = hash_data(...values, algorithm); // Compute hash digest
    return bytes_to_int(hashDigest); // Convert hash digest to integer form
}

export {curve_by_name, mod, hash_data, hash_numeric}; // Export functions for usage in other modules

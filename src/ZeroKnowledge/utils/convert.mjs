// Convert any value to an integer from its big endian bytes representation
function bytes_to_int(value) {
    return parseInt(Buffer.from(value).toString('hex'), 16);
}

// Convert an integer value to bytes in big endian representation
function int_to_bytes(value) {
    const hex = value.toString(16); // Convert integer to hexadecimal string
    // Create a buffer from the hexadecimal string, ensuring even length by padding with zeros if necessary
    return Buffer.from(hex.padStart(hex.length + (hex.length % 2), '0'), 'hex');
}

// Encode data in base64 format, optionally strip padding
function data_to_b64_str(data, strip=true) {
    const base64 = Buffer.from(data).toString('base64'); // Convert data to base64
    return strip ? base64.replace(/=+$/, '') : base64; // Optionally strip padding from base64 string
}

// Decode base64 data to bytes, append padding if necessary
function b64d(data, pad=true) {
    return Buffer.from(data + (pad ? '==='.slice((data.length + 3) % 4) : ''), 'base64'); // Decode base64 data
}

// Convert data to its bytes representation
function to_bytes(data, encoding="utf-8", errors="replace") {
    // If data is a string, convert it to bytes using the specified encoding
    if (typeof data === 'string') {
        return Buffer.from(data, encoding);
    }
    // If data is an integer, convert it to bytes using int_to_bytes function
    if (Number.isInteger(data)) {
        return int_to_bytes(data);
    }
    // Handle other types accordingly
}

// Convert data to its string representation
function to_str(data, encoding="utf-8", errors="replace") {
    // If data is already a string, return it unchanged
    if (typeof data === 'string') {
        return data;
    }
    // If data is a Buffer, convert it to a string using the specified encoding
    if (data instanceof Buffer) {
        return data.toString(encoding, errors);
    }
    // If data is an integer, convert it to a string
    if (Number.isInteger(data)) {
        return data.toString();
    }
    // Handle other types accordingly
}

// Export all functions for usage in other modules
export { bytes_to_int, int_to_bytes, data_to_b64_str, b64d, to_bytes, to_str };

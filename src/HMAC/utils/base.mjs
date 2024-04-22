// Function to convert data to bytes representation
function to_bytes(data, encoding = "utf-8") {
    // Check if the data is a string
    if (typeof data === 'string') {
        // If it's a string, convert it to bytes using the specified encoding
        return Buffer.from(data, encoding);
    }
    // If data is not a string, return it as is
    return data;
}

// Function to convert data to string representation
function to_str(data, encoding = "utf-8") {
    // Check if the data is a buffer
    if (Buffer.isBuffer(data)) {
        // If it's a buffer, convert it to a string using the specified encoding
        return data.toString(encoding);
    }
    // If data is not a buffer, return it as is
    return data;
}

// Export the functions for usage in other modules
export { to_bytes, to_str };

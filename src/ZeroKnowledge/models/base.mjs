// Importing necessary modules

// Define ZeroKnowledgeParams class
class ZeroKnowledgeParams {
    /**
     * Parameters used to construct a "Zero-Knowledge" instance using a hashing scheme,
     * a standard elliptic curve name, and a random salt
     */
    constructor(algorithm, curve, salt) {
        this.algorithm = algorithm; // Hashing algorithm name
        this.curve = curve; // Standard Elliptic Curve name to use
        this.salt = salt; // Random salt for the state
    }

    to_json() {
        // Convert parameters to JSON format
        return JSON.stringify({
            algorithm: this.algorithm,
            curve: this.curve,
            salt: this.salt
        });
    }

    static from_json(json) {
        // Convert JSON string to ZeroKnowledgeParams object
        const obj = JSON.parse(json);
        return new ZeroKnowledgeParams(obj.algorithm, obj.curve, obj.salt);
    }
}

// Define ZeroKnowledgeSignature class
class ZeroKnowledgeSignature {
    /**
     * Cryptographic public signature used to verify future messages
     */
    constructor(params, signature) {
        this.params = params; // Reference "Zero-Knowledge" Parameters
        this.signature = signature; // The public key derived from your original secret
    }

    to_json() {
        // Convert signature object to JSON format
        return JSON.stringify({
            params: this.params.to_json(),
            signature: this.signature,
        });
    }

    static from_json(json) {
        // Convert JSON string to ZeroKnowledgeSignature object
        const obj = JSON.parse(json);
        return new ZeroKnowledgeSignature(obj.params.from_json(), obj.signature);
    }
}

// Define ZeroKnowledgeProof class
class ZeroKnowledgeProof {
    /**
     * Cryptographic proof that can be verified to ensure the private key used to create
     * the proof is the same key used to generate the signature
     */
    constructor(params, c, m) {
        this.params = params; // Reference "Zero-Knowledge" Parameters
        this.c = c; // The hash of the signed data and random point, R
        this.m = m; // The offset from the secret `r` (`R=r*g`) from c * Hash(secret)
    }

    to_json() {
        // Convert proof object to JSON format
        return JSON.stringify({
            params: this.params.to_json(),
            c: this.c,
            m: this.m,
        });
    }

    static from_json(json) {
        // Convert JSON string to ZeroKnowledgeProof object
        const obj = JSON.parse(json);
        return new ZeroKnowledgeProof(obj.params.from_json(), obj.c, obj.m);
    }
}

// Define ZeroKnowledgeData class
class ZeroKnowledgeData {
    /**
     * Wrapper to contain data and a signed proof using the data
     */
    constructor(data, proof) {
        this.data = data; // Signed data
        this.proof = proof; // ZeroKnowledgeProof instance
    }

    static from_json(json) {
        // Convert JSON string to ZeroKnowledgeData object
        const obj = JSON.parse(json);
        return new ZeroKnowledgeData(obj.data, obj.proof.from_json());
    }

    to_json() {
        // Convert ZeroKnowledgeData object to JSON format
        return JSON.stringify({
            data: this.data,
            proof: this.proof.to_json(),
        });
    }
}

// Exporting classes for usage
export {ZeroKnowledgeParams, ZeroKnowledgeSignature, ZeroKnowledgeProof, ZeroKnowledgeData};

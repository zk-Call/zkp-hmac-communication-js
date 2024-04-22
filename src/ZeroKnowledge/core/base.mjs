import {ZeroKnowledgeData, ZeroKnowledgeParams, ZeroKnowledgeProof, ZeroKnowledgeSignature} from '../models/base.mjs'; // Import necessary models
import * as jwt from 'jsonwebtoken'; // Import jwt module for JSON Web Token operations
import {bytes_to_int, int_to_bytes, to_bytes, to_str} from '../utils/convert.mjs'; // Import utility functions
import {curve_by_name, hash_numeric, mod} from '../utils/hashing.mjs'; // Import utility functions
import {dump_object} from '../utils/serialization.mjs'; // Import utility functions
import {randomBytes} from 'crypto'; // Import randomBytes function from the crypto module


export class ZeroKnowledge {
    /**
     * Class implementing zero-knowledge authentication scheme.
     */
    constructor(params, secret = null, algorithm = "HB2S", issuer = "zk-call") {
        /**
         * Initialize the curve with the given parameters
         */
        this._obj_curve = curve_by_name(params.curve); // Retrieve the curve object
        if (!this._obj_curve) {
            throw new Error(`The curve '${params.curve}' is invalid`);
        }
        this._params = params; // Store the parameters

        this._bits = this._obj_curve.curve.p.bitLength(); // Get the number of bits for the curve
        this._secret = secret; // Store the secret key
        this._algorithm = algorithm; // Store the algorithm for JWT
        this._issuer = issuer; // Store the issuer name for JWT
    }

    generate_jwt(signature, exp = td(seconds = 10)) {
        /**
         * Generate a JSON Web Token (JWT) using the provided signature and expiration time.
         */
        if (this._secret) {

            const now = new Date().toISOString(); // Get the current UTC time
            return to_str(jwt.encode({ // Encode the JWT payload
                "signature": dump_object(signature), // Dump the signature object
                "iat": now,
                "nbf": now,
                "exp": new Date(new Date().getTime() + exp * 1000).toISOString(),
                "iss": this._issuer, // Set JWT claims
            }, this._secret, algorithm = this._algorithm)); // Encode JWT using secret key
        }
    }

    verify_jwt(tok) {
        /**
         * Verify a JSON Web Token (JWT) and return decoded data if valid.
         */
        if (this._secret) {
            try {
                return jwt.decode(to_str(tok), this._secret, iss = this._issuer, algorithms = [this._algorithm]);
            } catch (e) {
                console.error(e);
            }
        }
    }

    get params() {
        /**
         * Get zero-knowledge parameters.
         */
        return this._params;
    }

    get salt() {
        /**
         * Get salt used in the authentication.
         */
        return this._params.salt;
    }

    get curve() {
        /**
         * Get the elliptic curve used for cryptography.
         */
        return this._obj_curve;
    }

    static new(curve_name = "Ed25519", hash_alg = "blake2b", jwt_secret = null, jwt_alg = "HB2B", salt_size = 16) {
        /**
         * Create a new instance of "Zero-Knowledge" with specified parameters.
         */
        const curve = curve_by_name(curve_name); // Get the curve object

        if (!curve) {
            throw new Error("Invalid Curve Name"); // Raise error for invalid curve name
        }
        let zkx = new ZeroKnowledgeParams({ // Initialize "Zero-Knowledge"Params object
            algorithm: hash_alg, // Set hashing algorithm
            curve: curve_name, // Set elliptic curve name
            salt: randomBytes(salt_size), // Generate salt
        })

        return new ZeroKnowledge
        (new ZeroKnowledgeParams( // Return a new instance of "Zero-Knowledge"
            hash_alg, // Set hashing algorithm
            curve_name, // Set elliptic curve name
            randomBytes(salt_size), // Generate salt
            ), jwt_secret, // Set JWT secret
            jwt_alg // Set JWT algorithm
        );
    }

    _to_point(value) {
        /**
         * Convert a value to a point on the elliptic curve.
         */

        const bytes = to_bytes(value instanceof ZeroKnowledgeSignature ? value.signature : value);
        try {
             // Adjust isOdd as needed
            return this.curve.curve.pointFromX(bytes, /*isOdd=*/ true);
        } catch (error) {
            console.error("Error constructing point from x-coordinate:", error);
            // Handle the error or return null/undefined if appropriate
            return null;
        }
    }

    token() {
        /**
         * Generate a random token.
         */
        return randomBytes(this._bits + 7 >> 3);
    }

    hash(...values) {
        /**
         * Hash the values provided modulo the curve order
         */
        return mod(hash_numeric(...values.filter(v => v !== null), this.salt, this.params.algorithm), this.curve.curve.n);
    }

    create_signature(secret) {
        /**
         * Create a signature object using the provided secret key.
         */

        let signaturePoint = this.curve.curve.g.mul(this.hash(secret));

        let signatureBytes = to_bytes(signaturePoint);


        return new ZeroKnowledgeSignature({
            params: this.params,
            signature: signatureBytes,
        });
    }

    create_proof(secret, data = null) {
        const key = this.hash(secret); // Compute hash of the secret key
        const bytesNeeded = Math.ceil(Math.log2(this.curve.curve.n) / 8); // Calculate bytes needed for the curve order
        const randomBytes1 = randomBytes(bytesNeeded); // Generate random bytes
        const r = bytes_to_int(randomBytes1); // Convert random bytes to integer
        const R = this.curve.curve.g.mul(BigInt(r)); // Compute a point on the curve
        const c = this.hash(data, R); // Compute hash of the data and R
        const m = mod(r - c * key, this.curve.curve.n); // Compute m

        return new ZeroKnowledgeProof(
            this.params,
            int_to_bytes(c),
            int_to_bytes(m)
        );
    }

    sign(secret, data) {
        /**
         * Sign the provided data using the secret key.
         */


        data = to_str(data); // Convert data to string



        return new ZeroKnowledgeData( // Create a "Zero-Knowledge"Data object
            data,
            this.create_proof(secret, data) // Create proof for the data
        );
    }

    static signature_is_valid(signature) {
        /**
         * Check if the signature is valid.
         */
        try {
            const zk = new ZeroKnowledge(signature.params); // Create "Zero-Knowledge" object
            return zk.curve.curve.validate(zk._to_point(signature)); // Check if the signature is valid
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    verify(challenge, signature, data = "") {
        /**
         * Verify the authenticity of the provided challenge data against the given signature.
         */


        let proof=challenge.proof;

        data = challenge.data ;

        const c = bytes_to_int(proof.c); // Convert proof.c to an integer
        const p = this.curve.curve.g.mul(bytes_to_int(proof.m)).add(this._to_point(signature).mul(c));
        return c === this.hash(data, p); // Compare c with hash of data and point
    }

    login(login_data) {
        /**
         * Perform a login using the provided login data.
         */
        const data = this.verify_jwt(login_data.data); // Verify JWT token from login data
        return data && this.verify( // Check if data is valid and verify the login
            login_data,
            ZeroKnowledgeSignature.from_json(data.get("signature")) // Convert JSON signature to "Zero-Knowledge" Signature object
        );
    }
}

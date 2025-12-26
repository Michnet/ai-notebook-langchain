import crypto from 'crypto';

// Polyfill for Node.js < 21.7.0
if (!crypto.hash) {
    // @ts-ignore
    crypto.hash = (algorithm: string, data: crypto.BinaryLike, outputEncoding?: crypto.BinaryToTextEncoding) => {
        const hash = crypto.createHash(algorithm);
        hash.update(data);
        if (outputEncoding) {
            return hash.digest(outputEncoding);
        }
        return hash.digest();
    };
}

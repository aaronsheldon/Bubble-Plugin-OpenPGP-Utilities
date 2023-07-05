function(properties, context) {
    
    // Instantiate library
	const openpgp = require('openpgp');

    // Bail on missing
    if (properties.name == null) {
        return {
            publickey: null,
            privatekey: null
        };
    }
    if (properties.email == null) {
        return {
            publickey: null,
            privatekey: null
        };
    }
    if (properties.passphrase == null) {
        return {
            publickey: null,
            privatekey: null
        };
    }
    
    // Load and prune
    const options = {
        userIDs: {
            name: properties.name,
            email: properties.email
        },
        type: "rsa",
        passphrase: properties.passphrase,
        rsaBits: 4096,
        format: "armored"
    }
    if (properties.date != null) { options.date = properties.date; }
    if (properties.expires != null) { options.keyExpirationTime = Math.max(0, properties.expires); }
    
    // Generate pair
    const pairpromise = openpgp.generateKey(options);
    const pair = context.async(
        callback => pairpromise
        .then(response => callback(null, response))
        .catch(reason => callback(reason))
    );
    
	// Send
	return {
        publickey: pair.publicKey,
        privatekey: pair.privateKey
    };
}
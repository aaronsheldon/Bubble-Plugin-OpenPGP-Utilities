function(properties, context) {
    
    // Instantiate library
	const openpgp = require('openpgp');
    
    // Bail on missing
    if (properties.message == null) {
        return { signature: null };
    }
    if (properties.signingkey == null) {
        return { signature: null };
    }
    if (properties.passphrase == null) {
        return { signature: null };
    }
    
    // Load and prune
    const messageoptions = {};
    if (properties.base64) {
        messageoptions.binary = new Uint8Array(Buffer.from(properties.message, "base64"));
        messageoptions.format = "binary";
    }
    else {
        messageoptions.text = properties.message;
        messageoptions.format = "utf8";
    }
    
    // Chain promises
    const messagepromise = openpgp.createMessage(messageoptions);
    const keypromise = openpgp.readPrivateKey({ armoredKey: properties.signingkey })
    .then(
        key => {
            const options = {
                privateKey: key,
                passphrase: properties.passphrase
            };
            return openpgp.decryptKey(options);
        }
    );
    const signpromise = Promise.all([messagepromise, keypromise])
    .then(
        ([message, key]) => {
            const options = {
                message: message,
                signingKeys: key,
                format: "armored",
                detached: true
            };
            if (properties.date != null) { options.date = properties.date; }
            return openpgp.sign(options);
        }
    )
    .catch(reason => { return null; });
    
    // Extract from chain
    const signature = context.async(
        callback => signpromise
        .then(response => callback(null, response))
        .catch(reason => callback(reason))
    );
    
	// Send
	return { signature: signature };
}
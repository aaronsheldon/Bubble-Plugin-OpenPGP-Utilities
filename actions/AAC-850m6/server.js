function(properties, context) {
    
    // Instantiate library
	const openpgp = require('openpgp');

    // Bail on missing
    if (properties.message == null) {
        return { message: null };
    }
    if (properties.encryptionkey == null) {
        return { message: null };
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
    if (properties.filename != null) { messageoptions.filename = properties.filename; }
    
    // Chain promises
    let encryptpromise;
    const messagepromise = openpgp.createMessage(messageoptions);
    const publicpromise = openpgp.readKey({ armoredKey: properties.encryptionkey });
    
    // Sign
    if ((properties.signingkey != null) && (properties.passphrase != null)) {
        const privatepromise = openpgp.readPrivateKey({ armoredKey: properties.signingkey })
        .then(
            key => {
                const options = {
                    privateKey: key,
                    passphrase: properties.passphrase
                };
                return openpgp.decryptKey(options);
            }
        );
        encryptpromise = Promise.all([messagepromise, publicpromise, privatepromise])
        .then(
            ([message, publickey, privatekey]) => {
                const options = {
                    message: message,
                    encryptionKeys: publickey,
                    signingkKeys: privatekey,
                    format: properties.base64 ? "binary" : "armored"
                };
                if (properties.date != null) { options.date = properties.date; }
                return openpgp.encrypt(options);
            }
        )
        .catch(reason => { return null; });
    }
    
    // Do not sign
    else {
        encryptpromise = Promise.all([messagepromise, publicpromise])
        .then(
            ([message, publickey]) => {
                const options = {
                    message: message,
                    encryptionKeys: publickey,
                    format: properties.base64 ? "binary" : "armored"
                };
                return openpgp.encrypt(options);
            }
        )
        .catch(reason => { return null; });        
    }
    
    // Extract from chain
    const encrypted = context.async(
        callback => encryptpromise
        .then(response => callback(null, response))
        .catch(reason => callback(reason))
    );
    
	// Send
    return { message: properties.base64 ? Buffer.from(encrypted).toString("base64") : encrypted}
}
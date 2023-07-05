function(properties, context) {
    
    // Instantiate library
	const openpgp = require('openpgp');
	let verified = null;
    
    // Bail on missing
    if (properties.message == null) {
        return { 
            message: null,
            verified: null,
            filename: null
        };
    }
    if (properties.decryptionkey == null) {
        return { 
            message: null,
            verified: null,
            filename: null
        };
    }
    if (properties.passphrase == null) {
        return { 
            message: null,
            verified: null,
            filename: null
        };
    }
    
    // Load and prune
    const messageoptions = {};
    if (properties.base64) {
        messageoptions.binaryMessage = new Uint8Array(Buffer.from(properties.message, "base64"));
    }
    else {
        messageoptions.armoredMessage = properties.message;
    }
    
    // Chain promise
    let decryptpromise;
    const encryptpromise = openpgp.readMessage(messageoptions);
	const privatepromise = openpgp.readPrivateKey({ armoredKey: properties.decryptionkey })
    .then(
        key => {
            const options = {
                privateKey: key,
                passphrase: properties.passphrase
            };
            return openpgp.decryptKey(options);
        }
    );
    
    // Verify
    if (properties.verificationkey != null) {
        const publicpromise = openpgp.readKey({ armoredKey: properties.verificationkey });
        decryptpromise = Promise.all([encryptpromise, privatepromise, publicpromise])
        .then(
        	([message, privatekey, publickey]) => {
                const options = {
                    message: message,
                    decryptionKeys: privatekey,
                    format: properties.base64 ? "binary" : "utf8",
                    expectSigned: false,
                    verificationKeys: publickey
                };
                if (properties.date != null) { options.date = properties.date; }
                return openpgp.decrypt(options);
            }
        );
        const verifypromise = decryptpromise
        .then(bundle => { return bundle.signatures[0].verified; })
        .catch(reason => { return null; });
        
        // Extract from chain
        verified = context.async(
            callback => verifypromise
            .then(response => callback(null, response))
            .catch(reason => callback(reason))
        );
    }
    
    // Do not verify
    else {
        decryptpromise = Promise.all([encryptpromise, privatepromise])
        .then(
        	([message, privatekey]) => {
                const options = {
                    message: message,
                    decryptionKeys: privatekey,
                    format: properties.base64 ? "binary" : "utf8",
                    expectSigned: false
                };
                return openpgp.decrypt(options);
            }
        );
    }
    
    // Shared ending
	const messagepromise = decryptpromise
    .then(bundle => { return bundle.data; })
    .catch(reason => { return null; });
    const filepromise = decryptpromise
    .then(bundle => { return bundle.filename; })
    .catch(reason => { return null; });
    
    // Extract from chain
    const message = context.async(
        callback => messagepromise
        .then(response => callback(null, response))
        .catch(reason => callback(reason))
    );
    const filename = context.async(
        callback => filepromise
        .then(response => callback(null, response))
        .catch(reason => callback(reason))
    );
    
	// Send
	return {
        message: properties.base64 ? Buffer.from(message).toString("base64") : message,
        verified: verified,
        filename: filename
    };
}
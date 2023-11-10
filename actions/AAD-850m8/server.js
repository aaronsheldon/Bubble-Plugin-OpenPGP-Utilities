async function(properties, context) {
    
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
        (key) => {
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
        )
        .then(
        	(bundle) => {
            	return {
                	message: properties.base64 ? Buffer.from(bundle.data).toString("base64") : bundle.data,
                    filename: bundle.filename,
                    verified: bundle.signatures[0].verified
                };
            }
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
        )
        .then(
        	(bundle) => {
            	return {
                	message: properties.base64 ? Buffer.from(bundle.data).toString("base64") : bundle.data,
                    filename: bundle.filename,
                    verified: null
                };
            }
        );
    }
    
	// Send
	return decryptpromise;
}
function(properties, context) {
    
    // Instantiate library
	const openpgp = require('openpgp');
    
    // Bail on missing
    if (properties.message == null) {
        return { verified: null };
    }
    if (properties.signature == null) {
        return { verified: null };
    }
    if (properties.verificationkey == null) {
        return { verified: null };
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
    const keypromise = openpgp.readKey({ armoredKey: properties.verificationkey });
    const signaturepromise = openpgp.readSignature({ armoredSignature: properties.signature });
    const verifypromise = Promise.all([messagepromise, keypromise, signaturepromise])
    .then(
        ([message, key, signature]) => {
            const options = {
            	format: properties.base64 ? "binary" : "utf8",
            	expectSigned: false,
				verificationKeys: key,
                signature: signature,
            	message: message
            };
            if (properties.date != null) { options.date = properties.date; }
            return openpgp.verify(options);
        }
    )
    .then(bundle => { return bundle.signatures[0].verified; })
    .catch(reason => { return null; });
    
    // Extract from chain
    const verified = context.async(
        callback => verifypromise
        .then(response => callback(null, response))
        .catch(reason => callback(reason))
    );
    
	// Send
	return { verified: verified };
}
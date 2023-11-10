async function(properties, context) {
    
    // Instantiate library
	const openpgp = require('openpgp');

	// Bail on missing
    if (properties.oldpassphrase == null) {
        return { lockedkey: null };
    }
    if (properties.newpassphrase == null) {
        return { lockedkey: null };
    }
    if (properties.lockedkey == null) {
        return { lockedkey: null };
    }

	// Chain promises
	const lockpromise = openpgp.readPrivateKey({ armoredKey: properties.lockedkey })
    .then(
        privatekey => {
            const options = {
                privateKey: privatekey,
                passphrase: properties.oldpassphrase
            };
            return openpgp.decryptKey(options);
        }
    )
    .then(
    	privatekey => { 
            const options = {
                passphrase: properties.newpassphrase,
                privateKey: privatekey
            };
            return openpgp.encryptKey(options);
        }
    )
    .then((key) => { return { lockedkey: key }; });
    
	// Send
	return lockpromise;
}
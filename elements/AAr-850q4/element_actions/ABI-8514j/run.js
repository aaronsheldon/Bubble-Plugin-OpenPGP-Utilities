function(instance, properties, context) {
    
    // Do not recycle
    delete instance.data.unlockedkey;
    
    // Bail on missing
    if (instance.data.lockedkey == null) {
        instance.triggerEvent("actionfailed");
        return;
    }
    if (properties.passphrase == null) {
        instance.triggerEvent("actionfailed");
        return;
    }
    
    // Create unlock promise
    instance.data.unlockedkey = instance.data.lockedkey
    .then(
    	key => {
            const options = {
                privateKey: key,
                passphrase: properties.passphrase
            };
            return openpgp.decryptKey(options);
        }    
    );
    
    // Announce
    instance.triggerEvent("privatekeyunlocked");
}
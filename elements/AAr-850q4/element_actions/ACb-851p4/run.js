function(instance, properties, context) {
    
    // Do not recycle
    instance.publishState("privatekey", null);

    // Bail on missing
    if (instance.data.unlockedkey == null) {
        instance.triggerEvent("actionfailed");
        return;
    }
    if (properties.passphrase == null) {
        instance.triggerEvent("actionfailed");
        return;
    }
    
    // Lock private key
    instance.data.unlockedkey
    .then(
    	privatekey => { 
            const options = {
                passphrase: properties.passphrase,
                privateKey: privatekey
            };
            return openpgp.encryptKey(options);
        }
    )
    .then(
    	privatekey => {
            instance.publishState("privatekey", privatekey);
            
            // Announce
            instance.triggerEvent("privatekeylocked");
        }
    );
}
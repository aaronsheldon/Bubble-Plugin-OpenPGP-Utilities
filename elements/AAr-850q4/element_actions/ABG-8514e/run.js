function(instance, properties, context) {
    
    // Do not recycle
    delete instance.data.lockedkey;
    
    // Bail on missing
    if (properties.privatekey == null) {
        instance.triggerEvent("actionfailed");
        return;
    }
        
    // Create the private key promise
    instance.data.lockedkey = openpgp.readPrivateKey({ armoredKey: properties.privatekey });
    
    // Announce
    instance.triggerEvent("privatekeyread");
}
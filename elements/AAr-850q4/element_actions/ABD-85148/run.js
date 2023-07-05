function(instance, properties, context) {
    
    // Do not recycle
    delete instance.data.publickey;
    
    // Bail on missing
    if (properties.publickey == null) {
        instance.triggerEvent("actionfailed");
        return;
    }
        
    // Create the public key promise    
    instance.data.publickey = openpgp.readKey({ armoredKey: properties.publickey });
    
    // Announce
    instance.triggerEvent("publickeyread");
}
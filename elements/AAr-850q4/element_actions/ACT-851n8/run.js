function(instance, properties, context) {

	// Do not recycle
    delete instance.data.signature;

    // Bail on missing
    if (properties.signature == null) {
        instance.triggerEvent("actionfailed");
        return;
    }
        
    // Create the signature promise     
    instance.data.signature = openpgp.readSignature({ armoredSignature: properties.signature });
    
    // Announce
    instance.triggerEvent("signatureread");
}
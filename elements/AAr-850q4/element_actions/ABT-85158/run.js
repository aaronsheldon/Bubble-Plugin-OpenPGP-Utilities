function(instance, properties, context) {
    
    // Do not recycle
    delete instance.data.lockedmessage;
    
    // File
    if (instance.data.loadedbytes != null) {
        instance.data.lockedmessage = instance.data.loadedbytes
        .then(
        	filebytes => {
                return openpgp.readMessage({ binaryMessage: filebytes });
            }
        );
    }
    
    // Message
    else if (properties.message != null) {
		instance.data.lockedmessage = openpgp.readMessage({ armoredMessage: properties.message });
    }
    
    // Bail on missing
    else {
        instance.triggerEvent("actionfailed");
        return;
    }

    // Announce
    instance.triggerEvent("messageread");
}
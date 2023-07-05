function(instance, properties, context) {
    
    // Do not recycle
    delete instance.data.unlockedmessage;
    
    // File
    if (instance.data.loadedbytes != null) {
        instance.data.unlockedmessage = instance.data.loadedbytes
        .then(
        	filebytes => {
                const options = {
                    binary: filebytes,
                    format: "binary"
                };
                if (properties.filename != null) { options.filename = properties.filename; }
                return openpgp.createMessage(options);
            }        
        ); 
    }
    
    // Message
    else if (properties.message != null) {
        const options = {
            text: properties.message,
            format: "utf8"
        }
        if (properties.filename != null) { options.filename = properties.filename; }
        instance.data.unlockedmessage = openpgp.createMessage(options);
    }
    
    // Bail on missing
    else {
        instance.triggerEvent("actionfailed");
        return;
    }
    
    // Announce
    instance.triggerEvent("messagecreated");
}
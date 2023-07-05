function(instance, properties, context) {
    
    // Do not recycle
    instance.publishState("message", null);
    
    // Bail on missing
    if (instance.data.unlockedkey == null) {
        instance.triggerEvent("actionfailed");
        return;
    }
    if (instance.data.unlockedmessage == null) {
        instance.triggerEvent("actionfailed");
        return;
    }
    
    // Sign
    Promise.all([instance.data.unlockedmessage, instance.data.unlockedkey])
    .then(
        ([message, key]) => {
            const options = {
                message: message,
                signingKeys: key,
                format: "armored",
                detached: true
            };
            if (properties.date != null) { options.date = properties.date; }
            return openpgp.sign(options);
        }
    )
    .then(
    	signed => {
            instance.publishState("message", signed);
            
            // Announce
            instance.triggerEvent("messagesigned");
        }
    )
    .catch(reason => { instance.triggerEvent("actionfailed"); });
}
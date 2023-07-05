function(instance, properties, context) {
    
    // Do not recycle
    instance.publishState("verified", null);
    
    // Bail on missing
    if (instance.data.publickey == null) {
        instance.triggerEvent("messageverification");
        return;
    }
    if (instance.data.unlockedmessage == null) {
        instance.triggerEvent("messageverification");
        return;
    }
    if (instance.data.signature == null) {
        instance.triggerEvent("messageverification");
        return;
    }
    
    // Verification
    Promise.all([instance.data.unlockedmessage, instance.data.publickey, instance.data.signature])
    .then(
        ([message, key, signature]) => {
            const options = {
            	format: (instance.data.loadedbytes == null) ? "utf8" : "binary",
            	expectSigned: false,
				verificationKeys: key,
            	message: message,
                signature: signature
            };
            if (properties.date != null) { options.date = properties.date; }
            return openpgp.verify(options);
        }
    )
    .then(
        bundle => {
            return bundle.signatures[0].verified;                
        }
    )
    .then(
        verified => {
            instance.publishState("verified", verified);
            
            // Announce
            instance.triggerEvent("messageverification");           
        }
    )
    .catch(reason => { instance.triggerEvent("actionfailed"); });
}
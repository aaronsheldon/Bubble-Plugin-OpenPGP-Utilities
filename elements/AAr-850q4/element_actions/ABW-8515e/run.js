function(instance, properties, context) {
    
    // Do not recycle
    instance.publishState("message", null);

    // Bail on missing
    if (instance.data.publickey == null) {
        instance.triggerEvent("actionfailed");
        return;
    }
    if (instance.data.unlockedmessage == null) {
        instance.triggerEvent("actionfailed");
        return;
    }
    
    // No signing
    if (instance.data.unlockedkey == null) {
        Promise.all([instance.data.unlockedmessage, instance.data.publickey])
        .then(
            ([message, publickey]) => {
                const options = {
                    message: message,
                    encryptionKeys: publickey,
                    format: (instance.data.loadedbytes == null) ? "armored" : "binary"
                };
                return openpgp.encrypt(options);
            }
        )
        .then(
        	encrypted => {
                
                // Message
                if (instance.data.loadedbytes == null) {
                	instance.publishState("message", encrypted);
                }
                
                // File
                else {
                    const fileblob = new Blob([encrypted]);
                    const fileurl = URL.createObjectURL(fileblob);
                	const alink = document.createElement("a");
                    alink.download = "";
                    alink.href = fileurl;
                    instance.canvas.appendChild(alink);
                    alink.click();
                    alink.remove();
                    URL.revokeObjectURL(fileurl);                    
                }
                
                // Announce
                instance.triggerEvent("messageencrypted");
            }
        )
        .catch(reason => { instance.triggerEvent("actionfailed"); });
    }

    // Sign
    else {
        Promise.all([instance.data.unlockedmessage, instance.data.publickey, instance.data.unlockedkey])
        .then(
            ([message, publickey, privatekey]) => {
                const options = {
                    message: message,
                    encryptionKeys: publickey,
                    signingkKeys: privatekey,
                    format: (instance.data.loadedbytes == null) ? "armored" : "binary"
                };
                if (properties.date != null) { options.date = properties.date; }
                return openpgp.encrypt(options);
            }
        )
        .then(
        	encrypted => {
                
                // Message
                if (instance.data.loadedbytes == null) {
                	instance.publishState("message", encrypted);
                }
                
                // File
                else {
                    const fileblob = new Blob([encrypted]);
                    const fileurl = URL.createObjectURL(fileblob);
                	const alink = document.createElement("a");
                    alink.download = "";
                    alink.href = fileurl;
                    instance.canvas.appendChild(alink);
                    alink.click();
                    alink.remove();
                    URL.revokeObjectURL(fileurl);
                }
                
                // Announce
                instance.triggerEvent("messageencrypted");
            }
        )
        .catch(reason => { instance.triggerEvent("actionfailed"); });
    }
}
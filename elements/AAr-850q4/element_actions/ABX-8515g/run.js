function(instance, properties, context) {
    
    // Do not recycle
    instance.publishState("message", null);
    instance.publishState("verified", null);
    instance.publishState("filename", null);

    // Bail on missing
    if (instance.data.unlockedkey == null) {
        instance.triggerEvent("actionfailed");
        return;
    }
    if (instance.data.lockedmessage == null) {
        instance.triggerEvent("actionfailed");
        return;
    }

	// No verification
    if (instance.data.publickey == null) {
        Promise.all([instance.data.lockedmessage, instance.data.unlockedkey])
        .then(
        	([message, privatekey]) => {
                const options = {
                    message: message,
                    decryptionKeys: privatekey,
                    format: (instance.data.loadedbytes == null) ? "utf8" : "binary",
                    expectSigned: false
                };
                return openpgp.decrypt(options);
            }
        )
        .then(
        	bundle => {
                
                // Message
                if (instance.data.loadedbytes == null) {
                	instance.publishState("message", bundle.data);
                }
                
                // File
                else {
                    const fileblob = new Blob([bundle.data]);
                    const fileurl = URL.createObjectURL(fileblob);
                	const alink = document.createElement("a");
                    alink.download = bundle.filename;
                    alink.href = fileurl;
                    instance.canvas.appendChild(alink);
                    alink.click();
                    alink.remove();
                    URL.revokeObjectURL(fileurl);     
                }
                instance.publishState("filename", bundle.filename);
                
                // Announce
                instance.triggerEvent("messagedecrypted");
            }
        )
        .catch(reason => { instance.triggerEvent("actionfailed"); });
    }
    
    // Verify
    else {
        Promise.all([instance.data.lockedmessage, instance.data.unlockedkey, instance.data.publickey])
        .then(
        	([message, privatekey, publickey]) => {
                const options = {
                    message: message,
                    decryptionKeys: privatekey,
                    format: (instance.data.loadedbytes == null) ? "utf8" : "binary",
                    expectSigned: false,
                    verificationKeys: publickey
                };
                if (properties.date != null) { options.date = properties.date; }
                return openpgp.decrypt(options);
            }
        )
        .then(
        	bundle => {
                
                // Message
                if (instance.data.loadedbytes == null) {
                	instance.publishState("message", bundle.data);
                }
                
                // File
                else {
                    const fileblob = new Blob([bundle.data]);
                    const fileurl = URL.createObjectURL(fileblob);
                	const alink = document.createElement("a");
                    alink.download = bundle.filename;
                    alink.href = fileurl;
                    instance.canvas.appendChild(alink);
                    alink.click();
                    alink.remove();
                    URL.revokeObjectURL(fileurl);
                }
                instance.publishState("filename", bundle.filename);
                return bundle.signatures[0].verified;                
            }
        )
        .then(
        	verified => {
                instance.publishState("verified", verified);
                
                // Announce
                instance.triggerEvent("messagedecrypted");                
            }
        )
        .catch(reason => { instance.triggerEvent("actionfailed"); });
    }
}
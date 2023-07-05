function(instance, properties, context) {
    
    // Do not recycle
    instance.publishState("publickey", null);
    instance.publishState("privatekey", null);
    
    // Bail on missing
    if (properties.name == null) {
        instance.triggerEvent("actionfailed");
        return;
    }
    if (properties.email == null) {
        instance.triggerEvent("actionfailed");
        return;
    }
    if (properties.passphrase == null) {
        instance.triggerEvent("actionfailed");
        return;
    }

    // Load and prune
    const options = {
        userIDs: {
            name: properties.name,
            email: properties.email
        },
        type: "rsa",
        passphrase: properties.passphrase,
        rsaBits: 4096,
        format: "armored"
    }
    if (properties.date != null) { options.date = properties.date; }
    if (properties.expires != null) { options.keyExpirationTime = Math.max(0, properties.expires); }
    
    // Generate pair
    openpgp.generateKey(options)
    .then(
        pair => {
            instance.publishState("publickey", pair.publicKey);
            instance.publishState("privatekey", pair.privateKey);
            instance.triggerEvent("generated");
        }
    )
    .catch(reason => { instance.triggerEvent("actionfailed"); });
}
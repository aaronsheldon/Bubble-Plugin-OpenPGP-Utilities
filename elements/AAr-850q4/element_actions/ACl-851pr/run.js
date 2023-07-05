function(instance, properties, context) {
    
    // Reset promises
    delete instance.data.publickey;
    delete instance.data.lockedkey;
    delete instance.data.unlockedkey;
    delete instance.data.unlockedmessage;
    delete instance.data.lockedmessage;
    delete instance.data.loadedbytes;
    delete instance.data.signature;
    
    // Reset states
    instance.publishState("publickey", null);
    instance.publishState("privatekey", null);
    instance.publishState("message", null);
    instance.publishState("verified", null);
    instance.publishState("filename", null);
    
    // Announce
    instance.triggerEvent("storagecleared");
}
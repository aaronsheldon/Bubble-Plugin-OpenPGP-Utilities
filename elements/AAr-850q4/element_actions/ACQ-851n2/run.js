function(instance, properties, context) {
    
    // Do not recycle
    instance.publishState("filename", null);
    delete instance.data.loadedbytes;
    
	// File input
    const fileinput = document.createElement("input");
    fileinput.type = "file";
    fileinput.style.display = "none";

    // File handler
    fileinput.addEventListener(
        "change",
        e => { 
            instance.data.loadedbytes = new Promise(
                (resolve, reject) => {
                    const filereader = new FileReader();
                    filereader.addEventListener("load", (e) => { resolve(new Uint8Array(filereader.result)); });
                    filereader.addEventListener("error", (e) => { reject(new Error("File Read Error.")); });
                    filereader.addEventListener("abort", (e) => { reject(new Error("File Read Error.")); });
                    filereader.readAsArrayBuffer(fileinput.files[0]);
                }                
            );
            instance.publishState("filename", fileinput.files[0].name);
            
            // Announce
            instance.triggerEvent("fileselected");
        }
    );

    // Fire and forget
    instance.canvas.appendChild(fileinput);
    fileinput.click();
    fileinput.remove();
}
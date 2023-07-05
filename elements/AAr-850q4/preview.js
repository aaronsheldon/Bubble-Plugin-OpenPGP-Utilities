function(instance, properties) {
    
    // Do nothing except show the icon
    const poster = new Image(28, 28);
    poster.src = "https://dd7tel2830j4w.cloudfront.net/f1645044756401x495948863728440800/icon_openpgpjs.png";
    poster.style.position = "absolute";
    poster.style.top = "2px";
    poster.style.left = "2px";
    instance.canvas.appendChild(poster);
    instance.canvas.style.overflow = "hidden";
}
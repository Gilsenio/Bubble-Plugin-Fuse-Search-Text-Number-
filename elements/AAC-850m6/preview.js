function(instance, properties) {
   
    var imgElement = document.createElement("IMG");
    imgElement.setAttribute("src", "https://dd7tel2830j4w.cloudfront.net/f1642906557732x106489742038385900/preview_search.fw.png");
    imgElement.style.width = properties.bubble.width();
    
    instance.canvas[0].appendChild(imgElement);


}
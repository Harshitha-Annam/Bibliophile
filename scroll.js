function scrolling(id){
    element = document.getElementById(id);
    element.scrollIntoView({behaviour:'smooth', block:'start', inline:'nearest'});
}


const observer = new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
        if(entry.isIntersecting){
            console.log(entry.target.id);
        }
    })
},{
    root:null,
    threshold:1.0
})

observer.observe(document.getElementById("sec1"));
observer.observe(document.getElementById("sec2"));
observer.observe(document.getElementById("sec3"));
observer.observe(document.getElementById("sec4"));
observer.observe(document.getElementById("sec5"));



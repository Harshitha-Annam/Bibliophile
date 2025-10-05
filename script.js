let fileInput = document.getElementById('file-input');
let canvas = document.getElementById('file-render');
let context = canvas.getContext('2d');
let rangeInput = document.getElementById('page-range');
var pdfDoc = null;
var pageNumber = 1;
var scale = 1;
var totalPages = 0;
var { pdfjsLib } = globalThis;
var viewport;
let fingerprint;
let noteText = document.getElementById('note-textarea');
let noteBtn = document.getElementById('save-note-btn');
let delBtns = [];
let fileContainer = document.getElementById('file-render-container');
let showNotesBtn = document.getElementById('show-notes-btn');
let threshold =  0.9;
let renderingComplete = false;
let allowObserverUpdates = true;
let pageRendered = false;
if(window.innerWidth<=400)
{
    threshold=0.8;
}
showNotesBtn?.addEventListener('click', function (){
   
    document.querySelector('.side-bar').classList.toggle('open');
    // document.querySelector('.side-bar').classList.toggle('close');

})

const observer = new IntersectionObserver((entries)=>{
    if(!renderingComplete || !allowObserverUpdates) return;
    entries.forEach((entry)=>{
        if(entry.isIntersecting){
            // alert(entry.target.id);
            pageNumber = parseInt(entry.target.id);
            getCurrentPage();
            rangeInput.value=pageNumber;
            renderSpecificPage();
            updateLastVisited(fingerprint, entry.target.id);

        }
    })
},{
    root:null,
    threshold:threshold,
})



function onPrevPage() {
    if (pageNumber <= 1) {
      return;
    }
    pageNumber--;
    rangeInput.value=pageNumber;
    // renderPage(pageNumber);
    scrolling(pageNumber);
    // getCurrentPage();
    
  }




function onNextPage() {
    if (pageNumber >= totalPages) {
      return;
    }
    pageNumber++;
    rangeInput.value = pageNumber;
    // renderPage(pageNumber);
    scrolling(pageNumber)
    // getCurrentPage();
    
  }



//function for rendering a page

function renderSpecificPage()
{
    const pageRangeInput = rangeInput.value;
    console.log(pageRangeInput);
    pageNumber = parseInt(pageRangeInput);
    console.log(pageNumber);
    // renderPage(pageNumber);
    scrolling(pageNumber);
    // getCurrentPage();

    
}


function updateLastVisited(fingerprint, pageNum)
{
    let data = JSON.parse(localStorage.getItem('bookReader')) || [];
    const newDoc = {
                'uId':fingerprint,
                'lastVisited':pageNum,
                'bookmarks':[],
                'notes' : [],
            };
            // console.log(newDoc);
    let existingDoc = data.find(doc => doc.uId === fingerprint);

    if(existingDoc)
    {
        existingDoc.lastVisited = pageNum;    
        console.log(existingDoc.lastVisited) ;
    }
    else{
        data.push(newDoc);
        console.log(newDoc.lastVisited);
    }
    localStorage.setItem('bookReader', JSON.stringify(data));
}

function getLastVisitedPage(fingerprint){
    let data = JSON.parse(localStorage.getItem('bookReader')) || [];
    let found = data.find(doc => doc.uId === fingerprint);
    if(data.length > 0 && found !== undefined )
    {
        
        // console.log(found);
        return found.lastVisited || 1;
    }
    else return 1;
}

function addBookmark()
{
    let data = JSON.parse(localStorage.getItem('bookReader')) || [];
    // console.log(data);
    let existingDoc = data.find(doc => doc.uId === fingerprint);
    // console.log(existingDoc);
    // console.log(existingDoc.bookmarks.includes(pageNumber));
    if(!existingDoc.bookmarks.includes(pageNumber))
    {
    existingDoc.bookmarks.push(pageNumber);
    console.log('bookmark added');
    document.getElementById(`bookmark`).textContent = '★';
    // document.getElementById(`bookmark`).style.backgroundColor = 'rgb(240, 240, 31)';
    // document.getElementById(`bookmark`).style.color = 'black';

    }
    else{
        const idx = existingDoc.bookmarks.indexOf(pageNumber);
        existingDoc.bookmarks.splice(idx,1);
        document.getElementById(`bookmark`).textContent = '☆';
        // document.getElementById(`bookmark`).style.backgroundColor = 'transparent';
        // document.getElementById(`bookmark`).style.color = 'rgb(240, 240, 31)';


    }
    
    localStorage.setItem('bookReader', JSON.stringify(data));
    showBookmarks();
}
function checkIfBookmarked(){
    let data = JSON.parse(localStorage.getItem('bookReader')) || [];
    // console.log(data);
    let existingDoc = data.find(doc => doc.uId === fingerprint);
    // console.log(existingDoc);
    // console.log(existingDoc.bookmarks.includes(pageNumber));
    if(existingDoc.bookmarks.includes(pageNumber))
    {
    
    document.getElementById(`bookmark`).textContent = '★';
    // document.getElementById(`bookmark`).style.backgroundColor = 'rgb(240, 240, 31)';
    // document.getElementById(`bookmark`).style.color = 'black';

    }
    else{
        
        document.getElementById(`bookmark`).textContent = '☆';
        // document.getElementById(`bookmark`).style.backgroundColor = 'transparent';
        // document.getElementById(`bookmark`).style.color = 'rgb(240, 240, 31)';


    }
}

function showBookmarks(){
    let bookmarksList = document.getElementById('bookmarks-list');
    let data = JSON.parse(localStorage.getItem('bookReader')) || [];
    let existingDoc = data.find(doc => doc.uId === fingerprint);

    
        bookmarksList.innerHTML = '<option>Show Bookmarks</option>';
        existingDoc.bookmarks.map((bookmark, index) => {
            bookmarksList.innerHTML += `<option value = '${bookmark}'> page No: ${ bookmark}</option>`;
        });
   
}

function showBookmarkedPage(){
    // console.log(document.getElementById('bookmarks-list'));
    if(document.getElementById('bookmarks-list')?.value)
    {
    const pageNum = document.getElementById('bookmarks-list')?.value;
    // console.log(pageNum);
    pageNumber = pageNum;
    allowObserverUpdates = false;
    scrolling(parseInt(pageNumber));
    rangeInput.value = pageNumber;
    // document.getElementById('page_num').textContent = pageNumber;
    document.getElementById('bookmark').textContent = '★';
    // document.getElementById(`bookmark`).style.backgroundColor = 'rgb(240, 240, 31)';
    // document.getElementById(`bookmark`).style.color = 'black';


    // getCurrentPage();
    setTimeout(() => {
            allowObserverUpdates = true;
        }, 800); 
    }
}


function renderPage(num, canvaPage) {
    

    if(!pdfDoc) {
        console.log('pdf not loaded yet')
    }
    else{
    
    pdfDoc.getPage(num).then(function(page) {
      let viewport = page.getViewport({scale: scale});
      canvaPage.height = viewport?.height;
      canvaPage.width = viewport?.width;

      // Render PDF page into canvas context
      var renderContext = {
        canvasContext: canvaPage.getContext('2d'),
        viewport: viewport
      };
      page.render(renderContext).promise.then(function() {
        // updateLastVisited(fingerprint, num); 
      });
    });

    // Update page counters
    // document.getElementById('page_num').textContent = num;
    // getCurrentPage();
    // showNotes();
    // console.log(pageNumber);
    }
    getCurrentPage();
    showNotes();
    // console.log(pageNumber);
  }

function getCurrentPage()
{
    document.getElementById('page_num').textContent = pageNumber;
    updateLastVisited(fingerprint, pageNumber);
    checkIfBookmarked();
    showNotes();
    
}


function createNote(text)
{
    let data = JSON.parse(localStorage.getItem('bookReader')) || [];
    // console.log(data);
    let existingDoc = data.find(doc => doc.uId === fingerprint);
    // console.log(existingDoc.notes);
    let notes = existingDoc.notes;
    if(text.trim() != '')
    {
        notes.push({ 'page' : pageNumber, 'note':text});
        existingDoc.notes = notes;
        // console.log(existingDoc);
        noteText.value = '';
        localStorage.setItem('bookReader', JSON.stringify(data));
        showNotes();
    }
    
    delBtns = document.querySelectorAll('.del');
    
}

function showNotes(){
    let data = JSON.parse(localStorage.getItem('bookReader')) || [];
    // console.log(data);
    let existingDoc = data.find(doc => doc.uId === fingerprint);
    // console.log(existingDoc.notes);
    let notes = existingDoc?.notes || [];
    document.getElementById('notes-container').innerHTML='';
    notes?.map((el, index) => {
        if(el.page === pageNumber){
            const noteDiv = document.createElement('div');
            const span = document.createElement('span');
            span.textContent = el.note;
            noteDiv.appendChild(span);
            const btn = document.createElement('button');
            btn.id = index;
            btn.textContent = 'delete';
            noteDiv.appendChild(btn);
        document.getElementById('notes-container').appendChild(noteDiv);
        btn.addEventListener('click',(e)=> deleteNote(e))
        }
    });
}

function deleteNote(e){
    console.log(e);
    let data = JSON.parse(localStorage.getItem('bookReader')) || [];
    // console.log(data);
    let existingDoc = data.find(doc => doc.uId === fingerprint);
    console.log(existingDoc.notes);
    let notes = existingDoc.notes;
    notes.splice(parseInt(e.target.id), 1);
    existingDoc.notes = notes;
    console.log(existingDoc.notes);

    localStorage.setItem('bookReader', JSON.stringify(data));
    showNotes();


}

document.getElementById('prev').addEventListener('click', onPrevPage);
document.getElementById('next').addEventListener('click', onNextPage);
document.getElementById('page-range').addEventListener('change', () => {

    pageNumber = parseInt(rangeInput.value);
    allowObserverUpdates = false;
    scrolling(pageNumber);
    document.getElementById('page_num').textContent = pageNumber;

    // setTimeout(() => {
    //     allowObserverUpdates = true;
    // }, 200);
    getCurrentPage();
    
});
document.getElementById('bookmark').addEventListener('click',addBookmark);
document.getElementById('bookmarks-list').addEventListener('change', showBookmarkedPage);
noteBtn.addEventListener('click', () => {createNote(noteText.value)});
document.getElementById('note-textarea').addEventListener('keydown', function(event) {
    
    if(event.key === 'Enter')
    {
        createNote(noteText.value);
    }
} );


function renderPages(totalPages){
    fileContainer.innerHTML = '';
    // observer.disconnect();
    for(let i =1; i<= totalPages;i++)
    {
        const canvaPage = document.createElement('canvas');
        canvaPage.id = i;
        fileContainer.appendChild(canvaPage);
        renderPage(i, canvaPage);
        observer.observe(canvaPage);
        

    }

}



function scrolling(id){
    element = document.getElementById(id);
    element.scrollIntoView({behavior:'smooth',block:'nearest', inline:'start'});
    
}



fileInput.addEventListener('change', (event) => {
    observer.disconnect();
    let file = event.target.files[0];
    console.log(file);
    if(file === undefined) 
    {
        document.getElementById
        ('prev').disabled = true;
        document.getElementById('next').disabled = true;
        pdfDoc = null;
        context.clearRect(0,0,canvas.width, canvas.height);
        document.getElementById('page_count').textContent = 0;
        document.getElementById('page_num').textContent = 0;
        document.getElementById('bookmark').disabled=true;

    }
    // console.log(file);
    if(file && file.type === 'application/pdf')
    {
        
        const fileURL = URL.createObjectURL(file);
        // console.log(fileURL);        
        pdfjsLib.getDocument(fileURL).promise.then(function(pdf) {
            pdfDoc = pdf;
            document.getElementById('prev').disabled = false;
            document.getElementById('next').disabled = false;
            document.getElementById('bookmark').disabled=false;

            fingerprint = pdf.fingerprint;
            pageNumber = getLastVisitedPage(fingerprint); 
            console.log(pageNumber);
            // console.log(pdfDoc);
            rangeInput.setAttribute('max', pdf.numPages);
            rangeInput.value = pageNumber;
            totalPages = pdf.numPages;
            document.getElementById('page_count').textContent=totalPages;
            // renderPage(pageNumber);
            renderPages(totalPages);
            renderingComplete = true;
            setTimeout(()=>{
                scrolling(pageNumber);
                allowObserverUpdates = true;
            },200)
            
            showBookmarks();
  });
}   
});






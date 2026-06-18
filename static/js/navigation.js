// #region =====================================================
// SHOW PAGE
// =====================================================

let currentPage = 1;

function showPage(n){
    currentPage=n;
    document.querySelectorAll(".page").forEach(p=>p.style.display="none");
    document.getElementById("page"+n).style.display="flex";
    updateButtons();
}

function nextPage(){
    if(currentPage<3) showPage(currentPage+1);
}

function updateButtons(){
    document.getElementById("nextBtn").style.display =
        (currentPage===3)?"none":"block";

    document.getElementById("analyzeBtn").style.display =
        (currentPage===3)?"block":"none";
}

// #endregion
// ======================================
// REPORT SYSTEM
// ======================================

let currentReportSection = "nodes";

let reportSelections = {

    nodes: [],
    members: [],
    supports: [],
    loads: [],
    reactions: [],
    displacements: [],
    forces: [],
    sfd: [],
    bmd: [],
    deflection: []
};

// #region Report Navigation Function

// =============================

function showReportSection(section,btn){

    saveCurrentReportSelections();

    currentReportSection = section;

    document
        .querySelectorAll(".report-nav-btn")
        .forEach(b=>{
            b.classList.remove(
                "active-report-tab"
            );
        });

    btn.classList.add(
        "active-report-tab"
    );

    populateReportSelection();
}

function populateReportSelection(){

    let container =
        document.getElementById(
            "reportSelectionContent"
        );

    let title =
        document.getElementById(
            "reportSelectionTitle"
        );

    container.innerHTML = "";

    title.innerText =
        currentReportSection
            .toUpperCase();

    let items = [];

    switch(currentReportSection){

        case "nodes":

            items =
                Object.keys(
                    getNodes()
                );

            break;

        case "members":

            items =
                getMembers()
                .map(m=>m.name);

            break;

        case "supports":

            items =
                getSupports()
                .map(s=>s.node);

            break;

        case "loads":

            items =
                loadDatabase.map(
                    (_,i)=>
                    `Load ${i+1}`
                );

            break;

        case "reactions":

            if(window.analysisResults){

                items = getSupports()
            .map(s => `Node ${s.node}`);
            }

            break;

        case "displacements":

            if(window.analysisResults){

                items = Object.keys(
                    getNodes()
                );
            }

            break;

        case "forces":

            if(window.analysisResults){

                items =
                    window.memberLabels;
            }

            break;

        case "sfd":

        case "bmd":

        case "deflection":

            if(window.analysisResults){

                items =
                    window.memberLabels;
            }

            break;
    }

    items.forEach(item=>{

        let checked =

            reportSelections[currentReportSection]
                .includes(item);

        container.innerHTML += `

            <label class="report-item">

                <input
                    type="checkbox"
                    ${checked ? "checked" : ""}
                    value="${item}">

                ${item}

            </label>

        `;
    });
}

function toggleSelectAllReport(){

    const allSelected = areAllReportItemsSelected();

    if(allSelected){

        reportSelections = {

            nodes: [],
            members: [],
            supports: [],
            loads: [],
            reactions: [],
            displacements: [],
            forces: [],
            sfd: [],
            bmd: [],
            deflection: []

        };

    }else{

        reportSelections.nodes =
            Object.keys(getNodes());

        reportSelections.members =
            getMembers().map(m=>String(m.name));

        reportSelections.supports =
            getSupports().map(s=>String(s.node));

        reportSelections.loads =
            loadDatabase.map((_,i)=>`Load ${i+1}`);

        if(window.analysisResults){

            reportSelections.reactions =
                getSupports().map(s=>`Node ${s.node}`);

            reportSelections.displacements =
                Object.keys(getNodes());

            reportSelections.forces =
                window.memberLabels.map(String);

            reportSelections.sfd =
                window.memberLabels.map(String);

            reportSelections.bmd =
                window.memberLabels.map(String);

            reportSelections.deflection =
                window.memberLabels.map(String);
        }
    }

    populateReportSelection();

    updateGlobalSelectButton();
}

function updateGlobalSelectButton(){

    const btn = document.querySelector(
        ".report-select-nav-btn"
    );

    if(!btn) return;

    if(areAllReportItemsSelected()){

        btn.classList.add("active");

    }else{

        btn.classList.remove("active");
    }
}

function toggleCurrentSectionSelection(){

    let checks =
        document.querySelectorAll(
            "#reportSelectionContent input[type='checkbox']"
        );

    let allChecked =
        [...checks].every(c=>c.checked);

    checks.forEach(c=>{

        c.checked = !allChecked;

    });

    saveCurrentReportSelections();
}

function areAllReportItemsSelected(){

    const sections=[

        "nodes",
        "members",
        "supports",
        "loads",
        "reactions",
        "displacements",
        "forces",
        "sfd",
        "bmd",
        "deflection"

    ];

    for(const section of sections){

        if(reportSelections[section].length===0){

            return false;
        }
    }

    return true;
}

function saveCurrentReportSelections(){

    let checks =
        document.querySelectorAll(
            "#reportSelectionContent input[type='checkbox']"
        );

    reportSelections[currentReportSection] =
        [...checks]
        .filter(c => c.checked)
        .map(c => c.value);
}

// #endregion


// #region Report Preview Generation Function
// =============================

function generateReportPreview(){

    let totalSelected = Object.values(
        reportSelections
    ).reduce(
        (sum,arr)=>sum+arr.length,
        0
    );

    if(totalSelected===0){

        document.getElementById("reportPreview").innerHTML = `
            <div class="report-preview-placeholder">

                <div class="placeholder-icon">📄</div>

                <h3>Report Preview</h3>

                <p>
                    Select the desired report contents from the left panel and 
                    click <strong>Generate Preview</strong> to view the report.
                </p>

            </div>
        `;

        return;
    }

    saveCurrentReportSelections();

    let html = `

        <div class="report-preview">

            <h1>
                Structural Analysis Report
            </h1>

            <hr>

    `;

    // =====================================
    // NODES
    // =====================================

    if(reportSelections.nodes.length){

        html += `

        <div class="report-section">
            <h2>Nodes</h2>

            <table class="report-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>X</th>
                    <th>Y</th>
                </tr>
                </thead>
                <tbody>
        `;

        let nodes = getNodes();

        Object.entries(nodes).forEach(([id,coord])=>{

            if(
                !reportSelections.nodes.includes(id)
            ){
                return;
            }

            html += `
                <tr>
                    <td>${id}</td>
                    <td>${coord[0]}</td>
                    <td>${coord[1]}</td>
                </tr>
            `;
        });

        html += `              
                </tbody>
            </table>
        </div>
        `;
    }

    // =====================================
    // MEMBERS
    // =====================================

    if(reportSelections.members.length){

        html += `
        <div class="report-section">
            <h2>Members</h2>

            <table class="report-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Start</th>
                    <th>End</th>
                </tr>
                </thead>
                <tbody>
        `;

        getMembers().forEach(member=>{

            if(
                !reportSelections.members.includes(
                    String(member.name)
                )
            ){
                return;
            }

            html += `
                <tr>
                    <td>${member.name}</td>
                    <td>${member.start}</td>
                    <td>${member.end}</td>
                </tr>
            `;
        });

        html += `              
                </tbody>
            </table>
        </div>
        `;
    }

    // =====================================
    // SUPPORTS
    // =====================================

    if(reportSelections.supports.length){

        html += `
        <div class="report-section">
            <h2>Supports</h2>

            <table class="report-table">
                <thead>
                <tr>
                    <th>Node</th>
                    <th>Ux</th>
                    <th>Uy</th>
                    <th>Rz</th>
                </tr>
                </thead>
                <tbody>
        `;

        getSupports().forEach(s=>{

            if(
                !reportSelections.supports.includes(
                    String(s.node)
                )
            ){
                return;
            }

            html += `
                <tr>
                    <td>${s.node}</td>
                    <td>${s.ux ? "restrained" : ""}</td>
                    <td>${s.uy ? "restrained" : ""}</td>
                    <td>${s.rz ? "restrained" : ""}</td>
                </tr>
            `;
        });

        html += `              
                </tbody>
            </table>
        </div>
        `;
    }
    
    // =====================================
    // LOADS
    // =====================================

    if(reportSelections.loads.length){

        html += `
        <div class="report-section">

            <h2>Loads</h2>

            <table class="report-table">
                <thead>
                <tr>
                    <th>No.</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Assignment</th>
                </tr>
                </thead>
                <tbody>
        `;

        loadDatabase.forEach((load,i)=>{

            let label = `Load ${i+1}`;

            if(
                !reportSelections.loads.includes(label)
            ){
                return;
            }

            let assignment =
                load.category==="nodal"
                ?
                load.assignedNodes.join(", ")
                :
                load.assignedMembers.join(", ");

            html += `
                <tr>

                    <td>${i+1}</td>

                    <td>${load.category}</td>

                    <td>${load.type}</td>

                    <td>

                        ${load.direction || ""}

                        ${load.value1}

                        ${load.value2 ? " → "+load.value2 : ""}

                    </td>

                    <td>${assignment}</td>

                </tr>
            `;
        });

        html += `              
                </tbody>
            </table>
        </div>
        `;
    }

    // =====================================
    // REACTIONS
    // =====================================

    if(
        window.analysisResults &&
        reportSelections.reactions.length
    ){

        html += `
        <div class="report-section">
            <h2>Reactions</h2>

            <table class="report-table">
                <thead>
                <tr>
                    <th>Node</th>
                    <th>Fx</th>
                    <th>Fy</th>
                    <th>Mz</th>
                </tr>
                </thead>
                <tbody>
        `;

        let R = window.analysisResults.reactions;

        for(let i=0;i<R.length/3;i++){

            let nodeName = String(window.nodeLabels[i]);

            if(
                !reportSelections.reactions.includes(
                    "Node " + nodeName
                )
            ){
                continue;
            }

            let fx = R[3*i];
            let fy = R[3*i+1];
            let mz = R[3*i+2];

            html += `
                <tr>

                    <td>${nodeName}</td>

                    <td>${fx.toFixed(3)}</td>

                    <td>${fy.toFixed(3)}</td>

                    <td>${mz.toFixed(3)}</td>

                </tr>
            `;
        }

        html += `              
                </tbody>
            </table>
        </div>
        `;
    }
 
    // =====================================
    // DISPLACEMENTS
    // =====================================
    if(
        window.analysisResults &&
        reportSelections.displacements.length
    ){

        html += `
        <div class="report-section">
            <h2>Displacements</h2>

            <table class="report-table">
                <thead>
                <tr>
                    <th>Node</th>
                    <th>u</th>
                    <th>v</th>
                    <th>θ</th>
                </tr>
                </thead>
                <tbody>
        `;

        let D =
            window.analysisResults.displacements;

        for(let i=0;i<D.length/3;i++){

            let nodeName =
                String(
                    window.nodeLabels[i]
                );

            if(
                !reportSelections.displacements
                .includes(nodeName)
            ){
                continue;
            }

            html += `
                <tr>

                    <td>${nodeName}</td>

                    <td>${D[3*i].toFixed(5)}</td>

                    <td>${D[3*i+1].toFixed(5)}</td>

                    <td>${D[3*i+2].toFixed(5)}</td>

                </tr>
            `;
        }

        html += `              
                </tbody>
            </table>
        </div>
        `;
    }


    // =====================================
    // MEMBER FORCES
    // =====================================
    if(
        window.analysisResults &&
        reportSelections.forces.length
    ){

        html += `
        <div class="report-section">
            <h2>Member Forces</h2>

            <table class="report-table">
                <thead>
                <tr>
                    <th>Member</th>
                    <th>Fx</th>
                    <th>Fy</th>
                    <th>Mz</th>
                </tr>
                </thead>
                <tbody>
        `;

        window.analysisResults.member_forces.forEach((m,i)=>{

            let memberName =
                String(window.memberLabels[i]);

            if(
                !reportSelections.forces.includes(
                    memberName
                )
            ){
                return;
            }

            html += `
                <tr>

                    <td>${memberName}</td>

                    <td>${m[0].toFixed(3)}</td>

                    <td>${m[1].toFixed(3)}</td>

                    <td>${m[2].toFixed(3)}</td>

                </tr>
            `;
        });

        html += `              
                </tbody>
            </table>
        </div>
        `;
    }

    // =====================================
    // SFD
    // =====================================

    if(
        window.analysisResults &&
        reportSelections.sfd.length
    ){

        html += `
        <div class="report-section">
            <h2>Shear Force Summary</h2>

            <table class="report-table">
                <thead>
                <tr>
                    <th>Member</th>
                    <th>Max Shear</th>
                    <th>x @ Max</th>
                    <th>Min Shear</th>
                    <th>x @ Min</th>
                </tr>
                </thead>
                <tbody>

        `;

        window.analysisResults.sfd.forEach(d=>{

            if(
                !reportSelections.sfd.includes(
                    String(d.member)
                )
            ){
                return;
            }

            html += `
                <tr>

                    <td>${d.member}</td>

                    <td>${d.max_V.toFixed(3)}</td>

                    <td>${d.x_max_V.toFixed(3)}</td>

                    <td>${d.min_V.toFixed(3)}</td>

                    <td>${d.x_min_V.toFixed(3)}</td>

                </tr>
            `;
        });

        html += `              
                </tbody>
            </table>
        </div>
        `;
    }

    // =====================================
    // BMD
    // =====================================

    if(
        window.analysisResults &&
        reportSelections.bmd.length
    ){

        html += `
        <div class="report-section">
            <h2>Bending Moment Summary</h2>

            <table class="report-table">
                <thead>
                <tr>
                    <th>Member</th>
                    <th>Max Moment</th>
                    <th>x @ Max</th>
                    <th>Min Moment</th>
                    <th>x @ Min</th>
                </tr>
                </thead>
                <tbody>
        `;

        window.analysisResults.bmd.forEach(d=>{

            if(
                !reportSelections.bmd.includes(
                    String(d.member)
                )
            ){
                return;
            }

            html += `
                <tr>

                    <td>${d.member}</td>

                    <td>${d.max_M.toFixed(3)}</td>

                    <td>${d.x_max_M.toFixed(3)}</td>

                    <td>${d.min_M.toFixed(3)}</td>

                    <td>${d.x_min_M.toFixed(3)}</td>

                </tr>
            `;
        });

        html += `              
                </tbody>
            </table>
        </div>
        `;
    }

    // =====================================
    // DEFLECTION
    // =====================================

    if(
        window.analysisResults &&
        reportSelections.deflection.length
    ){

        html += `
        <div class="report-section">
            <h2>Deflection Summary</h2>

            <table class="report-table">
                <thead>
                <tr>
                    <th>Member</th>
                    <th>Max Deflection</th>
                    <th>x @ Max</th>
                    <th>Min Deflection</th>
                    <th>x @ Min</th>
                </tr>
                </thead>
                <tbody>
        `;

        window.analysisResults.deflection_shapes.forEach(d=>{

            if(
                !reportSelections.deflection.includes(
                    String(d.member)
                )
            ){
                return;
            }

            html += `
                <tr>

                    <td>${d.member}</td>

                    <td>${d.max_deflection.toExponential(3)}</td>

                    <td>${d.x_max_deflection.toFixed(3)}</td>

                    <td>${d.min_deflection.toExponential(3)}</td>

                    <td>${d.x_min_deflection.toFixed(3)}</td>

                </tr>
            `;
        });

        html += `              
                </tbody>
            </table>
        </div>
        `;
    }

    html += `
        </div>
    `;

    document.getElementById(
        "reportPreview"
    ).innerHTML = html;
}


// #endregion


function exportReportPDF(){

    saveCurrentReportSelections();

    generateReportPreview();

    const element = document.getElementById("reportPreview");

    const opt = {
        margin: 10,
        filename: "Structural_Analysis_Report.pdf",
        image: {
            type: "jpeg",
            quality: 1
        },
        html2canvas: {
            scale: 2,
            useCORS: true,
            scrollY: 0
        },
        jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait"
        },
        pagebreak: {
            mode: ["css", "legacy"]
        }
    };

    html2pdf().set(opt).from(element).save();
}
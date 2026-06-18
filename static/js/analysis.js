// #region =====================================================
// ANALYZE FRAME
// =====================================================

function analyzeFrame(){

    console.log("Analyzing...");



    // -------------------------------------------------
    // UI RESET
    // -------------------------------------------------

    document.getElementById(
        "resultPlaceholder"
    ).style.display = "none";

    document.getElementById(
        "loading"
    ).style.display = "block";



    // -------------------------------------------------
    // CREATE ANALYSIS DATA
    // -------------------------------------------------

    let data = {

        nodes:
            getNodes(),

        members:
            getMembers(),

        supports:
            getSupports(),

        loads:
            getLoads()

    };



    // -------------------------------------------------
    // SEND TO FLASK
    // -------------------------------------------------

    fetch("/analyze", {

        method : "POST",

        headers : {
            "Content-Type":"application/json"
        },

        body : JSON.stringify(data)
    })



    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    .then(res => res.json())

    .then(data => {

        // SHOW RESULTS LAYOUT
        document.getElementById(
            "resultPlaceholder"
        ).style.display = "none";

        document.querySelector(
            ".results-layout"
        ).style.display = "flex";



        console.log(
            "Response:",
            data
        );

        window.nodeLabels = data.node_labels;

        window.memberLabels = data.member_labels;

        window.analysisResults = data;

        window.currentDiagram = "structure";


        // Hide loading spinner
        document.getElementById(
            "loading"
        ).style.display = "none";



        // ---------------------------------------------
        // ERROR
        // ---------------------------------------------

        if(data.error){

            document.getElementById(
                "resultPlaceholder"
            ).style.display = "block";

            document.getElementById(
                "resultPlaceholder"
            ).innerHTML =

                `<p style="color:red;">
                    ${data.error}
                </p>`;

            return;
        }

        // ---------------------------------------------
        // DISPLACEMENTS
        // ---------------------------------------------

        document.getElementById(
            "displacementCard"
        ).innerHTML =

            formatDisplacements(
                data.displacements
            );



        // ---------------------------------------------
        // REACTIONS
        // ---------------------------------------------

        document.getElementById(
            "reactionCard"
        ).innerHTML =

            formatReactions(
                data.reactions
            );



        // ---------------------------------------------
        // MEMBER FORCES
        // ---------------------------------------------

        document.getElementById(
            "memberForceCard"
        ).innerHTML =

            formatMemberForces(
                data.member_forces
            );
        
        // =================================================
        // DIAGRAM TABLES
        // =================================================

        document.getElementById(
            "sfdTable"
        ).innerHTML =

            formatSFDTable(
                data.sfd
            );



        document.getElementById(
            "bmdTable"
        ).innerHTML =

            formatBMDTable(
                data.bmd
            );



        document.getElementById(
            "deflectionTable"
        ).innerHTML =

            formatDeflectionTable(
                data.deflection_shapes
            );
        
    })



    // -------------------------------------------------
    // SERVER ERROR
    // -------------------------------------------------

    .catch(err => {

        console.log(
            "Error:",
            err
        );

        document.getElementById(
            "loading"
        ).style.display = "none";

        document.getElementById(
            "resultPlaceholder"
        ).style.display = "block";

        document.getElementById(
            "resultPlaceholder"
        ).innerHTML =

            `<p style="color:red;">
                Server error
            </p>`;
    });
}

// #endregion




// #region =====================================================
// ANALYZE + SHOW RESULT PAGE
// =====================================================

function analyzeAndShow(){

    showPage(3);

    setTimeout(
        ()=> analyzeFrame(),
        50
    );
}

// #endregion




// #region =====================================================
// DISPLACEMENT TABLE
// =====================================================

function formatDisplacements(D){

    let html = `

        <table class="result-table">

            <tr>
                <th>Node</th>
                <th>u</th>
                <th>v</th>
                <th>θ</th>
            </tr>
    `;



    for(let i=0; i<D.length/3; i++){

        html += `

            <tr>

                <td>${window.nodeLabels[i]}</td>

                <td>
                    ${D[3*i].toFixed(5)}
                </td>

                <td>
                    ${D[3*i+1].toFixed(5)}
                </td>

                <td>
                    ${D[3*i+2].toFixed(5)}
                </td>

            </tr>
        `;
    }

    return html + "</table>";
}

// #endregion




// #region =====================================================
// REACTION TABLE
// =====================================================

function formatReactions(R){

    let html = `

        <table class="result-table">

            <tr>
                <th>Node</th>
                <th>Fx</th>
                <th>Fy</th>
                <th>Mz</th>
            </tr>
    `;



    for(let i=0; i<R.length/3; i++){

        let fx = R[3*i];

        let fy = R[3*i+1];

        let mz = R[3*i+2];



        // Skip near-zero rows
        if(
            Math.abs(fx)
            +
            Math.abs(fy)
            +
            Math.abs(mz)
            < 1e-6
        ){
            continue;
        }



        html += `

            <tr>

                <td>${window.nodeLabels[i]}</td>

                <td>
                    ${fx.toFixed(3)}
                </td>

                <td>
                    ${fy.toFixed(3)}
                </td>

                <td>
                    ${mz.toFixed(3)}
                </td>

            </tr>
        `;
    }

    return html + "</table>";
}

// #endregion




// #region =====================================================
// MEMBER FORCE TABLE
// =====================================================

function formatMemberForces(members){

    let html = `

        <table class="result-table">

            <tr>
                <th>Member</th>
                <th>Fx</th>
                <th>Fy</th>
                <th>Mz</th>
            </tr>
    `;



    members.forEach((m,i)=>{

        html += `

            <tr>

                <td>${window.memberLabels[i]}</td>

                <td>
                    ${m[0].toFixed(3)}
                </td>

                <td>
                    ${m[1].toFixed(3)}
                </td>

                <td>
                    ${m[2].toFixed(3)}
                </td>

            </tr>
        `;
    });

    return html + "</table>";
}

// #endregion

// #region =====================================================
// SFD TABLE
// =====================================================
function formatSFDTable(data){

    let html = `
        <table class="result-table">
            <tr>
                <th>Member</th>
                <th>Max Shear</th>
                <th>x @ Max</th>
                <th>Min Shear</th>
                <th>x @ Min</th>
            </tr>
    `;

    data.forEach(d=>{
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

    html += "</table>";
    return html;
}

// #endregion

// #region =====================================================
// BMD TABLE
// =====================================================
function formatBMDTable(data){
    let html = `
        <table class="result-table">
            <tr>
                <th>Member</th>
                <th>Max Moment</th>
                <th>x @ Max</th>
                <th>Min Moment</th>
                <th>x @ Min</th>
            </tr>
    `;

    data.forEach(d=>{
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

    html += "</table>";

    return html;
}

// #endregion

// #region =====================================================
// DEFLECTION TABLE
// =====================================================
function formatDeflectionTable(data){
    let html = `
        <table class="result-table">
            <tr>
                <th>Member</th>
                <th>Max Deflection</th>
                <th>x @ Max</th>
                <th>Min Deflection</th>
                <th>x @ Min</th>
            </tr>
    `;

    data.forEach(d=>{
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

    html += "</table>";

    return html;
}
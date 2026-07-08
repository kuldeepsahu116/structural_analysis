
// #region  NODE INPUT
// =====================================================

function addNode(id="", x="", y=""){

    let table = document.getElementById("nodesTable");

    let rowCount = table.rows.length - 1;

    // Default values
    if(id === "") id = rowCount;

    if(x === "") x = 0;

    if(y === "") y = 0;

    let row = table.insertRow();

    row.innerHTML = `
        <td>
            <input value="${id}" oninput="refreshView()">
        </td>

        <td>
            <input value="${x}" oninput="refreshView()">
        </td>

        <td>
            <input value="${y}" oninput="refreshView()">
        </td>

        <td>
            <button
                class="delete-btn"
                onclick="deleteRow(this)">
                X
            </button>
        </td>
    `;

    refreshView();
}

// #endregion

// #region MEMBER INPUT
// =====================================================

function addMember(
    id="",
    start="",
    end="",
    E="",
    A="",
    I=""
){

    let table = document.getElementById("membersTable");

    let rowCount = table.rows.length;

    // Default values
    if(id === "") id = rowCount;

    if(start === "") start = 0;

    if(end === "") end = 0;

    if(E === "") E = 1;

    if(A === "") A = 1;

    if(I === "") I = 1;

    let row = table.insertRow();

    row.innerHTML = `
        <td><input value="${id}" oninput="refreshView()"></td>

        <td><input value="${start}" oninput="refreshView()"></td>

        <td><input value="${end}" oninput="refreshView()"></td>

        <td><input value="${E}" oninput="refreshView()"></td>

        <td><input value="${A}" oninput="refreshView()"></td>

        <td><input value="${I}" oninput="refreshView()"></td>

        <td>
            <button
                class="delete-btn"
                onclick="deleteRow(this)">
                X
            </button>
        </td>
    `;

    refreshView();
}

// #endregion

// #region SUPPORT INPUT
// =====================================================

function addSupport(node="", ux=false, uy=false, rz=false){

    let table = document.getElementById("supportsTable");

    let row = table.insertRow();

    row.innerHTML = `

        <td>
            <input
                value="${node}"
                oninput="refreshView()">
        </td>

        <td>
            <input
                type="checkbox"
                ${ux ? "checked" : ""}
                onchange="refreshView()">
        </td>

        <td>
            <input
                type="checkbox"
                ${uy ? "checked" : ""}
                onchange="refreshView()">
        </td>

        <td>
            <input
                type="checkbox"
                ${rz ? "checked" : ""}
                onchange="refreshView()">
        </td>

        <td>
            <button
                class="delete-btn"
                onclick="deleteRow(this)">
                X
            </button>
        </td>
    `;

    refreshView();
}

// #endregion

// #region DELETE ROW
// =====================================================

function deleteRow(btn){

    btn.parentElement.parentElement.remove();

    refreshView();
}

// #endregion

// #region LOAD POPUP SYSTEM
// =====================================================

let loadDatabase = [];



// -----------------------------------------------------
// OPEN POPUP
// -----------------------------------------------------

function openLoadPopup(){

    document.getElementById(
        "loadPopup"
    ).style.display = "flex";

    updateLoadPopup();
}



// -----------------------------------------------------
// CLOSE POPUP
// -----------------------------------------------------

function closeLoadPopup(){

    document.getElementById(
        "loadPopup"
    ).style.display = "none";
}



// -----------------------------------------------------
// SAVE LOAD
// -----------------------------------------------------

function saveLoad(){

    let oldLoad = null;

        if(editingLoadIndex >= 0){

            oldLoad = loadDatabase[editingLoadIndex];
        }

    let load = {

        category:
            document.getElementById(
                "loadCategory"
            ).value,

        type:
            document.getElementById(
                "loadType"
            ).value,

        direction:
            document.getElementById(
                "loadDirection"
            ).value,

        value1:
            +document.getElementById(
                "loadValue1"
            ).value,

        value2:
            +document.getElementById(
                "loadValue2"
            ).value,

        a:
            +document.getElementById(
                "loadA"
            ).value,

        b:
            +document.getElementById(
                "loadB"
            ).value,


        // ---------------------------------
        // ASSIGNMENT
        // ---------------------------------

        assignedNodes :
            oldLoad
            ?
            [...oldLoad.assignedNodes]
            :
            [],

        assignedMembers :
            oldLoad
            ?
            [...oldLoad.assignedMembers]
            :
            []
    };



    if(editingLoadIndex >= 0){
        loadDatabase[editingLoadIndex] = load;
        editingLoadIndex = -1;
    }

    else{
        loadDatabase.push(load);
    }

    renderLoadCards();

    closeLoadPopup();

    refreshView();
}



// -----------------------------------------------------
// RENDER LOAD CARDS
// -----------------------------------------------------

function renderLoadCards(){

    let container =
        document.getElementById(
            "loadCardContainer"
        );

    container.innerHTML = "";



    loadDatabase.forEach((load,index)=>{

        // ---------------------------------------------
        // CLONE TEMPLATE
        // ---------------------------------------------

        let template =
            document.getElementById(
                "loadCardTemplate"
            );

        let card =
            template.firstElementChild.cloneNode(true);



        // ---------------------------------------------
        // DESCRIPTION
        // ---------------------------------------------

        let description = "";



        if(load.category === "nodal"){

            if(load.direction === "X"){

                description =
                    `Horizontal Force = ${load.value1}`;
            }

            else if(load.direction === "Y"){

                description =
                    `Vertical Force = ${load.value1}`;
            }

            else if(load.direction === "M"){

                description =
                    `Moment = ${load.value1}`;
            }
        }

        else{

            if(load.type === "point"){

                description =
                    `Point Load = ${load.value1}
                     @ a = ${load.a}`;
            }

            else if(load.type === "moment"){

                description =
                    `Moment = ${load.value1}
                     @ a = ${load.a}`;
            }

            else if(load.type === "udl"){

                description =
                    `UDL = ${load.value1}`;
            }

            else if(load.type === "partial_udl"){

                description =
                    `Partial UDL = ${load.value1}
                     from ${load.a} to ${load.b}`;
            }

            else if(load.type === "trapezoidal"){

                description =
                    `Trapezoidal = ${load.value1}
                     → ${load.value2}`;
            }
        }



        // ---------------------------------------------
        // ASSIGNMENT
        // ---------------------------------------------

        let assignment = "";

        if(load.category === "nodal"){
            
            assignment =
                `Nodes:
                ${load.assignedNodes.join(", ")}`;
        }

        else{

            assignment =
                `Members:
                ${load.assignedMembers.join(", ")}`;
        }



        // ---------------------------------------------
        // FILL CONTENT
        // ---------------------------------------------

        card.querySelector(".load-title")
            .innerText =

            `${load.category.toUpperCase()}
             - ${load.type.toUpperCase()}`;



        card.querySelector(".load-description")
            .innerText = description;



        card.querySelector(".load-assignment")
            .innerText = assignment;

        let assignmentInput = card.querySelector(".load-assignment-input");

        assignmentInput.value =
            load.category === "nodal"
            ?
            load.assignedNodes.join(", ")
            :
            load.assignedMembers.join(", ");

        let assignBtn = card.querySelector(".assign-load-btn");

        assignBtn.disabled = true;

        assignmentInput.addEventListener(
            "input",
            ()=>{
                let current =
                    load.category === "nodal"
                    ?
                    load.assignedNodes.join(", ")
                    :
                    load.assignedMembers.join(", ");

                assignBtn.disabled =
                    assignmentInput.value.trim()
                    ===
                    current.trim();
            }
        );

        card.querySelector(".assign-load-btn")
        .onclick = () => assignLoad(index);



        // ---------------------------------------------
        // BUTTONS
        // ---------------------------------------------

        card.querySelector(".edit-load-btn")
            .onclick = () => editLoad(index);



        card.querySelector(".delete-btn")
            .onclick = () => deleteLoad(index);



        // ---------------------------------------------
        // ADD CARD
        // ---------------------------------------------

        container.appendChild(card);
    });
}

// #region =====================================================
// DYNAMIC LOAD POPUP
// =====================================================

function updateLoadPopup(){

    let category =
        document.getElementById(
            "loadCategory"
        ).value;

    let typeSelect =
        document.getElementById(
            "loadType"
        );



    // ---------------------------------------------
    // BUILD TYPE OPTIONS
    // ---------------------------------------------

    if(category === "nodal"){

        typeSelect.innerHTML = `

            <option value="point">
                Force
            </option>

            <option value="moment">
                Moment
            </option>
        `;
    }

    else{

        typeSelect.innerHTML = `

            <option value="point">
                Concentrated Force
            </option>

            <option value="moment">
                Concentrated Moment
            </option>

            <option value="udl">
                UDL
            </option>

            <option value="partial_udl">
                Partial UDL
            </option>

            <option value="trapezoidal">
                Trapezoidal
            </option>
        `;
    }



    // ---------------------------------------------
    // UPDATE VISIBLE FIELDS
    // ---------------------------------------------

    updateLoadFields();
}

function updateLoadFields(){

    let category =
        document.getElementById(
            "loadCategory"
        ).value;

    let typeSelect =
        document.getElementById(
            "loadType"
        );

    // -------------------------------------------------
    // CURRENT TYPE
    // -------------------------------------------------

    let type = typeSelect.value;



    // -------------------------------------------------
    // HIDE EVERYTHING FIRST
    // -------------------------------------------------

    hideGroup("directionGroup");

    hideGroup("value2Group");

    hideGroup("aGroup");

    hideGroup("bGroup");



    // -------------------------------------------------
    // NODAL LOADS
    // -------------------------------------------------

    if(category === "nodal"){

        showGroup("directionGroup");

        let directionSelect =
            document.getElementById(
                "loadDirection"
            );
        // FORCE
        if(type === "point"){
            document.getElementById(
                "value1Label"
            ).innerText = "Force";
            
            directionSelect.innerHTML = `
                <option value="X">
                    Global-X
                </option>
                <option value="Y">
                    Global-Y
                </option>
            `;
        }

        // MOMENT
        else{
            document.getElementById(
                "value1Label"
            ).innerText = "Moment";

            directionSelect.innerHTML = `
                <option value="M">
                    Global-Z
                </option>
            `;
        }
    }


    // -------------------------------------------------
    // MEMBER LOADS
    // -------------------------------------------------

    else{


        // POINT LOAD
        if(type === "point"){

            showGroup("aGroup");

            document.getElementById(
                "value1Label"
            ).innerText = "Concentrated Force";
        }



        // MOMENT
        else if(type === "moment"){

            showGroup("aGroup");

            document.getElementById(
                "value1Label"
            ).innerText = "Concentrated Moment";
        }



        // UDL
        else if(type === "udl"){

            document.getElementById(
                "value1Label"
            ).innerText = "UDL";
        }



        // PARTIAL UDL
        else if(type === "partial_udl"){

            showGroup("aGroup");

            showGroup("bGroup");

            document.getElementById(
                "value1Label"
            ).innerText = "UDL";
        }



        // TRAPEZOIDAL
        else if(type === "trapezoidal"){

            showGroup("value2Group");

            document.getElementById(
                "value1Label"
            ).innerText = "Start Load";

            document.getElementById(
                "value2Label"
            ).innerText = "End Load";
        }
    }

    updateLoadInstructions();
}

// #region =====================================================
// LOAD INSTRUCTION PANEL
// =====================================================

function updateLoadInstructions(){

    let category = document.getElementById("loadCategory").value;

    let type = document.getElementById("loadType").value;

    let html = "";

    // NODAL LOADS

    if(category === "nodal"){

        // FORCE
        if(type === "point"){
            html = `
                <b>Sign Convention</b><br>
                + Global-X → Right<br>
                + Global-Y → Upward<br>

                <br>
                <b>Force</b><br>
                Magnitude of force in kN.
                <br><br>
                <b>Direction</b><br>
                Global-X → Horizontal force<br>
                Global-Y → Vertical force
            `;
        }

        // MOMENT
        else{
            html = `
                <b>Sign Convention</b><br>
                + Global-Z → Anticlockwise
                <br><br>
                <b>Moment</b><br>
                Applied nodal moment in kN-m.
                <br><br>
                <b>Direction</b><br>
                Global-Z → Out of plane rotation
            `;
        }
    }

    // MEMBER LOADS

    else{

        // POINT LOAD
        if(type === "point"){
            html = `
                <b>Sign Convention</b><br>
                Negative → Downward local Y load
                <br><br>
                <b>Concentrated Force</b><br>
                Magnitude of Concentrated Force in kN.
                <br><br>
                <b>a</b><br>
                Distance of Load from member start node.
            `;
        }

        // MOMENT
        else if(type === "moment"){

            html = `
                <b>Sign Convention</b><br>
                Positive → Anticlockwise
                <br><br>
                <b>Concentrated Moment</b><br>
                Applied Concentrated Moment on member in kN-m.
                <br><br>
                <b>a</b><br>
                Distance of Load from member start node.
            `;
        }



        // UDL
        else if(type === "udl"){

            html = `
                <b>Sign Convention</b><br>
                Negative → Downward on local Y direction
                <br><br>
                <b>UDL</b><br>
                Uniformly distributed load intensity in kN/m.
            `;
        }



        // PARTIAL UDL
        else if(type === "partial_udl"){

            html = `
                <b>Sign Convention</b><br>
                Negative → Downward on local Y direction
                <br><br>
                <b>UDL</b><br>
                Uniformly distributed load intensity in kN/m.
                <br><br>
                <b>a</b><br>
                Start distance of UDL from member start node.
                <br><br>
                <b>b</b><br>
                End distance of UDL from member start node.
            `;
        }



        // TRAPEZOIDAL
        else if(type === "trapezoidal"){

            html = `
                <b>Sign Convention</b><br>
                Negative → Downward on local Y direction
                <br><br>
                <b>Start Load</b><br>
                Load intensity at start node in kN/m.
                <br><br>
                <b>End Load</b><br>
                Load intensity at end node in kN/m.
            `;
        }
    }



    document.getElementById("loadInstructionContent").innerHTML = html;
}

// #endregion

// -----------------------------------------------------
// SHOW GROUP
// -----------------------------------------------------

function showGroup(id){

    document.getElementById(
        id
    ).style.display = "block";
}



// -----------------------------------------------------
// HIDE GROUP
// -----------------------------------------------------

function hideGroup(id){

    document.getElementById(
        id
    ).style.display = "none";
}

// #endregion


// //#region -----------------------------------------------------
// DELETE LOAD
// -----------------------------------------------------

function deleteLoad(index){

    loadDatabase.splice(index,1);

    renderLoadCards();

    refreshView();
}

// #endregion

// #region EDIT LOAD
// -----------------------------------------------------
let editingLoadIndex = -1;

function editLoad(index){

    let load = loadDatabase[index];
    editingLoadIndex = index;

    // OPEN POPUP
    openLoadPopup();

    // CATEGORY
    document.getElementById(
        "loadCategory"
    ).value = load.category;

    // UPDATE TYPES
    updateLoadPopup();

    // TYPE
    document.getElementById(
        "loadType"
    ).value = load.type;

    // UPDATE FIELDS
    updateLoadFields();

    // DIRECTION
    document.getElementById(
        "loadDirection"
    ).value = load.direction;

    // VALUES
    document.getElementById(
        "loadValue1"
    ).value = load.value1;

    document.getElementById(
        "loadValue2"
    ).value = load.value2;

    document.getElementById(
        "loadA"
    ).value = load.a;

    document.getElementById(
        "loadB"
    ).value = load.b;

}

// #endregion

// #region  ASSIGN LOAD
// -----------------------------------------------------

function assignLoad(index){

    let card = document.querySelectorAll(
        ".load-item"
    )[index];

    let input = card.querySelector(
        ".load-assignment-input"
    );

    let values = input.value
        .split(",")
        .map(x => x.trim())
        .filter(x => x !== "");

    let load = loadDatabase[index];

    // UPDATE ASSIGNMENT

    if(load.category === "nodal"){
        load.assignedNodes = values;
    }

    else{
        load.assignedMembers = values;
    }

    renderLoadCards();

    refreshView();
}

// #endregion

// #region RESULT TAB SWITCHING
// =====================================================

function showResultTab(tabName,btn){

    // -------------------------------------------------
    // REMOVE ACTIVE BUTTON
    // -------------------------------------------------

    document
        .querySelectorAll(".results-nav-btn")
        .forEach(b=>{

            b.classList.remove(
                "active-result-tab"
            );
        });



    // -------------------------------------------------
    // REMOVE ACTIVE TAB
    // -------------------------------------------------

    document
        .querySelectorAll(".result-tab")
        .forEach(tab=>{

            tab.classList.remove(
                "active-result-tab-content"
            );
        });



    // -------------------------------------------------
    // ACTIVATE BUTTON
    // -------------------------------------------------

    btn.classList.add(
        "active-result-tab"
    );



    // -------------------------------------------------
    // ACTIVATE TAB
    // -------------------------------------------------

    document
        .getElementById(tabName)
        .classList.add(
            "active-result-tab-content"
        );
}

// #endregion
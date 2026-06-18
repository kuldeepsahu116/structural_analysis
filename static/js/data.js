// #region =====================================================
// GET NODES
// =====================================================

function getNodes(){

    let nodes = {};

    let rows = document.getElementById("nodesTable").rows;

    for(let i=1; i<rows.length; i++){

        let c = rows[i].cells;

        nodes[
            c[0].children[0].value
        ] = [

            +c[1].children[0].value,

            +c[2].children[0].value
        ];
    }

    return nodes;
}

// #endregion



// #region =====================================================
// GET MEMBERS
// =====================================================

function getMembers(){

    let members = [];

    let rows = document.getElementById("membersTable").rows;

    for(let i=1; i<rows.length; i++){

        let c = rows[i].cells;

        members.push({

            name:
                c[0].children[0].value,

            start:
                c[1].children[0].value,

            end:
                c[2].children[0].value,

            E:
                +c[3].children[0].value,

            A:
                +c[4].children[0].value,

            I:
                +c[5].children[0].value
        });
    }

    return members;
}

// #endregion



// #region =====================================================
// GET SUPPORTS
// =====================================================

function getSupports(){

    let supports = [];

    let rows = document.getElementById("supportsTable").rows;

    for(let i=1; i<rows.length; i++){

        let c = rows[i].cells;

        supports.push({

            node:
                c[0].children[0].value,

            ux:
                c[1].children[0].checked,

            uy:
                c[2].children[0].checked,

            rz:
                c[3].children[0].checked
        });
    }

    return supports;
}

// #endregion



// #region =====================================================
// GET LOADS
// =====================================================

function getLoads(){

    return loadDatabase;
}

// #endregion

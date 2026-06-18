// #region =====================================================
// APPLICATION STARTUP
// =====================================================

window.onload = function(){

    showPage(1);

    addNode(0,0,0);
    addNode(1,1,0);
    addNode(2,2,0);
    addNode(3,3,0);
    addNode(4,5,0);

    addMember("A",0,1,1,1,1);
    addMember("B",1,2,1,1,1);
    addMember("C",2,3,1,1,1);
    addMember("D",3,4,1,1,1);

    addSupport(0,true,true,true);
    addSupport(2,true,true,false);
    addSupport(3,true,true,false);
    addSupport(4,true,true,true);

    // -------------------------------------------------
    // STARTUP LOADS
    // -------------------------------------------------

    loadDatabase.push({

        category : "nodal",
        type : "point",
        direction : "Y",
        value1 : -16,
        value2 : 0,
        a : 0,
        b : 0,
        assignedNodes : ["1"],
        assignedMembers : []
    });



    loadDatabase.push({

        category : "member",
        type : "udl",
        direction : "",
        value1 : -6,
        value2 : 0,
        a : 0,
        b : 0,
        assignedNodes : [],
        assignedMembers : ["D"]
    });

    loadDatabase.push({

        category : "member",
        type : "trapezoidal",
        direction : "",
        value1 : -6,
        value2 : -12,
        a : 0,
        b : 0,
        assignedNodes : [],
        assignedMembers : ["B"]
    });

    renderLoadCards();

    drawStructure();

    setTimeout(resetView,20);
};

// #endregion
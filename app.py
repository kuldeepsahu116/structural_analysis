from flask import Flask, render_template, request, jsonify
import numpy as np
from stuructural_analysis_solver import Member, run_analysis

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/analyze", methods=["POST"])
def analyze():

    try:
        data = request.get_json()

        # nodes = {int(k): tuple(v) for k,v in data["nodes"].items()}
        # --------------------------------
        # NODES
        # --------------------------------

        raw_nodes = data["nodes"]

        # NODE LABEL → INDEX MAP
        node_map = {}
        nodes = {}

        for i, (label, coord) in enumerate(raw_nodes.items()):
            node_map[label] = i
            nodes[i] = tuple(coord)

        # --------------------------------
        # MEMBERS
        # --------------------------------
        members = []
        for i, m in enumerate(data["members"]):

            if str(m["start"]) not in node_map:
                raise ValueError(f"Invalid start node {m['start']}")

            if str(m["end"]) not in node_map:
                raise ValueError(f"Invalid end node {m['end']}")
        
            start_index = node_map[str(m["start"])]
            end_index = node_map[str(m["end"])]
            members.append(Member(
                i,
                start_index, 
                end_index,
                m["E"], m["A"], m["I"]
            ))

        # -----------------------------
        # SUPPORTS
        # -----------------------------

        fixed_dofs = []

        for s in data["supports"]:

            if str(s["node"]) not in node_map:

                raise ValueError(
                    f"Support node '{s['node']}' does not exist"
                )

            node = node_map[str(s["node"])]

            if s["ux"]:
                fixed_dofs.append(3*node)

            if s["uy"]:
                fixed_dofs.append(3*node + 1)

            if s["rz"]:
                fixed_dofs.append(3*node + 2)

        fixed_dofs = np.array(fixed_dofs).reshape(-1,1)

        # -----------------------------
        # LOADS
        # -----------------------------

        F_node = np.zeros((3*len(nodes),1))

        # -----------------------------------------------------
        # MEMBER LOOKUP
        # UI LABEL -> MEMBER INDEX
        # -----------------------------------------------------

        member_map = {
            str(m["name"]): i
            for i, m in enumerate(data["members"])
        }

        # =====================================================
        # APPLY LOADS
        # =====================================================
        for load in data["loads"]:

            category = load["category"]

            # NODAL LOADS 

            if category == "nodal":

                direction = load["direction"]
                value = load["value1"]

                for node_label in load["assignedNodes"]:

                    #VALIDATION: NODE EXISTS
                    if str(node_label) not in node_map:

                        raise ValueError(
                            f"Load node '{node_label}' does not exist"
                        )

                    node_index = node_map[str(node_label)]

                    if direction == "X":

                        F_node[3*node_index] += value

                    elif direction == "Y":

                        F_node[3*node_index+1] += value

                    elif direction == "M":

                        F_node[3*node_index+2] += value

        # MEMBER LOADS

            # Only member loads
            elif category == "member":

                load_type = load["type"]

                for member_label in load["assignedMembers"]:

                    #VALIDATION: MEMBER EXISTS
                    if member_label not in member_map:

                        raise ValueError(
                            f"Member '{member_label}' does not exist"
                        )

                    member = members[member_map[member_label]]

                    # POINT LOAD
                    if load_type == "point":

                        member.add_point_load(
                            load["value1"],
                            load["a"]
                        )
                        
                    # UDL
                    elif load_type == "udl":

                        member.add_udl(
                            load["value1"]
                        )

                    # PARTIAL UDL
                    elif load_type == "partial_udl":

                        member.add_partial_udl(
                            load["value1"],
                            load["a"],
                            load["b"]
                        )

                    # TRAPEZOIDAL
                    elif load_type == "trapezoidal":

                        member.add_trapezoidal_load(
                            load["value1"],
                            load["value2"]
                        )

                    # MOMENT
                    elif load_type == "moment":

                        member.add_moment_load(
                            load["value1"],
                            load["a"]
                        )

        result = run_analysis(nodes, members, F_node, fixed_dofs)

        reverse_node_map = {
            v:k for k,v in node_map.items()
        }
        member_labels = [
            str(m["name"])
            for m in data["members"]
        ]

        return jsonify({
            "displacements": result["displacements"].flatten().tolist(),
            "reactions": result["reactions"].flatten().tolist(),
            "node_labels": reverse_node_map,
            "member_labels": member_labels,
            "member_forces": [m.f_memb_force_local.flatten().tolist()
                              for m in result["members"]],
            "sfd": [{
                    "member":member_labels[i],
                    "x": m.shear_x,
                    "V": m.shear_V,
                    "max_V": m.max_shear,
                    "x_max_V": m.x_max_shear,
                    "min_V": m.min_shear,
                    "x_min_V":m.x_min_shear}
                for i,m in enumerate(result["members"])],
            "bmd": [{
                    "member":member_labels[i],
                    "x": m.moment_x,
                    "M": m.moment_M,
                    "max_M": m.max_moment,
                    "x_max_M": m.x_max_moment,
                    "min_M": m.min_moment,
                    "x_min_M": m.x_min_moment}
                    for i,m in enumerate(result["members"])],
            "deflection_shapes": [{
                    "member": member_labels[i],
                    "x": m.deflection_x,
                    "y": m.deflection_y,
                    "max_deflection": m.max_deflection,
                    "x_max_deflection": m.x_max_deflection,
                    "min_deflection": m.min_deflection,
                    "x_min_deflection": m.x_min_deflection}
                for i,m in enumerate(result["members"])],
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True)
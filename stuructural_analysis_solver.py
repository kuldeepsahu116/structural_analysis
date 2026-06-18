from dataclasses import dataclass, field
import numpy as np


# ----------------------------
# MEMBER CLASS DEFINITION
# ----------------------------
@dataclass
class Member:
    name: int
    start_node: int
    end_node: int
    E: float
    A: float
    I: float

    # LOAD STORAGE
    member_loads: list = field(default_factory=list)

    # GEOMETRIC PROPERTIES 
    start_point: tuple = field(init=False)
    end_point: tuple = field(init=False)
    L: float = field(init=False)

    C: float = field(init=False)
    S: float = field(init=False)

    # MATRICES
    k_local: np.ndarray = field(init=False)
    k_global: np.ndarray = field(init=False)

    T: np.ndarray = field(init=False)

    # MEMBER END FORCES
    F_Fixed_local: np.ndarray = field(init=False)
    F_Fixed_Global: np.ndarray = field(init=False)

    # MEMBER RESULTS
    f_memb_force_local: np.ndarray = field(init=False)
    d_local: np.ndarray = field(init=False)

    # POST-PROCESSING STORAGE
    shear_x: list = field(default_factory=list)
    shear_V: list = field(default_factory=list)

    moment_x: list = field(default_factory=list)
    moment_M: list = field(default_factory=list)

    deflection_x: list = field(default_factory=list)
    deflection_y: list = field(default_factory=list)

    # EXTREME VALUES
    max_shear: float = 0.0
    x_max_shear: float = 0.0
    min_shear: float = 0.0
    x_min_shear: float = 0.0

    max_moment: float = 0.0
    x_max_moment: float = 0.0
    min_moment: float = 0.0
    x_min_moment: float = 0.0

    max_deflection: float = 0.0
    x_max_deflection: float = 0.0
    min_deflection: float = 0.0
    x_min_deflection: float = 0.0

    # ============================
    # LOAD DEFINITIONS
    # ============================
    
    # POINT LOAD
    def add_point_load(self, P, a):

        self.member_loads.append({
            "type": "point",
            "P": P,   # load
            "a": a    # distance from start
        })

    # UDL
    def add_udl(self, w):

        self.member_loads.append({
            "type": "udl",
            "w": w   # load intensity
        })

    # PARTIAL UDL
    def add_partial_udl(self, w, a, b):

        self.member_loads.append({
            "type": "partial_udl",
            "w": w,   # load intensity  
            "a": a,   # start distance
            "b": b    # end distance
        })

    # TRAPEZOIDAL LOAD
    def add_trapezoidal_load(self, w1, w2):

        self.member_loads.append({
            "type": "trapezoidal",
            "w1": w1,   # start intensity
            "w2": w2    # end intensity
        })

    # MEMBER MOMENT
    def add_moment_load(self, M, a):

        self.member_loads.append({
            "type": "moment",
            "M": M,   # applied moment
            "a": a    # distance from start
        })

    # ----------------------------
    # INITIALIZATION
    # ----------------------------
    def initialize(self, nodes):

        self.compute_geometry(nodes)

        self.compute_transformation_matrix()

        self.compute_local_stiffness()

        self.compute_global_stiffness()

        self.compute_fixed_end_forces()


    # GEOMETRY
    def compute_geometry(self, nodes):

        if self.start_node not in nodes or self.end_node not in nodes:
            raise ValueError(f"Invalid node in member {self.name}")

        self.start_point = nodes[self.start_node]
        self.end_point = nodes[self.end_node]

        x1, y1 = self.start_point
        x2, y2 = self.end_point

        dx = x2 - x1
        dy = y2 - y1

        self.L = np.sqrt(dx**2 + dy**2)
        if self.L == 0:
            raise ValueError("Zero length member detected")

        self.C = dx / self.L
        self.S = dy / self.L

    # LOCAL COORDINATE STIFFNESS 
    def compute_local_stiffness(self):

        E = self.E
        A = self.A
        I = self.I
        L = self.L

        self.k_local = np.array([
            [ E*A/L,      0,            0,     -E*A/L,     0,            0],
            [ 0,    12*E*I/L**3,  6*E*I/L**2,  0,   -12*E*I/L**3,  6*E*I/L**2],
            [ 0,     6*E*I/L**2,  4*E*I/L,     0,    -6*E*I/L**2,  2*E*I/L],
            [-E*A/L,     0,            0,      E*A/L,     0,            0],
            [ 0,   -12*E*I/L**3, -6*E*I/L**2,  0,    12*E*I/L**3, -6*E*I/L**2],
            [ 0,     6*E*I/L**2,  2*E*I/L,     0,    -6*E*I/L**2,  4*E*I/L]
        ])

    # TRANSFORMATION MATRIX 
    def compute_transformation_matrix(self):

        C = self.C
        S = self.S

        self.T = np.array([
            [C, -S, 0, 0, 0, 0],
            [S,  C, 0, 0, 0, 0],
            [0,  0, 1, 0, 0, 0],
            [0,  0, 0, C, -S, 0],
            [0,  0, 0, S,  C, 0],
            [0,  0, 0, 0,  0, 1]
        ])

    # GLOBAL COORDINATE STIFFNESS
    def compute_global_stiffness(self):

        self.k_global = self.T @ self.k_local @ self.T.T

    # --------------------------
    # FIXED END FORCES 
    # --------------------------
    def compute_fixed_end_forces(self):

        L = self.L

        self.F_Fixed_local = np.zeros((6,1))
        
        for load in self.member_loads:

            # POINT LOAD
            if load["type"] == "point":
                P = -load["P"]
                a = load["a"]
                b = L - a

                F = np.array([
                    [0],
                    [P*b**2*(3*a+b)/L**3],
                    [P*a*b**2/L**2],
                    [0],
                    [P*a**2*(a+3*b)/L**3],
                    [-P*a**2*b/L**2]
                ])

                self.F_Fixed_local += F

            # UDL
            elif load["type"] == "udl":

                w = -load["w"]

                F = np.array([
                    [0],
                    [w*L/2],
                    [w*L**2/12],
                    [0],
                    [w*L/2],
                    [-w*L**2/12]
                ])

                self.F_Fixed_local += F

            # PARTIAL UDL
            elif load["type"] == "partial_udl":

                w = -load["w"]
                a = load["a"]
                b = load["b"]

                length = b - a

                W = w * length

                R1 = (w / (2 * L**3)) * (2 * L**3 * (b - a) - 2 * L * (b**3 - a**3) + (b**4 - a**4))
                R2 = W - R1
                M1 = (w / (12 * L**2)) * (b**2 * (6 * L**2 - 8 * L * b + 3 * b**2) - 
                                        a**2 * (6 * L**2 - 8 * L * a + 3 * a**2))
                M2 = (-w / (12 * L**2)) * (b**3 * (4 * L - 3 * b) - a**3 * (4 * L - 3 * a))
                F = np.array([
                    [0],
                    [R1],
                    [M1],
                    [0],
                    [R2],
                    [M2]
                ])

                self.F_Fixed_local += F

            # TRAPEZOIDAL LOAD
            elif load["type"] == "trapezoidal":

                w1 = -load["w1"]
                w2 = -load["w2"]

                F = np.array([
                    [0],
                    [(L/20)*(7*w1+3*w2)],
                    [(L**2/60)*(3*w1+2*w2)],
                    [0],
                    [(L/20)*(3*w1+7*w2)],
                    [-(L**2/60)*(2*w1+3*w2)]
                ])

                self.F_Fixed_local += F


            # MEMBER MOMENT
            elif load["type"] == "moment":

                M = load["M"]
                a = load["a"]

                b = L - a

                F = np.array([
                    [0],
                    [-6*M*a*b/L**3],
                    [M*b*(2*a-b)/L**2],
                    [0],
                    [6*M*a*b/L**3],
                    [M*a*(2*b-a)/L**2]
                ])

                self.F_Fixed_local += F
        #Transform to global coordinates
        self.F_Fixed_Global = self.T @ self.F_Fixed_local

        self.f_memb_force_local = np.zeros((6,1))
        self.d_local = np.zeros((6,1))

    # ============================
    # POST-PROCESSING 
    # ============================
    def postprocess(self):
        
        self.compute_shear_distribution()

        self.compute_moment_distribution()

        self.compute_deflection_distribution()

    # SHEAR FORCE DISTRIBUTION
    def compute_shear_distribution(self,n_points=40):

        L = self.L
        x_vals = np.linspace(0,L,n_points)

        # LOCAL MEMBER END FORCES
        Fy1 = self.f_memb_force_local[1,0]
        Fy2 = self.f_memb_force_local[4,0]

        V = []

        for x in x_vals:
            v = Fy1

            # UDL
            for load in self.member_loads:

                if load["type"] == "udl":
                    w = -load["w"]
                    v -= w*x

                elif load["type"] == "partial_udl":
                    w = -load["w"]
                    a = load["a"]
                    b = load["b"]

                    if x <= a:
                        pass
                    elif x <= b:
                        v -= w*(x-a)
                    else:
                        v -= w*(b-a)

                elif load["type"] == "point":
                    P = -load["P"]
                    a = load["a"]

                    if x >= a:
                        v -= P

                elif load["type"] == "trapezoidal":
                    w1 = -load["w1"]
                    w2 = -load["w2"]

                    v -= (w1*x) + ((w2-w1)*x**2/(2*L))

            V.append(v)

        V[-1] += Fy2
        V_arr = np.array(V)

        self.shear_x = x_vals.tolist()
        self.shear_V = V

        self.max_shear = np.max(V_arr)
        self.x_max_shear = x_vals[np.argmax(V_arr)]

        self.min_shear = np.min(V_arr)
        self.x_min_shear = x_vals[np.argmin(V_arr)]

    # MOMENT DISTRIBUTION
    def compute_moment_distribution(self, n_points=40):

        L = self.L
        x_vals = np.linspace(0,L,n_points)

        Fy1 = self.f_memb_force_local[1,0]
        M1  = self.f_memb_force_local[2,0]

        M = []

        for x in x_vals:
            m = -M1 + Fy1*x

            # UDL
            for load in self.member_loads:

                if load["type"] == "udl":
                    w = -load["w"]
                    m -= w*x*x/2

                elif load["type"] == "partial_udl":
                    w = -load["w"]
                    a = load["a"]
                    b = load["b"]

                    if x <= a:
                        pass
                    elif x <= b:
                        m -= w*((x-a)**2)/2
                    else:
                        m -= (w*(b-a)*( x - (a+b)/2))

                elif load["type"] == "point":
                    P = -load["P"]
                    a = load["a"]
                    if x >= a:
                        m -= P*(x-a)

                elif load["type"] == "moment":
                    Mm = load["M"]
                    a  = load["a"]

                    if x >= a:
                        m += Mm

                elif load["type"] == "trapezoidal":
                    w1 = -load["w1"]
                    w2 = -load["w2"]

                    m -= (w1*x*x/2) + ((w2-w1)*x**3/(6*L))

            M.append(m)

        M_arr = np.array(M)

        self.moment_x = x_vals.tolist()
        self.moment_M = M

        self.max_moment = np.max(M_arr)
        self.x_max_moment = x_vals[np.argmax(M_arr)]

        self.min_moment = np.min(M_arr)
        self.x_min_moment = x_vals[np.argmin(M_arr)]

    # DEFLECTION DISTRIBUTION
    def compute_deflection_distribution(self, n_points=40):

        L = self.L
        x_vals = np.linspace(0,L,n_points)

        # LOCAL DISPLACEMENTS
        d = self.d_local.flatten()
        v1 = d[1]
        t1 = d[2]
        v2 = d[4]
        t2 = d[5]

        Y = []

        for x in x_vals:
            xi = x/L

            # HERMITE SHAPE FUNCTIONS
            N1 = 1 - 3*xi**2 + 2*xi**3
            N2 = L*(xi - 2*xi**2 + xi**3)
            N3 = 3*xi**2 - 2*xi**3
            N4 = L*(-xi**2 + xi**3)

            y = float(N1*v1+N2*t1+N3*v2+N4*t2)
            Y.append(y)

        Y_arr = np.array(Y,dtype=float)

        self.deflection_x = x_vals.tolist()
        self.deflection_y = Y_arr.tolist()

        self.max_deflection = float(np.max(Y_arr))
        self.x_max_deflection = float(x_vals[np.argmax(Y_arr)])

        self.min_deflection = float(np.min(Y_arr))
        self.x_min_deflection = float(x_vals[np.argmin(Y_arr)])
        
       

# ----------------------------
# MEMBER INITIALIZATION
# ----------------------------
def initialize_members(members, nodes):
    for m in members:
        m.initialize(nodes)


# ----------------------------
# GLOBAL FORCE VECTOR
# ----------------------------
def assemble_force_vector(nodes, members, F_node):
    F = np.zeros((3*len(nodes),1))

    # Node loads
    F += F_node

    # Member loads
    for m in members:
        dofs = [3*m.start_node, 3*m.start_node+1, 3*m.start_node+2,
                3*m.end_node, 3*m.end_node+1, 3*m.end_node+2]

        for a in range(6):
            F[dofs[a]] -= m.F_Fixed_Global[a]

    return F


# ----------------------------
# GLOBAL STIFFNESS MATRIX
# ----------------------------
def assemble_stiffness(nodes, members):
    n_nodes = len(nodes)
    K_global = np.zeros((3*n_nodes, 3*n_nodes))

    for m in members:
        dofs = [3*m.start_node, 3*m.start_node+1, 3*m.start_node+2,
                3*m.end_node, 3*m.end_node+1, 3*m.end_node+2]

        for a in range(6):
            for b in range(6):
                K_global[dofs[a], dofs[b]] += m.k_global[a, b]

    return K_global


# ----------------------------
# SOLVER
# ----------------------------
def solve_system(K_global, F, fixed_dofs):

    n = len(F)

    all_dofs = np.arange(n)
    fixed_dofs = fixed_dofs.flatten()
    free_dofs = np.setdiff1d(all_dofs, fixed_dofs)

    K_red = K_global[np.ix_(free_dofs, free_dofs)]
    F_red = F[free_dofs]

    try:
        D_red = np.linalg.solve(K_red, F_red)
    except np.linalg.LinAlgError:
        raise ValueError("Structure unstable (insufficient constraints) or mechanism formed")

    D = np.zeros((n,1))
    D[free_dofs] = D_red

    R = (K_global @ D) - F

    return D, R, K_red, F_red


# ----------------------------
# FUNCTION 5: MEMBER FORCES
# ----------------------------
def compute_member_forces(members, D):

    for m in members:
        d_Global_Coo = np.array([
            D[3*m.start_node],
            D[3*m.start_node+1],
            D[3*m.start_node+2],
            D[3*m.end_node],
            D[3*m.end_node+1],
            D[3*m.end_node+2]
        ]).reshape(6,1)

        # CONVERT → LOCAL
        d_local = m.T.T @ d_Global_Coo

        m.d_local = d_local


        m.f_memb_force_local = (m.k_local @ d_local) + m.F_Fixed_local
        m.f_memb_force_local = np.round(m.f_memb_force_local, 3)


# ----------------------------
# MAIN ANALYSIS FUNCTION
# ----------------------------
def run_analysis(nodes, members, F_node, fixed_dofs):

    # Step 1: initialize members
    initialize_members(members, nodes)

    # Step 2: force vector
    F = assemble_force_vector(nodes, members, F_node)

    # Step 3: stiffness matrix
    K_global = assemble_stiffness(nodes, members)

    # Step 4: solve
    D, R, K_red, F_red = solve_system(K_global, F, fixed_dofs)

    # Step 5: member forces
    compute_member_forces(members, D)

    # Step 6: post-process members
    for m in members:
        m.postprocess()

    # return everything
    return {
        "K_global": K_global,
        "K_reduced": K_red,
        "F_reduced": F_red,
        "displacements": D,
        "reactions": R,
        "members": members,
       
    }

#----------------------------
# Run analysis 
#----------------------------

if __name__ == "__main__":

    # Nodes
    nodes = {
        0: (0,0),
        1: (1,0),
        2: (2,0),
        3: (3,0),
        4: (5,0),
    }

    # Members
  
    m1=Member(1, 0, 1, E=1, A=1, I=1)
    m2=Member(2, 1, 2, E=1, A=1, I=1)
    m3=Member(3, 2, 3, E=1, A=1, I=1)
    m4=Member(4, 3, 4, E=1, A=1, I=1)
    
    m4.add_udl(w=-6)

    members = [m1, m2, m3, m4]

    # Loads
    F_node = np.zeros((3 * len(nodes), 1))

    F_node[3*1 + 1] = -16   # v direction

    # Supports
    fixed_dofs = np.array([
    [0], [1], [2],        # Node 0 → fixed
    [6], [7],             # Node 2 → roller (u,v fixed)
    [9], [10],            # Node 3 → roller
    [12], [13], [14]      # Node 4 → fixed
    ])

    # Run
    result = run_analysis(nodes, members, F_node, fixed_dofs)

    print("Displacements:\n", result["displacements"])
    print("Reactions:\n", result["reactions"])

    for m in result["members"]:
        print(f"Member {m.start_node}-{m.end_node} force:\n", m.f_memb_force_local)
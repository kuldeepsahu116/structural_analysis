# Structural Analysis Web App - Feature Roadmap
 
## Immediate Next Development Priority

* [x] Draw member loads on structure view
* [ ] Draw reaction arrows
* [ ] Correct the plot of deformed shape
* [ ] Save/Open project
* [ ] Load cases
* [ ] Load combinations
* [ ] AFD generation
* [ ] Unit management system
---


## Phase 1: Core Analysis Features

* [ ] Load Cases

  * [ ] Dead Load (DL)
  * [ ] Live Load (LL)
  * [ ] Wind Load (WL)
  * [ ] Seismic Load (EQ)
  * [ ] User-defined load cases

* [ ] Load Combinations

  * [ ] Custom combinations
  * [ ] Code-based combinations
  * [ ] Combination manager

* [ ] Support Settlements

  * [ ] Vertical settlement
  * [ ] Horizontal settlement
  * [ ] Rotational settlement

* [ ] Temperature Loads

  * [ ] Uniform temperature change
  * [ ] Temperature gradient

* [ ] Member End Releases

  * [ ] Start hinge
  * [ ] End hinge
  * [ ] Partial releases

* [ ] Spring Supports

  * [ ] Translational spring X
  * [ ] Translational spring Y
  * [ ] Rotational spring

---

## Phase 2: Visualization Features

* [ ] Deformed Shape

  * [ ] Scale factor control
  * [ ] Original + deformed overlay
  * [ ] Animation option

* [ ] Reaction Display

  * [ ] Force arrows
  * [ ] Moment arrows
  * [ ] Reaction values box

* [ ] Member Load Visualization

  * [ ] scaling of loads with values

* [ ] Selection & Highlighting

  * [ ] Node selection
  * [ ] Member selection
  * [ ] Support selection
  * [ ] Load selection

---

## Phase 3: Result Features

* [ ] Member End Forces

  * [ ] Fx1
  * [ ] Fy1
  * [ ] Mz1
  * [ ] Fx2
  * [ ] Fy2
  * [ ] Mz2

* [ ] Axial Force Diagram (AFD)

* [ ] Shear Force Diagram (SFD)

* [ ] Bending Moment Diagram (BMD)

* [ ] Result Summary

  * [x] Maximum displacement
  * [x] Maximum moment
  * [x] Maximum shear
  * [ ] Maximum axial force

---

## Phase 4: User Experience Features

* [ ] Undo / Redo

* [ ] Auto Numbering

  * [ ] Nodes
  * [ ] Members

* [ ] Copy Member Properties

* [ ] Save Project

  * [ ] JSON export
  * [ ] JSON import

* [ ] Project Templates

  * [ ] Cantilever beam
  * [ ] Simply supported beam
  * [ ] Continuous beam
  * [ ] Portal frame

* [ ] Unit System

  * [ ] N-mm
  * [ ] N-m
  * [ ] kN-mm
  * [ ] kN-m

---

## Phase 5: Professional Features

* [ ] Material Library

  * [ ] Steel
  * [ ] Concrete
  * [ ] Aluminium
  * [ ] Custom material

* [ ] Section Library

  * [ ] ISMB
  * [ ] ISHB
  * [ ] IPE
  * [ ] Custom section

* [ ] Property Groups

  * [ ] Material groups
  * [ ] Section groups

* [ ] Model Validation

  * [ ] Duplicate nodes
  * [ ] Duplicate members
  * [ ] Zero-length members
  * [ ] Disconnected nodes
  * [ ] Invalid supports
  * [ ] Invalid loads

* [ ] Analysis Log

  * [ ] Node count
  * [ ] Member count
  * [ ] Total DOFs
  * [ ] Fixed DOFs
  * [ ] Free DOFs
  * [ ] Analysis time

* [ ] Error Highlighting

  * [ ] Highlight invalid node
  * [ ] Highlight invalid member
  * [ ] Highlight invalid load

---

## Phase 6: Advanced FEM Features

* [ ] Frame + Truss Hybrid Analysis

* [ ] Plane Truss Solver

* [ ] Automatic Grid Generation

  * [ ] Rectangular grid
  * [ ] Custom spacing

* [ ] Moving Load Analysis

* [ ] Influence Line Generation

* [ ] Buckling Analysis

## Phase 6: Advanced FEM Features

* [ ] Make 3D solver

* [ ] extend the ui to 3D

* [ ] use 3js
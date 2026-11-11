# Chemlib
**Chemlib** is a TypeScript library for simulating chemical processes. The software offers *no* visual frontend but instead should be used as a backend for other web applications.

## Installation

 1. Copy this repository using `git clone`
 2. link the project using either `npm link` or `npm install </path to Chemlib>`

#### Dependencies
Chemlib utilizes the open source toolbox [kekule.js](https://partridgejiang.github.io/Kekule.js/), which should already be bundled with Chemlib.

## Usage

### Import

Simply import all components from Chemlib into another project using the common commands:

    import * as chemlib from 'chemlib'
  or just use individual components like so:

    import {ElementData, Atom} from 'chemlib'

### Components
Chemlib consists of multiple Classes, most of which need to work together to function properly. A list of all Classes with a short description can be found below.

| name | description |
|--|--|
| *ElementData* | A collection of data for each chemical element |
| *Atom* | Representation of an atom |
| *Bond* | Representation of an atomic bond |
| *Molecule* | Representation of a molecule |
| *Mixture* | A Representation of a mixture of one or more instances of Molecule |
| *StructureManager* | Abstract static management class for Mixture} and Molecule objects |
| *ChemComponent* | Representation of a chemical lab component such as beakers and flasks |
| *ComponentType* | An enum for the specific component types, used for identification |
| *ElectricComponent* | Representation of an electric component |
| *EComponentType* | An enum for the specific electric component types, used for identification |
| *ComponentManager* | Abstract static managing class for all components |
| *Simulation* | A static abstract class used to access all chemical simulations |

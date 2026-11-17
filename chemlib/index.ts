import {Atom} from './Atom'
import {Bond} from './Bond'
import {ChemComponent, ComponentType} from './ChemComponent'
import {ComponentManager} from './ComponentManager'
import {ElectricComponent, EComponentType} from './ElectricComponent'
import {ElementData} from './ElementData'
import {Mixture} from './Mixture'
import {Molecule} from './Molecule'
import {Simulation} from './Simulation'
import {StructureManager} from './StructureManager'
import {AcidBase} from './AcidBase'

export {Atom, Bond, ChemComponent, ComponentType, ComponentManager, ElectricComponent, EComponentType, ElementData, Mixture, Molecule, Simulation, StructureManager, AcidBase}
export {nonpolarDensity, splitLiquidPhases, type LiquidPhase} from './liquidPhases'
export type {AcidBaseSystem} from './AcidBase'
export {
	halfReactions,
	halfReactionsOn,
	oxidationOf,
	reductionOf,
	materialName,
	exchangeCurrentDensity,
	currentDensity,
	REFERENCE_CURRENT_DENSITY,
	ELECTRODE_AREA,
	ELECTROLYTE_RESISTANCE,
	BRIDGE_RESISTANCE,
	OPEN_CIRCUIT_RESISTANCE,
	GAS_PARTIAL_PRESSURE,
} from './halfReactions'
export type {HalfReaction, HalfReactionTerm} from './halfReactions'
export {MOLAR_GAS_VOLUME, MOLAR_GAS_VOLUME_ML} from './gasEvolution'
export {alreadyWired, canConnect, canPlug, connectDevices, connectionPairs, plugCable, restoreCables, restoreConnections} from './terminals'
export type {ConnectionEntry} from './terminals'
export type {CableEnd, TerminalSocket} from './ElectricComponent'
export {
	CABLE_RESISTANCE,
	VOLTMETER_RESISTANCE,
	AMMETER_RESISTANCE,
	SOURCE_RESISTANCE,
} from './ElectricComponent'
export {circuitNetwork, circuitThevenin, circuitReadings} from './circuit'
export type {CircuitElement, CircuitNetwork, CircuitReading} from './circuit'

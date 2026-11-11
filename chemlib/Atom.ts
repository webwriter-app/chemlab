import {ElementData} from "./ElementData";

/**
 * Representation of an atom
 *
 * @class Atom
 * @typedef {Atom}
 */
class Atom {
    /**
	 * the element of the atom shown via a data subset from {@link ElementData}
	 *
	 * @readonly
	 * @type {object}
	 */
    readonly _element : object;
    /**
	 * The ionic charge of the atom
	 *
	 * @type {number}
	 */
    _ionicCharge : number = 0;
    /**
	 * The ionic type of the atom (cation/anion/neutral)
	 *
	 * @type {string}
	 */
    _ionicType : string;
    /**
	 * The number of current bonding electrons of the atom
	 *
	 * @type {number}
	 */
    _bondingElectrons : number;
    /**
	 * The current electron configuration of the atom including its charge
	 *
	 * @type {string}
	 */
    _effectiveElectronConfiguration : string;
    /**
	 * The current electron configuration of the atom in sematic representation including its charge
	 *
	 * @type {string}
	 */
    _effectiveElectronConfigurationSemantic : string;
    /**
	 * The corresponding kekule.js object
	 *
	 * @type {*}
	 */
    _kekule_obj : any;
    /**
	 * The x and y positions of the atom within a molecule. Used to draw the shape
	 *
	 * @type {Array<number>}
	 */
    _pos2D : Array < number > = undefined;
    /**
	 * The specific id of the object
	 *
	 * @readonly
	 * @type {number}
	 */
    readonly _id : number;

    /**
	 * Returns a new atom object
	 *
	 * @constructor
	 * @param {string} pName - the name of the element
	 * @param {*} nkek - a possible underlying kekule.js atom object
	 * @param {number} [pIonicCharge=0] - the ionic charge (default is 0)
	 * @param {number} nIndex- the id of the object
	 */
    constructor(pName : string, nkek : any, pIonicCharge : number = 0, nIndex : number) {
        this._id = nIndex;
        this._element = ElementData.getData(pName);
        this._kekule_obj = nkek;

        this.setIonicCharge(pIonicCharge);
        this._kekule_obj.charge = pIonicCharge;
        this.updateElectrons(0, 0);
    }

    /**
	 * Sets the current charge and number of bonding electrons and updates the electron configuration
	 *
	 * @public
	 * @param {number} uValue - the number of new bonds
	 * @param {number} uCharge - the amount of new charges
	 */
    public updateElectrons(uValue : number, uCharge : number) : void {
        if(uValue != 0) {
            this.setIonicCharge(this._ionicCharge + uCharge);
            this._kekule_obj.charge = this._ionicCharge;
        }

        this._bondingElectrons = this.getElectrons() - uValue;
        this._effectiveElectronConfiguration = ElementData.getData(ElementData.getNameBeforeAfter(this._element["name"].toLowerCase(), -this._ionicCharge))["electron_configuration"];
        this._effectiveElectronConfigurationSemantic = ElementData.getData(ElementData.getNameBeforeAfter(this._element["name"].toLowerCase(), -this._ionicCharge))["electron_configuration_semantic"];
    }

    /**
	 * Setter for the {@link _pos2D} Array
	 *
	 * @public
	 * @param {number} nX - new x coordinate
	 * @param {number} nY - new y coordinate
	 */
    public setPos2D(nX : number, nY : number) : void {
        this._pos2D = [nX, nY];
        this
            ._kekule_obj
            .setCoord2D({x: nX, y: nY});
    }

    /**
	 * Returns the corresponding kekule.js object
	 *
	 * @public
	 * @returns {*}
	 */
    public getKekuleObj() : any {return this._kekule_obj;}

    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {string}
	 */
    public getName() : string {return this._element["name"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {number}
	 */
    public getProtons() : number {return this._element["number"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {number}
	 */
    public getElectrons() : number {return this._element["number"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {number}
	 */
    public getNeutrons() : number {return this._element["number"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {number}
	 */
    public getNumber() : number {return this._element["number"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {number}
	 */
    public getAtomicMass() : number {return this._element["atomic_mass"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {number}
	 */
    public getDensity() : number {return this._element["density"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {number}
	 */
    public getBoil() : number {return this._element["boil"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {string}
	 */
    public getCategory() : string {return this._element["category"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {number}
	 */
    public getMelt() : number {return this._element["melt"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {number}
	 */
    public getMolarHeat() : number {return this._element["molar_heat"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {number}
	 */
    public getPeriod() : number {return this._element["period"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {number}
	 */
    public getGroup() : number {return this._element["group"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {string}
	 */
    public getPhase() : string {return this._element["phase"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {string}
	 */
    public getElectronConfiguration() : string {return this._element["electron_configuration"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {string}
	 */
    public getElectronConfigurationSemantic() : string {return this._element["electron_configuration_semantic"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {number}
	 */
    public getElectronAffinity() : number {return this._element["electron_affinity"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {number}
	 */
    public getElectronNegativityPauling() : number {return this._element["electronegativity_pauling"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {string}
	 */
    public getBlock() : string {return this._element["block"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {string}
	 */
    public getSymbol() : string {return this._element["symbol"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {string}
	 */
    public getDiscoveryBy() : string {return this._element["discovered_by"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {string}
	 */
    public getNamedBy() : string {return this._element["named_by"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {string}
	 */
    public getSource() : string {return this._element["source"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {string}
	 */
    public getBohrModelImage() : string {return this._element["bohr_mode_image"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {string}
	 */
    public getBohrModel3D() : string {return this._element["bohr_model_3d"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {string}
	 */
    public getSpectralImg() : string {return this._element["spectral_img"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {string}
	 */
    public getSummary() : string {return this._element["summery"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {number}
	 */
    public getYpos() : number {return this._element["ypos"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {number}
	 */
    public getWXpos() : number {return this._element["wxpos"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {number}
	 */
    public getWYpos() : number {return this._element["wypos"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {number}
	 */
    public getXpos() : number {return this._element["xpos"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {[number]}
	 */
    public getShells() : [number]{

        return this._element["shells"];
    }
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {[number]}
	 */
    public getIonizationEnergies() : [number]{

        return this._element["ionization_energies"];
    }
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {string}
	 */
    public getCPKHEX() : string {return this._element["cpk-hex"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {object}
	 */
    public getImage() : object {return this._element["image"];}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {string}
	 */
    public getIonicType() : string {return this._ionicType;}
    /**
	 * Getter for named property
	 *
	 * @public
	 * @returns {number}
	 */
    public getIonicCharge() : number {return this._ionicCharge;}

    /**
	 * Sets the ionic charge of the atom and determines if its an ion
	 *
	 * @public
	 * @param {number} pCharge
	 */
    public setIonicCharge(pCharge : number) : void {
        this._ionicCharge = pCharge;

        if (pCharge == 0) {
            this._ionicType = "neutral";
        } else if (pCharge > 0) {
            this._ionicType = "Kation";
        } else {
            this._ionicType = "Anion";
        }
    }
    // Methods
}

export {Atom};

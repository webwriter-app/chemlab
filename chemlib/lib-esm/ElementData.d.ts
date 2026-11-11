type JsonPrimitive = string | number | boolean | null;
interface JsonMap extends Record<string, JsonPrimitive | JsonArray | JsonMap> {
}
interface JsonArray extends Array<JsonPrimitive | JsonArray | JsonMap> {
}
type Json = JsonPrimitive | JsonMap | JsonArray;
export declare abstract class ElementData {
    /**
     * A collection of data for each chemical element
     *
     * @static
     * @type {Json}
     */
    static data: Json;
    /**
     * Returns a datafield for given element
     *
     * @public
     * @static
     * @param {string} pElement - the name of the element
     * @returns {object}
     */
    static getData(pElement: string): object;
    /**
     * Returns a datafield of an element relative to another
     * @public
     * @static
     * @param {string} pElement - the name of the element to start from
     * @param {*} pDirection - the offset
     * @returns {string}
     */
    static getNameBeforeAfter(pElement: string, pDirection: any): string;
    /**
     * Returns a list of all names of Elements in order
     * @public
     * @static
     * @returns {string[]}
     */
    static getElementList(): string[];
}
export {};

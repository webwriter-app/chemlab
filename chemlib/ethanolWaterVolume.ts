// OIML R 22, §6.2, at 20 °C. Coefficients are in g/L, in ascending powers
// of the ethanol mass fraction. https://www.oiml.org/en/files/pdf_r/r022-e75.pdf
const densityCoefficients = [
	998.2012300, -192.9769495, 389.1238958, -1668.103923, 13522.15441,
	-88292.78388, 306287.4042, -613838.1234, 747017.2998, -547846.1354,
	223446.0334, -39032.85426,
];

function density(ethanolMassFraction: number): number {
	return densityCoefficients.reduceRight((sum, coefficient) =>
		coefficient + ethanolMassFraction * sum, 0);
}

const waterDensity = density(0);
const ethanolDensity = density(1);

export function ethanolWaterExcessVolume(waterGrams: number, ethanolGrams: number): number {
	if (!(waterGrams > 0 && ethanolGrams > 0)) return 0;
	const mass = waterGrams + ethanolGrams;
	return mass / density(ethanolGrams / mass) - waterGrams / waterDensity - ethanolGrams / ethanolDensity;
}

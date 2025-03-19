import readline from "readline";
import FileManager from "./FilesManager";

export default class Geogebra {
	static input(): Promise<void> {
		return new Promise((resolve) => {
			let functions: string[] = [];

			const rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout
			});

			const askForFunction = () => {
				rl.question("Escribe una función: ", (func) => {
					functions.push(func);

					Geogebra.checkAsymptotes(func);

					rl.question("¿Quieres escribir más funciones? (S/N): ", (answer) => {
						switch(answer.toUpperCase()) {
							case "N":
								rl.question("¿Cuál es el nombre del archivo de imagen? (sin extensión): ", (fileName) => {
									rl.close();

									Geogebra.generateGraph(functions, fileName).then();
									resolve();
								});
								break;

							case "S":
								askForFunction();
								break;

							default:
								console.log("Por favor, responde con S o N.");
								askForFunction();
						}
					});
				});
			};
			askForFunction();
		});
	}

	static async generateGraph(input: string[], fileName: string) {
		const GGBPlotter = require("node-geogebra").GGBPlotter;
		const plotter = new GGBPlotter({ggb: "local"});

		await plotter.evalGGBScript(input, 1280, 720);

		const svgContent = await plotter.exportSVG();

		new FileManager(svgContent, fileName).writeOnFile();

		await plotter.release();
	}

	static checkAsymptotes(functionString: string): void {
		const formatFunction = functionString.trim().toLowerCase();

		if(formatFunction.includes("/")) {
			//console.log(`Analizando asíntotas para la función: ${functionString}`);
			try {
				const rationalFunctionParts = this.extractRationalParts(formatFunction);
				if(rationalFunctionParts) {
					const {numerator, denominator} = rationalFunctionParts;
					const verticalAsymptotes = this.findVerticalAsymptotes(denominator);

					if(verticalAsymptotes.length > 0) {
						console.log(`Asíntotas verticales: x = ${verticalAsymptotes.join(", x = ")}`);
					}

					const horizontalAsymptote = this.findHorizontalAsymptote(numerator, denominator);

					if(horizontalAsymptote !== null) {
						console.log(`Asíntota horizontal: y = ${horizontalAsymptote}`);
					}
				}
			} catch(error) {
				console.log("ERROR: No se pudieron determinar las asíntotas automáticamente.");
			}
		}

		if(formatFunction.includes("log(") || formatFunction.includes("ln(")) {
			console.log(`La función ${functionString} tiene una asíntota vertical en el dominio del logaritmo.`);
		}

		if(formatFunction.includes("tan(")) {
			console.log(`La función ${functionString} tiene asíntotas verticales en x = π/2 + nπ, donde n es un entero.`);
		}
	}

	private static extractRationalParts(functionString: string): {numerator: string, denominator: string}|null {
		const match = functionString.match(/\(*(.*?)\)*\s*\/\s*\(*(.*?)\)*$/);

		if(match && match[1] && match[2]) {
			return {
				numerator: match[1],
				denominator: match[2]
			};
		}
		return null;
	}

	private static findVerticalAsymptotes(denominator: string): string[] {
		const asymptotes: string[] = [];
		const match = denominator.match(/\(?x\s*[-+]\s*(\d+|\d*\.\d+)\)?/g);

		if(match) {
			match.forEach(match => {
				const valueMatch = match.match(/x\s*([-+])\s*(\d+|\d*\.\d+)/);
				if(valueMatch) {
					const sign = valueMatch[1];
					const value = valueMatch[2];

					asymptotes.push(sign === "-"? value: `-${value}`);
				}
			});
		}

		if(denominator.trim() === "x") {
			asymptotes.push("0");
		}

		return asymptotes;
	}

	private static findHorizontalAsymptote(numerator: string, denominator: string): string|null { //!-No aplica para todos los casos-!
		const numeratorMatch = numerator.match(/(\d*\.?\d*)x/);
		const denominatorMatch = denominator.match(/(\d*\.?\d*)x/);

		if(!numerator.includes("x") && denominator.includes("x")) {
			return "0";
		}

		if(numeratorMatch && denominatorMatch) {
			const a = numeratorMatch[1]? parseFloat(numeratorMatch[1]) || 1: 1;
			const c = denominatorMatch[1]? parseFloat(denominatorMatch[1]) || 1: 1;
			return `${a / c}`;
		}

		return null;
	}
}
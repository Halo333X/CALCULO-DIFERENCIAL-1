import readline from 'readline';
import FileManager from './FilesManager';

export default class Geogebra {
  static input(): Promise<void> {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      let functions: string[] = [];
      
      const askForFunction = () => {
        rl.question('Escribe una función: ', (func) => {
          functions.push(func);

          rl.question('¿Quieres escribir más funciones? (S/N): ', (answer) => {
            if (answer.toUpperCase() === 'N') {
              rl.question('¿Cuál es el nombre del archivo de imagen? (sin extensión): ', (fileName) => {
                rl.close();
                Geogebra.generateGraph(functions, fileName);
                resolve();
              });
            } else if (answer.toUpperCase() === 'S') {
              askForFunction();
            } else {
              console.log('Por favor, responde con S o N.');
              askForFunction();
            }
          });
        });
      };
      askForFunction();
    });
  }

  static async generateGraph(input: string[], fileName: string) {
    const width = 1280;
    const height = 720;
    const GGBPlotter = require('node-geogebra').GGBPlotter;
    const plotter = new GGBPlotter({ ggb: 'local' });
    
    await plotter.evalGGBScript(input, width, height);
    const svgContent = await plotter.exportSVG();

    new FileManager(svgContent, fileName).writeOnFile();

    await plotter.release();
  }
}
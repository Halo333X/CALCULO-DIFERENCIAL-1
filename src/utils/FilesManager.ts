import fs from "fs";
import path from "path";
import {exec} from "child_process";

export default class FileManager {
	private readonly buffer: Buffer;
	private fileName: string;
	private readonly sanitizedFileName: string;
	private readonly path: string;

	constructor(buffer: Buffer, fileName: string) {
		this.buffer = buffer;
		this.fileName = fileName;
		this.sanitizedFileName = fileName.replace(/[\\/:*?"<>|]+/g, "_").replace(/(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i, "_reserved").replace(/[.\s]+$/, "");
		this.path = path.join(__dirname, "..", "..", "output", this.sanitizedFileName + ".svg");
	}

	writeOnFile() {
		fs.mkdirSync(path.dirname(this.path), {recursive: true});

		fs.writeFileSync(this.path, this.buffer);

		console.warn(`Archivo guardado exitosamente en: ${this.path}`);

		this.openFile();
	}

	openFile() {
		if(process.platform === "win32") {
			exec(`start ${this.path}`);
		} else if(process.platform === "darwin") {
			exec(`open ${this.path}`);
		} else {
			exec(`xdg-open ${this.path}`);
		}
	}
}
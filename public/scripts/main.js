class GraphGenerator {
    constructor() {
        this.expressionIdCounter = 0;
        this.calculator = null;
        this.init();
    }

    init() {
        document.getElementById("addFunctionForm").addEventListener("submit", (event) => {
            event.preventDefault();
            this.handleSubmit();
        });

        document.getElementById("addInputButton").addEventListener("click", (event) => {
            event.preventDefault();
            this.addInputField();
        });

        document.querySelector("input[type='submit']").addEventListener("click", (event) => {
            event.preventDefault();
            this.generateGraph();
        });
    }

    addExpression(latex) {
        if (latex && this.calculator) {
            this.expressionIdCounter++;
            this.calculator.setExpression({
                id: `graph${this.expressionIdCounter}`,
                latex: latex
            });
        }
    }

    handleSubmit() {
        const functionInputs = document.querySelectorAll(".functionInput");
        functionInputs.forEach(input => {
            const functionValue = input.value.trim();
            if (functionValue) {
                this.addExpression(functionValue);
                input.value = ''; // Limpiar campo de entrada
            }
        });
    }

    addInputField() {
        const container = document.getElementById("inputFieldsContainer");

        // Crear contenedor para el input y el botón
        const inputGroup = document.createElement("div");
        inputGroup.classList.add("input-group");

        // Crear el campo de entrada
        const newInput = document.createElement("input");
        newInput.type = "text";
        newInput.placeholder = "Escribe una función...";
        newInput.classList.add("functionInput");

        // Crear el botón de eliminar
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "x";
        deleteButton.classList.add("delete-btn");
        deleteButton.addEventListener("click", () => {
            inputGroup.remove();
        });

        // Añadir elementos al contenedor
        inputGroup.appendChild(newInput);
        inputGroup.appendChild(deleteButton);

        // Añadir el contenedor al formulario
        container.appendChild(inputGroup);
    }

    generateGraph() {
        const calculatorContainer = document.getElementById('calculator');

        // Mostrar la calculadora
        calculatorContainer.style.display = 'block';

        // Eliminar el gráfico anterior si existe
        if (this.calculator) {
            this.calculator.destroy();
        }

        // Limpiar el contenedor del gráfico para evitar residuos
        calculatorContainer.innerHTML = '';

        // Crear un nuevo gráfico
        this.calculator = Desmos.GraphingCalculator(calculatorContainer, {
            settingsMenu: false,
            keypad: false,
            expressions: false,
            zoomButtons: false,
            showResetButtonOnGraphpaper: false,
            border: false
        });

        // Agregar las funciones al gráfico y generar la tabla
        const functionInputs = document.querySelectorAll(".functionInput");
        const tableBody = document.getElementById("resultsTableBody");
        tableBody.innerHTML = ""; // Limpiar tabla anterior

        functionInputs.forEach(input => {
            const functionValue = input.value.trim();
            if (functionValue) {
                this.addExpression(functionValue);
                this.addTableRow(functionValue);
            }
        });
    }

    // Métodos para detectar asíntotas (convertidos de TS a JS)
    static extractRationalParts(functionString) {
        const match = functionString.match(/\(*(.*?)\)*\s*\/\s*\(*(.*?)\)*$/);

        if (match && match[1] && match[2]) {
            return {
                numerator: match[1],
                denominator: match[2]
            };
        }
        return null;
    }

    static findVerticalAsymptotes(denominator) {
        const asymptotes = [];
        const match = denominator.match(/\(?x\s*[-+]\s*(\d+|\d*\.\d+)\)?/g);

        if (match) {
            match.forEach(match => {
                const valueMatch = match.match(/x\s*([-+])\s*(\d+|\d*\.\d+)/);
                if (valueMatch) {
                    const sign = valueMatch[1];
                    const value = valueMatch[2];

                    asymptotes.push(sign === "-" ? value : `-${value}`);
                }
            });
        }

        if (denominator.trim() === "x") {
            asymptotes.push("0");
        }

        return asymptotes;
    }

    static findHorizontalAsymptote(numerator, denominator) {
        const numeratorMatch = numerator.match(/(\d*\.?\d*)x/);
        const denominatorMatch = denominator.match(/(\d*\.?\d*)x/);

        if (!numerator.includes("x") && denominator.includes("x")) {
            return "0";
        }

        if (numeratorMatch && denominatorMatch) {
            const a = numeratorMatch[1] ? parseFloat(numeratorMatch[1]) || 1 : 1;
            const c = denominatorMatch[1] ? parseFloat(denominatorMatch[1]) || 1 : 1;
            return `${a / c}`;
        }

        return null;
    }

    static checkAsymptotes(functionString) {
        const formatFunction = functionString.trim().toLowerCase();
        let results = {
            verticalAsymptotes: [],
            horizontalAsymptote: null,
            specialCaseMessage: null
        };

        if (formatFunction.includes("/")) {
            try {
                const rationalFunctionParts = this.extractRationalParts(formatFunction);
                if (rationalFunctionParts) {
                    const { numerator, denominator } = rationalFunctionParts;
                    results.verticalAsymptotes = this.findVerticalAsymptotes(denominator);
                    results.horizontalAsymptote = this.findHorizontalAsymptote(numerator, denominator);
                }
            } catch (error) {
                results.specialCaseMessage = "No se pudieron determinar las asíntotas automáticamente.";
            }
        }

        if (formatFunction.includes("log(") || formatFunction.includes("ln(")) {
            results.specialCaseMessage = "Tiene una asíntota vertical en el dominio del logaritmo.";
        }

        if (formatFunction.includes("tan(")) {
            results.specialCaseMessage = "Tiene asíntotas verticales en x = π/2 + nπ, donde n es un entero.";
        }

        return results;
    }

    addTableRow(func) {
        const tableBody = document.getElementById("resultsTableBody");
        const row = document.createElement("tr");
    
        const functionCell = document.createElement("td");
        functionCell.textContent = func;
    
        const asymptoteXCell = document.createElement("td");
        const asymptoteYCell = document.createElement("td");
        const limitCell = document.createElement("td");
    
        try {
            const parsedFunction = math.parse(func);
            const compiledFunction = parsedFunction.compile();
            
            // Usar el nuevo método para detectar asíntotas
            const asymptoteResults = GraphGenerator.checkAsymptotes(func);
            
            // Asíntotas verticales
            if (asymptoteResults.verticalAsymptotes.length > 0) {
                asymptoteXCell.textContent = asymptoteResults.verticalAsymptotes.map(x => `x = ${x}`).join(", ");
            } else {
                // Si el método nuevo no encontró asíntotas, usamos el método anterior como respaldo
                let asymptotesX = [];
                if (func.includes("/")) {
                    const parts = func.split("/");
                    if (parts.length === 2) {
                        const denominator = math.parse(parts[1]).compile();
                        let criticalPoints = [];
                        // Encontrar los puntos donde el denominador se vuelve 0
                        for (let x = -10; x <= 10; x += 0.1) {
                            try {
                                if (Math.abs(denominator.evaluate({ x })) < 1e-5) {
                                    criticalPoints.push(x);
                                }
                            } catch {}
                        }
                        // Ahora revisar esos puntos como posibles asíntotas verticales
                        asymptotesX = criticalPoints.map(x => `x = ${x.toFixed(2)}`);
                    }
                }
                asymptoteXCell.textContent = asymptotesX.length ? asymptotesX.join(", ") : "Ninguna";
            }
            
            // Asíntotas horizontales
            if (asymptoteResults.horizontalAsymptote !== null) {
                asymptoteYCell.textContent = `y = ${asymptoteResults.horizontalAsymptote}`;
            } else {
                // Si el método nuevo no encontró asíntotas horizontales, usamos el método anterior
                let limitPosInfinity = compiledFunction.evaluate({ x: 1e6 });
                let limitNegInfinity = compiledFunction.evaluate({ x: -1e6 });
                asymptoteYCell.textContent = limitPosInfinity === limitNegInfinity ? 
                    `y = ${limitPosInfinity.toFixed(2)}` : "Ninguna";
            }
            
            // Casos especiales (logaritmos, tangentes)
            if (asymptoteResults.specialCaseMessage) {
                asymptoteXCell.textContent += asymptoteResults.specialCaseMessage ? 
                    (asymptoteXCell.textContent !== "Ninguna" ? "; " : "") + asymptoteResults.specialCaseMessage : "";
            }
    
            // Calcular el límite en puntos donde el denominador es 0
            let verticalAsymptotes = asymptoteResults.verticalAsymptotes.length > 0 ? 
                asymptoteResults.verticalAsymptotes : 
                asymptoteXCell.textContent.split(", ").filter(a => a.startsWith("x = ")).map(a => a.replace("x = ", ""));
                
            let criticalLimits = verticalAsymptotes.map(xVal => {
                try {
                    let xValue = parseFloat(xVal);
                    let leftLimit = compiledFunction.evaluate({ x: xValue - 0.01 });
                    let rightLimit = compiledFunction.evaluate({ x: xValue + 0.01 });
                    return `lim x→${xValue}⁻: ${leftLimit < 0 ? '-∞' : '+∞'}, lim x→${xValue}⁺: ${rightLimit < 0 ? '-∞': '+∞'}`;
                } catch (e) {
                    return `lim x→${xVal}: No calculable`;
                }
            });
            
            limitCell.textContent = criticalLimits.length ? criticalLimits.join("; ") : "Ninguno";
        } catch (error) {
            asymptoteXCell.textContent = "N/A";
            asymptoteYCell.textContent = "N/A";
            limitCell.textContent = "N/A";
        }
    
        row.appendChild(functionCell);
        row.appendChild(asymptoteXCell);
        row.appendChild(asymptoteYCell);
        row.appendChild(limitCell);
    
        tableBody.appendChild(row);
    }    
}

const graphGenerator = new GraphGenerator();
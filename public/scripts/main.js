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
            
            // Buscar asíntotas verticales resolviendo el denominador = 0
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
    
            // Buscar asíntotas horizontales para funciones racionales
            let limitPosInfinity = compiledFunction.evaluate({ x: 1e6 });
            let limitNegInfinity = compiledFunction.evaluate({ x: -1e6 });
            asymptoteYCell.textContent = limitPosInfinity === limitNegInfinity ? `y = ${limitPosInfinity.toFixed(2)}` : "Ninguna";
    
            // Calcular el límite en puntos donde el denominador es 0
            let criticalLimits = asymptotesX.map(a => {
                let xVal = parseFloat(a.split("=")[1]);
                let leftLimit = compiledFunction.evaluate({ x: xVal - 0.01 });
                let rightLimit = compiledFunction.evaluate({ x: xVal + 0.01 });
                return `lim x→${xVal}⁻: ${leftLimit.toFixed(2)}, lim x→${xVal}⁺: ${rightLimit.toFixed(2)}`;
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
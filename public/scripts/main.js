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

        // Agregar las funciones al gráfico
        const functionInputs = document.querySelectorAll(".functionInput");
        functionInputs.forEach(input => {
            const functionValue = input.value.trim();
            if (functionValue) {
                this.addExpression(functionValue);
            }
        });
    }
}

const graphGenerator = new GraphGenerator();
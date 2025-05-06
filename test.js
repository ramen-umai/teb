let blocks = [];
let argumentCounter = 0;

document.getElementById("addArgument").addEventListener("click", () => {
    const container = document.getElementById("argumentsContainer");

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `引数${++argumentCounter}`;
    input.classList.add("arg-input");

    container.appendChild(input);
});

document.getElementById("addBlock").addEventListener("click", () => {
    const blockId = document.getElementById("blockId").value.trim();
    const blockText = document.getElementById("blockText").value.trim();
    const blockType = document.getElementById("blockType").value;
    const blockBody = document.getElementById("blockBody").value.trim();

    if (!blockId || !blockText || !blockBody) {
        alert("ID、テキスト、関数内容をすべて入力してください！");
        return;
    }

    if (blocks.some(block => block.id === blockId)) {
        alert("そのIDはすでに使われています！");
        return;
    }

    const argumentInputs = document.querySelectorAll(".arg-input");
    const argumentNames = Array.from(argumentInputs)
        .map(input => input.value.trim())
        .filter(name => name);

    const newBlock = {
        id: blockId,
        text: blockText,
        type: blockType,
        body: blockBody,
        arguments: argumentNames
    };

    blocks.push(newBlock);
    refreshBlockList();

    // 入力欄リセット
    document.getElementById("blockId").value = "";
    document.getElementById("blockText").value = "";
    document.getElementById("blockBody").value = "";
    document.getElementById("argumentsContainer").innerHTML = "";
    argumentCounter = 0;
});

function refreshBlockList() {
    const list = document.getElementById("blockList");
    list.innerHTML = "";

    blocks.forEach((block, index) => {
        const li = document.createElement("li");
        li.innerHTML = `[${block.text}] ${block.id}(${block.arguments.join(", ")}) (${block.type})`;

        const editBtn = document.createElement("button");
        editBtn.textContent = "編集";
        editBtn.addEventListener("click", () => {
            const newText = prompt("ブロックのテキストを変更", block.text);
            const newId = prompt("ID（関数名）を変更", block.id);
            const newBody = prompt("関数の処理（JSコード）を変更", block.body);

            if (blocks.some((b, i) => i !== index && b.id === newId)) {
                alert("そのIDはすでに使われています！");
                return;
            }

            block.text = newText.trim();
            block.id = newId.trim();
            block.body = newBody.trim();
            refreshBlockList();
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "削除";
        deleteBtn.addEventListener("click", () => {
            blocks.splice(index, 1);
            refreshBlockList();
        });

        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}

document.getElementById("generateCode").addEventListener("click", () => {
    const extensionName = document.getElementById("extName").value.trim();
    if (!extensionName) {
        alert("拡張機能の名前を入力してください！");
        return;
    }

    const generatedCode = generateCode(extensionName);
    document.getElementById("output").textContent = generatedCode;
});

function generateCode(extensionName) {
    const blockDefs = blocks.map(block => `
                {
                    opcode: "${block.id}",
                    blockType: Scratch.BlockType.${block.type},
                    text: "${block.text}",
                    arguments: {
                        ${block.arguments.map(arg => `${arg}: { type: Scratch.ArgumentType.STRING, defaultValue: "" }`).join(",\n                        ")}
                    }
                }`).join(",\n");

    const funcDefs = blocks.map(block => `
    ${block.id}(${block.arguments.join(", ")}) {
        ${block.body}
    }`).join("\n");

    return `
class ${extensionName} {
    getInfo() {
        return {
            id: "${extensionName}",
            name: "${extensionName}",
            blocks: [
${blockDefs}
            ]
        };
    }

${funcDefs}
}

Scratch.extensions.register(new ${extensionName}());
`.trim();
}

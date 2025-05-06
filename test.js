// test.js - TurboWarp Extension Builder v0.5

let blocks = [];

// ブロックを追加
document.getElementById("addBlock").addEventListener("click", () => {
    const blockId = document.getElementById("blockId").value.trim();
    const blockText = document.getElementById("blockText").value.trim();
    const blockType = document.getElementById("blockType").value;
    const blockBody = document.getElementById("blockBody").value.trim();

    const argumentField = document.getElementById("blockArguments");
    const argumentList = argumentField.value.split(",").map(a => a.trim()).filter(a => a);

    if (!blockId || !blockText || !blockBody) {
        alert("ID、テキスト、関数内容をすべて入力してください！");
        return;
    }

    if (blocks.some(block => block.id === blockId)) {
        alert("そのIDはすでに使われています！");
        return;
    }

    const newBlock = {
        id: blockId,
        text: blockText,
        type: blockType,
        body: blockBody,
        arguments: argumentList
    };

    blocks.push(newBlock);
    refreshBlockList();
    clearForm();
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
            const newArgs = prompt("引数（カンマ区切り）を変更", block.arguments.join(", "));
            const newBody = prompt("関数の処理（JSコード）を変更", block.body);

            if (!newText || !newId || !newBody) return;

            if (blocks.some((b, i) => i !== index && b.id === newId)) {
                alert("そのIDはすでに使われています！");
                return;
            }

            block.text = newText.trim();
            block.id = newId.trim();
            block.arguments = newArgs.split(",").map(a => a.trim()).filter(a => a);
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
    const extensionId = document.getElementById("extId").value.trim();
    if (!extensionId) {
        alert("拡張機能のIDを入力してください！");
        return;
    }
    const code = generateCode(extensionName, extensionId);
    document.getElementById("output").textContent = code;
});

function generateCode(extensionName, extensionId) {
    const color1 = document.getElementById("color1").value;
    const color2 = document.getElementById("color2").value;
    const color3 = document.getElementById("color3").value;

    // ブロック定義を作成
    const blockDefs = blocks.map(block => `
                {
                    opcode: "${block.id}",
                    blockType: Scratch.BlockType.${block.type},
                    text: "${block.text}",
                    arguments: {
                        ${block.arguments.map(arg => `${arg}: { type: Scratch.ArgumentType.STRING, defaultValue: "" }`).join(",\n                        ")}
                    }
                }`).join(",\n");

    // 関数定義を作成（引数が空なら args を使わない）
    const funcDefs = blocks.map(block => {
        const hasArgs = block.arguments.length > 0;
        const funcHeader = `${block.id}(${hasArgs ? "args" : ""}) {`;
        const argExtracts = hasArgs
            ? block.arguments.map(arg => `const ${arg} = args.${arg};`).join("\n        ") + "\n        "
            : "";
        return `
    ${funcHeader}
        ${argExtracts}${block.body}
    }`;
    }).join("\n");

    // 最終出力
    return `
class ${extensionName} {
    getInfo() {
        return {
            id: "${extensionId}",
            name: "${extensionName}",
            color1: "${color1}",
            color2: "${color2}",
            color3: "${color3}",
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


function clearForm() {
    document.getElementById("blockId").value = "";
    document.getElementById("blockText").value = "";
    document.getElementById("blockBody").value = "";
    document.getElementById("blockArguments").value = "";
}

document.getElementById("copyCode").addEventListener("click", () => {
    const code = document.getElementById("output").textContent;
    navigator.clipboard.writeText(code).then(() => {
        alert("コードをコピーしました！");
    });
});

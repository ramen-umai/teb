let blocks = [];

// ブロックを追加
document.getElementById("addBlock").addEventListener("click", () => {
    const blockId = document.getElementById("blockId").value.trim();
    const blockText = document.getElementById("blockText").value.trim();
    const blockType = document.getElementById("blockType").value;
    const blockBody = document.getElementById("blockBody").value.trim();

    // 引数を , 区切りで取得
    const argumentField = document.getElementById("blockArguments");
    const argumentList = argumentField.value.split(",").map(a => a.trim()).filter(a => a);

    // 入力チェック
    if (!blockId || !blockText || !blockBody) {
        alert("ID、テキスト、関数内容をすべて入力してください！");
        return;
    }

    // IDの重複チェック
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
    refreshBlockList(); // リストを更新
    clearForm(); // 入力をリセット
});

// ブロックリスト更新
function refreshBlockList() {
    const list = document.getElementById("blockList");
    list.innerHTML = "";

    blocks.forEach((block, index) => {
        const li = document.createElement("li");
        li.innerHTML = `[${block.text}] ${block.id}(${block.arguments.join(", ")}) (${block.type})`;

        // 編集ボタン
        const editBtn = document.createElement("button");
        editBtn.textContent = "編集";
        editBtn.addEventListener("click", () => {
            const newText = prompt("ブロックのテキストを変更", block.text);
            const newId = prompt("ID（関数名）を変更", block.id);
            const newArgs = prompt("引数（カンマ区切り）を変更", block.arguments.join(", "));
            const newBody = prompt("関数の処理（JSコード）を変更", block.body);

            if (!newText || !newId || !newBody) return;

            // 重複チェック（自分以外に同じIDがないか）
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

        // 削除ボタン
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

// コード生成
document.getElementById("generateCode").addEventListener("click", () => {
    const extensionName = document.getElementById("extName").value.trim();
    if (!extensionName) {
        alert("拡張機能の名前を入力してください！");
        return;
    }

    const code = generateCode(extensionName);
    document.getElementById("output").textContent = code;
});

function generateCode(extensionName) {
    const color1 = document.getElementById("color1").value;
    const color2 = document.getElementById("color2").value;
    const color3 = document.getElementById("color3").value;

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

// 入力フォームをクリア
function clearForm() {
    document.getElementById("blockId").value = "";
    document.getElementById("blockText").value = "";
    document.getElementById("blockBody").value = "";
    document.getElementById("blockArguments").value = "";
}

// コピーボタン機能
document.getElementById("copyCode").addEventListener("click", () => {
    const code = document.getElementById("output").textContent;
    navigator.clipboard.writeText(code).then(() => {
        alert("コードをコピーしました！");
    });
});

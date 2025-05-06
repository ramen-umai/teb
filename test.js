let blocks = [];

// 引数用の入力欄を管理するための変数
let argumentCounter = 0;

// ブロックを追加
document.getElementById("addBlock").addEventListener("click", () => {
    const blockId = document.getElementById("blockId").value.trim();
    const blockText = document.getElementById("blockText").value.trim();
    const blockType = document.getElementById("blockType").value;
    const blockBody = document.getElementById("blockBody").value.trim();

    // 必須項目の確認
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
        arguments: []  // 引数は後で追加
    };

    blocks.push(newBlock);
    refreshBlockList(); // リストを更新
});

// 引数を追加
document.getElementById("addArgument").addEventListener("click", () => {
    const blockId = document.getElementById("blockId").value.trim();

    if (!blockId) {
        alert("引数を追加するブロックIDを入力してください！");
        return;
    }

    const block = blocks.find(b => b.id === blockId);
    if (!block) {
        alert(`ID "${blockId}" のブロックが見つかりません！`);
        return;
    }

    // 新しい引数のための入力欄を作成
    const argumentInput = document.createElement("input");
    argumentInput.type = "text";
    argumentInput.placeholder = `引数${++argumentCounter}`;
    argumentInput.id = `argumentInput${argumentCounter}`;

    const addArgumentButton = document.createElement("button");
    addArgumentButton.textContent = "引数追加";
    addArgumentButton.addEventListener("click", () => {
        const argumentValue = document.getElementById(`argumentInput${argumentCounter}`).value.trim();
        if (argumentValue) {
            block.arguments.push(argumentValue);  // 引数を追加
            refreshBlockList();  // リストを再表示
        }
    });

    // 引数入力欄を表示
    const argumentsContainer = document.createElement("div");
    argumentsContainer.appendChild(argumentInput);
    argumentsContainer.appendChild(addArgumentButton);
    document.body.appendChild(argumentsContainer);
});

// ブロックリストを更新
function refreshBlockList() {
    const list = document.getElementById("blockList");
    list.innerHTML = ""; // 既存のリストをクリア

    blocks.forEach((block, index) => {
        const li = document.createElement("li");

        // ブロックの表示
        li.innerHTML = `[${block.text}] ${block.id}() (${block.type})`;

        // 引数を表示
        if (block.arguments.length > 0) {
            li.innerHTML += ` - 引数: ${block.arguments.join(", ")}`;
        }

        // 編集ボタン
        const editBtn = document.createElement("button");
        editBtn.textContent = "編集";
        editBtn.addEventListener("click", () => {
            const newText = prompt("ブロックのテキストを変更", block.text);
            const newId = prompt("ID（関数名）を変更", block.id);
            const newBody = prompt("関数の処理（JSコード）を変更", block.body);

            // 重複チェック
            if (blocks.some((b, i) => i !== index && b.id === newId)) {
                alert("そのIDはすでに使われています！");
                return;
            }

            block.text = newText.trim();
            block.id = newId.trim();
            block.body = newBody.trim();

            refreshBlockList();  // リストを再表示
        });

        // 削除ボタン
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "削除";
        deleteBtn.addEventListener("click", () => {
            blocks.splice(index, 1);  // ブロックを削除
            refreshBlockList();  // リストを再表示
        });

        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}

// コード生成ボタン
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
                ${block.arguments.map(arg => `${arg}: { type: "string", defaultValue: "" }`).join(",\n                ")}
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


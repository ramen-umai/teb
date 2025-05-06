const blocks = [];

function refreshBlockList() {
  const list = document.getElementById("blockList");
  list.innerHTML = "";

  blocks.forEach((block, index) => {
    const li = document.createElement("li");
    li.textContent = `[${block.type}] ${block.text} → ${block.id}()`;

    // 引数表示
    if (block.arguments && block.arguments.length > 0) {
      const argsText = block.arguments.map(arg => `${arg.name} (${arg.type})`).join(", ");
      li.textContent += ` [Arguments: ${argsText}]`;
    }

    // 🖊 Editボタン（引数も含めて編集）
    const editBtn = document.createElement("button");
    editBtn.classList.add("edit");
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => {
      const newText = prompt("ブロックのテキストを変更", block.text);
      const newId = prompt("ID（関数名）を変更", block.id);
      const newBody = prompt("関数の処理（JSコード）を変更", block.body);
      const trimmedId = newId.trim();

      // 🔒 重複チェック（今のIDと違う場合のみ）
      const idExists = blocks.some((b, i) => i !== index && b.id === trimmedId);
      if (idExists) {
        alert("そのIDはすでに使われています！");
        return;
      }

      block.text = newText.trim();
      block.id = trimmedId;
      block.opcode = trimmedId;
      block.body = newBody.trim();

      refreshBlockList();
    });

    // ❌ Deleteボタン
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      blocks.splice(index, 1);
      refreshBlockList();
    });

    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

document.getElementById("addBlock").addEventListener("click", () => {
  const id = document.getElementById("blockId").value.trim();
  const text = document.getElementById("blockText").value.trim();
  const type = document.getElementById("blockType").value;
  const body = document.getElementById("blockBody").value.trim();

  if (!id || !text || !body) {
    alert("ID, テキスト, 処理内容（関数本体）を入力してね！");
    return;
  }

  // 🔒 重複チェック
  const exists = blocks.some(block => block.id === id);
  if (exists) {
    alert("そのIDはすでに使われています！");
    return;
  }

  const block = { id, opcode: id, text, type, body };
  blocks.push(block);

  refreshBlockList();
});

document.getElementById("addArgument").addEventListener("click", () => {
  const argName = prompt("引数の名前を入力");
  const argType = prompt("引数の型を入力（例: STRING, NUMBER, COLOR）");
  const blockId = document.getElementById("blockId").value.trim();
  const block = blocks.find(b => b.id === blockId);

  if (!block) {
    alert("ブロックが見つかりません！");
    return;
  }

  block.arguments = block.arguments || [];
  block.arguments.push({ name: argName, type: argType.toUpperCase() });

  refreshBlockList();
});

document.getElementById("generateCode").addEventListener("click", () => {
  const name = document.getElementById("extName").value || "MyExtension";
  const code = generateExtensionCode(name, blocks);
  document.getElementById("output").textContent = code;
});

function generateExtensionCode(name, blocks) {
  const blockDefs = blocks.map(block => {
    const argsDef = block.arguments ? 
      block.arguments.map(arg => `${arg.name}: { type: Scratch.ArgumentType.${arg.type} }`).join(", ") : "";

    return `
      {
          opcode: "${block.id}",
          blockType: Scratch.BlockType.${block.type},
          text: "${block.text}",
          arguments: { ${argsDef} }
      }`;
  }).join(",");

  const funcDefs = blocks.map(block => `
    ${block.id}() {
        // 関数本体（JSコード）
        ${block.body}
    }`).join("\n");

  return `
class ${name} {
    getInfo() {
        return {
            id: "${name.toLowerCase()}",
            name: "${name}",
            blocks: [${blockDefs}]
        };
    }

${funcDefs}
}

Scratch.extensions.register(new ${name}());
`.trim();
}

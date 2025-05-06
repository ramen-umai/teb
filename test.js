// グローバル変数にブロックのリストを保持
let blocks = [];

// ブロック追加ボタンのイベントリスナー
document.getElementById("addBlock").addEventListener("click", () => {
  // ユーザーからブロックのID、テキスト、JSコードを入力してもらう
  const blockId = prompt("ブロックのID（関数名）を入力");
  const blockText = prompt("ブロックのテキストを入力");
  const blockBody = prompt("ブロックのJSコードを入力");

  const trimmedId = blockId.trim();

  // ID重複チェック
  const idExists = blocks.some(b => b.id === trimmedId);
  if (idExists) {
    alert("そのIDはすでに使われています！");
    return;
  }

  // 新しいブロックの追加
  const newBlock = {
    id: trimmedId,
    text: blockText.trim(),
    body: blockBody.trim(),
    arguments: [] // 引数を初期化
  };

  blocks.push(newBlock);
  refreshBlockList();  // ブロックリストを再表示
});

// 引数を追加するボタンのイベントリスナー
document.getElementById("addArgument").addEventListener("click", () => {
  const argName = prompt("引数の名前を入力");
  const argType = prompt("引数の型を入力（例: STRING, NUMBER, COLOR）");

  const blockId = document.getElementById("blockId").value.trim(); // 現在選ばれているIDを取得

  if (!blockId) {
    alert("IDを入力してください！");
    return;
  }

  const block = blocks.find(b => b.id === blockId); // ブロックIDが一致するものを検索

  if (!block) {
    alert(`ID "${blockId}" のブロックが見つかりません！`);
    return;
  }

  // 引数を追加
  block.arguments.push({ name: argName, type: argType.toUpperCase() });

  refreshBlockList(); // 引数を追加した後にブロックリストを再表示
});

// ブロックリストの更新
function refreshBlockList() {
  const list = document.getElementById("blockList");
  list.innerHTML = "";  // リストをクリア

  blocks.forEach((block, index) => {
    const li = document.createElement("li");
    li.textContent = `[${block.type}] ${block.text} → ${block.id}()`;

    // 引数があれば表示
    if (block.arguments && block.arguments.length > 0) {
      const argsText = block.arguments.map(arg => `${arg.name} (${arg.type})`).join(", ");
      li.textContent += ` [Arguments: ${argsText}]`;
    }

    // 編集ボタン
    const editBtn = document.createElement("button");
    editBtn.classList.add("edit");
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => {
      const newText = prompt("ブロックのテキストを変更", block.text);
      const newId = prompt("ID（関数名）を変更", block.id);
      const newBody = prompt("関数の処理（JSコード）を変更", block.body);

      const trimmedId = newId.trim();

      // 重複チェック
      const idExists = blocks.some((b, i) => i !== index && b.id === trimmedId);
      if (idExists) {
        alert("そのIDはすでに使われています！");
        return;
      }

      block.text = newText.trim();
      block.id = trimmedId;
      block.opcode = trimmedId;
      block.body = newBody.trim();

      refreshBlockList();  // リスト再表示
    });

    // 削除ボタン
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      blocks.splice(index, 1);
      refreshBlockList();  // リスト再表示
    });

    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

// コード生成
function generateCode() {
  const name = "MyExtension"; // 拡張機能名（固定にしている場合）
  
  const blockDefs = blocks.map(block => `
    { opcode: "${block.id}", blockType: Scratch.BlockType.REPORTER, text: "${block.text}" }`).join(",\n");

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

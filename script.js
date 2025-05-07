    const blocks = [];

    // 引数追加
    document.getElementById("addArg").addEventListener("click", () => {
      const area = document.getElementById("argumentsArea");
      const div = document.createElement("div");
      div.className = "arg-row";
      div.innerHTML = `
        <input type="text" placeholder="引数名">
        <select>
          <option value="STRING">STRING - テキスト(appleなど)</option>
          <option value="NUMBER">NUMBER - 数値(1,4など..)</option>
          <option value="BOOLEAN">BOOLEAN - 真偽値(true,false)</option>
        </select>
        <button>削除</button>
      `;
      div.querySelector("button").addEventListener("click", () => div.remove());
      area.appendChild(div);
    });

    // ブロック追加
    document.getElementById("addBlock").addEventListener("click", () => {
      const id = document.getElementById("blockId").value.trim();
      const text = document.getElementById("blockText").value.trim();
      const type = document.getElementById("blockType").value;
      const body = document.getElementById("blockBody").value;

      const argsArea = document.getElementById("argumentsArea");
      const args = Array.from(argsArea.children).map(div => {
        const name = div.querySelector("input").value.trim();
        const argType = div.querySelector("select").value;
        return { name, type: argType };
      }).filter(arg => arg.name);

      blocks.push({ id, text, type, body, args });
      renderBlockList();
    });

    function renderBlockList() {
      const list = document.getElementById("blockList");
      list.innerHTML = "";
      for (const block of blocks) {
        const li = document.createElement("li");
        li.textContent = `${block.text} (${block.id}) - ${block.args.map(a => a.name + ':' + a.type).join(", ")}`;
        list.appendChild(li);
      }
    }

    // コード生成
    document.getElementById("generateCode").addEventListener("click", () => {
      const name = document.getElementById("extName").value.trim();
      const id = document.getElementById("extId").value.trim();
      const color1 = document.getElementById("color1").value;
      const color2 = document.getElementById("color2").value;
      const color3 = document.getElementById("color3").value;

      const blockDefs = blocks.map(block => `{
          opcode: "${block.id}",
          blockType: Scratch.BlockType.${block.type},
          text: "${block.text}",
          arguments: {
              ${block.args.map(arg => `${arg.name}: { type: Scratch.ArgumentType.${arg.type}, defaultValue: "" }`).join(",\n              ")}
          }
      }`).join(",\n");

      const funcDefs = blocks.map(block => {
        const hasArgs = block.args.length > 0;
        const argLines = block.args.map(arg => `const ${arg.name} = args.${arg.name};`).join("\n        ");
        return `${block.id}(${hasArgs ? "args" : ""}) {
        ${hasArgs ? argLines + "\n        " : ""}${block.body}
    }`;
      }).join("\n\n");

      const fullCode = `class ${id} {
    getInfo() {
        return {
            id: "${id}",
            name: "${name}",
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

Scratch.extensions.register(new ${id}());`;

      document.getElementById("output").textContent = fullCode;
    });

    // コピーボタン
    document.getElementById("copyCode").addEventListener("click", () => {
      const code = document.getElementById("output").textContent;
      navigator.clipboard.writeText(code).then(() => console.log("コードをコピーしました"));
    });

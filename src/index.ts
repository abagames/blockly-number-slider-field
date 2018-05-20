const toolbox = `
<xml>
<block type="controls_if"></block>
<block type="logic_compare"></block>
<block type="controls_repeat_ext"></block>
<block type="math_number">
  <field name="NUM">123</field>
</block>
<block type="math_arithmetic"></block>
<block type="text"></block>
<block type="text_print"></block>
</xml>
`;

const blocklyArea = document.getElementById("blocklyArea");
const blocklyDiv = document.getElementById("blocklyDiv");
const workspacePlayground = Blockly.inject(blocklyDiv, { toolbox });

function resizeBlocklyDiv(e: UIEvent = null) {
  let element: any = blocklyArea;
  let x = 0;
  let y = 0;
  do {
    x += element.offsetLeft;
    y += element.offsetTop;
    element = element.offsetParent;
  } while (element);
  blocklyDiv.style.left = x + "px";
  blocklyDiv.style.top = y + "px";
  blocklyDiv.style.width = blocklyArea.offsetWidth + "px";
  blocklyDiv.style.height = blocklyArea.offsetHeight + "px";
}

window.addEventListener("resize", resizeBlocklyDiv, false);
resizeBlocklyDiv();
(<any>Blockly.svgResize)(workspacePlayground);

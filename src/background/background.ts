import OBR, { isImage } from "@owlbear-rodeo/sdk";
import { TOOL_ID, MODE_ID } from "../ids";
import { defaultToolMetadata } from "../types";
import { closePopover, createPopover, switchToDefaultTool } from "../utils";
import { buildAura } from "./buildAura";
export const icon = new URL(
  "../assets/sun.svg#icon",
  import.meta.url,
).toString();

OBR.onReady(async () => {
  printVersionToConsole();

  createTool();
  createMode();

  handleActiveTool();
  handleSceneClose();
});

async function printVersionToConsole() {
  fetch("/manifest.json")
    .then((response) => response.json())
    .then((json) =>
      console.log(json["name"] + " - version: " + json["version"]),
    );
}

function createTool() {
  OBR.tool.create({
    id: TOOL_ID,
    icons: [
      {
        icon: icon,
        label: "Auras",
      },
    ],
    onClick: () => {
      createPopover();
      return true;
    },
    defaultMetadata: defaultToolMetadata,
  });
}

function createMode() {
  OBR.tool.createMode({
    id: MODE_ID,
    icons: [
      {
        icon: icon,
        label: "Auras Applicator",
        filter: {
          activeTools: [TOOL_ID],
        },
      },
    ],
    cursors: [
      {
        cursor: "pointer",
        filter: {
          target: [
            {
              key: "layer",
              value: "CHARACTER",
              operator: "==",
              coordinator: "||",
            },
            {
              key: "layer",
              value: "PROP",
              operator: "==",
              coordinator: "||",
            },
            { key: "layer", value: "MOUNT", operator: "==" },
            { key: "locked", value: true, operator: "!=" },
            { key: "image", value: undefined, operator: "!=" },
          ],
        },
      },
      {
        cursor: "move",
      },
    ],
    onToolClick: async (_context, event) => {
      const target = event?.target;
      if (
        target &&
        isImage(target) &&
        target.locked === false &&
        (target.layer === "CHARACTER" ||
          target.layer === "MOUNT" ||
          target.layer === "PROP")
      ) {
        const aura = await buildAura(target);
        OBR.scene.items.addItems([aura]);
      }
    },
    preventDrag: {
      dragging: true,
    },
  });
}

async function handleActiveTool() {
  if ((await OBR.tool.getActiveTool()) === TOOL_ID) createPopover();
  OBR.tool.onToolChange((id) => {
    if (id === TOOL_ID) createPopover();
    else closePopover();
  });
}

async function handleSceneClose() {
  if (!(await OBR.scene.isReady())) switchToDefaultTool();
  OBR.scene.onReadyChange((ready) => {
    if (!ready) switchToDefaultTool();
  });
}

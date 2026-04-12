import OBR, { buildShape, isImage, Math2 } from "@owlbear-rodeo/sdk";
import { TOOL_ID, MODE_ID } from "../ids";
import { defaultToolMetadata, isToolMetadata } from "../types";
import {
  closePopover,
  createPopover,
  getImageBounds,
  getImageCenter,
  switchToDefaultTool,
} from "../utils";
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
        const sceneDpi = await OBR.scene.grid.getDpi();
        const { width } = getImageBounds(target, sceneDpi);

        const metadata = await OBR.tool.getMetadata(TOOL_ID);
        const toolMetadata = { ...defaultToolMetadata, ...metadata };
        if (!isToolMetadata(toolMetadata)) throw "Error bad metadata";
        const aura =
          toolMetadata.shape === "CIRCLE"
            ? buildShape()
                .id(`${target.id}-aura`)
                .shapeType("CIRCLE")
                .position(getImageCenter(target, sceneDpi))
                .attachedTo(target.id)
                .width(width + sceneDpi * toolMetadata.radius * 2)
                .height(width + sceneDpi * toolMetadata.radius * 2)
                .fillColor(toolMetadata.color)
                .fillOpacity(toolMetadata.opacity / 100)
                .strokeWidth(0)
                .locked(true)
                .disableAutoZIndex(true)
                .zIndex(-10000000)
                // .disableAttachmentBehavior(["SCALE"])
                .build()
            : buildShape()
                .id(`${target.id}-aura`)
                .shapeType("RECTANGLE")
                .position(
                  Math2.subtract(getImageCenter(target, sceneDpi), {
                    x: width / 2 + sceneDpi * toolMetadata.radius,
                    y: width / 2 + sceneDpi * toolMetadata.radius,
                  }),
                )
                .attachedTo(target.id)
                .disableAttachmentBehavior(["ROTATION"])
                .width(width + sceneDpi * toolMetadata.radius * 2)
                .height(width + sceneDpi * toolMetadata.radius * 2)
                .fillColor(toolMetadata.color)
                .fillOpacity(toolMetadata.opacity / 100)
                .strokeWidth(0)
                .locked(true)
                .disableAutoZIndex(true)
                .zIndex(-10000000)
                // .disableAttachmentBehavior(["SCALE"])
                .build();
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

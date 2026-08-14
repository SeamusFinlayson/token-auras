import OBR, { buildShape, Math2, Image } from "@owlbear-rodeo/sdk";
import { TOOL_ID } from "../ids";
import { defaultToolMetadata, isToolMetadata } from "../types";
import { getImageBounds, getImageCenter } from "../utils";

export async function buildAura(target: Image) {
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
  return aura;
}

import React, { useRef } from "react";
import { Text } from "react-konva";
import { useEditor } from "../useEditor.js";

const TextNode = ({ obj, onSelect, onDragEnd, onTransformEnd, onEdit, isEditing }) => {
  const { selectedId } = useEditor();
  const ref = useRef(null);
  const isSelected = selectedId === obj.id;

  return (
    <Text
      ref={ref}
      id={obj.id}
      x={obj.x}
      y={obj.y}
      width={obj.width}
      height={obj.height}
      rotation={obj.rotation ?? 0}
      opacity={obj.opacity ?? 1}
      visible={!isEditing}
      text={obj.text ?? ""}
      fontSize={obj.fontSize ?? 24}
      fontFamily={obj.fontFamily ?? "NeueHaasGroteskDisplayW02Bold, sans-serif"}
      fill={obj.fill ?? "#111111"}
      align={obj.align ?? "left"}
      draggable
      onClick={() => onSelect(obj.id)}
      onTap={() => onSelect(obj.id)}
      onDblClick={() => onEdit?.(obj.id)}
      onDblTap={() => onEdit?.(obj.id)}
      onDragEnd={(e) => onDragEnd(obj.id, e)}
      onTransformEnd={(e) => onTransformEnd(obj.id, e, ref)}
      stroke={isSelected ? "transparent" : undefined}
    />
  );
};

export default TextNode;

/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import "./TreeSelector.scss";
import { useMemo, useState } from "react";
import { MenuItem, Select } from "@itwin/itwinui-react";

import type { SelectOption } from "@itwin/itwinui-react";
import type { SelectableTreeRenderProps } from "./SelectableTree.js";

/**
 * A definition for trees displayed in `TreeSelector`
 * @internal
 */
export interface TreeContentDefinition {
  id: string;
  label: string;
  render: (props: SelectableTreeRenderProps) => React.ReactNode;
  startIcon?: React.ReactNode;
}

/**
 * Props for `TreeSelector`
 * @internal
 */
export interface TreeSelectorProps {
  defaultSelectedContentId: string;
  trees: TreeContentDefinition[];
  density?: "enlarged" | "default";
  onPerformanceMeasured?: (feature: string, elapsedTime: number) => void;
  onFeatureUsed?: (feature: string) => void;
}

/**
 * A component that accepts a list of trees and renders a select box at the top,
 * allowing to choose which of the provided tree components should be rendered at the bottom.
 * @internal
 */
export function TreeSelector(props: TreeSelectorProps) {
  const [selectedContentId, setSelectedContentId] = useState(props.defaultSelectedContentId);
  const selectedContent = props.trees.find((c) => c.id === selectedContentId) ?? props.trees[0];
  const isEnlarged = props.density === "enlarged";

  const options = useMemo(() => {
    return props.trees.map((c) => ({ label: c.label, value: c.id, startIcon: c.startIcon })) as SelectOption<string>[];
  }, [props.trees]);

  return (
    <div className="presentation-components-tree-selector-content">
      <div className="presentation-components-tree-selector-content-header">
        {options.length > 0 && (
          <Select
            options={options}
            value={selectedContent.id}
            size={isEnlarged ? "large" : "small"}
            onChange={(treeId: string) => {
              props.onFeatureUsed?.(`choose-${treeId}`);
              setSelectedContentId(treeId);
            }}
            itemRenderer={(option, itemProps) => (
              <MenuItem {...option} isSelected={itemProps.isSelected} size={isEnlarged ? "large" : "default"}>
                {option.label}
              </MenuItem>
            )}
          />
        )}
      </div>
      <div className="presentation-components-tree-selector-content-wrapper">
        {selectedContent?.render({ density: props.density, onPerformanceMeasured: props.onPerformanceMeasured, onFeatureUsed: props.onFeatureUsed })}
      </div>
    </div>
  );
}

import { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";

import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import EmployeeCard from "../EmployeeCard/EmployeeCard";
import TreeConnector from "../TreeConnector/TreeConnector";
import type { OrgTreeNode, EmployeeNode } from "../types";

export type TreeNodeProps = {
  node: OrgTreeNode | EmployeeNode | any;
  onReparent?: (node: OrgTreeNode | EmployeeNode | any) => void;
  defaultExpanded?: boolean;
};

export default function TreeNode({
  node,
  onReparent,
  defaultExpanded = true,
}: TreeNodeProps) {
  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);

  const children: any[] = node?.children ?? [];
  const hasChildren = children.length > 0;

  return (
    <Stack sx={{ alignItems: "center" }}>
      {/* Current Position Node Card */}
      <EmployeeCard employee={node} onReparent={onReparent} />

      {/* Expand / Collapse Toggle Pill (if node has direct reports) */}
      {hasChildren && (
        <ButtonBase
          onClick={() => setExpanded((prev) => !prev)}
          sx={{
            mt: 1,
            mb: 0.5,
            px: 1.5,
            py: 0.3,
            borderRadius: "20px",
            backgroundColor: expanded ? "action.hover" : "primary.main",
            color: expanded ? "text.secondary" : "#FFFFFF",
            border: "1px solid",
            borderColor: expanded ? "divider" : "primary.main",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: "11px",
            fontWeight: 700,
            boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
            transition: "all 0.15s ease-in-out",
            "&:hover": {
              backgroundColor: expanded ? "divider" : "primary.dark",
            },
          }}
        >
          {expanded ? (
            <>
              <ExpandLessIcon sx={{ fontSize: 14 }} />
              <Typography sx={{ fontSize: "11px", fontWeight: 700 }}>
                Hide {children.length} {children.length === 1 ? "report" : "reports"}
              </Typography>
            </>
          ) : (
            <>
              <ExpandMoreIcon sx={{ fontSize: 14 }} />
              <Typography sx={{ fontSize: "11px", fontWeight: 700 }}>
                Show {children.length} {children.length === 1 ? "report" : "reports"}
              </Typography>
            </>
          )}
        </ButtonBase>
      )}

      {/* Children Subtrees (when expanded) */}
      {hasChildren && expanded && (
        <>
          {/* Connector Branch Lines */}
          <TreeConnector childCount={children.length} />

          {/* Children Row Container */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 4,
            }}
          >
            {children.map((childNode, index) => (
              <TreeNode
                key={childNode?.id || childNode?._id || index}
                node={childNode}
                onReparent={onReparent}
                defaultExpanded={true}
              />
            ))}
          </Box>
        </>
      )}
    </Stack>
  );
}
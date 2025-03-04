import { Edge, Node } from '@xyflow/react';

// Custom game skill tree layout algorithm with better vertical organization
export const getLayoutedElements = (nodes: Node[], edges: Edge[], nodeHeight?: number) => {
  if (nodes.length === 0) return { nodes, edges };

  // Layout configuration
  const nodeWidth = 250;
  nodeHeight = nodeHeight || 180;
  const horizontalSpacing = nodeWidth * 1.5;
  const verticalSpacing = nodeHeight * 1.5;

  try {
    // Build adjacency lists
    const childNodes: Record<string, string[]> = {};
    const parentNodes: Record<string, string[]> = {};

    // Initialize lists
    nodes.forEach((node) => {
      childNodes[node.id] = [];
      parentNodes[node.id] = [];
    });

    // Populate lists
    edges.forEach((edge) => {
      const { source, target } = edge;
      childNodes[source].push(target);
      parentNodes[target].push(source);
    });

    // Find root nodes (no parents)
    const rootIds = nodes
      .filter((node) => parentNodes[node.id].length === 0)
      .map((node) => node.id);

    if (rootIds.length === 0 && nodes.length > 0) {
      rootIds.push(nodes[0].id);
    }

    // Step 1: Assign logical layers (not just depth from root)
    // We want nodes to be placed in later layers if they depend on multiple nodes
    const nodeLayers: Record<string, number> = {};

    // Initial BFS to assign minimum required layers
    const assignLayers = () => {
      const queue: { id: string; layer: number }[] = rootIds.map((id) => ({
        id,
        layer: 0,
      }));

      while (queue.length > 0) {
        const { id, layer } = queue.shift()!;

        // If we've already assigned this node to a deeper layer, keep that assignment
        if (nodeLayers[id] !== undefined && nodeLayers[id] >= layer) {
          continue;
        }

        nodeLayers[id] = layer;

        // Add all children to the queue with incremented layer
        childNodes[id].forEach((childId) => {
          queue.push({ id: childId, layer: layer + 1 });
        });
      }
    };

    assignLayers();

    // Step 2: Ensure dependent nodes are always in a later layer than ALL their parents
    const ensureProperLayering = () => {
      let changed = true;

      while (changed) {
        changed = false;

        nodes.forEach((node) => {
          const nodeLayer = nodeLayers[node.id];

          // Check if any parent is in the same or later layer
          parentNodes[node.id].forEach((parentId) => {
            const parentLayer = nodeLayers[parentId];

            if (parentLayer >= nodeLayer) {
              // Move this node one layer deeper than its deepest parent
              nodeLayers[node.id] = parentLayer + 1;
              changed = true;
            }
          });
        });
      }
    };

    ensureProperLayering();

    // Step 3: Find the longest/main path through the tree
    // This will be centered vertically in our layout
    const findMainPaths = () => {
      // Find all possible paths from roots to leaf nodes
      const findPathsFromNode = (
        nodeId: string,
        currentPath: string[] = []
      ): string[][] => {
        const newPath = [...currentPath, nodeId];

        // If this is a leaf node (no children), return the path
        if (childNodes[nodeId].length === 0) {
          return [newPath];
        }

        // Otherwise, get all paths from children and prepend this node
        let paths: string[][] = [];
        childNodes[nodeId].forEach((childId) => {
          paths = [...paths, ...findPathsFromNode(childId, newPath)];
        });

        return paths;
      };

      // Get all paths from all root nodes
      let allPaths: string[][] = [];
      rootIds.forEach((rootId) => {
        allPaths = [...allPaths, ...findPathsFromNode(rootId)];
      });

      // Find the longest path(s)
      let maxLength = 0;
      allPaths.forEach((path) => {
        maxLength = Math.max(maxLength, path.length);
      });

      // Get all paths that have the maximum length
      const longestPaths = allPaths.filter((path) => path.length === maxLength);

      // Return the first longest path (we could implement more complex selection criteria here)
      return longestPaths[0] || [];
    };

    const mainPath = findMainPaths();

    // Step 4: Group nodes by layer
    const nodesByLayer: Record<number, string[]> = {};

    Object.entries(nodeLayers).forEach(([nodeId, layer]) => {
      if (!nodesByLayer[layer]) {
        nodesByLayer[layer] = [];
      }
      nodesByLayer[layer].push(nodeId);
    });

    // Step 5: Improved horizontal positioning within each layer
    const positions: Record<string, { x: number; y: number }> = {};
    const maxLayer = Math.max(...Object.keys(nodesByLayer).map(Number));

    // Create special ordering for nodes to ensure main path is centered
    const layerNodesOrdering: Record<number, string[]> = {};

    // First, place main path nodes exactly at center (x=0) for each layer
    mainPath.forEach((nodeId) => {
      const layer = nodeLayers[nodeId];
      if (!layerNodesOrdering[layer]) {
        layerNodesOrdering[layer] = [];
      }
      // Add main path node to center position
      layerNodesOrdering[layer].push(nodeId);
    });

    // Now add the remaining nodes to each layer, alternating left and right
    for (let layer = 0; layer <= maxLayer; layer++) {
      const allNodesInLayer = nodesByLayer[layer] || [];
      if (!layerNodesOrdering[layer]) {
        layerNodesOrdering[layer] = [];
      }

      // Get non-main path nodes sorted by importance (number of children)
      const nonMainPathNodes = allNodesInLayer
        .filter((id) => !mainPath.includes(id))
        .sort((a, b) => childNodes[b].length - childNodes[a].length);

      // Alternate adding nodes to left and right of main path
      const leftNodes: string[] = [];
      const rightNodes: string[] = [];

      nonMainPathNodes.forEach((nodeId, idx) => {
        if (idx % 2 === 0) {
          leftNodes.unshift(nodeId); // Add to left (beginning)
        } else {
          rightNodes.push(nodeId); // Add to right (end)
        }
      });

      // Insert left nodes before main path and right nodes after
      layerNodesOrdering[layer] = [
        ...leftNodes,
        ...layerNodesOrdering[layer],
        ...rightNodes,
      ];
    }

    // Now position all nodes with the special ordering
    for (let layer = 0; layer <= maxLayer; layer++) {
      const orderedNodesInLayer = layerNodesOrdering[layer] || [];
      const y = layer * verticalSpacing;

      // Calculate spacing to center the entire layer
      const totalWidth = (orderedNodesInLayer.length - 1) * horizontalSpacing;
      let startX = -totalWidth / 2;

      // Position each node according to the special ordering
      orderedNodesInLayer.forEach((nodeId, index) => {
        positions[nodeId] = {
          x: startX + index * horizontalSpacing,
          y,
        };
      });
    }

    // Step 5.5: Adjust positions for nodes with multiple parents
    for (let layer = 1; layer <= maxLayer; layer++) {
      // Start from layer 1 since layer 0 has no parents
      const nodesInLayer = nodesByLayer[layer] || [];
      const xOffsets: Record<string, number> = {};

      // Calculate ideal position for each node based on parents' positions
      nodesInLayer.forEach((nodeId) => {
        const parentIds = parentNodes[nodeId];

        // Only adjust nodes with multiple parents
        if (parentIds.length >= 2) {
          // Calculate average x position of parents
          let parentXSum = 0;
          parentIds.forEach((parentId) => {
            if (positions[parentId]) {
              parentXSum += positions[parentId].x;
            }
          });

          const avgParentX = parentXSum / parentIds.length;
          const currentX = positions[nodeId].x;

          // Calculate offset from current position
          xOffsets[nodeId] = avgParentX - currentX;
        }
      });

      // Adjust offsets to minimize overlap
      if (Object.keys(xOffsets).length > 0) {
        // Group nodes by position and movement direction
        const nodesByXPosition: Record<number, string[]> = {};

        // Group nodes by their current positions (rounded to nearest horizontal spacing)
        nodesInLayer.forEach((nodeId) => {
          if (!positions[nodeId]) return;

          const xPos =
            Math.round(positions[nodeId].x / (horizontalSpacing / 2)) *
            (horizontalSpacing / 2);
          if (!nodesByXPosition[xPos]) {
            nodesByXPosition[xPos] = [];
          }
          nodesByXPosition[xPos].push(nodeId);
        });

        // For each position group, analyze if nodes are converging
        Object.entries(nodesByXPosition).forEach(([xPosStr, nodeIds]) => {
          if (nodeIds.length <= 1) return; // Skip positions with only one node

          // Get nodes with offsets in this position group
          const nodesWithOffsets = nodeIds.filter(
            (id) => xOffsets[id] !== undefined
          );
          if (nodesWithOffsets.length <= 1) return; // Need at least 2 nodes with offsets to have convergence

          // Check if nodes are converging (some moving left, some right)
          const movingRight = nodesWithOffsets.filter((id) => xOffsets[id] > 0);
          const movingLeft = nodesWithOffsets.filter((id) => xOffsets[id] < 0);
          const stayingPut = nodesWithOffsets.filter(
            (id) => xOffsets[id] === 0
          );

          // If we have nodes moving in opposite directions, they're converging
          const isConverging = movingRight.length > 0 && movingLeft.length > 0;

          if (isConverging) {
            // Find max positive and negative offset
            const maxPositive = Math.max(
              ...movingRight.map((id) => xOffsets[id])
            );
            const maxNegative = Math.abs(
              Math.min(...movingLeft.map((id) => xOffsets[id]))
            );

            // Scale both to prevent overlap (aim for at most 1/3 of spacing)
            const maxMagnitude = Math.max(maxPositive, maxNegative);
            const scaleFactor = horizontalSpacing / 6 / maxMagnitude;

            // Apply scaling only to converging nodes
            [...movingRight, ...movingLeft].forEach((nodeId) => {
              xOffsets[nodeId] *= scaleFactor;
            });
          }
        });

        // Check if nodes would be too close after applying offsets
        const nodePositionsAfterOffset: Record<string, number> = {};
        nodesInLayer.forEach((nodeId) => {
          if (positions[nodeId]) {
            nodePositionsAfterOffset[nodeId] =
              positions[nodeId].x + (xOffsets[nodeId] || 0);
          }
        });

        // Sort nodes by their would-be positions
        const sortedNodeIds = Object.keys(nodePositionsAfterOffset).sort(
          (a, b) => nodePositionsAfterOffset[a] - nodePositionsAfterOffset[b]
        );

        // Check for minimum spacing violations and adjust if needed
        const minSpacing = horizontalSpacing * 0.75;
        let needsAdjustment = false;

        for (let i = 1; i < sortedNodeIds.length; i++) {
          const prevId = sortedNodeIds[i - 1];
          const currId = sortedNodeIds[i];
          const distance =
            nodePositionsAfterOffset[currId] - nodePositionsAfterOffset[prevId];

          if (distance < minSpacing) {
            needsAdjustment = true;
            break;
          }
        }

        // If we need to adjust, scale all offsets proportionally
        if (needsAdjustment) {
          const maxOffset = Math.max(...Object.values(xOffsets).map(Math.abs));
          if (maxOffset > 0) {
            const scaleFactor = horizontalSpacing / 4 / maxOffset;
            Object.keys(xOffsets).forEach((nodeId) => {
              xOffsets[nodeId] *= scaleFactor;
            });
          }
        }

        // Apply adjusted offsets to node positions
        Object.entries(xOffsets).forEach(([nodeId, offset]) => {
          if (positions[nodeId]) {
            positions[nodeId].x += offset;
          }
        });
      }
    }

    // Step 6: Apply positions to original nodes
    const layoutedNodes = nodes.map((node) => ({
      ...node,
      position: positions[node.id] || { x: 0, y: 0 },
    }));

    return { nodes: layoutedNodes, edges };
  } catch (error) {
    console.error('Error applying custom layout:', error);
    return { nodes, edges };
  }
};
